"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { gradients } from "@/lib/gradients"
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Bot,
  MessageSquare,
  Volume2,
  Download,
  Search,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  TrendingUp,
  Award,
  Zap,
  Lightbulb,
  BookOpen,
  Headphones,
  Activity,
  Target,
  Trophy,
  Sparkles,
  ArrowRight,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  RefreshCw,
  Bell,
  Mail,
  Shield,
  Crown,
  GraduationCap,
  Clock3,
  Timer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRedacoesProfessor, getTurmasProfessor, getEstatisticasProfessor, corrigirRedacaoIA } from "@/app/actions"
import { CorrecaoDetalhada } from "@/components/correcao-detalhada"
import { toast } from "sonner"

interface RedacaoProfessor {
  id: number
  titulo: string
  tema: string
  status: string
  aluno_nome: string
  turma_nome: string
  data_envio: string
  nota_ia?: number
  correcao_ia?: string
  urgente: boolean
}

interface TurmaProfessor {
  id: string
  nome: string
  codigo_acesso: string
  total_alunos: number
  redacoes_pendentes: number
  periodo: string
}

interface EstatisticasProfessor {
  total_redacoes: number
  pendentes: number
  corrigidas_hoje: number
  media_tempo_correcao: number
  total_alunos: number
}

export default function TeacherDashboard() {
  const [redacoes, setRedacoes] = useState<RedacaoProfessor[]>([])
  const [turmas, setTurmas] = useState<TurmaProfessor[]>([])
  const [stats, setStats] = useState<EstatisticasProfessor>({
    total_redacoes: 0,
    pendentes: 0,
    corrigidas_hoje: 0,
    media_tempo_correcao: 0,
    total_alunos: 0,
  })
  const [activeTab, setActiveTab] = useState("dashboard")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroTurma, setFiltroTurma] = useState("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [corrigindoIA, setCorrigindoIA] = useState<number | null>(null)
  const [correcaoDetalhada, setCorrecaoDetalhada] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [redacoesData, turmasData, statsData] = await Promise.all([
        getRedacoesProfessor(),
        getTurmasProfessor(),
        getEstatisticasProfessor(),
      ])

      setRedacoes(Array.isArray(redacoesData) ? redacoesData : [])
      setTurmas(Array.isArray(turmasData) ? turmasData : [])
      setStats(statsData || {
        total_redacoes: 0,
        pendentes: 0,
        corrigidas_hoje: 0,
        media_tempo_correcao: 0,
        total_alunos: 0,
      })
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setRedacoes([])
      setTurmas([])
      setStats({
        total_redacoes: 0,
        pendentes: 0,
        corrigidas_hoje: 0,
        media_tempo_correcao: 0,
        total_alunos: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCorrecaoIA = async (redacaoId: number) => {
    setCorrigindoIA(redacaoId)
    try {
      await corrigirRedacaoIA(redacaoId)
      await loadData()
      toast.success("Correção IA concluída!")
    } catch (error) {
      console.error("Erro na correção IA:", error)
      toast.error("Erro na correção IA")
    } finally {
      setCorrigindoIA(null)
    }
  }

  const iniciarCorrecaoDetalhada = (redacaoId: number) => {
    setCorrecaoDetalhada(redacaoId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "em_correcao":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "corrigida":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
      case "revisada":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />
      case "em_correcao":
        return <AlertCircle className="h-4 w-4" />
      case "corrigida":
        return <CheckCircle2 className="h-4 w-4" />
      case "revisada":
        return <Star className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const redacoesFiltradas = Array.isArray(redacoes) ? redacoes.filter((redacao) => {
    const matchStatus = filtroStatus === "todos" || redacao.status === filtroStatus
    const matchTurma = filtroTurma === "todas" || redacao.turma_nome === filtroTurma
    const matchSearch =
      searchTerm === "" ||
      redacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redacao.aluno_nome.toLowerCase().includes(searchTerm.toLowerCase())

    return matchStatus && matchTurma && matchSearch
  }) : []

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando área do professor...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (correcaoDetalhada) {
    return (
      <CorrecaoDetalhada 
        redacaoId={correcaoDetalhada} 
        onClose={() => setCorrecaoDetalhada(null)} 
      />
    )
  }

  return (
    <DashboardShell>
      {/* Header com gradiente */}
      <div className={`${gradients.cardOrange} rounded-xl p-6 mb-6 border border-orange-200/20 dark:border-orange-800/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${gradients.orange} p-3 rounded-lg`}>
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Área do Professor
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas turmas, corrija redações e acompanhe o progresso dos alunos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button size="sm" className={`${gradients.buttonOrange} text-white`}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-orange-50 dark:bg-orange-950/30">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="correcoes" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Edit className="h-4 w-4" />
            Correções
            {stats.pendentes > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {stats.pendentes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="turmas" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            Turmas
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Cards de Estatísticas com gradientes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className={`${gradients.cardOrange} border-orange-200/20 dark:border-orange-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Redações</CardTitle>
                <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.total_redacoes}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recebidas este mês
                </p>
              </CardContent>
            </Card>

            <Card className={`${gradients.cardBlue} border-blue-200/20 dark:border-blue-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.pendentes}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aguardando correção
                </p>
              </CardContent>
            </Card>

            <Card className={`${gradients.cardGreen} border-green-200/20 dark:border-green-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Corrigidas Hoje</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.corrigidas_hoje}
                </div>
                <p className="text-xs text-muted-foreground">
                  Meta: 10 por dia
                </p>
              </CardContent>
            </Card>

            <Card className={`${gradients.cardPurple} border-purple-200/20 dark:border-purple-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.total_alunos}
                </div>
                <p className="text-xs text-muted-foreground">
                  Em todas as turmas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Ações Rápidas */}
          <Card className="border-orange-200/20 dark:border-orange-800/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Ferramentas mais utilizadas para otimizar seu trabalho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
                  onClick={() => setActiveTab("correcoes")}
                >
                  <Bot className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">Correção IA</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Correção automática em massa
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                >
                  <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Exportar</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Relatórios e dados
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
                >
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="font-medium">Feedback</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Áudio e comentários
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
                >
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Agendar</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Correções programadas
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Turmas e Produtividade */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Minhas Turmas
                </CardTitle>
                <CardDescription>Visão geral das suas turmas ativas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(turmas) ? turmas.slice(0, 3).map((turma) => (
                    <div key={turma.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200/20">
                      <div className="flex items-center gap-3">
                        <div className={`${gradients.orange} p-2 rounded-lg`}>
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{turma.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {turma.total_alunos} alunos • {turma.periodo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">{turma.codigo_acesso}</Badge>
                        {turma.redacoes_pendentes > 0 && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {turma.redacoes_pendentes} pendente{turma.redacoes_pendentes !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma turma encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Produtividade
                </CardTitle>
                <CardDescription>Seu desempenho esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Correções Realizadas</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">28</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo Médio</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">12 min</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uso da IA</span>
                    <span className="font-medium text-green-600 dark:text-green-400">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Correções Tab */}
        <TabsContent value="correcoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Correções de Redação</h2>
              <p className="text-muted-foreground mt-1">
                Gerencie e corrija as redações dos seus alunos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                <Bot className="h-4 w-4 mr-2" />
                IA em Massa
              </Button>
              <Button size="sm" className={`${gradients.buttonOrange} text-white`}>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filtros Melhorados */}
          <Card className="border-orange-200/20 dark:border-orange-800/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por aluno ou título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-orange-200 focus:border-orange-500"
                  />
                </div>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[180px] border-orange-200 focus:border-orange-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_correcao">Em Correção</SelectItem>
                    <SelectItem value="corrigida">Corrigida</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger className="w-[180px] border-orange-200 focus:border-orange-500">
                    <SelectValue placeholder="Turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Turmas</SelectItem>
                    {Array.isArray(turmas) ? turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.nome}>
                        {turma.nome}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Redações Melhorada */}
          <div className="space-y-4">
            {Array.isArray(redacoesFiltradas) ? redacoesFiltradas.map((redacao) => (
              <Card
                key={redacao.id}
                className={cn(
                  "border-orange-200/20 dark:border-orange-800/20 hover:shadow-lg transition-all duration-200",
                  redacao.urgente && "border-red-500/50 bg-red-50 dark:bg-red-950/20",
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/avatars/${redacao.aluno_nome.toLowerCase().replace(' ', '-')}.jpg`} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                          {redacao.aluno_nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {redacao.titulo}
                          {redacao.urgente && (
                            <Badge variant="destructive" className="animate-pulse">
                              Urgente
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{redacao.aluno_nome}</span>
                          <span>•</span>
                          <span>{redacao.turma_nome}</span>
                          <span>•</span>
                          <span>{redacao.tema}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(redacao.status)}>
                      {getStatusIcon(redacao.status)}
                      <span className="ml-1">{redacao.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(redacao.data_envio).toLocaleDateString()}
                      </span>
                      {redacao.nota_ia && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Nota IA: {redacao.nota_ia}/1000
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      {redacao.status === "pendente" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleCorrecaoIA(redacao.id)}
                            disabled={corrigindoIA === redacao.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Bot className="h-4 w-4 mr-1" />
                            {corrigindoIA === redacao.id ? "Corrigindo..." : "IA"}
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => iniciarCorrecaoDetalhada(redacao.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Corrigir
                          </Button>
                        </>
                      )}

                      {redacao.correcao_ia && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Edit className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                        <Volume2 className="h-4 w-4 mr-1" />
                        Áudio
                      </Button>
                    </div>
                  </div>

                  {redacao.correcao_ia && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Correção da IA</span>
                        <Badge variant="secondary">Nota: {redacao.nota_ia}/1000</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{redacao.correcao_ia}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : null}

            {(!Array.isArray(redacoesFiltradas) || redacoesFiltradas.length === 0) && (
              <Card className="border-orange-200/20 dark:border-orange-800/20">
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma redação encontrada</h3>
                  <p className="text-muted-foreground">Ajuste os filtros ou aguarde novas redações dos alunos.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Turmas Tab */}
        <TabsContent value="turmas" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gerenciar Turmas</h2>
              <p className="text-muted-foreground mt-1">
                Visualize e gerencie suas turmas e alunos
              </p>
            </div>
            <Button className={`${gradients.buttonOrange} text-white`}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(turmas) ? turmas.map((turma) => (
              <Card key={turma.id} className="border-orange-200/20 dark:border-orange-800/20 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      {turma.nome}
                    </span>
                    <Badge variant="outline">{turma.codigo_acesso}</Badge>
                  </CardTitle>
                  <CardDescription>Período: {turma.periodo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Alunos</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">{turma.total_alunos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Redações Pendentes</span>
                      <Badge variant={turma.redacoes_pendentes > 0 ? "destructive" : "secondary"}>
                        {turma.redacoes_pendentes}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                        <Users className="h-4 w-4 mr-1" />
                        Alunos
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Relatório
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma turma encontrada</h3>
                <p className="text-muted-foreground">Crie sua primeira turma para começar.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Relatórios e Análises</h2>
            <p className="text-muted-foreground">
              Acompanhe o desempenho dos seus alunos e turmas com relatórios detalhados
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Desempenho por Turma
                </CardTitle>
                <CardDescription>Média de notas e evolução</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(turmas) ? turmas.map((turma) => (
                    <div key={turma.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{turma.nome}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-20" />
                        <span className="text-sm text-muted-foreground">750/1000</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Nenhum dado disponível</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Produtividade
                </CardTitle>
                <CardDescription>Suas correções nos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Correções Realizadas</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo Médio por Correção</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">12 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uso da IA</span>
                    <span className="font-medium text-green-600 dark:text-green-400">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurações Tab */}
        <TabsContent value="configuracoes" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Configurações</h2>
            <p className="text-muted-foreground">Personalize sua experiência como professor</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Preferências de Correção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usar IA por padrão</span>
                    <input type="checkbox" defaultChecked className="rounded border-orange-200" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificações por email</span>
                    <input type="checkbox" defaultChecked className="rounded border-orange-200" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feedback por áudio</span>
                    <input type="checkbox" className="rounded border-orange-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Critérios de Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                    <Edit className="h-4 w-4 mr-2" />
                    Personalizar Critérios ENEM
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Rubrica
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
