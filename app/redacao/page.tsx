"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
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
  Camera,
  Image as ImageIcon,
  X,
  ZoomIn,
  Play,
  Pause,
  Mic,
  MicOff,
  Edit3,
  Save,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  Bell,
  UserCheck,
  Users,
  BookOpen,
  Target,
  Timer,
  Sparkles,
  Loader2,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserRoleClient } from "@/lib/get-user-role"
import { createClient } from "@/lib/supabase/client"
import { getRedacoesUsuario, getTemasRedacao, getTemplatesRedacao, createRedacao, uploadAudioFeedback, salvarCorrecaoRedacao } from "@/app/actions"

// Tipos para as redações
interface Redacao {
  id: number
  titulo: string
  tema: string
  tema_id: number
  status: "rascunho" | "enviada" | "em_correcao" | "corrigida" | "revisada"
  nota_final?: number
  nota_ia?: number
  data_criacao: string
  data_envio?: string
  data_correcao?: string
  feedback_professor?: string
  feedback_audio_url?: string
  correcao_ia?: string
  imagens: RedacaoImagem[]
  comentarios?: ComentarioCorrecao[]
  aluno_id: string
  professor_id?: string
}

interface RedacaoImagem {
  id: number
  redacao_id: number
  url: string
  ordem: number
  rotation: number
}

interface ComentarioCorrecao {
  id: number
  redacao_id: number
  pagina: number
  x_position: number
  y_position: number
  comentario: string
  tipo: "erro" | "sugestao" | "elogio"
  created_at: string
}

interface Tema {
  id: number
  titulo: string
  descricao: string
  enunciado: string
  texto_motivador?: string
  tipo_prova: string
  ano?: number
  dificuldade: "facil" | "medio" | "dificil"
  tags: string[]
  tempo_limite: number // em minutos
  criterios_avaliacao: string[]
}

interface Template {
  id: number
  nome: string
  tipo: string
  descricao: string
}

