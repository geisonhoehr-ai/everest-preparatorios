"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRedacoesProfessor, getTurmasProfessor, getEstatisticasProfessor, corrigirRedacaoIA } from "@/app/actions"

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

      setRedacoes(redacoesData)
      setTurmas(turmasData)
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCorrecaoIA = async (redacaoId: number) => {
    setCorrigindoIA(redacaoId)
    try {
      await corrigirRedacaoIA(redacaoId)
      await loadData() // Recarregar dados
    } catch (error) {
      console.error("Erro na correção IA:", error)
    } finally {
      setCorrigindoIA(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "em_correcao":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "corrigida":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "revisada":
        return "bg-purple-500/20 text-purple-700 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30"
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

  const redacoesFiltradas = redacoes.filter((redacao) => {
    const matchStatus = filtroStatus === "todos" || redacao.status === filtroStatus
    const matchTurma = filtroTurma === "todas" || redacao.turma_nome === filtroTurma
    const matchSearch =
      searchTerm === "" ||
      redacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redacao.aluno_nome.toLowerCase().includes(searchTerm.toLowerCase())

    return matchStatus && matchTurma && matchSearch
  })

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando área do professor...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Área do Professor</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas turmas, corrija redações e acompanhe o progresso dos alunos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="correcoes">
            Correções
            {stats.pendentes > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {stats.pendentes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="turmas">Turmas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Config</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total de Redações</CardTitle>
                <FileText className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total_redacoes}</div>
                <p className="text-xs text-white/70">Recebidas este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendentes}</div>
                <p className="text-xs text-white/70">Aguardando correção</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Corrigidas Hoje</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.corrigidas_hoje}</div>
                <p className="text-xs text-white/70">Meta: 10 por dia</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total_alunos}</div>
                <p className="text-xs text-white/70">Em todas as turmas</p>
              </CardContent>
            </Card>
          </div>

          {/* Turmas e Ações Rápidas */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Minhas Turmas
                </CardTitle>
                <CardDescription>Visão geral das suas turmas ativas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {turmas.slice(0, 3).map((turma) => (
                    <div key={turma.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{turma.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {turma.total_alunos} alunos • {turma.periodo}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{turma.codigo_acesso}</Badge>
                        {turma.redacoes_pendentes > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            {turma.redacoes_pendentes} pendente{turma.redacoes_pendentes !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Ferramentas mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Bot className="h-4 w-4 mr-2" />
                    Correção IA em Massa
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback por Áudio
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Correções
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Correções Tab */}
        <TabsContent value="correcoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Correções de Redação</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bot className="h-4 w-4 mr-2" />
                IA em Massa
              </Button>
              <Button size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por aluno ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border rounded-md bg-background"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-1 border rounded-md bg-background"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_correcao">Em Correção</option>
              <option value="corrigida">Corrigida</option>
            </select>

            <select
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
              className="px-3 py-1 border rounded-md bg-background"
            >
              <option value="todas">Todas as Turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.nome}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Redações */}
          <div className="space-y-4">
            {redacoesFiltradas.map((redacao) => (
              <Card
                key={redacao.id}
                className={cn(
                  "bg-gradient-to-br from-primary/10 to-background border-primary/30",
                  redacao.urgente && "border-red-500/50 bg-red-500/5",
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {redacao.titulo}
                        {redacao.urgente && <Badge variant="destructive">Urgente</Badge>}
                      </CardTitle>
                      <CardDescription>
                        {redacao.aluno_nome} • {redacao.turma_nome} • {redacao.tema}
                      </CardDescription>
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
                      <span>Enviado: {new Date(redacao.data_envio).toLocaleDateString()}</span>
                      {redacao.nota_ia && <span>Nota IA: {redacao.nota_ia}/1000</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      {redacao.status === "pendente" && (
                        <Button
                          size="sm"
                          onClick={() => handleCorrecaoIA(redacao.id)}
                          disabled={corrigindoIA === redacao.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          {corrigindoIA === redacao.id ? "Corrigindo..." : "IA"}
                        </Button>
                      )}

                      {redacao.correcao_ia && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Edit className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
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
            ))}

            {redacoesFiltradas.length === 0 && (
              <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
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
            <h2 className="text-2xl font-bold">Gerenciar Turmas</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {turmas.map((turma) => (
              <Card key={turma.id} className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {turma.nome}
                    <Badge variant="secondary">{turma.codigo_acesso}</Badge>
                  </CardTitle>
                  <CardDescription>Período: {turma.periodo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Alunos</span>
                      <span className="font-medium">{turma.total_alunos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Redações Pendentes</span>
                      <Badge variant={turma.redacoes_pendentes > 0 ? "destructive" : "secondary"}>
                        {turma.redacoes_pendentes}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Users className="h-4 w-4 mr-1" />
                        Alunos
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Relatório
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Relatórios e Análises</h2>
            <p className="text-muted-foreground">
              Acompanhe o desempenho dos seus alunos e turmas com relatórios detalhados
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>Desempenho por Turma</CardTitle>
                <CardDescription>Média de notas e evolução</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {turmas.map((turma) => (
                    <div key={turma.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{turma.nome}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-20" />
                        <span className="text-sm text-muted-foreground">750/1000</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>Produtividade</CardTitle>
                <CardDescription>Suas correções nos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Correções Realizadas</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo Médio por Correção</span>
                    <span className="font-medium">12 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uso da IA</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurações Tab */}
        <TabsContent value="configuracoes" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Configurações</h2>
            <p className="text-muted-foreground">Personalize sua experiência como professor</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
              <CardHeader>
                <CardTitle>Preferências de Correção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usar IA por padrão</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificações por email</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feedback por áudio</span>
                    <input type="checkbox" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
              <CardHeader>
                <CardTitle>Critérios de Avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Personalizar Critérios ENEM
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Rubrica
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
