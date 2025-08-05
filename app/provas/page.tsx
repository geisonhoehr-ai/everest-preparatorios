"use client";

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Play, 
  Clock, 
  Users, 
  Trophy, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { 
  getProvas, 
  getProvasProfessor, 
  criarProva, 
  publicarProva, 
  arquivarProva, 
  deletarProva,
  getProvaCompleta,
  iniciarTentativa,
  salvarResposta,
  finalizarTentativa,
  getTentativasAluno,
  getTentativasProfessor,
  adicionarQuestao,
  atualizarQuestao,
  deletarQuestao,
  getQuestoesProva,
  checkPublishedExams
} from "@/app/actions"
import { getUserRoleClient, getAuthAndRole } from "@/lib/get-user-role"
import { createClient } from "@/lib/supabase/client"
import { RichTextEditor } from "@/components/rich-text-editor"

interface Questao {
  id?: string;
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'completar' | 'associacao' | 'ordenacao';
  enunciado: string;
  pontuacao: number;
  ordem: number;
  opcoes?: string[];
  resposta_correta?: string;
  explicacao?: string;
  imagem_url?: string;
  tempo_estimado?: number;
}

interface Prova {
  id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_limite: number;
  tentativas_permitidas: number;
  nota_minima: number;
  status: 'rascunho' | 'publicada' | 'arquivada';
  criado_por: string;
  criado_em: string;
  texto_base?: string;
  tem_texto_base?: boolean;
  titulo_texto_base?: string;
  fonte_texto_base?: string;
  questoes?: Questao[];
}

