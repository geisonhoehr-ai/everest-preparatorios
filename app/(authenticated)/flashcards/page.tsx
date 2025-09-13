"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
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
import { updateFlashcardProgress, updateFlashcard, deleteFlashcard, getAllSubjects, getTopicsBySubject, getFlashcardsForReview, createFlashcard, updateFlashcardProgressSM2, getCardsForReview, getNewCards, getFlashcardProgressStats, getAllFlashcardCategories, getAllFlashcardTags, addFlashcardCategory, addFlashcardTag, removeFlashcardCategory, removeFlashcardTag, getFlashcardCategoriesAndTags, createStudySession, endStudySession, getStudySessionsHistory, getStudyAnalytics, createStudyGoal, getStudyGoals, updateStudyGoalProgress } from "../../server-actions"
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
  categories?: FlashcardCategory[]
  tags?: FlashcardTag[]
}

interface FlashcardCategory {
  id: number
  name: string
  description?: string
  color: string
  icon?: string
}

interface FlashcardTag {
  id: number
  name: string
  color: string
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
  
  // Estados para categorias e tags
  const [categories, setCategories] = useState<FlashcardCategory[]>([])
  const [tags, setTags] = useState<FlashcardTag[]>([])
  const [isCategoryTagDialogOpen, setIsCategoryTagDialogOpen] = useState(false)
  const [selectedFlashcardForTags, setSelectedFlashcardForTags] = useState<Flashcard | null>(null)
  
