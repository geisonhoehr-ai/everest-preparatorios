"use client"

import { useState, useEffect, useTransition } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpenText, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Trophy, 
  Star, 
  Search, 
  Flame, 
  Clock,
  Target,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Timer,
  Brain,
  RefreshCw,
  Maximize,
  Minimize,
  Keyboard,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  Shield
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context"
import { updateFlashcardProgress, updateFlashcard, deleteFlashcard, getAllSubjects, getTopicsBySubject, getFlashcardsForReview, createFlashcard, updateFlashcardProgressSM2, getCardsForReview, getNewCards, getFlashcardProgressStats } from "../../server-actions"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Interface para subjects
interface Subject {
  id: number
  name: string
  description?: string
}


interface Topic {
  id: string
  name: string
  description: string
}

interface Flashcard {
  id: number
  topic_id: string
  question: string
  answer: string
}

export default function FlashcardsPage() {
  const { user, profile } = useAuth()
  
  // Debug: verificar dados do usuário
  console.log('🔍 Debug Flashcards - User:', user)
  console.log('🔍 Debug Flashcards - Profile:', profile)
  console.log('🔍 Debug Flashcards - Profile Role:', profile?.role)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState<"select" | "study" | "finished">("select")
  const [studyType, setStudyType] = useState<"review" | "new" | "learning" | "all">("review")
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [progressStats, setProgressStats] = useState({
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    total: 0
  })
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "difficulty" | "progress">("newest")
  
  // Estados para edição inline (admin/teacher)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFlashcardLoading, setIsFlashcardLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [editForm, setEditForm] = useState({
    question: '',
    answer: ''
  })
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Carregar subjects quando o componente for montado
  useEffect(() => {
    if (user?.id) {
      loadSubjects()
    }
  }, [user?.id])

  // Garantir que subjects sempre seja um array válido
  const safeSubjects = Array.isArray(subjects) ? subjects : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeFlashcards = Array.isArray(flashcards) ? flashcards : []

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Carregando matérias do Supabase...")
      
      const subjectsData = await getAllSubjects()
      console.log("✅ Matérias carregadas:", subjectsData.length)
      
      // Adicionar descrições padrão baseadas no nome
      const subjectsWithDescription = subjectsData.map((subject: any) => ({
        ...subject,
        description: subject.name === "Português" 
          ? "Gramática, Literatura e Redação"
          : subject.name === "Regulamentos"
          ? "Normas e Regulamentos Aeronáuticos"
          : `Estude e pratique seus conhecimentos em ${subject.name}`
      }))
      
      setSubjects(subjectsWithDescription)
      
    } catch (error) {
      console.error("❌ Erro ao carregar matérias:", error)
      setSubjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async (subjectId: number) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando tópicos do Supabase para matéria ${subjectId}...`)
      
      const topicsData = await getTopicsBySubject(subjectId)
      console.log("✅ Tópicos carregados:", topicsData.length)
      
      // Converter para o formato esperado
      const formattedTopics = topicsData.map(topic => ({
        id: topic.id.toString(),
        name: topic.name,
        description: `Estude e pratique ${topic.name.toLowerCase()}`
      }))
      
      setTopics(formattedTopics)
      
    } catch (error) {
      console.error("❌ Erro ao carregar tópicos:", error)
      setTopics([])
    } finally {
      setIsLoading(false)
    }
  }

  // Funções para edição inline (admin/teacher)
  const handleEditFlashcard = (flashcard: Flashcard) => {
    console.log("🔧 [Debug] handleEditFlashcard chamado com:", flashcard)
    console.log("🔧 [Debug] Profile disponível:", profile)
    console.log("🔧 [Debug] User disponível:", user)
    setEditingFlashcard(flashcard)
    setEditForm({
      question: flashcard.question,
      answer: flashcard.answer
    })
    setIsEditDialogOpen(true)
    console.log("🔧 [Debug] Modal deve estar aberto agora")
  }

  const handleSaveEdit = async () => {
    console.log("🔧 [Debug] handleSaveEdit chamado")
    console.log("🔧 [Debug] Profile user_id:", profile?.user_id)
    console.log("🔧 [Debug] Selected topic:", selectedTopic)
    console.log("🔧 [Debug] Editing flashcard:", editingFlashcard)
    console.log("🔧 [Debug] Edit form:", editForm)
    
    if (!profile?.user_id) {
      console.log("❌ [Debug] Falta profile.user_id")
      return
    }
    
    setIsFlashcardLoading(true)
    
    startTransition(async () => {
      try {
      if (editingFlashcard) {
        console.log("🔧 [Debug] Editando flashcard existente")
        // Editar flashcard existente
        const result = await updateFlashcard(
          profile.user_id, 
          editingFlashcard.id, 
          editForm.question, 
          editForm.answer
        )
        
        console.log("🔧 [Debug] Resultado da atualização:", result)
        
        if (result.success) {
          setFlashcards(prev => 
            prev.map(f => f.id === editingFlashcard.id 
              ? { ...f, question: editForm.question, answer: editForm.answer }
              : f
            )
          )
        }
      } else {
        console.log("🔧 [Debug] Criando novo flashcard")
        // Criar novo flashcard
        if (!selectedTopic) {
          alert("Selecione um tópico primeiro")
          return
        }
        
        const result = await createFlashcard(profile.user_id, {
          topic_id: selectedTopic,
          question: editForm.question,
          answer: editForm.answer
        })
        
        console.log("🔧 [Debug] Resultado da criação:", result)
        
        if (result.success && result.data) {
          setFlashcards(prev => [result.data, ...prev])
        }
      }
      
      setIsEditDialogOpen(false)
      setEditingFlashcard(null)
      setEditForm({ question: '', answer: '' })
      } catch (error) {
        console.error("❌ [Debug] Erro ao salvar flashcard:", error)
      } finally {
        setIsFlashcardLoading(false)
      }
    })
  }

  const handleDeleteFlashcard = async (flashcardId: number) => {
    if (!profile?.user_id) return
    
    if (confirm("Tem certeza que deseja excluir este flashcard?")) {
      try {
        const result = await deleteFlashcard(profile.user_id, flashcardId)
        if (result.success) {
          setFlashcards(prev => prev.filter(f => f.id !== flashcardId))
        }
      } catch (error) {
        console.error("Erro ao excluir flashcard:", error)
      }
    }
  }

  const loadFlashcards = async (topicId: string, type: "review" | "new" | "learning" | "all" = "review") => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando flashcards do Supabase para tópico ${topicId}, tipo: ${type}...`)
      
      if (!user?.id) {
        console.error("❌ Usuário não autenticado")
        return
      }

      let flashcardsData: any[] = []

      switch (type) {
        case "review":
          const reviewResult = await getCardsForReview(user.id, topicId, 20)
          if (reviewResult.success && reviewResult.data) {
            flashcardsData = reviewResult.data.map((item: any) => ({
              id: item.flashcards.id,
              topic_id: item.flashcards.topic_id,
              question: item.flashcards.question,
              answer: item.flashcards.answer,
              progress: item // Incluir dados de progresso
            }))
          }
          break
        case "new":
          const newResult = await getNewCards(user.id, topicId, 10)
          if (newResult.success && newResult.data) {
            flashcardsData = newResult.data
          }
          break
        case "learning":
          // Para learning, buscar cards com status 'learning' ou 'relearning'
          const learningResult = await getCardsForReview(user.id, topicId, 15)
          if (learningResult.success && learningResult.data) {
            flashcardsData = learningResult.data
              .filter((item: any) => item.status === 'learning' || item.status === 'relearning')
              .map((item: any) => ({
                id: item.flashcards.id,
                topic_id: item.flashcards.topic_id,
                question: item.flashcards.question,
                answer: item.flashcards.answer,
                progress: item
              }))
          }
          break
        case "all":
        default:
          const allResult = await getFlashcardsForReview(topicId, 50)
          flashcardsData = allResult
          break
      }
      
      console.log(`✅ Flashcards carregados (${type}):`, flashcardsData.length)
      setFlashcards(flashcardsData)
      
    } catch (error) {
      console.error("❌ Erro ao carregar flashcards:", error)
      setFlashcards([])
    } finally {
      setIsLoading(false)
    }
  }

  const startStudy = (topicId: string, type: "review" | "new" | "learning" | "all" = "review") => {
    setSelectedTopic(topicId)
    setStudyType(type)
    loadFlashcards(topicId, type)
    setStudyMode("study")
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  const loadProgressStats = async (topicId?: string) => {
    if (!user?.id) return
    
    try {
      const result = await getFlashcardProgressStats(user.id, topicId)
      if (result.success && result.data) {
        setProgressStats(result.data)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < safeFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      setStudyMode("finished")
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const markCorrect = async () => {
    setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    
    // Salvar progresso usando algoritmo SM2
    if (user && safeFlashcards[currentCardIndex]) {
      try {
        const currentCard = safeFlashcards[currentCardIndex]
        const result = await updateFlashcardProgressSM2(user.id, currentCard.id, 4) // Qualidade 4 = correto
        if (result.success) {
          setXpGained(prev => prev + 5) // 5 XP por acerto
          console.log(`✅ Card marcado como correto!`)
        }
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error)
      }
    }
    
    nextCard()
  }

  const markIncorrect = async () => {
    setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
    
    // Salvar progresso usando algoritmo SM2
    if (user && safeFlashcards[currentCardIndex]) {
      try {
        const currentCard = safeFlashcards[currentCardIndex]
        const result = await updateFlashcardProgressSM2(user.id, currentCard.id, 2) // Qualidade 2 = incorreto
        if (result.success) {
          setXpGained(prev => prev + 1) // 1 XP por tentativa
          console.log(`❌ Card marcado como incorreto!`)
        }
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error)
      }
    }
    
    nextCard()
  }

  // Nova função para avaliação de qualidade (0-5)
  const rateQuality = async (quality: number) => {
    if (user && safeFlashcards[currentCardIndex]) {
      try {
        const currentCard = safeFlashcards[currentCardIndex]
        const result = await updateFlashcardProgressSM2(user.id, currentCard.id, quality)
        if (result.success) {
          // Atualizar estatísticas baseado na qualidade
          if (quality >= 3) {
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }))
            setXpGained(prev => prev + (quality * 2)) // Mais XP para melhor qualidade
          } else {
            setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
            setXpGained(prev => prev + 1)
          }
          console.log(`📊 Card avaliado com qualidade ${quality}`)
        }
      } catch (error) {
        console.error('❌ Erro ao avaliar card:', error)
      }
    }
    
    nextCard()
  }

  const resetStudy = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setFlashcards([])
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  useEffect(() => {
    loadSubjects()
    if (user?.id) {
      loadProgressStats()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedTopic && user?.id) {
      loadProgressStats(selectedTopic)
    }
  }, [selectedTopic, user?.id])

  if (isLoading && studyMode === "select") {
    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </RoleGuard>
    )
  }

  // Seleção de matéria
  if (!selectedSubject) {
    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Escolha a Matéria
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Selecione a matéria que deseja estudar com flashcards
              </p>
            </div>
            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
              <div className="flex gap-2">
                <Button 
                  variant={isAdminMode ? "default" : "outline"}
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {isAdminMode ? "Modo Admin" : "Modo Normal"}
                </Button>
                <Button 
                  onClick={() => {
                    // TODO: Implementar criação de matéria
                    alert("Funcionalidade de adicionar matéria será implementada em breve")
                  }}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Matéria
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {safeSubjects.map((subject, index) => (
              <Card 
                key={subject.id || index} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-500"
                onClick={() => {
                  setSelectedSubject(subject.id)
                  loadTopics(subject.id)
                }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                    <BookOpenText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                    {subject.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {subject.description || "Estude e pratique seus conhecimentos"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4" />
                        <span>Tópicos</span>
                      </span>
                      <span className="font-medium">
                        -
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Play className="h-4 w-4" />
                        <span>Flashcards</span>
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                    <Play className="mr-3 h-6 w-6" />
                    Estudar {subject.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {safeSubjects.length === 0 && (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent>
                <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                  <BookOpenText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Nenhuma matéria disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
                  No momento não há matérias disponíveis para estudo. Tente novamente mais tarde.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </RoleGuard>
    )
  }

  // Seleção de tópico
  if (studyMode === "select") {
    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubject(null)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {safeSubjects.find(s => s.id === selectedSubject)?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Escolha um tópico para estudar
                </p>
              </div>
            </div>
            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
              <Button 
                onClick={() => {
                  // Abrir modal de criação de flashcard
                  setEditForm({ question: '', answer: '' })
                  setEditingFlashcard(null)
                  setIsEditDialogOpen(true)
                }}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4" />
                Novo Flashcard
              </Button>
            )}
          </div>

          {/* Dashboard de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{progressStats.new}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Novos</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{progressStats.learning}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aprendendo</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{progressStats.review}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Revisão</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{progressStats.relearning}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reaprendendo</div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Busca e Filtros */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar flashcards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory(null)
                      setSelectedTag(null)
                      setDifficultyFilter(null)
                      setSortBy("newest")
                    }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ordenar por:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="newest">Mais recentes</option>
                      <option value="oldest">Mais antigos</option>
                      <option value="difficulty">Dificuldade</option>
                      <option value="progress">Progresso</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dificuldade:
                    </label>
                    <select
                      value={difficultyFilter || ""}
                      onChange={(e) => setDifficultyFilter(e.target.value || null)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="">Todas</option>
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando tópicos...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {safeTopics.map((topic, index) => (
                <Card 
                  key={topic.id || index} 
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-500"
                  onClick={() => startStudy(topic.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                      {topic.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Button 
                        onClick={() => startStudy(topic.id, "review")}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 rounded-lg transition-all duration-300"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Revisão
                      </Button>
                      <Button 
                        onClick={() => startStudy(topic.id, "new")}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Novos
                      </Button>
                      <Button 
                        onClick={() => startStudy(topic.id, "learning")}
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        Aprendendo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {safeTopics.length === 0 && !isLoading && (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent>
                <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                  <Brain className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Nenhum tópico disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
                  Não há tópicos disponíveis para esta matéria no momento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </RoleGuard>
    )
  }

  // Modo de estudo
  if (studyMode === "study" && safeFlashcards.length > 0) {
    const currentCard = safeFlashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / safeFlashcards.length) * 100

    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={resetStudy}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Voltar
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {safeTopics.find(t => t.id === selectedTopic)?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Flashcard {currentCardIndex + 1} de {safeFlashcards.length}
              </p>
              {xpGained > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ⭐ +{xpGained} XP
                  </span>
                </div>
              )}
            </div>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="min-h-[400px] flex flex-col justify-center relative">
              {/* Ícones de edição para admin/teacher */}
              {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("🔧 [Debug] Botão de editar clicado!")
                      handleEditFlashcard(currentCard)
                    }}
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                    type="button"
                  >
                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteFlashcard(currentCard.id)
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              )}
              
              <CardContent className="p-8 text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentCard.question}
                  </h2>
                  
                  {showAnswer && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Resposta:
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  {!showAnswer ? (
                    <Button 
                      onClick={() => setShowAnswer(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Mostrar Resposta
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Como foi sua resposta?
                        </p>
                        <div className="flex gap-2 justify-center">
                          {[0, 1, 2, 3, 4, 5].map((quality) => (
                            <Button
                              key={quality}
                              onClick={() => rateQuality(quality)}
                              variant={quality >= 3 ? "default" : "destructive"}
                              size="sm"
                              className={`w-12 h-12 rounded-full ${
                                quality >= 3 
                                  ? "bg-green-500 hover:bg-green-600 text-white" 
                                  : "bg-red-500 hover:bg-red-600 text-white"
                              }`}
                            >
                              {quality}
                            </Button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Esqueci</span>
                          <span>Difícil</span>
                          <span>Bom</span>
                          <span>Fácil</span>
                        </div>
                      </div>
                      
                      {/* Botões alternativos para compatibilidade */}
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => rateQuality(2)}
                          variant="destructive"
                          className="px-6 py-2 text-sm"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Errei
                        </Button>
                        <Button 
                          onClick={() => rateQuality(4)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 text-sm"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Acertei
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6">
              <Button 
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                variant="outline"
              >
                <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                Anterior
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Acertos: <span className="font-bold text-green-600">{sessionStats.correct}</span> | 
                  Erros: <span className="font-bold text-red-600">{sessionStats.incorrect}</span>
                </p>
              </div>
              
              <Button 
                onClick={nextCard}
                disabled={currentCardIndex === safeFlashcards.length - 1}
                variant="outline"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  // Sessão finalizada
  if (studyMode === "finished") {
    const totalCards = sessionStats.correct + sessionStats.incorrect
    const accuracy = totalCards > 0 ? (sessionStats.correct / totalCards) * 100 : 0

    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
          <div className="text-center">
            <div className="mx-auto mb-6 p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-fit">
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sessão Finalizada!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Parabéns por completar o estudo!
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {sessionStats.correct}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Acertos</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {sessionStats.incorrect}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Erros</p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {accuracy.toFixed(1)}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Taxa de Acerto</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center mt-8">
              <Button 
                onClick={resetStudy}
                variant="outline"
                className="px-8 py-3"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Estudar Novamente
              </Button>
              <Button 
                onClick={() => setSelectedSubject(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Escolher Outra Matéria
              </Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  // Debug: verificar estado do modal
  console.log("🔧 [Debug] Estado do modal:", { isEditDialogOpen, editingFlashcard })

  return (
    <PagePermissionGuard pageName="flashcards">
      {/* Modal de Edição de Flashcard - Versão Simplificada */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingFlashcard ? 'Editar Flashcard' : 'Novo Flashcard'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {editingFlashcard 
                ? 'Atualize as informações do flashcard'
                : 'Crie um novo flashcard para a plataforma'
              }
            </p>
            
            <div className="space-y-4">
              {!editingFlashcard && (
                <div className="space-y-2">
                  <label htmlFor="edit-topic" className="text-sm font-medium">
                    Tópico
                  </label>
                  <select
                    id="edit-topic"
                    value={selectedTopic || ''}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Selecione um tópico</option>
                    {safeTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="edit-question" className="text-sm font-medium">
                  Pergunta
                </label>
                <Textarea
                  id="edit-question"
                  placeholder="Digite a pergunta..."
                  value={editForm.question}
                  onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-answer" className="text-sm font-medium">
                  Resposta
                </label>
                <Textarea
                  id="edit-answer"
                  placeholder="Digite a resposta..."
                  value={editForm.answer}
                  onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingFlashcard(null)
                    setEditForm({ question: '', answer: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={isFlashcardLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isFlashcardLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PagePermissionGuard>
  )
}