export default function RedacaoPage() {
  const [redacoes, setRedacoes] = useState<Redacao[]>([])
  const [temas, setTemas] = useState<Tema[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedRedacao, setSelectedRedacao] = useState<Redacao | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  
  // Estados para correção
  const [correcaoData, setCorrecaoData] = useState({
    feedbackProfessor: "",
    notaFinal: "",
    comentarios: ""
  })
  const [salvandoCorrecao, setSalvandoCorrecao] = useState(false)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    titulo: "",
    tema_id: "",
    observacoes: ""
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Dados dos templates
  const templates: Template[] = [
    { id: 1, nome: "ENEM - Modelo Oficial", tipo: "ENEM", descricao: "Folha oficial do ENEM com 30 linhas" },
    { id: 2, nome: "CIAAR - Concurso da Aeronáutica", tipo: "CIAAR", descricao: "Modelo para provas da Aeronáutica" },
    { id: 3, nome: "EsPCEx - Escola de Sargentos", tipo: "EsPCEx", descricao: "Template para EsPCEx" },
    { id: 4, nome: "Modelo Genérico", tipo: "Genérico", descricao: "Para prática geral de redação" }
  ]

  // Verificar role do usuário
  const checkUserRole = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const role = await getUserRoleClient(user.id)
        setUserRole(role)
      }
    } catch (error) {
      console.error("Erro ao verificar role do usuário:", error)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        await checkUserRole()
        
        // Carregar dados reais do backend
        const [redacoesData, temasData] = await Promise.all([
          getRedacoesUsuario(),
          getTemasRedacao()
        ])
        
        setRedacoes(redacoesData)
        setTemas(temasData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Lidar com seleção de arquivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validar arquivos
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name} é muito grande (máx. 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length + selectedFiles.length > 10) {
      toast.error("Máximo de 10 páginas por redação")
      return
    }

    setSelectedFiles([...selectedFiles, ...validFiles])
    
    // Criar previews
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })
  }

  // Remover arquivo selecionado
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    
    // Limpar URL do preview
    URL.revokeObjectURL(previewUrls[index])
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
  }

  // Enviar redação
  const handleSubmitRedacao = async () => {
    if (!formData.titulo || !formData.tema_id || selectedFiles.length === 0) {
      toast.error("Preencha todos os campos e adicione pelo menos uma imagem")
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()

      // Verificar se bucket 'redacoes' existe
      const { data: buckets } = await supabase.storage.listBuckets()
      const redacoesBucket = buckets?.find(bucket => bucket.name === 'redacoes')
      
      if (!redacoesBucket) {
        // Criar bucket se não existir
        const { error: bucketError } = await supabase.storage.createBucket('redacoes', {
          public: false,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB
        })
        
        if (bucketError) {
          console.error("Erro ao criar bucket:", bucketError)
          toast.error("Erro no sistema de storage. Verifique as permissões.")
          setUploading(false)
          return
        }
      }

      const result = await createRedacao({
        titulo: formData.titulo,
        tema_id: parseInt(formData.tema_id),
        observacoes: formData.observacoes,
        imagens: selectedFiles
      })
      
      if (result.success) {
        toast.success("Redação enviada com sucesso!")
        setIsModalOpen(false)
        setFormData({ titulo: "", tema_id: "", observacoes: "" })
        setSelectedFiles([])
        setPreviewUrls([])
        
        // Recarregar redações
        const redacoesData = await getRedacoesUsuario()
        setRedacoes(redacoesData)
      } else {
        toast.error(result.error || "Erro ao enviar redação")
      }
    } catch (error) {
      console.error("Erro ao enviar redação:", error)
      toast.error("Erro ao enviar redação")
    } finally {
      setUploading(false)
    }
  }

  // Iniciar gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        
        // Se estamos visualizando uma redação, salvar como feedback
        if (selectedRedacao) {
          await salvarAudioFeedback(selectedRedacao.id, audioBlob)
        } else {
          console.log('Áudio gravado:', audioBlob)
          toast.success("Áudio feedback gravado!")
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)
      toast.error("Erro ao acessar microfone")
    }
  }

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Salvar áudio de feedback
  const salvarAudioFeedback = async (redacaoId: number, audioBlob: Blob) => {
    try {
      const result = await uploadAudioFeedback(redacaoId, audioBlob)
      if (result.success) {
        toast.success("Áudio de feedback salvo com sucesso!")
        // Recarregar redações para mostrar o áudio
        const redacoesData = await getRedacoesUsuario()
        setRedacoes(redacoesData)
      } else {
        toast.error(result.error || "Erro ao salvar áudio")
      }
    } catch (error) {
      console.error("Erro ao salvar áudio:", error)
      toast.error("Erro ao salvar áudio")
         }
   }

  // Salvar correção de redação
  const handleSalvarCorrecao = async () => {
    if (!selectedRedacao || !correcaoData.feedbackProfessor || !correcaoData.notaFinal) {
      toast.error("Preencha o feedback e a nota para salvar a correção")
      return
    }

    const nota = parseFloat(correcaoData.notaFinal)
    if (isNaN(nota) || nota < 0 || nota > 1000) {
      toast.error("Nota deve ser um número entre 0 e 1000")
      return
    }

    setSalvandoCorrecao(true)
    try {
      const result = await salvarCorrecaoRedacao({
        redacaoId: selectedRedacao.id,
        feedbackProfessor: correcaoData.feedbackProfessor,
        notaFinal: nota,
        comentarios: correcaoData.comentarios
      })
      
      if (result.success) {
        toast.success("Correção salva com sucesso!")
        setCorrecaoData({ feedbackProfessor: "", notaFinal: "", comentarios: "" })
        
        // Recarregar redações
        const redacoesData = await getRedacoesUsuario()
        setRedacoes(redacoesData)
        
        // Fechar modal se quiser
        // setIsViewerOpen(false)
      } else {
        toast.error(result.error || "Erro ao salvar correção")
      }
    } catch (error) {
      console.error("Erro ao salvar correção:", error)
      toast.error("Erro ao salvar correção")
    } finally {
      setSalvandoCorrecao(false)
    }
  }

  // Estatísticas calculadas
  const stats = {
    total: redacoes.length,
    pendentes: redacoes.filter((r) => r.status === "enviada" || r.status === "em_correcao").length,
    corrigidas: redacoes.filter((r) => r.status === "corrigida" || r.status === "revisada").length,
    mediaNotas: redacoes.filter((r) => r.nota_final).reduce((acc, r) => acc + (r.nota_final || 0), 0) / redacoes.filter((r) => r.nota_final).length || 0,
    rascunhos: redacoes.filter((r) => r.status === "rascunho").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "rascunho":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30"
      case "enviada":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "em_correcao":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
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
      case "rascunho":
        return <Edit3 className="h-4 w-4" />
      case "enviada":
        return <Send className="h-4 w-4" />
      case "em_correcao":
        return <Clock className="h-4 w-4" />
      case "corrigida":
        return <CheckCircle2 className="h-4 w-4" />
      case "revisada":
        return <Star className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const isTeacher = userRole === "teacher" || userRole === "admin"
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🖍️ Redação
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher 
                ? "Gerencie e corrija redações dos seus alunos" 
                : "Escreva, envie e acompanhe suas redações com correção profissional"
              }
            </p>
          </div>
          
          {!isTeacher && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transform transition-all duration-200 hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Redação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Enviar Nova Redação
                  </DialogTitle>
                  <DialogDescription>
                    Escolha um tema, fotografe ou escaneie sua redação e envie para correção
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Formulário */}
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tema">Tema da Redação *</Label>
                        <Select value={formData.tema_id} onValueChange={(value) => setFormData({...formData, tema_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um tema..." />
                          </SelectTrigger>
                          <SelectContent>
                            {temas.map((tema) => (
                              <SelectItem key={tema.id} value={tema.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {tema.tipo_prova}
                                  </Badge>
                                  {tema.titulo}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título da sua redação *</Label>
                        <Input
                          id="titulo"
                          value={formData.titulo}
                          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                          placeholder="Ex: A digitalização da educação brasileira"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações (opcional)</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                        placeholder="Alguma observação sobre sua redação..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Upload de Imagens */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Páginas da Redação *</Label>
                      <div className="text-sm text-muted-foreground">
                        {selectedFiles.length}/10 páginas
                      </div>
                    </div>
                    
                    <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center gap-4">
                          <Camera className="h-12 w-12 text-blue-500" />
                          <ImageIcon className="h-12 w-12 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Adicionar Páginas</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Fotografe ou escaneie suas páginas de redação
                          </p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Imagens
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview das imagens */}
                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Página ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-blue-200 dark:border-blue-800"
                            />
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Página {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tema selecionado - Preview */}
                    {formData.tema_id && (
                      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/20 border-blue-500/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Tema Selecionado</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const temaSelecionado = temas.find(t => t.id.toString() === formData.tema_id)
                            return temaSelecionado ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{temaSelecionado.titulo}</h4>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{temaSelecionado.tipo_prova}</Badge>
                                    <Badge variant="outline" className={
                                      temaSelecionado.dificuldade === "facil" ? "text-green-600 border-green-600" :
                                      temaSelecionado.dificuldade === "medio" ? "text-yellow-600 border-yellow-600" : 
                                      "text-red-600 border-red-600"
                                    }>
                                      {temaSelecionado.dificuldade}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{temaSelecionado.descricao}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-4 w-4" />
                                    {temaSelecionado.tempo_limite}min
                                  </div>
                                  {temaSelecionado.ano && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {temaSelecionado.ano}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null
                          })()}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitRedacao}
                      disabled={uploading || !formData.titulo || !formData.tema_id || selectedFiles.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Redação
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px] bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-200 dark:border-blue-800">
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="temas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              📝 Temas
            </TabsTrigger>
            <TabsTrigger 
              value="historico"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              📚 {isTeacher ? "Correções" : "Histórico"}
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              📄 Templates
            </TabsTrigger>
            <TabsTrigger 
              value="ia"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              🤖 IA
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Redações</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {isTeacher ? "Redações recebidas" : "Redações enviadas"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-500/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isTeacher ? "Para Corrigir" : "Pendentes"}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendentes}</div>
                  <p className="text-xs text-muted-foreground">
                    {isTeacher ? "Aguardando correção" : "Em análise"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Corrigidas</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.corrigidas}</div>
                  <p className="text-xs text-muted-foreground">Com feedback</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isTeacher ? "Média Geral" : "Sua Média"}
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.mediaNotas ? stats.mediaNotas.toFixed(0) : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground">Pontos (máx. 1000)</p>
                </CardContent>
              </Card>
            </div>

            {/* Conteúdo específico por role */}
            {isTeacher ? (
              // Dashboard do Professor
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Redações Urgentes
                    </CardTitle>
                    <CardDescription>Redações que precisam de atenção</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {redacoes.filter(r => r.status === "enviada").slice(0, 3).map((redacao) => (
                        <div key={redacao.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-600/20 border border-yellow-500/20 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium">{redacao.titulo}</p>
                              <p className="text-xs text-muted-foreground">
                                Enviada há {Math.floor((Date.now() - new Date(redacao.data_envio!).getTime()) / (1000 * 60 * 60 * 24))} dias
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
                            Corrigir
                          </Button>
                        </div>
                      ))}
                      {redacoes.filter(r => r.status === "enviada").length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          🎉 Todas as redações estão em dia!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Alunos Ativos
                    </CardTitle>
                    <CardDescription>Estudantes que mais enviam redações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Dados dos alunos serão exibidos aqui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Dashboard do Aluno
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Seu Progresso
                    </CardTitle>
                    <CardDescription>Evolução nas suas redações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Meta Mensal</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.total}/8 redações
                        </span>
                      </div>
                      <Progress value={(stats.total / 8) * 100} className="h-3 bg-blue-100 dark:bg-blue-900" />
                      <p className="text-xs text-muted-foreground">
                        {stats.total < 8 
                          ? `Faltam ${8 - stats.total} redações para completar sua meta mensal!`
                          : "🎉 Meta mensal alcançada! Continue praticando."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Últimas Redações
                    </CardTitle>
                    <CardDescription>Suas redações mais recentes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {redacoes.slice(0, 3).map((redacao) => (
                        <div key={redacao.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-600/10 border border-blue-500/20 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(redacao.status)}
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">{redacao.titulo}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(redacao.data_criacao).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(redacao.status)}>
                            {redacao.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                      {redacoes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="mb-2">Nenhuma redação enviada ainda</p>
                          <Button 
                            size="sm" 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                          >
                            Enviar Primeira Redação
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Temas Tab */}
          <TabsContent value="temas" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Temas Disponíveis</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-500" />
                <select className="p-2 border rounded-md bg-background border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500">
                  <option>Todos os tipos</option>
                  <option>ENEM</option>
                  <option>CIAAR</option>
                  <option>ESPCEX</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {temas.map((tema) => (
                <Card key={tema.id} className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                          {tema.tipo_prova}
                        </Badge>
                        <Badge variant="outline" className={
                          tema.dificuldade === "facil" ? "text-green-600 border-green-600 bg-green-50 dark:bg-green-950" :
                          tema.dificuldade === "medio" ? "text-yellow-600 border-yellow-600 bg-yellow-50 dark:bg-yellow-950" : 
                          "text-red-600 border-red-600 bg-red-50 dark:bg-red-950"
                        }>
                          {tema.dificuldade}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tema.titulo}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-muted-foreground">
                      {tema.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4 text-blue-500" />
                          {tema.tempo_limite}min
                        </div>
                        {tema.ano && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            {tema.ano}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {tema.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            {tag}
                          </Badge>
                        ))}
                        {tema.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tema.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                          onClick={() => {
                            // Visualizar tema completo
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Tema
                        </Button>
                        {!isTeacher && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-105"
                            onClick={() => {
                              setFormData({...formData, tema_id: tema.id.toString()})
                              setIsModalOpen(true)
                            }}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Escrever
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Histórico/Correções Tab */}
          <TabsContent value="historico" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isTeacher ? "Redações para Correção" : "Histórico de Redações"}
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-500" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="p-2 border rounded-md bg-background border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="enviada">Enviada</option>
                  <option value="em_correcao">Em Correção</option>
                  <option value="corrigida">Corrigida</option>
                  <option value="revisada">Revisada</option>
                </select>
              </div>
            </div>

            {redacoesFiltradas.length === 0 ? (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-800 dark:to-purple-900 border-blue-200 dark:border-blue-700 hover:shadow-2xl transition-all duration-300">
                <CardContent className="text-center py-16">
                  <div className="p-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 mx-auto mb-6 w-fit">
                    <FileText className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent">
                    {isTeacher ? "Nenhuma redação para corrigir" : "Nenhuma redação encontrada"}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-lg leading-relaxed max-w-md mx-auto mb-8">
                    {filtroStatus === "todos"
                      ? isTeacher 
                        ? "Quando os alunos enviarem redações, elas aparecerão aqui."
                        : "Você ainda não enviou nenhuma redação."
                      : `Nenhuma redação com status "${filtroStatus.replace("_", " ")}" encontrada.`}
                  </p>
                  {!isTeacher && (
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-3 text-lg font-semibold transform transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enviar Primeira Redação
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {redacoesFiltradas.map((redacao) => (
                  <Card key={redacao.id} className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {redacao.titulo}
                        </CardTitle>
                        <Badge className={`${getStatusColor(redacao.status)} transform transition-all duration-200 group-hover:scale-105`}>
                          {getStatusIcon(redacao.status)}
                          <span className="ml-1">{redacao.status.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <CardDescription className="text-muted-foreground">{redacao.tema}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {redacao.data_envio 
                              ? `Enviada: ${new Date(redacao.data_envio).toLocaleDateString()}`
                              : `Criada: ${new Date(redacao.data_criacao).toLocaleDateString()}`
                            }
                          </span>
                        </div>

                        {redacao.nota_final && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                            <Award className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Nota: {redacao.nota_final}/1000</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                          <ImageIcon className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">{redacao.imagens?.length || 0} páginas</span>
                        </div>

                        {isTeacher && redacao.status === "enviada" && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Aguardando correção</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                          onClick={() => {
                            setSelectedRedacao(redacao)
                            setIsViewerOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>

                        {isTeacher && redacao.status === "enviada" && (
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-105"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Corrigir
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                📄 Templates de Redação
              </h2>
              <p className="text-muted-foreground mb-6">
                Baixe templates oficiais para praticar redação com o formato correto de cada prova
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                        {template.tipo}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.nome}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {template.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>Formato oficial {template.tipo}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-105"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 to-purple-600/20 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg">📝 Como usar os templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400">
                      Para prática em casa:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        Baixe e imprima o template apropriado
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        Escreva sua redação à mão com caneta preta
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        Fotografe ou escaneie com boa qualidade
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        Envie através da nossa plataforma
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-purple-600 dark:text-purple-400">
                      Para simulados:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        Use sempre o template oficial da prova
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        Respeite rigorosamente o limite de linhas
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        Pratique sua caligrafia e legibilidade
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        Cronometre o tempo conforme a prova real
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IA Tab */}
          <TabsContent value="ia" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                🤖 Assistente de Redação IA
              </h2>
              <p className="text-muted-foreground mb-6">
                Receba análise instantânea e sugestões de melhoria para suas redações
              </p>
            </div>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 to-purple-600/20 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Análise Instantânea
                </CardTitle>
                <CardDescription>
                  Cole o texto da sua redação e receba feedback detalhado em segundos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="texto-redacao" className="text-sm font-medium mb-2 block">
                      Texto da Redação:
                    </Label>
                    <Textarea
                      id="texto-redacao"
                      placeholder="Cole aqui o texto da sua redação para análise instantânea..."
                      className="min-h-[200px] resize-none border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-105">
                      <Bot className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Professor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    O que a IA analisa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Estrutura e organização textual",
                      "Gramática e correção linguística", 
                      "Coesão e coerência argumentativa",
                      "Adequação ao tema proposto",
                      "Proposta de intervenção (quando aplicável)",
                      "Uso de conectivos e elementos coesivos",
                      "Repertório sociocultural",
                      "Progressão temática"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Vantagens da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: Clock, text: "Feedback instantâneo em segundos", color: "text-blue-500" },
                      { icon: Eye, text: "Análise detalhada por competências", color: "text-green-500" },
                      { icon: TrendingUp, text: "Sugestões específicas de melhoria", color: "text-blue-500" },
                      { icon: Award, text: "Nota estimada por critério", color: "text-purple-500" },
                      { icon: MessageSquare, text: "Comentários contextualizados", color: "text-pink-500" },
                      { icon: Target, text: "Identificação de pontos fracos", color: "text-red-500" },
                      { icon: Sparkles, text: "Sugestões de repertório", color: "text-yellow-500" },
                      { icon: UserCheck, text: "Disponível 24/7", color: "text-indigo-500" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Importante sobre a IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • A análise da IA é uma <strong>ferramenta de apoio</strong> e não substitui a correção do professor
                  </p>
                  <p>
                    • Use o feedback da IA para <strong>melhorar sua redação</strong> antes de enviar para correção final
                  </p>
                  <p>
                    • A nota da IA é <strong>estimativa</strong> - a nota oficial será sempre do professor
                  </p>
                  <p>
                    • Para concursos, sempre pratique com a <strong>correção humana</strong> para melhor preparação
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Visualização de Redação */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedRedacao?.titulo}
              </DialogTitle>
              <DialogDescription>
                Tema: {selectedRedacao?.tema} • Status: {selectedRedacao?.status.replace("_", " ")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRedacao && selectedRedacao.imagens && (
              <div className="grid gap-4 lg:grid-cols-2 h-[70vh]">
                {/* Visualizador de Imagens */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Página {selectedImageIndex + 1} de {selectedRedacao.imagens.length}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                        disabled={selectedImageIndex === 0}
                      >
                        ← Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImageIndex(Math.min(selectedRedacao.imagens.length - 1, selectedImageIndex + 1))}
                        disabled={selectedImageIndex === selectedRedacao.imagens.length - 1}
                      >
                        Próxima →
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <img
                      src={selectedRedacao.imagens[selectedImageIndex]?.url || "/placeholder.jpg"}
                      alt={`Página ${selectedImageIndex + 1}`}
                      className="w-full h-auto max-h-[500px] object-contain"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedRedacao.imagens.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden",
                          selectedImageIndex === index ? "border-orange-500" : "border-muted"
                        )}
                      >
                        <img
                          src={img.url}
                          alt={`Página ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Painel de Correção (apenas para professores) */}
                {isTeacher && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ferramentas de Correção</h4>
                        {selectedRedacao.status === "enviada" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Iniciar correção
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Iniciar Correção
                          </Button>
                        )}
                      </div>

                      {/* Feedback geral */}
                      <div className="space-y-3">
                        <Label>Feedback Geral:</Label>
                        <Textarea
                          value={correcaoData.feedbackProfessor}
                          onChange={(e) => setCorrecaoData({...correcaoData, feedbackProfessor: e.target.value})}
                          placeholder="Escreva seu feedback detalhado sobre a redação..."
                          className="min-h-[120px]"
                        />
                      </div>

                      {/* Comentários por página */}
                      <div className="space-y-3">
                        <Label>Comentários da Página {selectedImageIndex + 1}:</Label>
                        <Textarea
                          value={correcaoData.comentarios}
                          onChange={(e) => setCorrecaoData({...correcaoData, comentarios: e.target.value})}
                          placeholder="Adicione comentários específicos sobre esta página..."
                          className="min-h-[80px]"
                        />
                      </div>

                      {/* Gravação de áudio */}
                      <div className="space-y-2">
                        <Label>Feedback em Áudio:</Label>
                        <div className="flex gap-2">
                          {!isRecording ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={startRecording}
                            >
                              <Mic className="h-4 w-4 mr-1" />
                              Gravar Áudio
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={stopRecording}
                            >
                              <MicOff className="h-4 w-4 mr-1" />
                              Parar Gravação
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Nota */}
                      <div className="space-y-2">
                        <Label htmlFor="nota">Nota Final (0-1000):</Label>
                        <Input
                          id="nota"
                          type="number"
                          min="0"
                          max="1000"
                          value={correcaoData.notaFinal}
                          onChange={(e) => setCorrecaoData({...correcaoData, notaFinal: e.target.value})}
                          placeholder="Ex: 850"
                        />
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Salvar Correção
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Finalizar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Painel de Feedback (para alunos) */}
                {!isTeacher && selectedRedacao.feedback_professor && (
                  <div className="border rounded-lg p-4 bg-green-500/10">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Feedback do Professor
                    </h4>
                    <div className="space-y-3">
                      {selectedRedacao.nota_final && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            Nota: {selectedRedacao.nota_final}/1000
                          </span>
                        </div>
                      )}
                      <p className="text-sm">{selectedRedacao.feedback_professor}</p>
                      {selectedRedacao.feedback_audio_url && (
                        <Button variant="outline" size="sm">
                          <Volume2 className="h-4 w-4 mr-1" />
                          Ouvir Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