  // Estados para UI/UX
  const [isAnimating, setIsAnimating] = useState(false)
  const [cardFlipDirection, setCardFlipDirection] = useState<'next' | 'prev'>('next')
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Estados para modos de estudo avançados
  const [studyModeConfig, setStudyModeConfig] = useState({
    type: 'standard' as 'standard' | 'timer' | 'goals' | 'intensive' | 'test' | 'custom',
    timerMinutes: 15,
    goalCards: 20,
    goalAccuracy: 80,
    customSettings: {
      showHints: false,
      autoAdvance: false,
      shuffleCards: true,
      showProgress: true,
      timePerCard: 0 // 0 = sem limite
    }
  })
  const [sessionTimer, setSessionTimer] = useState(0)
  const [cardTimer, setCardTimer] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showStudyModeConfig, setShowStudyModeConfig] = useState(false)
  
  // Estados para rastreamento de progresso
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [studyHistory, setStudyHistory] = useState<any[]>([])
  const [studyAnalytics, setStudyAnalytics] = useState<any>(null)
  const [studyGoals, setStudyGoals] = useState<any[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
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

  const startStudy = async (topicId: string, type: "review" | "new" | "learning" | "all" = "review", modeType: 'standard' | 'timer' | 'goals' | 'intensive' | 'test' | 'custom' = 'standard') => {
    if (!user?.id) return
    
    setSelectedTopic(topicId)
    setStudyType(type)
    setStudyModeConfig(prev => ({ ...prev, type: modeType }))
    loadFlashcards(topicId, type)
    setStudyMode("study")
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    
    // Criar sessão de rastreamento
    try {
      const sessionResult = await createStudySession(user.id, {
        topic_id: topicId,
        start_time: new Date().toISOString(),
        cards_studied: 0,
        correct_answers: 0,
        incorrect_answers: 0,
        xp_gained: 0,
        session_type: modeType === 'standard' ? type : modeType,
        study_mode_config: studyModeConfig
      })
      
      if (sessionResult.success && sessionResult.data) {
        setCurrentSessionId(sessionResult.data.id)
        console.log("📊 Sessão de estudo criada:", sessionResult.data.id)
      }
    } catch (error) {
      console.error("❌ Erro ao criar sessão de estudo:", error)
    }
    
    // Iniciar sessão baseada no modo
    if (modeType !== 'standard') {
      startStudySession(modeType)
    }
    
    // Shuffle cards se necessário
    if (modeType === 'custom' && studyModeConfig.customSettings.shuffleCards) {
      setTimeout(() => shuffleFlashcards(), 100)
    }
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

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesResult, tagsResult] = await Promise.all([
        getAllFlashcardCategories(),
        getAllFlashcardTags()
      ])

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      }

      if (tagsResult.success && tagsResult.data) {
        setTags(tagsResult.data)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar categorias e tags:", error)
    }
  }

  const handleAddCategoryToFlashcard = async (flashcardId: number, categoryId: number) => {
    if (!user?.id) return

    try {
      const result = await addFlashcardCategory(user.id, flashcardId, categoryId)
      if (result.success) {
        console.log("✅ Categoria adicionada ao flashcard")
        // Recarregar categorias do flashcard
        loadFlashcardCategoriesAndTags(flashcardId)
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar categoria:", error)
    }
  }

  const handleAddTagToFlashcard = async (flashcardId: number, tagId: number) => {
    if (!user?.id) return

    try {
      const result = await addFlashcardTag(user.id, flashcardId, tagId)
      if (result.success) {
        console.log("✅ Tag adicionada ao flashcard")
        // Recarregar tags do flashcard
        loadFlashcardCategoriesAndTags(flashcardId)
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar tag:", error)
    }
  }

  const loadFlashcardCategoriesAndTags = async (flashcardId: number) => {
    try {
      const result = await getFlashcardCategoriesAndTags(flashcardId)
      if (result.success && result.data) {
        // Atualizar o flashcard específico com suas categorias e tags
        setFlashcards(prev => prev.map(flashcard => 
          flashcard.id === flashcardId 
            ? { 
                ...flashcard, 
                categories: Array.isArray(result.data?.categories) ? result.data.categories.flat() : [],
                tags: Array.isArray(result.data?.tags) ? result.data.tags.flat() : []
              }
            : flashcard
        ))
      }
    } catch (error) {
      console.error("❌ Erro ao carregar categorias e tags do flashcard:", error)
    }
  }

  const nextCard = useCallback(() => {
    if (currentCardIndex < safeFlashcards.length - 1) {
      setIsAnimating(true)
      setCardFlipDirection('next')
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1)
        setShowAnswer(false)
        setIsAnimating(false)
      }, 150)
    } else {
      setStudyMode("finished")
    }
  }, [currentCardIndex, safeFlashcards.length])

  const previousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setIsAnimating(true)
      setCardFlipDirection('prev')
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1)
        setShowAnswer(false)
        setIsAnimating(false)
      }, 150)
    }
  }, [currentCardIndex])

  // Função para animação suave ao mostrar resposta
  const toggleAnswer = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      setShowAnswer(!showAnswer)
      setIsAnimating(false)
    }, 100)
  }, [showAnswer])

  // Funções para modos de estudo avançados
  const startStudySession = useCallback((modeType: 'standard' | 'timer' | 'goals' | 'intensive' | 'test' | 'custom') => {
    setStudyModeConfig(prev => ({ ...prev, type: modeType }))
    setSessionStartTime(new Date())
    setSessionTimer(0)
    setCardTimer(0)
    setIsTimerActive(true)
  }, [])

  const stopStudySession = useCallback(() => {
    setIsTimerActive(false)
    setSessionStartTime(null)
    setSessionTimer(0)
    setCardTimer(0)
  }, [])

  const resetCardTimer = useCallback(() => {
    setCardTimer(0)
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTimerActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
        setSessionTimer(elapsed)
        setCardTimer(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, sessionStartTime])

  // Auto-advance para modo customizado
  useEffect(() => {
    if (studyModeConfig.type === 'custom' && studyModeConfig.customSettings.autoAdvance && showAnswer) {
      const timePerCard = studyModeConfig.customSettings.timePerCard
      if (timePerCard > 0) {
        const timer = setTimeout(() => {
          nextCard()
        }, timePerCard * 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [showAnswer, studyModeConfig, nextCard])

  // Verificar metas
  const checkGoals = useCallback(() => {
    if (studyModeConfig.type === 'goals') {
      const totalCards = sessionStats.correct + sessionStats.incorrect
      const accuracy = totalCards > 0 ? (sessionStats.correct / totalCards) * 100 : 0
      
      if (totalCards >= studyModeConfig.goalCards && accuracy >= studyModeConfig.goalAccuracy) {
        // Meta atingida!
        console.log("🎯 Meta atingida!")
        return true
      }
    }
    return false
  }, [studyModeConfig, sessionStats])

  // Shuffle cards para modo customizado
  const shuffleFlashcards = useCallback(() => {
    if (studyModeConfig.customSettings.shuffleCards) {
      setFlashcards(prev => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5)
        return shuffled
      })
    }
  }, [studyModeConfig.customSettings.shuffleCards])

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

  const resetStudy = async () => {
    // Finalizar sessão de rastreamento se existir
    if (currentSessionId && user?.id) {
      try {
        const totalCards = sessionStats.correct + sessionStats.incorrect
        const endResult = await endStudySession(currentSessionId, {
          end_time: new Date().toISOString(),
          duration_seconds: sessionTimer,
          cards_studied: totalCards,
          correct_answers: sessionStats.correct,
          incorrect_answers: sessionStats.incorrect,
          xp_gained: xpGained
        })
        
        if (endResult.success) {
          console.log("📊 Sessão de estudo finalizada:", endResult.data)
        }
      } catch (error) {
        console.error("❌ Erro ao finalizar sessão de estudo:", error)
      }
    }
    
    stopStudySession()
    setStudyMode("select")
    setSelectedTopic(null)
    setFlashcards([])
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    setStudyModeConfig(prev => ({ ...prev, type: 'standard' }))
    setCurrentSessionId(null)
  }

  // Funções para carregar dados de rastreamento
  const loadStudyHistory = async () => {
    if (!user?.id) return
    
    try {
      const result = await getStudySessionsHistory(user.id, 20)
      if (result.success && result.data) {
        setStudyHistory(result.data)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar histórico:", error)
    }
  }

  const loadStudyAnalytics = async () => {
    if (!user?.id) return
    
    try {
      const result = await getStudyAnalytics(user.id, 30)
      if (result.success && result.data) {
        setStudyAnalytics(result.data)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar analytics:", error)
    }
  }

  const loadStudyGoals = async () => {
    if (!user?.id) return
    
    try {
      const result = await getStudyGoals(user.id)
      if (result.success && result.data) {
        setStudyGoals(result.data)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar metas:", error)
    }
  }

  useEffect(() => {
    loadSubjects()
    loadCategoriesAndTags()
    if (user?.id) {
      loadProgressStats()
      loadStudyHistory()
      loadStudyAnalytics()
      loadStudyGoals()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedTopic && user?.id) {
      loadProgressStats(selectedTopic)
    }
  }, [selectedTopic, user?.id])

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (studyMode !== "study") return

      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault()
          if (!showAnswer) {
            toggleAnswer()
          } else {
            nextCard()
          }
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (showAnswer) {
            toggleAnswer()
          } else {
            previousCard()
          }
          break
        case 'Escape':
          event.preventDefault()
          resetStudy()
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (showAnswer) {
            event.preventDefault()
            rateQuality(parseInt(event.key))
          }
          break
        case '?':
          event.preventDefault()
          setShowKeyboardShortcuts(!showKeyboardShortcuts)
          break
        case 'd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setIsDarkMode(!isDarkMode)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [studyMode, showAnswer, nextCard, previousCard, toggleAnswer, resetStudy, rateQuality, showKeyboardShortcuts, isDarkMode])

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Escolha a Matéria
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                Selecione a matéria que deseja estudar com flashcards
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Botões de Analytics e Rastreamento */}
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-1 sm:gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm"
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 sm:gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs sm:text-sm"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Histórico
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowGoals(true)}
                className="flex items-center gap-1 sm:gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs sm:text-sm"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                Metas
              </Button>
              
              {(profile?.role === 'teacher' || profile?.role === 'admin') && (
                <>
                  <Button 
                    variant={isAdminMode ? "default" : "outline"}
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{isAdminMode ? "Modo Admin" : "Modo Normal"}</span>
                    <span className="sm:hidden">{isAdminMode ? "Admin" : "Normal"}</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      // TODO: Implementar criação de matéria
                      alert("Funcionalidade de adicionar matéria será implementada em breve")
                    }}
                    className="flex items-center gap-1 sm:gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Adicionar Matéria</span>
                    <span className="sm:hidden">Adicionar</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {safeSubjects.map((subject, index) => (
              <Card 
                key={subject.id || index} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-500"
                onClick={() => {
                  setSelectedSubject(subject.id)
                  loadTopics(subject.id)
                }}
              >
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                    <BookOpenText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                    {subject.name}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {subject.description || "Estude e pratique seus conhecimentos"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Tópicos</span>
                      </span>
                      <span className="font-medium">
                        -
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Flashcards</span>
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-medium py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 transform hover:scale-105">
                    <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="hidden sm:inline">Estudar </span>{subject.name}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubject(null)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                <span className="text-sm sm:text-base">Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {safeSubjects.find(s => s.id === selectedSubject)?.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
                className="flex items-center gap-1 sm:gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm w-full sm:w-auto"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Novo Flashcard</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            )}
          </div>

          {/* Dashboard de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{progressStats.new}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Novos</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{progressStats.learning}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Aprendendo</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{progressStats.review}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revisão</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{progressStats.relearning}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reaprendendo</div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Busca e Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                      <Input
                        placeholder="Buscar flashcards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 sm:pl-10 text-sm sm:text-base"
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
                    className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    Limpar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ordenar por:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs sm:text-sm"
                    >
                      <option value="newest">Mais recentes</option>
                      <option value="oldest">Mais antigos</option>
                      <option value="difficulty">Dificuldade</option>
                      <option value="progress">Progresso</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dificuldade:
                    </label>
                    <select
                      value={difficultyFilter || ""}
                      onChange={(e) => setDifficultyFilter(e.target.value || null)}
                      className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs sm:text-sm"
                    >
                      <option value="">Todas</option>
                      <option value="easy">Fácil</option>
                      <option value="medium">Médio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categoria:
                    </label>
                    <select
                      value={selectedCategory || ""}
                      onChange={(e) => setSelectedCategory(e.target.value || null)}
                      className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs sm:text-sm"
                    >
                      <option value="">Todas</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tag:
                    </label>
                    <select
                      value={selectedTag || ""}
                      onChange={(e) => setSelectedTag(e.target.value || null)}
                      className="px-2 sm:px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-xs sm:text-sm"
                    >
                      <option value="">Todas</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id.toString()}>
                          {tag.name}
                        </option>
                      ))}
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
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {safeTopics.map((topic, index) => (
                <Card 
                  key={topic.id || index} 
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-500"
                  onClick={() => startStudy(topic.id)}
                >
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                      {topic.name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 sm:space-y-2">
                      <Button 
                        onClick={() => startStudy(topic.id, "review")}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 text-sm sm:text-base rounded-lg transition-all duration-300"
                      >
                        <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Revisão
                      </Button>
                      <Button 
                        onClick={() => startStudy(topic.id, "new")}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm sm:text-base py-2"
                      >
                        <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Novos
                      </Button>
                      <Button 
                        onClick={() => startStudy(topic.id, "learning")}
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm sm:text-base py-2"
                      >
                        <Brain className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Aprendendo
                      </Button>
                      
                      {/* Modos Avançados */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Modos Avançados</p>
                        <div className="grid grid-cols-2 gap-1">
                          <Button 
                            onClick={() => startStudy(topic.id, "review", "timer")}
                            variant="outline"
                            size="sm"
                            className="text-xs border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 py-1 px-2"
                          >
                            <Timer className="mr-1 h-3 w-3" />
                            <span className="hidden sm:inline">Cronômetro</span>
                            <span className="sm:hidden">Timer</span>
                          </Button>
                          <Button 
                            onClick={() => startStudy(topic.id, "review", "goals")}
                            variant="outline"
                            size="sm"
                            className="text-xs border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 py-1 px-2"
                          >
                            <Target className="mr-1 h-3 w-3" />
                            Metas
                          </Button>
                          <Button 
                            onClick={() => startStudy(topic.id, "review", "intensive")}
                            variant="outline"
                            size="sm"
                            className="text-xs border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-1 px-2"
                          >
                            <Flame className="mr-1 h-3 w-3" />
                            <span className="hidden sm:inline">Intensivo</span>
                            <span className="sm:hidden">Intenso</span>
                          </Button>
                          <Button 
                            onClick={() => setShowStudyModeConfig(true)}
                            variant="outline"
                            size="sm"
                            className="text-xs border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 py-1 px-2"
                          >
                            <Settings className="mr-1 h-3 w-3" />
                            <span className="hidden sm:inline">Personalizar</span>
                            <span className="sm:hidden">Custom</span>
                          </Button>
                        </div>
                      </div>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={resetStudy}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
              <span className="text-sm sm:text-base">Voltar</span>
            </Button>
            <div className="text-center order-first sm:order-none">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {safeTopics.find(t => t.id === selectedTopic)?.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Flashcard {currentCardIndex + 1} de {safeFlashcards.length}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {xpGained > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ⭐ +{xpGained} XP
                  </span>
                )}
                {/* Indicador do modo de estudo */}
                {studyModeConfig.type === 'timer' && (
                  <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                    <Timer className="mr-1 h-3 w-3" />
                    Cronômetro
                  </Badge>
                )}
                {studyModeConfig.type === 'goals' && (
                  <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                    <Target className="mr-1 h-3 w-3" />
                    Metas
                  </Badge>
                )}
                {studyModeConfig.type === 'intensive' && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <Flame className="mr-1 h-3 w-3" />
                    Intensivo
                  </Badge>
                )}
                {studyModeConfig.type === 'test' && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Award className="mr-1 h-3 w-3" />
                    Teste
                  </Badge>
                )}
                {studyModeConfig.type === 'custom' && (
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Settings className="mr-1 h-3 w-3" />
                    Personalizado
                  </Badge>
                )}
              </div>
            </div>
            <div className="w-full sm:w-32 flex items-center gap-2 order-last sm:order-none">
              <Progress value={progress} className="h-2 flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                title="Atalhos de teclado (? para alternar)"
              >
                <Keyboard className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <Card className={`min-h-[300px] sm:min-h-[400px] flex flex-col justify-center relative transition-all duration-300 ${
              isAnimating 
                ? cardFlipDirection === 'next' 
                  ? 'transform translate-x-4 opacity-50' 
                  : 'transform -translate-x-4 opacity-50'
                : 'transform translate-x-0 opacity-100'
            }`}>
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
                      setSelectedFlashcardForTags(currentCard)
                      setIsCategoryTagDialogOpen(true)
                      loadFlashcardCategoriesAndTags(currentCard.id)
                    }}
                    className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer"
                    type="button"
                  >
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
              
              <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                    {currentCard.question}
                  </h2>
                  
                  {showAnswer && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                        Resposta:
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-4 justify-center">
                  {!showAnswer ? (
                    <Button 
                      onClick={toggleAnswer}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <Eye className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Mostrar Resposta</span>
                      <span className="sm:hidden">Resposta</span>
                      <span className="ml-1 sm:ml-2 text-xs opacity-70 hidden md:inline">(Espaço)</span>
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Como foi sua resposta?
                        </p>
                        <div className="flex gap-1 sm:gap-2 justify-center">
                          {[0, 1, 2, 3, 4, 5].map((quality) => (
                            <Button
                              key={quality}
                              onClick={() => rateQuality(quality)}
                              variant={quality >= 3 ? "default" : "destructive"}
                              size="sm"
                              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full transition-all duration-200 hover:scale-110 text-xs sm:text-sm ${
                                quality >= 3 
                                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/25" 
                                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25"
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
                      <div className="flex gap-2 sm:gap-4 justify-center">
                        <Button 
                          onClick={() => rateQuality(2)}
                          variant="destructive"
                          className="px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                        >
                          <XCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Errei
                        </Button>
                        <Button 
                          onClick={() => rateQuality(4)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 md:px-6 py-2 text-xs sm:text-sm transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                        >
                          <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Acertei
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-4 sm:gap-0">
              <Button 
                onClick={previousCard}
                disabled={currentCardIndex === 0 || isAnimating}
                variant="outline"
                className="transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Anterior</span>
                <span className="ml-1 sm:ml-2 text-xs opacity-70 hidden sm:inline">(←)</span>
              </Button>
              
              <div className="text-center order-first sm:order-none">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-green-600">{sessionStats.correct}</span> acertos | 
                  <span className="font-bold text-red-600"> {sessionStats.incorrect}</span> erros
                </p>
              </div>
              
              <Button 
                onClick={nextCard}
                disabled={currentCardIndex === safeFlashcards.length - 1 || isAnimating}
                variant="outline"
                className="transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <span className="text-sm sm:text-base">Próximo</span>
                <span className="mr-1 sm:mr-2 text-xs opacity-70 hidden sm:inline">(→)</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

      {/* Modal para gerenciar categorias e tags */}
      <Dialog open={isCategoryTagDialogOpen} onOpenChange={setIsCategoryTagDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias e Tags</DialogTitle>
            <DialogDescription>
              Organize este flashcard com categorias e tags para facilitar a busca e estudo.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlashcardForTags && (
            <div className="space-y-6">
              {/* Categorias atuais */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Categorias Atuais</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedFlashcardForTags.categories?.map((category) => (
                    <Badge 
                      key={category.id} 
                      style={{ backgroundColor: category.color, color: 'white' }}
                      className="px-3 py-1"
                    >
                      {category.name}
                    </Badge>
                  )) || <span className="text-gray-500">Nenhuma categoria</span>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adicionar Categoria:</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCategoryToFlashcard(selectedFlashcardForTags.id, category.id)}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        style={{ borderColor: category.color, color: category.color }}
                      >
                        <div 
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags atuais */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags Atuais</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedFlashcardForTags.tags?.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      style={{ backgroundColor: tag.color, color: 'white' }}
                      className="px-3 py-1"
                    >
                      {tag.name}
                    </Badge>
                  )) || <span className="text-gray-500">Nenhuma tag</span>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adicionar Tag:</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTagToFlashcard(selectedFlashcardForTags.id, tag.id)}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        <div 
                          className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setIsCategoryTagDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Atalhos de Teclado */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Atalhos de Teclado
            </DialogTitle>
            <DialogDescription>
              Use estes atalhos para navegar mais rapidamente pelos flashcards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Mostrar/Ocultar Resposta:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Espaço</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Próximo Card:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Card Anterior:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">←</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Sair do Estudo:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Avaliar (1-5):</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">1-5</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Atalhos:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">?</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Tema Escuro:</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+D</kbd>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Dica: Pressione <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">?</kbd> a qualquer momento para ver estes atalhos!
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowKeyboardShortcuts(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração de Modo Personalizado */}
      <Dialog open={showStudyModeConfig} onOpenChange={setShowStudyModeConfig}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Modo de Estudo Personalizado
            </DialogTitle>
            <DialogDescription>
              Personalize sua experiência de estudo com configurações avançadas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Configurações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempo por Card (segundos)</label>
                  <Input
                    type="number"
                    min="0"
                    value={studyModeConfig.customSettings.timePerCard}
                    onChange={(e) => setStudyModeConfig(prev => ({
                      ...prev,
                      customSettings: {
                        ...prev.customSettings,
                        timePerCard: parseInt(e.target.value) || 0
                      }
                    }))}
                    placeholder="0 = sem limite"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta de Cards</label>
                  <Input
                    type="number"
                    min="1"
                    value={studyModeConfig.goalCards}
                    onChange={(e) => setStudyModeConfig(prev => ({
                      ...prev,
                      goalCards: parseInt(e.target.value) || 20
                    }))}
                    placeholder="20"
                  />
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações Avançadas</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Embaralhar Cards</label>
                    <p className="text-xs text-gray-500">Misturar a ordem dos flashcards</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={studyModeConfig.customSettings.shuffleCards}
                    onChange={(e) => setStudyModeConfig(prev => ({
                      ...prev,
                      customSettings: {
                        ...prev.customSettings,
                        shuffleCards: e.target.checked
                      }
                    }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Avanço Automático</label>
                    <p className="text-xs text-gray-500">Passar automaticamente para o próximo card</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={studyModeConfig.customSettings.autoAdvance}
                    onChange={(e) => setStudyModeConfig(prev => ({
                      ...prev,
                      customSettings: {
                        ...prev.customSettings,
                        autoAdvance: e.target.checked
                      }
                    }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Mostrar Dicas</label>
                    <p className="text-xs text-gray-500">Exibir dicas adicionais nos cards</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={studyModeConfig.customSettings.showHints}
                    onChange={(e) => setStudyModeConfig(prev => ({
                      ...prev,
                      customSettings: {
                        ...prev.customSettings,
                        showHints: e.target.checked
                      }
                    }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Mostrar Progresso</label>
                    <p className="text-xs text-gray-500">Exibir barra de progresso durante o estudo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={studyModeConfig.customSettings.showProgress}
                    onChange={(e) => setStudyModeConfig(prev => ({
                      ...prev,
                      customSettings: {
                        ...prev.customSettings,
                        showProgress: e.target.checked
                      }
                    }))}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowStudyModeConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowStudyModeConfig(false)
              if (selectedTopic) {
                startStudy(selectedTopic, studyType, 'custom')
              }
            }}>
              Iniciar Estudo Personalizado
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Analytics */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics de Estudo
            </DialogTitle>
            <DialogDescription>
              Visualize suas estatísticas detalhadas de estudo dos últimos 30 dias.
            </DialogDescription>
          </DialogHeader>
          
          {studyAnalytics ? (
            <div className="space-y-6">
              {/* Estatísticas Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Sessões</p>
                      <p className="text-2xl font-bold">{studyAnalytics.totalSessions}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Tempo Total</p>
                      <p className="text-2xl font-bold">{Math.round(studyAnalytics.totalStudyTime / 60)}min</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Cards Estudados</p>
                      <p className="text-2xl font-bold">{studyAnalytics.totalCardsStudied}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Precisão</p>
                      <p className="text-2xl font-bold">{Math.round(studyAnalytics.averageAccuracy)}%</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Sequência Atual</p>
                      <p className="text-2xl font-bold">{studyAnalytics.currentStreak} dias</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">Maior Sequência</p>
                      <p className="text-2xl font-bold">{studyAnalytics.longestStreak} dias</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tópicos Mais Estudados */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Tópicos Mais Estudados</h3>
                <div className="space-y-2">
                  {studyAnalytics.topTopics.map((topic: any, index: number) => (
                    <div key={topic.topicId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{topic.topicName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{topic.cardsStudied} cards</span>
                        <span>{Math.round(topic.accuracy)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Padrões de Estudo */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Padrões de Estudo</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Hora Mais Ativa</p>
                    <p className="text-lg font-bold">{studyAnalytics.studyPatterns.mostActiveHour}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dia Mais Ativo</p>
                    <p className="text-lg font-bold">{studyAnalytics.studyPatterns.mostActiveDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duração Média</p>
                    <p className="text-lg font-bold">{Math.round(studyAnalytics.studyPatterns.averageSessionLength / 60)}min</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando analytics...</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setShowAnalytics(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Sessões
            </DialogTitle>
            <DialogDescription>
              Visualize todas as suas sessões de estudo recentes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {studyHistory.length > 0 ? (
              studyHistory.map((session: any) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {session.topics?.name || 'Sessão Geral'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {session.topics?.subjects?.name || 'Sem matéria'} • {new Date(session.start_time).toLocaleDateString('pt-BR')}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{session.cards_studied} cards</span>
                          <span>{Math.round(session.duration_seconds / 60)}min</span>
                          <span>{Math.round((session.correct_answers / (session.correct_answers + session.incorrect_answers)) * 100)}% precisão</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {session.session_type}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        +{session.xp_gained} XP
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma sessão encontrada</p>
                <p className="text-sm text-gray-500">Comece a estudar para ver seu histórico aqui!</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowHistory(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Metas */}
      <Dialog open={showGoals} onOpenChange={setShowGoals}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas de Estudo
            </DialogTitle>
            <DialogDescription>
              Defina e acompanhe suas metas de estudo para manter a motivação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {studyGoals.length > 0 ? (
              studyGoals.map((goal: any) => (
                <Card key={goal.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold capitalize">
                        {goal.goal_type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Meta: {goal.target_value} • Atual: {goal.current_value}
                      </p>
                      <Progress 
                        value={(goal.current_value / goal.target_value) * 100} 
                        className="mt-2"
                      />
                    </div>
                    <div className="text-right">
                      {goal.is_completed ? (
                        <Badge className="bg-green-500">Concluída</Badge>
                      ) : (
                        <Badge variant="outline">Em andamento</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma meta definida</p>
                <p className="text-sm text-gray-500">Defina metas para acompanhar seu progresso!</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              // TODO: Implementar criação de metas
              alert("Funcionalidade de criar metas será implementada em breve")
            }}>
              Nova Meta
            </Button>
            <Button onClick={() => setShowGoals(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PagePermissionGuard>
  )
}