export default function ProvasPage() {
  const [provas, setProvas] = useState<Prova[]>([])
  const [tentativas, setTentativas] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("disponiveis")
  
  // Estados para criação/edição de prova
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [provaData, setProvaData] = useState({
    titulo: '',
    descricao: '',
    materia: '',
    dificuldade: 'medio' as 'facil' | 'medio' | 'dificil',
    tempo_limite: 60,
    tentativas_permitidas: 1,
    nota_minima: 7,
    tem_texto_base: false,
    texto_base: '',
    titulo_texto_base: '',
    fonte_texto_base: '',
    data_liberacao: '' // Novo campo para data de liberação
  })
  
  // Estados para questões
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [editingQuestao, setEditingQuestao] = useState<Questao | null>(null)
  const [showQuestaoDialog, setShowQuestaoDialog] = useState(false)
  const [questaoData, setQuestaoData] = useState<Questao>({
    tipo: 'multipla_escolha' as const,
    enunciado: '',
    pontuacao: 1,
    ordem: 1,
    opcoes: ['', '', '', ''],
    resposta_correta: '',
    explicacao: '',
    tempo_estimado: 60
  })

  // Function to reset question form
  const resetQuestaoForm = () => {
    setQuestaoData({
      tipo: 'multipla_escolha',
      enunciado: '',
      pontuacao: 1,
      ordem: 1,
      opcoes: ['', '', '', ''],
      resposta_correta: '',
      explicacao: '',
      tempo_estimado: 60
    })
  }
  
  // Estados para tentativa
  const [tentativaAtual, setTentativaAtual] = useState<any>(null)
  const [provaEmAndamento, setProvaEmAndamento] = useState<Prova | null>(null)
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [respostas, setRespostas] = useState({})

  const supabase = createClient()

  useEffect(() => {
    // Limpar cookies corrompidos do localStorage
    const clearCorruptedCookies = () => {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            try {
              JSON.parse(localStorage.getItem(key) || '')
            } catch (error) {
              console.log('Removendo cookie corrompido:', key)
              localStorage.removeItem(key)
            }
          }
        })
      } catch (error) {
        console.warn('Erro ao limpar cookies corrompidos:', error)
      }
    }

    clearCorruptedCookies()
    
    // Verificação otimizada de autenticação e role
    const checkAuthAndRole = async () => {
      try {
        console.log('🔍 [PROVAS PAGE] Verificando autenticação...')
        const { user, role, isAuthenticated } = await getAuthAndRole()
        
        if (isAuthenticated && user) {
          console.log('✅ [PROVAS PAGE] Usuário autenticado:', user.id)
          console.log('✅ [PROVAS PAGE] Role do usuário:', role)
          setUserRole(role)
        } else {
          console.log('❌ [PROVAS PAGE] Usuário não autenticado')
          setUserRole('student')
        }
      } catch (error) {
        console.error("❌ [PROVAS PAGE] Erro ao verificar autenticação/role:", error)
        setUserRole('student')
      }
    }
    
    const initializePage = async () => {
      try {
        setAuthLoading(true)
        setLoading(true)
        
        await checkAuthAndRole()
        
        // Carregar dados em paralelo após verificar role
        await Promise.all([
          loadProvas(),
          loadTentativas()
        ])
        
      } catch (error) {
        console.error('Erro ao inicializar página:', error)
        toast.error('Erro ao carregar dados da página')
      } finally {
        setAuthLoading(false)
        setLoading(false)
      }
    }
    
    initializePage()
  }, [])

  const loadProvas = async () => {
    try {
      console.log('🔍 [CLIENT] loadProvas iniciado')
      console.log('👤 [CLIENT] User role:', userRole)
      
      let result
      
      if (userRole === 'teacher' || userRole === 'admin') {
        console.log('👨‍🏫 [CLIENT] Carregando provas do professor...')
        result = await getProvasProfessor()
      } else {
        console.log('👨‍🎓 [CLIENT] Carregando provas do aluno...')
        result = await getProvas()
      }
      
      if (result.data) {
        setProvas(result.data)
        console.log('✅ [CLIENT] Provas carregadas:', result.data.length)
      } else if (result.error) {
        console.error('❌ [CLIENT] Erro ao carregar provas:', result.error)
        toast.error('Erro ao carregar provas')
      }
    } catch (error) {
      console.error('❌ [CLIENT] Erro ao carregar provas:', error)
      toast.error('Erro ao carregar provas')
    }
  }

  const loadTentativas = async () => {
    try {
      let result
      
      if (userRole === 'teacher' || userRole === 'admin') {
        result = await getTentativasProfessor()
      } else {
        result = await getTentativasAluno()
      }
      
      if (result.data) {
        setTentativas(result.data)
        console.log('✅ Tentativas carregadas:', result.data.length)
      } else if (result.error) {
        console.error('Erro ao carregar tentativas:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar tentativas:', error)
    }
  }

  const handleSalvarProva = async () => {
    try {
      const result = await criarProva(provaData)
      
      if (result.data) {
        toast.success('Prova criada com sucesso!')
        setShowCreateDialog(false)
        setProvaData({
          titulo: '',
          descricao: '',
          materia: '',
          dificuldade: 'medio',
          tempo_limite: 60,
          tentativas_permitidas: 1,
          nota_minima: 7,
          tem_texto_base: false,
          texto_base: '',
          titulo_texto_base: '',
          fonte_texto_base: '',
          data_liberacao: ''
        })
        loadProvas()
      } else {
        toast.error('Erro ao criar prova')
      }
    } catch (error) {
      console.error('Erro ao salvar prova:', error)
      toast.error('Erro ao salvar prova')
    }
  }

  const handleAdicionarQuestao = async (provaId: string) => {
    try {
      const result = await adicionarQuestao(provaId, questaoData)
      
      if (result.data) {
        toast.success('Questão adicionada com sucesso!')
        resetQuestaoForm()
        setShowQuestaoDialog(true)
        loadProvas()
      } else {
        toast.error('Erro ao adicionar questão')
      }
    } catch (error) {
      console.error('Erro ao adicionar questão:', error)
      toast.error('Erro ao adicionar questão')
    }
  }

  const handleEditarQuestao = async (questaoId: string) => {
    try {
      const result = await atualizarQuestao(questaoId, questaoData)
      
      if (result.data) {
        toast.success('Questão atualizada com sucesso!')
        setShowQuestaoDialog(false)
        setEditingQuestao(null)
        resetQuestaoForm()
        loadProvas()
      } else {
        toast.error('Erro ao atualizar questão')
      }
    } catch (error) {
      console.error('Erro ao atualizar questão:', error)
      toast.error('Erro ao atualizar questão')
    }
  }

  const handleDeletarQuestao = async (questaoId: string) => {
    try {
      const result = await deletarQuestao(questaoId)
      
      if (result.success) {
        toast.success('Questão deletada com sucesso!')
        loadProvas()
      } else {
        toast.error('Erro ao deletar questão')
      }
    } catch (error) {
      console.error('Erro ao deletar questão:', error)
      toast.error('Erro ao deletar questão')
    }
  }

  const handlePublicarProva = async (provaId: string) => {
    try {
      const result = await publicarProva(provaId)
      if (result.success) {
        toast.success('Prova publicada com sucesso!')
        loadProvas()
      }
    } catch (error) {
      console.error('Erro ao publicar prova:', error)
      toast.error('Erro ao publicar prova')
    }
  }

  const handleArquivarProva = async (provaId: string) => {
    try {
      const result = await arquivarProva(provaId)
      if (result.success) {
        toast.success('Prova arquivada com sucesso!')
        loadProvas()
      }
    } catch (error) {
      console.error('Erro ao arquivar prova:', error)
      toast.error('Erro ao arquivar prova')
    }
  }

  const handleDeletarProva = async (provaId: string) => {
    try {
      const result = await deletarProva(provaId)
      if (result.success) {
        toast.success('Prova deletada com sucesso!')
        loadProvas()
      }
    } catch (error) {
      console.error('Erro ao deletar prova:', error)
      toast.error('Erro ao deletar prova')
    }
  }

  const iniciarProva = async (provaId: string) => {
    try {
      console.log('🔍 [CLIENT] Iniciando prova:', provaId)
      
      const provaEncontrada = provas.find(p => p.id === provaId)
      
      if (!provaEncontrada) {
        console.error('❌ [CLIENT] Prova não encontrada na lista local')
        toast.error('Prova não encontrada')
        return
      }
      
      if (provaEncontrada.status !== 'publicada') {
        console.error('❌ [CLIENT] Prova não está publicada:', provaEncontrada.status)
        toast.error('Esta prova não está disponível para alunos')
        return
      }
      
      console.log('✅ [CLIENT] Prova válida, chamando iniciarTentativa...')
      const result = await iniciarTentativa(provaId)
      
      if (result.data) {
        setTentativaAtual(result.data)
        setProvaEmAndamento(provaEncontrada)
        setQuestaoAtual(0)
        setRespostas({})
        console.log('✅ [CLIENT] Prova iniciada com sucesso')
        toast.success('Prova iniciada com sucesso!')
      } else {
        console.error('❌ [CLIENT] Erro ao iniciar prova:', result.error)
        const errorMessage = (result.error as any)?.message || 'Erro desconhecido ao iniciar prova'
        toast.error(`Erro ao iniciar prova: ${errorMessage}`)
      }
    } catch (error) {
      console.error('❌ [CLIENT] Erro ao iniciar prova:', error)
      toast.error('Erro ao iniciar prova')
    }
  }

  const salvarRespostaAtual = async () => {
    if (!tentativaAtual) return
    
    try {
      const questao = provaEmAndamento?.questoes?.[questaoAtual]
      if (questao && questao.id) {
        await salvarResposta(tentativaAtual.id, questao.id, (respostas as any)[questao.id] || '')
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
    }
  }

  const finalizarProva = async () => {
    if (!tentativaAtual) return
    
    try {
      await salvarRespostaAtual()
      const result = await finalizarTentativa(tentativaAtual.id)
      
      if (result.data) {
        toast.success(`Prova finalizada! Nota: ${result.data.nota_final}`)
        setTentativaAtual(null)
        setProvaEmAndamento(null)
        setQuestaoAtual(0)
        setRespostas({})
        loadTentativas()
      }
    } catch (error) {
      console.error('Erro ao finalizar prova:', error)
      toast.error('Erro ao finalizar prova')
    }
  }

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'bg-green-100 text-green-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'dificil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800'
      case 'publicada': return 'bg-green-100 text-green-800'
      case 'arquivada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho'
      case 'publicada': return 'Publicada'
      case 'arquivada': return 'Arquivada'
      default: return status
    }
  }

  // Loading inicial
  if (authLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-lg">Verificando autenticação...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Loading de dados
  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-lg">Carregando provas...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Header responsivo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Provas Online</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Pratique com provas simuladas e avalie seu conhecimento
            </p>
          </div>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Prova
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Criar Nova Prova</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da prova e adicione as questões
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={provaData.titulo}
                      onChange={(e) => setProvaData({...provaData, titulo: e.target.value})}
                      placeholder="Digite o título da prova"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={provaData.descricao}
                      onChange={(e) => setProvaData({...provaData, descricao: e.target.value})}
                      placeholder="Digite a descrição da prova"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="materia">Matéria</Label>
                      <Input
                        id="materia"
                        value={provaData.materia}
                        onChange={(e) => setProvaData({...provaData, materia: e.target.value})}
                        placeholder="Ex: Português"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dificuldade">Dificuldade</Label>
                      <Select
                        value={provaData.dificuldade}
                        onValueChange={(value: 'facil' | 'medio' | 'dificil') => 
                          setProvaData({...provaData, dificuldade: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facil">Fácil</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="dificil">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Configuração de Prova Dissertativa */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="tem_texto_base"
                        checked={provaData.tem_texto_base}
                        onChange={(e) => setProvaData({...provaData, tem_texto_base: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="tem_texto_base" className="text-sm font-medium">
                        Prova com Texto Base (Português/Redação)
                      </Label>
                    </div>
                    
                    {provaData.tem_texto_base && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="titulo_texto_base">Título do Texto</Label>
                            <Input
                              id="titulo_texto_base"
                              value={provaData.titulo_texto_base}
                              onChange={(e) => setProvaData({...provaData, titulo_texto_base: e.target.value})}
                              placeholder="Ex: A importância da leitura"
                            />
                          </div>
                          <div>
                            <Label htmlFor="fonte_texto_base">Fonte do Texto</Label>
                            <Input
                              id="fonte_texto_base"
                              value={provaData.fonte_texto_base}
                              onChange={(e) => setProvaData({...provaData, fonte_texto_base: e.target.value})}
                              placeholder="Ex: Revista Veja, 2024"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="texto_base">Texto Base (Rich Text)</Label>
                          <div className="mt-2 border rounded-lg">
                            <RichTextEditor
                              value={provaData.texto_base}
                              onChange={(value) => setProvaData({...provaData, texto_base: value})}
                              placeholder="Digite ou cole o texto base aqui. Os alunos poderão ler este texto durante a prova para responder as questões de interpretação..."
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Dica: Use este campo para textos de português, redação ou qualquer material que os alunos precisem ler antes de responder as questões.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="tempo">Tempo (min)</Label>
                      <Input
                        id="tempo"
                        type="number"
                        value={provaData.tempo_limite}
                        onChange={(e) => setProvaData({...provaData, tempo_limite: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tentativas">Tentativas</Label>
                      <Input
                        id="tentativas"
                        type="number"
                        value={provaData.tentativas_permitidas}
                        onChange={(e) => setProvaData({...provaData, tentativas_permitidas: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nota">Nota Mínima</Label>
                      <Input
                        id="nota"
                        type="number"
                        value={provaData.nota_minima}
                        onChange={(e) => setProvaData({...provaData, nota_minima: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_liberacao">Data de Liberação</Label>
                      <Input
                        id="data_liberacao"
                        type="datetime-local"
                        value={provaData.data_liberacao}
                        onChange={(e) => setProvaData({...provaData, data_liberacao: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarProva}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Prova
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tabs responsivas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="disponiveis" className="text-xs sm:text-sm">Provas Disponíveis</TabsTrigger>
            {(userRole === 'teacher' || userRole === 'admin') && (
              <TabsTrigger value="gerenciar" className="text-xs sm:text-sm">Gerenciar Provas</TabsTrigger>
            )}
            <TabsTrigger value="tentativas" className="text-xs sm:text-sm">Minhas Tentativas</TabsTrigger>
          </TabsList>

          {/* Tab Provas Disponíveis */}
          <TabsContent value="disponiveis" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar provas..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Grid responsivo de provas */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {provas.filter(p => p.status === 'publicada').map((prova) => (
                <Card key={prova.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{prova.titulo}</CardTitle>
                        <CardDescription className="mt-2 text-sm line-clamp-2">{prova.descricao}</CardDescription>
                      </div>
                      <Badge className={`${getDificuldadeColor(prova.dificuldade)} text-xs sm:text-sm`}>
                        {prova.dificuldade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="secondary" className="text-xs">{prova.materia}</Badge>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {prova.tempo_limite} min
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {prova.tentativas_permitidas} tentativa{prova.tentativas_permitidas > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Nota mínima: {prova.nota_minima}
                        </div>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {new Date(prova.criado_em).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 text-sm" 
                      onClick={() => iniciarProva(prova.id)}
                    >
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Iniciar Prova
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab Gerenciar Provas (apenas para professores) */}
          {(userRole === 'teacher' || userRole === 'admin') && (
            <TabsContent value="gerenciar" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {provas.map((prova) => (
                  <Card key={prova.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">{prova.titulo}</CardTitle>
                          <CardDescription className="mt-2 text-sm line-clamp-2">{prova.descricao}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(prova.status)} text-xs sm:text-sm`}>
                          {getStatusText(prova.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Badge variant="secondary" className="text-xs">{prova.materia}</Badge>
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {prova.tempo_limite} min
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {prova.questoes?.length || 0} questões
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            setQuestaoData({
                              tipo: 'multipla_escolha' as const,
                              enunciado: '',
                              pontuacao: 1,
                              ordem: (prova.questoes?.length || 0) + 1,
                              opcoes: ['', '', '', ''],
                              resposta_correta: '',
                              explicacao: '',
                              tempo_estimado: 60
                            })
                            setShowQuestaoDialog(true)
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar Questão
                        </Button>
                        {prova.status === 'rascunho' && (
                          <Button 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handlePublicarProva(prova.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Publicar
                          </Button>
                        )}
                        {prova.status === 'publicada' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleArquivarProva(prova.id)}
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Arquivar
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="text-xs"
                          onClick={() => handleDeletarProva(prova.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Tab Tentativas */}
          <TabsContent value="tentativas" className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold">Minhas Tentativas</h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {tentativas.map((tentativa: any) => (
                <Card key={tentativa.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">{tentativa.prova?.titulo}</CardTitle>
                    <CardDescription className="text-sm">
                      Tentativa realizada em {new Date(tentativa.iniciada_em).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant={tentativa.finalizada ? "default" : "secondary"} className="text-xs">
                          {tentativa.finalizada ? "Finalizada" : "Em andamento"}
                        </Badge>
                      </div>
                      {tentativa.finalizada && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm">Nota:</span>
                            <span className="font-semibold text-sm">{tentativa.nota_final}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Tempo:</span>
                            <span className="text-sm">{Math.round(tentativa.tempo_gasto / 60)} min</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Interface de fazer prova */}
      {provaEmAndamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header da prova */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold">{provaEmAndamento.titulo}</h2>
                  <p className="text-sm text-gray-600">{provaEmAndamento.descricao}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Questão {questaoAtual + 1} de {provaEmAndamento.questoes?.length}</span>
                    <span>Tempo: {provaEmAndamento.tempo_limite} min</span>
                    <span>Nota mínima: {provaEmAndamento.nota_minima}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setProvaEmAndamento(null)
                    setTentativaAtual(null)
                    setQuestaoAtual(0)
                    setRespostas({})
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                  <Button size="sm" onClick={finalizarProva}>
                    Finalizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Conteúdo da prova */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Painel do texto base (se existir) */}
              {provaEmAndamento.tem_texto_base && provaEmAndamento.texto_base && (
                <div className="w-1/2 border-r overflow-y-auto p-6 bg-gray-50">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {provaEmAndamento.titulo_texto_base || 'Texto Base'}
                      </h3>
                      {provaEmAndamento.fonte_texto_base && (
                        <p className="text-sm text-gray-500 italic">
                          Fonte: {provaEmAndamento.fonte_texto_base}
                        </p>
                      )}
                    </div>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: provaEmAndamento.texto_base }}
                    />
                  </div>
                </div>
              )}

              {/* Painel da questão */}
              <div className={`${provaEmAndamento.tem_texto_base && provaEmAndamento.texto_base ? 'w-1/2' : 'w-full'} overflow-y-auto p-6`}>
                {provaEmAndamento.questoes && provaEmAndamento.questoes[questaoAtual] && (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Questão {questaoAtual + 1}
                      </h3>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: provaEmAndamento.questoes[questaoAtual].enunciado }}
                      />
                    </div>

                    {/* Área de resposta baseada no tipo de questão */}
                    <div className="space-y-4">
                      {provaEmAndamento.questoes?.[questaoAtual]?.tipo === 'multipla_escolha' && (
                        <div className="space-y-3">
                          {provaEmAndamento.questoes?.[questaoAtual]?.opcoes?.map((opcao, index) => (
                            <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name={`questao-${provaEmAndamento.questoes?.[questaoAtual]?.id}`}
                                value={opcao}
                                checked={(respostas as any)[provaEmAndamento.questoes?.[questaoAtual]?.id!] === opcao}
                                onChange={(e) => setRespostas({
                                  ...respostas,
                                  [provaEmAndamento.questoes?.[questaoAtual]?.id!]: e.target.value
                                })}
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="text-sm">{opcao}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {provaEmAndamento.questoes?.[questaoAtual]?.tipo === 'verdadeiro_falso' && (
                        <div className="space-y-3">
                          {['Verdadeiro', 'Falso'].map((opcao) => (
                            <label key={opcao} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name={`questao-${provaEmAndamento.questoes?.[questaoAtual]?.id}`}
                                value={opcao}
                                checked={(respostas as any)[provaEmAndamento.questoes?.[questaoAtual]?.id!] === opcao}
                                onChange={(e) => setRespostas({
                                  ...respostas,
                                  [provaEmAndamento.questoes?.[questaoAtual]?.id!]: e.target.value
                                })}
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="text-sm">{opcao}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {provaEmAndamento.questoes?.[questaoAtual]?.tipo === 'completar' && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Digite sua resposta..."
                            value={(respostas as any)[provaEmAndamento.questoes?.[questaoAtual]?.id!] || ''}
                            onChange={(e) => setRespostas({
                              ...respostas,
                              [provaEmAndamento.questoes?.[questaoAtual]?.id!]: e.target.value
                            })}
                            className="text-base"
                          />
                          <p className="text-xs text-gray-500">
                            💡 Dica: Use ___ no enunciado para indicar onde o aluno deve completar.
                          </p>
                        </div>
                      )}

                      {provaEmAndamento.questoes?.[questaoAtual]?.tipo === 'dissertativa' && (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Digite sua resposta dissertativa..."
                            value={(respostas as any)[provaEmAndamento.questoes?.[questaoAtual]?.id!] || ''}
                            onChange={(e) => setRespostas({
                              ...respostas,
                              [provaEmAndamento.questoes?.[questaoAtual]?.id!]: e.target.value
                            })}
                            rows={8}
                            className="text-base"
                          />
                        </div>
                      )}

                      {provaEmAndamento.questoes?.[questaoAtual]?.tipo === 'associacao' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Associe os itens da coluna A com os da coluna B:
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Coluna A</h4>
                              {provaEmAndamento.questoes?.[questaoAtual]?.opcoes?.slice(0, Math.floor((provaEmAndamento.questoes?.[questaoAtual]?.opcoes?.length || 0) / 2)).map((item, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                  {index + 1}. {item}
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Coluna B</h4>
                              {provaEmAndamento.questoes?.[questaoAtual]?.opcoes?.slice(Math.floor((provaEmAndamento.questoes?.[questaoAtual]?.opcoes?.length || 0) / 2)).map((item, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                  {String.fromCharCode(65 + index)}. {item}
                                </div>
                              ))}
                            </div>
                          </div>
                          <Input
                            placeholder="Ex: 1-A, 2-B, 3-C..."
                            value={(respostas as any)[provaEmAndamento.questoes?.[questaoAtual]?.id!] || ''}
                            onChange={(e) => setRespostas({
                              ...respostas,
                              [provaEmAndamento.questoes?.[questaoAtual]?.id!]: e.target.value
                            })}
                            className="text-base"
                          />
                        </div>
                      )}

                      {provaEmAndamento.questoes?.[questaoAtual]?.tipo === 'ordenacao' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Ordene os itens corretamente:
                          </p>
                          <div className="space-y-2">
                            {provaEmAndamento.questoes?.[questaoAtual]?.opcoes?.map((item, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                {index + 1}. {item}
                              </div>
                            ))}
                          </div>
                          <Input
                            placeholder="Ex: 3,1,4,2,5"
                            value={(respostas as any)[provaEmAndamento.questoes?.[questaoAtual]?.id!] || ''}
                            onChange={(e) => setRespostas({
                              ...respostas,
                              [provaEmAndamento.questoes?.[questaoAtual]?.id!]: e.target.value
                            })}
                            className="text-base"
                          />
                        </div>
                      )}
                    </div>

                    {/* Navegação entre questões */}
                    <div className="flex justify-between items-center pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          salvarRespostaAtual()
                          setQuestaoAtual(Math.max(0, questaoAtual - 1))
                        }}
                        disabled={questaoAtual === 0}
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {questaoAtual + 1} de {provaEmAndamento.questoes?.length}
                        </span>
                      </div>

                      <Button
                        onClick={() => {
                          salvarRespostaAtual()
                          if (questaoAtual < (provaEmAndamento.questoes?.length || 0) - 1) {
                            setQuestaoAtual(questaoAtual + 1)
                          } else {
                            finalizarProva()
                          }
                        }}
                      >
                        {questaoAtual < (provaEmAndamento.questoes?.length || 0) - 1 ? 'Próxima' : 'Finalizar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog para adicionar/editar questão */}
      <Dialog open={showQuestaoDialog} onOpenChange={setShowQuestaoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestao ? 'Editar Questão' : 'Adicionar Questão'}
            </DialogTitle>
            <DialogDescription>
              Configure a questão e suas opções. Use o editor rico para formatação avançada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Questão</Label>
                <Select
                  value={questaoData.tipo}
                  onValueChange={(value: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'completar' | 'associacao' | 'ordenacao') => 
                    setQuestaoData({...questaoData, tipo: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                    <SelectItem value="dissertativa">Dissertativa</SelectItem>
                    <SelectItem value="verdadeiro_falso">Verdadeiro/Falso</SelectItem>
                    <SelectItem value="completar">Completar Lacunas</SelectItem>
                    <SelectItem value="associacao">Associação</SelectItem>
                    <SelectItem value="ordenacao">Ordenação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ordem">Ordem da Questão</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={questaoData.ordem}
                  onChange={(e) => setQuestaoData({...questaoData, ordem: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="enunciado">Enunciado da Questão</Label>
              <RichTextEditor
                value={questaoData.enunciado}
                onChange={(value) => setQuestaoData({...questaoData, enunciado: value})}
                placeholder="Digite o enunciado da questão. Use formatação rica para destacar pontos importantes..."
                className="mt-2 min-h-[200px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pontuacao">Pontuação</Label>
                <Input
                  id="pontuacao"
                  type="number"
                  value={questaoData.pontuacao}
                  onChange={(e) => setQuestaoData({...questaoData, pontuacao: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="tempo">Tempo Estimado (seg)</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={questaoData.tempo_estimado || 60}
                  onChange={(e) => setQuestaoData({...questaoData, tempo_estimado: parseInt(e.target.value) || 60})}
                />
              </div>
            </div>
            
            {/* Opções específicas para cada tipo de questão */}
            {questaoData.tipo === 'multipla_escolha' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Opções de Múltipla Escolha</Label>
                {questaoData.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={opcao}
                        onChange={(e) => {
                          const newOpcoes = [...(questaoData.opcoes || [])]
                          newOpcoes[index] = e.target.value
                          setQuestaoData({...questaoData, opcoes: newOpcoes})
                        }}
                        placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                        className="text-base"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="resposta_correta"
                        checked={questaoData.resposta_correta === opcao}
                        onChange={() => setQuestaoData({...questaoData, resposta_correta: opcao})}
                        className="h-4 w-4 text-blue-600"
                      />
                      <Label className="text-sm font-medium">Correta</Label>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newOpcoes = [...(questaoData.opcoes || []), '']
                    setQuestaoData({...questaoData, opcoes: newOpcoes})
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Opção
                </Button>
              </div>
            )}

            {questaoData.tipo === 'verdadeiro_falso' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Resposta Correta</Label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="resposta_correta"
                      value="verdadeiro"
                      checked={questaoData.resposta_correta === 'verdadeiro'}
                      onChange={(e) => setQuestaoData({...questaoData, resposta_correta: e.target.value})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-lg font-medium">Verdadeiro</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="resposta_correta"
                      value="falso"
                      checked={questaoData.resposta_correta === 'falso'}
                      onChange={(e) => setQuestaoData({...questaoData, resposta_correta: e.target.value})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-lg font-medium">Falso</span>
                  </label>
                </div>
              </div>
            )}

            {questaoData.tipo === 'completar' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Resposta Correta</Label>
                <div className="space-y-2">
                  <Input
                    value={questaoData.resposta_correta || ''}
                    onChange={(e) => setQuestaoData({...questaoData, resposta_correta: e.target.value})}
                    placeholder="Digite a resposta correta"
                    className="text-base"
                  />
                  <p className="text-sm text-gray-600">
                    💡 <strong>Dica:</strong> Use <code>___</code> no enunciado para indicar lacunas que devem ser preenchidas.
                  </p>
                </div>
              </div>
            )}

            {questaoData.tipo === 'associacao' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Pares de Associação</Label>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Input
                          placeholder={`Item ${index + 1}`}
                          value={questaoData.opcoes?.[index * 2] || ''}
                          onChange={(e) => {
                            const newOpcoes = [...(questaoData.opcoes || [])]
                            newOpcoes[index * 2] = e.target.value
                            setQuestaoData({...questaoData, opcoes: newOpcoes})
                          }}
                          className="text-base"
                        />
                      </div>
                      <div className="flex items-center text-lg font-bold text-gray-500">
                        →
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder={`Correspondente ${index + 1}`}
                          value={questaoData.opcoes?.[index * 2 + 1] || ''}
                          onChange={(e) => {
                            const newOpcoes = [...(questaoData.opcoes || [])]
                            newOpcoes[index * 2 + 1] = e.target.value
                            setQuestaoData({...questaoData, opcoes: newOpcoes})
                          }}
                          className="text-base"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questaoData.tipo === 'ordenacao' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Itens para Ordenar</Label>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder={`Item ${index + 1}`}
                          value={questaoData.opcoes?.[index] || ''}
                          onChange={(e) => {
                            const newOpcoes = [...(questaoData.opcoes || [])]
                            newOpcoes[index] = e.target.value
                            setQuestaoData({...questaoData, opcoes: newOpcoes})
                          }}
                          className="text-base"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  💡 <strong>Dica:</strong> Os itens devem ser ordenados do menor para o maior valor ou cronologicamente.
                </p>
              </div>
            )}

            {questaoData.tipo === 'dissertativa' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Critérios de Correção</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="resposta_correta">Resposta Modelo (Opcional)</Label>
                    <RichTextEditor
                      value={questaoData.resposta_correta || ''}
                      onChange={(value) => setQuestaoData({...questaoData, resposta_correta: value})}
                      placeholder="Digite uma resposta modelo para orientar a correção..."
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="explicacao">Critérios de Pontuação</Label>
                    <Textarea
                      id="explicacao"
                      value={questaoData.explicacao || ''}
                      onChange={(e) => setQuestaoData({...questaoData, explicacao: e.target.value})}
                      placeholder="Ex: - Coerência (2 pontos) - Argumentação (3 pontos) - Gramática (1 ponto)"
                      rows={3}
                      className="text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="explicacao">Explicação da Resposta (Opcional)</Label>
              <RichTextEditor
                value={questaoData.explicacao || ''}
                onChange={(value) => setQuestaoData({...questaoData, explicacao: value})}
                placeholder="Explicação detalhada da resposta correta..."
                className="mt-2 min-h-[150px]"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowQuestaoDialog(false)
                setEditingQuestao(null)
                resetQuestaoForm()
              }}>
                Cancelar
              </Button>
              {!editingQuestao && (
                <Button variant="outline" onClick={() => {
                  setShowQuestaoDialog(false)
                  resetQuestaoForm()
                }}>
                  Finalizar
                </Button>
              )}
              <Button onClick={async () => {
                try {
                  if (editingQuestao) {
                    await handleEditarQuestao(editingQuestao.id!)
                  } else {
                    // Encontrar a prova atual (rascunho ou a primeira disponível)
                    const provaAtual = provas.find(p => p.status === 'rascunho') || provas[0]
                    if (provaAtual) {
                      await handleAdicionarQuestao(provaAtual.id)
                      // Dialog stays open for adding more questions
                      toast.success('Questão adicionada! Adicione mais questões ou clique em "Finalizar".')
                    } else {
                      toast.error('Nenhuma prova disponível para adicionar questão')
                    }
                  }
                } catch (error) {
                  console.error('Erro ao salvar questão:', error)
                  toast.error('Erro ao salvar questão')
                }
              }}>
                <Save className="h-4 w-4 mr-2" />
                {editingQuestao ? 'Atualizar' : 'Adicionar'} Questão
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
} 