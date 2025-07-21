"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import {
  FileText,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  MessageSquare,
  Volume2,
  Bot,
  Send,
  Eye,
  Filter,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRedacoesUsuario, getTemplatesRedacao, getTemasRedacao, getNotificacoesUsuario } from "@/app/actions"

// Tipos para as redações
interface Redacao {
  id: number
  titulo: string
  tema: string
  status: "pendente" | "em_correcao" | "corrigida" | "revisada"
  nota_final?: number
  nota_ia?: number
  data_envio: string
  data_correcao?: string
  feedback_professor?: string
  feedback_audio_url?: string
  correcao_ia?: string
}

interface Template {
  id: number
  nome: string
  tipo: string
  descricao: string
  arquivo_url: string
}

interface Tema {
  id: number
  titulo: string
  descricao: string
  tipo_prova: string
  ano?: number
  dificuldade: string
  tags: string[]
}

interface Notificacao {
  id: number
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  created_at: string
}

export default function RedacaoPage() {
  const [redacoes, setRedacoes] = useState<Redacao[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [temas, setTemas] = useState<Tema[]>([])
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [loading, setLoading] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [redacoesData, templatesData, temasData, notificacoesData] = await Promise.all([
          getRedacoesUsuario(),
          getTemplatesRedacao(),
          getTemasRedacao(),
          getNotificacoesUsuario(),
        ])

        setRedacoes(redacoesData)
        setTemplates(templatesData)
        setTemas(temasData)
        setNotificacoes(notificacoesData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Estatísticas calculadas
  const stats = {
    total: redacoes.length,
    pendentes: redacoes.filter((r) => r.status === "pendente").length,
    corrigidas: redacoes.filter((r) => r.status === "corrigida" || r.status === "revisada").length,
    mediaNotas:
      redacoes.filter((r) => r.nota_final).reduce((acc, r) => acc + (r.nota_final || 0), 0) /
        redacoes.filter((r) => r.nota_final).length || 0,
    notificacoesNaoLidas: notificacoes.filter((n) => !n.lida).length,
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

  const redacoesFiltradas = filtroStatus === "todos" ? redacoes : redacoes.filter((r) => r.status === filtroStatus)

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando redações...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Redação</h1>
        <div className="flex items-center gap-2">
          {stats.notificacoesNaoLidas > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {stats.notificacoesNaoLidas} nova{stats.notificacoesNaoLidas > 1 ? "s" : ""}
            </Badge>
          )}
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Nova Redação
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="escrever">Escrever</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ia-correcao">IA Correção</TabsTrigger>
          <TabsTrigger value="notificacoes">
            Notificações
            {stats.notificacoesNaoLidas > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {stats.notificacoesNaoLidas}
              </Badge>
            )}
          </TabsTrigger>
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
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-white/70">Redações enviadas</p>
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
                <CardTitle className="text-sm font-medium text-white">Corrigidas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.corrigidas}</div>
                <p className="text-xs text-white/70">Com feedback</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Média de Notas</CardTitle>
                <Award className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.mediaNotas ? stats.mediaNotas.toFixed(0) : "--"}
                </div>
                <p className="text-xs text-white/70">Pontos (máx. 1000)</p>
              </CardContent>
            </Card>
          </div>

          {/* Progresso e Últimas Redações */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progresso Mensal
                </CardTitle>
                <CardDescription>Sua evolução nas redações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Meta Mensal</span>
                    <span className="text-sm text-muted-foreground">8/10 redações</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <p className="text-xs text-muted-foreground">Você está no caminho certo! Continue praticando.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>Últimas Redações</CardTitle>
                <CardDescription>Suas redações mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {redacoes.slice(0, 3).map((redacao) => (
                    <div key={redacao.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(redacao.status)}
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{redacao.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(redacao.data_envio).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(redacao.status)}>{redacao.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                  {redacoes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">Nenhuma redação enviada ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Escrever Tab */}
        <TabsContent value="escrever" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-background border-primary/30">
              <CardHeader>
                <CardTitle>Nova Redação</CardTitle>
                <CardDescription>Escolha um tema e comece a escrever sua redação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Selecione um Tema</label>
                    <select className="w-full p-2 border rounded-md bg-background">
                      <option value="">Escolha um tema...</option>
                      {temas.map((tema) => (
                        <option key={tema.id} value={tema.id}>
                          {tema.titulo} ({tema.tipo_prova} {tema.ano})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Título da Redação</label>
                    <input
                      type="text"
                      placeholder="Digite o título da sua redação..."
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Envio</label>
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        Escrever Online
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Arquivo
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>Dicas de Redação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Leia atentamente a proposta e os textos motivadores</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Faça um rascunho antes de escrever a versão final</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Mantenha a estrutura: introdução, desenvolvimento e conclusão</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <p>Revise sua redação antes de enviar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="historico" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Histórico de Redações</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="p-2 border rounded-md bg-background"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_correcao">Em Correção</option>
                <option value="corrigida">Corrigida</option>
                <option value="revisada">Revisada</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {redacoesFiltradas.map((redacao) => (
              <Card key={redacao.id} className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{redacao.titulo}</CardTitle>
                    <Badge className={getStatusColor(redacao.status)}>
                      {getStatusIcon(redacao.status)}
                      <span className="ml-1">{redacao.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                  <CardDescription>{redacao.tema}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Enviado: {new Date(redacao.data_envio).toLocaleDateString()}</span>
                    </div>

                    {redacao.nota_final && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Nota: {redacao.nota_final}/1000</span>
                      </div>
                    )}

                    {redacao.feedback_professor && (
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                        <MessageSquare className="h-4 w-4" />
                        Ver Feedback
                      </Button>
                    )}

                    {redacao.feedback_audio_url && (
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                        <Volume2 className="h-4 w-4" />
                        Áudio Feedback
                      </Button>
                    )}
                  </div>

                  {redacao.correcao_ia && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Correção IA</span>
                        {redacao.nota_ia && <Badge variant="secondary">Nota IA: {redacao.nota_ia}/1000</Badge>}
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
                  <p className="text-muted-foreground mb-4">
                    {filtroStatus === "todos"
                      ? "Você ainda não enviou nenhuma redação."
                      : `Nenhuma redação com status "${filtroStatus.replace("_", " ")}" encontrada.`}
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Primeira Redação
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Templates de Redação</h2>
            <p className="text-muted-foreground mb-6">
              Baixe os modelos oficiais de folha de redação para praticar em casa
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.nome}
                  </CardTitle>
                  <CardDescription>{template.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{template.tipo.toUpperCase()}</Badge>
                    <Button size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
            <CardHeader>
              <CardTitle>Como usar os templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">📝 Para prática em casa:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Baixe e imprima o template</li>
                    <li>• Escreva sua redação à mão</li>
                    <li>• Fotografe ou escaneie</li>
                    <li>• Envie através da plataforma</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🎯 Para simulados:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use o template oficial da prova</li>
                    <li>• Respeite o limite de linhas</li>
                    <li>• Pratique a caligrafia</li>
                    <li>• Cronometre o tempo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA Correção Tab */}
        <TabsContent value="ia-correcao" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Correção por IA</h2>
            <p className="text-muted-foreground mb-6">
              Receba feedback instantâneo da nossa IA especializada em correção de redações
            </p>
          </div>

          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Correção Instantânea
              </CardTitle>
              <CardDescription>Nossa IA analisa sua redação em segundos e fornece feedback detalhado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Cole sua redação aqui:</label>
                  <textarea
                    placeholder="Cole o texto da sua redação aqui para receber correção instantânea..."
                    className="w-full h-40 p-3 border rounded-md bg-background resize-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Button className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Corrigir com IA
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Send className="h-4 w-4" />
                    Enviar para Professor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>O que a IA analisa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Estrutura e organização</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Gramática e ortografia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Coesão e coerência</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Adequação ao tema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Proposta de intervenção</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
              <CardHeader>
                <CardTitle>Vantagens da IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Feedback instantâneo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Análise detalhada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Sugestões de melhoria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Nota estimada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Comentários específicos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notificações Tab */}
        <TabsContent value="notificacoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Notificações</h2>
            <Button variant="outline" size="sm">
              Marcar todas como lidas
            </Button>
          </div>

          <div className="space-y-3">
            {notificacoes.map((notificacao) => (
              <Card
                key={notificacao.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  !notificacao.lida
                    ? "bg-gradient-to-br from-primary/20 to-background border-primary/50"
                    : "bg-gradient-to-br from-primary/5 to-background border-primary/20",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notificacao.titulo}</h4>
                        {!notificacao.lida && <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notificacao.mensagem}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notificacao.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {notificacoes.length === 0 && (
              <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                  <p className="text-muted-foreground">Você receberá notificações sobre suas redações aqui</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
