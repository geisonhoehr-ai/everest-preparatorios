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
  const [tentativas, setTentativas] = useState([])
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
    fonte_texto_base: ''
  })
  
  // Estados para questões
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [editingQuestao, setEditingQuestao] = useState<Questao | null>(null)
  const [showQuestaoDialog, setShowQuestaoDialog] = useState(false)
  const [questaoData, setQuestaoData] = useState<Questao>({
    tipo: 'multipla_escolha',
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
    
    // Verificação otimizada de autenticação e role (mesmo padrão do flashcards)
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
      
      // Debug: verificar provas publicadas no banco
      console.log('🔍 [CLIENT] Verificando provas no banco...')
      const debugResult = await checkPublishedExams()
      console.log('📊 [CLIENT] Debug - Provas no banco:', debugResult)
      
      let result
      
      if (userRole === 'teacher' || userRole === 'admin') {
        console.log('👨‍🏫 [CLIENT] Carregando provas do professor...')
        result = await getProvasProfessor()
      } else {
        console.log('👨‍🎓 [CLIENT] Carregando provas do aluno...')
        result = await getProvas()
      }
      
      console.log('📊 [CLIENT] Resultado loadProvas:', result)
      console.log('📊 [CLIENT] Result data:', result.data)
      console.log('❌ [CLIENT] Result error:', result.error)
      
      if (result.data) {
        setProvas(result.data)
        console.log('✅ [CLIENT] Provas carregadas:', result.data.length)
        console.log('📝 [CLIENT] Provas:', result.data.map(p => ({ id: p.id, titulo: p.titulo, status: p.status })))
      } else if (result.error) {
        console.error('❌ [CLIENT] Erro ao carregar provas:', result.error)
        toast.error('Erro ao carregar provas')
      }
    } catch (error) {
      console.error('❌ [CLIENT] Erro ao carregar provas:', error)
      console.error('❌ [CLIENT] Tipo do erro:', typeof error)
      console.error('❌ [CLIENT] Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
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
          fonte_texto_base: ''
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
        // Reset form data
        resetQuestaoForm()
        // Keep dialog open for adding more questions
        setShowQuestaoDialog(true)
        loadProvas() // Recarregar para mostrar a nova questão
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
        // Reset form data
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
      console.log('📝 [CLIENT] Provas disponíveis:', provas.map(p => ({ id: p.id, titulo: p.titulo, status: p.status })))
      console.log('👤 [CLIENT] User role:', userRole)
      
      // Verificar se a prova existe e está publicada
      const provaEncontrada = provas.find(p => p.id === provaId)
      console.log('📝 [CLIENT] Prova encontrada:', provaEncontrada)
      
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
      console.log('✅ [CLIENT] Resultado iniciarTentativa:', result)
      console.log('📊 [CLIENT] Result data:', result.data)
      console.log('❌ [CLIENT] Result error:', result.error)
      
      if (result.data) {
        setTentativaAtual(result.data)
        setProvaEmAndamento(provaEncontrada)
        setQuestaoAtual(0)
        setRespostas({})
        console.log('✅ [CLIENT] Prova iniciada com sucesso')
        toast.success('Prova iniciada com sucesso!')
      } else {
        console.error('❌ [CLIENT] Erro ao iniciar prova:', result.error)
        const errorMessage = result.error?.message || 'Erro desconhecido ao iniciar prova'
        toast.error(`Erro ao iniciar prova: ${errorMessage}`)
      }
    } catch (error) {
      console.error('❌ [CLIENT] Erro ao iniciar prova:', error)
      console.error('❌ [CLIENT] Tipo do erro:', typeof error)
      console.error('❌ [CLIENT] Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error('Erro ao iniciar prova')
    }
  }

  const salvarRespostaAtual = async () => {
    if (!tentativaAtual) return
    
    try {
      const questao = provaEmAndamento?.questoes?.[questaoAtual]
      if (questao) {
        await salvarResposta(tentativaAtual.id, questao.id, respostas[questao.id] || '')
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
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Provas Online</h1>
            <p className="text-muted-foreground">
              Pratique com provas simuladas e avalie seu conhecimento
            </p>
          </div>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Prova
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Prova</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da prova e adicione as questões
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-3 gap-4">
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
                  </div>

                {/* Seção do Texto Base */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tem_texto_base"
                      checked={provaData.tem_texto_base}
                      onChange={(e) => setProvaData({...provaData, tem_texto_base: e.target.checked})}
                    />
                    <Label htmlFor="tem_texto_base">Esta prova tem texto base para interpretação</Label>
                  </div>

                  {provaData.tem_texto_base && (
                    <div className="space-y-4 border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
                      <div>
                        <Label htmlFor="titulo_texto_base">Título do Texto Base</Label>
                        <Input
                          id="titulo_texto_base"
                          value={provaData.titulo_texto_base}
                          onChange={(e) => setProvaData({...provaData, titulo_texto_base: e.target.value})}
                          placeholder="Ex: O que é voar?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="texto_base">Texto Base</Label>
                        <RichTextEditor
                          value={provaData.texto_base}
                          onChange={(value) => setProvaData({...provaData, texto_base: value})}
                          placeholder="Cole aqui o texto que será usado para as questões de interpretação..."
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fonte_texto_base">Fonte do Texto (Opcional)</Label>
                        <Input
                          id="fonte_texto_base"
                          value={provaData.fonte_texto_base}
                          onChange={(e) => setProvaData({...provaData, fonte_texto_base: e.target.value})}
                          placeholder="Ex: AEROMAGAZINE. O que é voar? Disponível em: https://..."
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvarProva}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Prova
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="disponiveis">Provas Disponíveis</TabsTrigger>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <TabsTrigger value="gerenciar">Gerenciar Provas</TabsTrigger>
          )}
          <TabsTrigger value="tentativas">Minhas Tentativas</TabsTrigger>
        </TabsList>

        <TabsContent value="disponiveis" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar provas..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {provas.filter(p => p.status === 'publicada').map((prova) => (
              <Card key={prova.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{prova.titulo}</CardTitle>
                      <CardDescription className="mt-2">{prova.descricao}</CardDescription>
                    </div>
                    <Badge className={getDificuldadeColor(prova.dificuldade)}>
                      {prova.dificuldade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">{prova.materia}</Badge>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {prova.tempo_limite} min
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {prova.tentativas_permitidas} tentativa{prova.tentativas_permitidas > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        Nota mínima: {prova.nota_minima}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(prova.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => iniciarProva(prova.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Prova
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {(userRole === 'teacher' || userRole === 'admin') && (
          <TabsContent value="gerenciar" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {provas.map((prova) => (
                <Card key={prova.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{prova.titulo}</CardTitle>
                        <CardDescription className="mt-2">{prova.descricao}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(prova.status)}>
                        {getStatusText(prova.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="secondary">{prova.materia}</Badge>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {prova.tempo_limite} min
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {prova.questoes?.length || 0} questões
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setQuestaoData({
                            tipo: 'multipla_escolha',
                            enunciado: '',
                            pontuacao: 1,
                            ordem: (prova.questoes?.length || 0) + 1,
                            opcoes: ['', '', '', ''],
                            resposta_correta: ''
                          })
                          setShowQuestaoDialog(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Questão
                      </Button>
                      {prova.status === 'rascunho' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublicarProva(prova.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Publicar
                        </Button>
                      )}
                      {prova.status === 'publicada' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleArquivarProva(prova.id)}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Arquivar
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeletarProva(prova.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="tentativas" className="space-y-6">
          <h2 className="text-xl font-semibold">Minhas Tentativas</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tentativas.map((tentativa: any) => (
              <Card key={tentativa.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{tentativa.prova?.titulo}</CardTitle>
                  <CardDescription>
                    Tentativa realizada em {new Date(tentativa.iniciada_em).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={tentativa.finalizada ? "default" : "secondary"}>
                        {tentativa.finalizada ? "Finalizada" : "Em andamento"}
                      </Badge>
                    </div>
                    {tentativa.finalizada && (
                      <>
                        <div className="flex justify-between">
                          <span>Nota:</span>
                          <span className="font-semibold">{tentativa.nota_final}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tempo:</span>
                          <span>{Math.round(tentativa.tempo_gasto / 60)} min</span>
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

      {/* Dialog para adicionar/editar questão */}
      <Dialog open={showQuestaoDialog} onOpenChange={setShowQuestaoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestao ? 'Editar Questão' : 'Adicionar Questão'}
            </DialogTitle>
            <DialogDescription>
              Configure a questão e suas opções
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="enunciado">Enunciado</Label>
              <RichTextEditor
                value={questaoData.enunciado}
                onChange={(value) => setQuestaoData({...questaoData, enunciado: value})}
                placeholder="Digite o enunciado da questão"
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={questaoData.ordem}
                  onChange={(e) => setQuestaoData({...questaoData, ordem: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="tempo">Tempo (seg)</Label>
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
              <div className="space-y-3">
                <Label>Opções</Label>
                {questaoData.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={opcao}
                      onChange={(e) => {
                        const newOpcoes = [...(questaoData.opcoes || [])]
                        newOpcoes[index] = e.target.value
                        setQuestaoData({...questaoData, opcoes: newOpcoes})
                      }}
                      placeholder={`Opção ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="resposta_correta"
                      checked={questaoData.resposta_correta === opcao}
                      onChange={() => setQuestaoData({...questaoData, resposta_correta: opcao})}
                    />
                    <Label className="text-sm">Correta</Label>
                  </div>
                ))}
              </div>
            )}

            {questaoData.tipo === 'verdadeiro_falso' && (
              <div className="space-y-3">
                <Label>Resposta Correta</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="resposta_correta"
                      value="verdadeiro"
                      checked={questaoData.resposta_correta === 'verdadeiro'}
                      onChange={(e) => setQuestaoData({...questaoData, resposta_correta: e.target.value})}
                    />
                    <span>Verdadeiro</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="resposta_correta"
                      value="falso"
                      checked={questaoData.resposta_correta === 'falso'}
                      onChange={(e) => setQuestaoData({...questaoData, resposta_correta: e.target.value})}
                    />
                    <span>Falso</span>
                  </label>
                </div>
              </div>
            )}

            {questaoData.tipo === 'completar' && (
              <div className="space-y-3">
                <Label>Resposta Correta</Label>
                <Input
                  value={questaoData.resposta_correta || ''}
                  onChange={(e) => setQuestaoData({...questaoData, resposta_correta: e.target.value})}
                  placeholder="Digite a resposta correta"
                />
                <p className="text-sm text-gray-500">
                  Use ___ para indicar lacunas no enunciado
                </p>
              </div>
            )}

            {questaoData.tipo === 'associacao' && (
              <div className="space-y-3">
                <Label>Pares de Associação</Label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder={`Item ${index + 1}`}
                        value={questaoData.opcoes?.[index * 2] || ''}
                        onChange={(e) => {
                          const newOpcoes = [...(questaoData.opcoes || [])]
                          newOpcoes[index * 2] = e.target.value
                          setQuestaoData({...questaoData, opcoes: newOpcoes})
                        }}
                      />
                      <span className="flex items-center">→</span>
                      <Input
                        placeholder={`Correspondente ${index + 1}`}
                        value={questaoData.opcoes?.[index * 2 + 1] || ''}
                        onChange={(e) => {
                          const newOpcoes = [...(questaoData.opcoes || [])]
                          newOpcoes[index * 2 + 1] = e.target.value
                          setQuestaoData({...questaoData, opcoes: newOpcoes})
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questaoData.tipo === 'ordenacao' && (
              <div className="space-y-3">
                <Label>Itens para Ordenar</Label>
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <Input
                      placeholder={`Item ${index + 1}`}
                      value={questaoData.opcoes?.[index] || ''}
                      onChange={(e) => {
                        const newOpcoes = [...(questaoData.opcoes || [])]
                        newOpcoes[index] = e.target.value
                        setQuestaoData({...questaoData, opcoes: newOpcoes})
                      }}
                    />
                  </div>
                ))}
                <p className="text-sm text-gray-500">
                  Os itens devem ser ordenados do menor para o maior
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="explicacao">Explicação (Opcional)</Label>
              <Textarea
                id="explicacao"
                value={questaoData.explicacao || ''}
                onChange={(e) => setQuestaoData({...questaoData, explicacao: e.target.value})}
                placeholder="Explicação da resposta correta"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
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