"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
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
  Share2, 
  Copy, 
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
import { getAllTopics, getFlashcardsForReview, updateTopicProgress, getAllSubjects, getTopicsBySubject, saveWrongCard, getWrongCardsByTopic, markWrongCardsAsReviewed, getWrongCardsCount, checkTeacherOrAdminAccess, createFlashcard, updateFlashcard, deleteFlashcard, getAllFlashcardsByTopic, getFlashcardById } from "@/actions"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import confetti from "canvas-confetti"
import { createClient } from "@/lib/supabase/client"
import { getUserRoleClient, ensureUserRole, checkAuthentication, getAuthAndRole } from "@/lib/get-user-role"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FlashcardQuantityModal from "@/components/FlashcardQuantityModal"

interface Topic {
  id: string
  name: string
}

interface Flashcard {
  id: number
  topic_id: string
  question: string
  answer: string
}

interface TopicProgress {
  accuracy: number
  lastStudied: string | null
  streak: number
  totalStudied: number
  level: number
  xp: number
  bestScore: number
  timeSpent: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

interface StudyStats {
  totalXP: number
  currentStreak: number
  longestStreak: number
  topicsCompleted: number
  totalTimeStudied: number
  averageAccuracy: number
}

// Mock data para demonstração
const generateTopicProgress = (topicId: string): TopicProgress => {
  const baseAccuracy = Math.floor(Math.random() * 100)
  const streak = Math.floor(Math.random() * 15)
  const totalStudied = Math.floor(Math.random() * 200) + 10
  
  return {
    accuracy: baseAccuracy,
    lastStudied: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    streak,
    totalStudied,
    level: Math.floor(totalStudied / 50) + 1,
    xp: totalStudied * 10 + baseAccuracy,
    bestScore: Math.min(100, baseAccuracy + Math.floor(Math.random() * 20)),
    timeSpent: Math.floor(Math.random() * 3600) + 300 // 5 min a 1h
  }
}

const achievements: Achievement[] = [
  { id: "first_study", title: "Primeiro Passo", description: "Complete seu primeiro flashcard", icon: "🎯", unlocked: true, unlockedAt: "2024-01-15" },
  { id: "streak_7", title: "Dedicado", description: "Estude por 7 dias consecutivos", icon: "🔥", unlocked: true, unlockedAt: "2024-01-20" },
  { id: "perfect_score", title: "Perfeição", description: "Acerte 100% em uma sessão", icon: "⭐", unlocked: false },
  { id: "level_5", title: "Especialista", description: "Alcance nível 5 em qualquer tópico", icon: "👑", unlocked: false },
  { id: "master", title: "Mestre", description: "Complete todos os tópicos", icon: "🏆", unlocked: false },
]

// Efeitos visuais customizados para feedback
if (typeof window !== "undefined") {
  const styleId = "flashcard-effects-style"
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.innerHTML = `
      .flashcard-gradient-bg {
        background: linear-gradient(to bottom, #10B981 0%, #047857 100%);
        color: #fff;
        border-radius: 1rem;
        border: 1.5px solid rgba(16, 185, 129, 0.5);
        box-shadow: 0 4px 24px 0 rgba(16,185,129,0.10);
      }
      .card-correct-effect {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #10b981 100%) !important;
        transform: scale(1.05);
        transition: all 0.5s ease;
        box-shadow: 0 20px 40px rgba(67, 233, 123, 0.4) !important;
        animation: successPulse 0.6s ease-out;
      }
      .card-incorrect-effect {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ef4444 100%) !important;
        animation: errorShake 0.8s ease-out;
        transition: all 0.5s ease;
        box-shadow: 0 20px 40px rgba(255, 107, 107, 0.4) !important;
      }
      @keyframes successPulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.7); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(67, 233, 123, 0); }
        100% { transform: scale(1.02); box-shadow: 0 0 0 0 rgba(67, 233, 123, 0); }
      }
      @keyframes errorShake {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10% { transform: translateX(-8px) rotate(-1deg); }
        20% { transform: translateX(8px) rotate(1deg); }
        30% { transform: translateX(-6px) rotate(-0.5deg); }
        40% { transform: translateX(6px) rotate(0.5deg); }
        50% { transform: translateX(-4px) rotate(-0.3deg); }
        60% { transform: translateX(4px) rotate(0.3deg); }
        70% { transform: translateX(-2px) rotate(-0.1deg); }
        80% { transform: translateX(2px) rotate(0.1deg); }
        90% { transform: translateX(-1px) rotate(0deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
        50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
      }
      .study-mode-card {
        min-height: 350px;
        perspective: 1000px;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .card-flip {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }
      .card-flip.flipped {
        transform: rotateY(180deg);
      }
      .card-front, .card-back {
        backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .card-back {
        transform: rotateY(180deg);
      }
      .card-enter {
        animation: slideInRight 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .card-exit {
        animation: slideOutLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .answer-reveal {
        animation: fadeInUp 0.6s ease-out;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      @keyframes slideOutLeft {
        from {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateX(-50px) scale(0.9);
        }
      }
      .answer-reveal {
        animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .progress-bar-animate {
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .button-success {
        animation: successPulse 0.6s ease-out;
      }
      .button-error {
        animation: errorShake 0.6s ease-out;
      }
      @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); box-shadow: 0 0 30px rgba(34, 197, 94, 0.6); }
        100% { transform: scale(1.1); }
      }
      @keyframes errorShake {
        0%, 100% { transform: translateX(0) scale(1); }
        25% { transform: translateX(-10px) scale(1.05); }
        75% { transform: translateX(10px) scale(1.05); }
      }
    `
    document.head.appendChild(style)
  }
}

export default function FlashcardsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState<"select" | "study" | "finished">("select")
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [availableCounts, setAvailableCounts] = useState<{ [topicId: string]: number }>({})
  const [selectedQuantity, setSelectedQuantity] = useState(20)
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [wrongCards, setWrongCards] = useState<Flashcard[]>([])
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [lastSessionStats, setLastSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [refreshProgress, setRefreshProgress] = useState(0)
  const supabase = createClient()

  // Estados para as novas funcionalidades
  const [searchTerm, setSearchTerm] = useState("")
  const [topicProgress, setTopicProgress] = useState<{ [topicId: string]: TopicProgress }>({})
  const [studyStats, setStudyStats] = useState<StudyStats>({
    totalXP: 12450,
    currentStreak: 8,
    longestStreak: 15,
    topicsCompleted: 12,
    totalTimeStudied: 2840, // em minutos
    averageAccuracy: 78
  })
  const [studyModeType, setStudyModeType] = useState<"normal" | "quick" | "review" | "test" | "custom" | "wrong">("normal")
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all")

  // Adicionar estado para controlar quantidade de cards
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [pendingTopicId, setPendingTopicId] = useState<string | null>(null)
  const [pendingMode, setPendingMode] = useState<string>("normal")
  const [customQuantity, setCustomQuantity] = useState(10)

  // Estados para cards errados
  const [wrongCardsCount, setWrongCardsCount] = useState<{ [topicId: string]: number }>({})
  const [isStudyingWrongCards, setIsStudyingWrongCards] = useState(false)

  // Estados para administração (professores/admins)
  const [userRole, setUserRole] = useState<string>('student')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<any>(null)
  const [adminFlashcards, setAdminFlashcards] = useState<any[]>([])
  const [adminPage, setAdminPage] = useState(1)
  const [adminTotal, setAdminTotal] = useState(0)
  const [formQuestion, setFormQuestion] = useState("")
  const [formAnswer, setFormAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Novos estados para melhorias
  const [isFullscreen, setIsFullscreen] = useState(true) // Fullscreen como padrão
  const [showTimer, setShowTimer] = useState(true) // Timer ativo por padrão
  const [cardTimer, setCardTimer] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [showKeyboardHints, setShowKeyboardHints] = useState(true)
  const [isCardAnimating, setIsCardAnimating] = useState(false)
  const [showContinueModal, setShowContinueModal] = useState(false)

  useEffect(() => {
    console.log("🔍 [DEBUG] useEffect triggered, selectedSubject:", selectedSubject)
    if (selectedSubject) {
      console.log("🔍 [DEBUG] selectedSubject existe, chamando loadTopicsBySubject()")
      loadTopicsBySubject()
    } else {
      console.log("🔍 [DEBUG] selectedSubject é null, chamando loadSubjects()")
      loadSubjects()
    }
  }, [selectedSubject])

  // Verificar autenticação e role do usuário
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        console.log('🔍 [DEBUG] Verificando autenticação...')
        const { user, role, isAuthenticated } = await getAuthAndRole()
        
        if (isAuthenticated && user) {
          console.log('✅ [DEBUG] Usuário autenticado:', user.id)
          console.log('✅ [DEBUG] Role definida:', role)
          setUserRole(role)
        } else {
          console.log('❌ [DEBUG] Usuário não autenticado')
          setUserRole('student')
        }
      } catch (error) {
        console.error("❌ [DEBUG] Erro ao verificar autenticação/role:", error)
        setUserRole('student')
      }
    }
    checkAuthAndRole()
  }, [])

  useEffect(() => {
    if (topics.length > 0) {
      const progress: { [topicId: string]: TopicProgress } = {}
      topics.forEach(topic => {
        progress[topic.id] = generateTopicProgress(topic.id)
      })
      setTopicProgress(progress)
      loadWrongCardsCount()
    }
  }, [topics])

  const loadWrongCardsCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const counts: { [topicId: string]: number } = {}
        for (const topic of topics) {
          const count = await getWrongCardsCount(user.id, topic.id)
          counts[topic.id] = count
        }
        setWrongCardsCount(counts)
      }
    } catch (error) {
      console.error("Erro ao carregar contagem de cards errados:", error)
    }
  }

  useEffect(() => {
    if (refreshProgress > 0) {
      loadTopics()
    }
  }, [refreshProgress])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (studyMode === "study" && showTimer && !showAnswer) {
      interval = setInterval(() => {
        setCardTimer(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [studyMode, showTimer, showAnswer])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (studyMode !== "study") return

      // Prevenir ações quando há modal aberto
      if (showFinishModal || showQuantityModal || showContinueModal) return

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (!showAnswer) {
            setShowAnswer(true)
          }
          break
        case 'Digit1':
        case 'Numpad1':
          event.preventDefault()
          if (showAnswer && lastAnswer === null) {
            handleAnswer(false)
          }
          break
        case 'Digit2':
        case 'Numpad2':
          event.preventDefault()
          if (showAnswer && lastAnswer === null) {
            handleAnswer(true)
          }
          break
        case 'KeyF':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'KeyT':
          event.preventDefault()
          setShowTimer(!showTimer)
          break
        case 'KeyH':
          event.preventDefault()
          setShowKeyboardHints(!showKeyboardHints)
          break
        case 'Escape':
          event.preventDefault()
          if (isFullscreen) {
            setIsFullscreen(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [studyMode, showAnswer, lastAnswer, showFinishModal, showQuantityModal, isFullscreen, showTimer, showKeyboardHints, showContinueModal])

  const loadSubjects = async () => {
    try {
      console.log("🔍 [DEBUG] Iniciando loadSubjects...")
      console.log("🔍 [DEBUG] Chamando getAllSubjects()...")
      const subjectsData = await getAllSubjects()
      console.log("📚 [DEBUG] Resposta de getAllSubjects():", subjectsData)
      console.log("📚 [DEBUG] Tipo de subjectsData:", typeof subjectsData)
      console.log("📚 [DEBUG] É array?", Array.isArray(subjectsData))
      console.log("📚 [DEBUG] Length:", subjectsData?.length)
      
      if (subjectsData && Array.isArray(subjectsData)) {
        console.log("✅ [DEBUG] Dados válidos, setando subjects...")
        setSubjects(subjectsData)
        console.log("✅ [DEBUG] Subjects setados:", subjectsData)
        
        // Se não há subjects, carregar tópicos diretamente
        if (subjectsData.length === 0) {
          console.log("📚 [DEBUG] Nenhum subject encontrado, carregando tópicos diretamente...")
          loadTopics()
        }
      } else {
        console.error("❌ [DEBUG] Dados inválidos:", subjectsData)
        setSubjects([])
        // Carregar tópicos diretamente se não há subjects
        console.log("📚 [DEBUG] Carregando tópicos diretamente devido a dados inválidos...")
        loadTopics()
      }
    } catch (error) {
      console.error("❌ [DEBUG] Erro ao carregar matérias:", error)
      console.error("❌ [DEBUG] Stack trace:", error instanceof Error ? error.stack : 'N/A')
      setSubjects([])
      // Carregar tópicos diretamente em caso de erro
      console.log("📚 [DEBUG] Carregando tópicos diretamente devido a erro...")
      loadTopics()
    } finally {
      console.log("🔍 [DEBUG] Finalizando loadSubjects, setIsLoading(false)")
      setIsLoading(false)
    }
  }

  const loadTopicsBySubject = async () => {
    if (!selectedSubject) return
    try {
      console.log("🔍 Carregando tópicos para matéria ID:", selectedSubject)
      const topicsData = await getTopicsBySubject(selectedSubject)
      console.log("📝 Tópicos encontrados:", topicsData)
      setTopics(topicsData)
    } catch (error) {
      console.error("❌ Erro ao carregar tópicos por matéria:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      console.log('Carregando tópicos...')
      const topicsData = await getAllTopics()
      console.log('Tópicos carregados:', topicsData)
      setTopics(topicsData)
      
      // Se não há tópicos, mostrar mensagem
      if (!topicsData || topicsData.length === 0) {
        console.log('Nenhum tópico encontrado')
      }
    } catch (error) {
      console.error("Erro ao carregar tópicos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStudyModeConfig = (mode: string, customQty?: number) => {
    switch (mode) {
      case "quick":
        return { quantity: 5, title: "Revisão Rápida", description: "5 cards para revisão rápida" }
      case "review":
        return { quantity: 10, title: "Revisão", description: "Revisar cards já estudados" }
      case "test":
        return { quantity: 15, title: "Modo Teste", description: "Teste cronometrado" }
      case "wrong":
        return { quantity: 999, title: "Cards Errados", description: "Revisar apenas cards que você errou" }
      case "custom":
        return { quantity: customQty || 10, title: "Quantidade Personalizada", description: `${customQty || 10} cards selecionados` }
      default:
        return { quantity: 20, title: "Sessão Completa", description: "Sessão completa de estudo" }
    }
  }

  // Type guard para validar modos de estudo
  const isValidStudyMode = (mode: any): mode is "normal" | "quick" | "review" | "test" | "custom" | "wrong" => {
    const validModes: ("normal" | "quick" | "review" | "test" | "custom" | "wrong")[] = 
      ["normal", "quick", "review", "test", "custom", "wrong"]
    return validModes.includes(mode)
  }

  const startStudySession = async (
    topicId: string, 
    mode: string = "normal", 
    customQuantity?: number
  ) => {
    try {
      setIsLoading(true)
      setSelectedTopic(topicId)
      
      // Validar e converter o modo de estudo
      const validMode: "normal" | "quick" | "review" | "test" | "custom" | "wrong" = 
        isValidStudyMode(mode) ? mode : "normal"
      
      // Configuração de estudo baseada no modo
      const config = getStudyModeConfig(validMode, customQuantity)
      const quantity = customQuantity || config.quantity
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        alert("Usuário não autenticado")
        setStudyMode("select")
        setIsLoading(false)
        return
      }
      
      // Buscar flashcards do tópico baseado no role do usuário
      let cards = []
      if (userRole === "teacher" || userRole === "admin") {
        // Para professores e admins, usar função com paginação
        const flashcardsResult = await getAllFlashcardsByTopic(user.id, topicId, 1, quantity)
        if (flashcardsResult && flashcardsResult.success && flashcardsResult.data) {
          cards = flashcardsResult.data.flashcards
        }
      } else {
        // Para estudantes, usar função simples
        cards = await getFlashcardsForReview(topicId, quantity)
      }
      
      // Verificar se há flashcards disponíveis
      if (cards && cards.length > 0) {
        
        // Configurar sessão de estudo
        setFlashcards(cards)
        setCurrentCardIndex(0)
        setShowAnswer(false)
        setSessionStats({ correct: 0, incorrect: 0 })
        setSessionStartTime(new Date())
        setCardTimer(0)
        setStudyModeType(validMode)
        setIsStudyingWrongCards(validMode === "wrong")
        
        // Transição para modo de estudo
        setStudyMode("study")
      } else {
        // Sem flashcards disponíveis
        alert("Não há flashcards disponíveis para este tópico.")
        setStudyMode("select")
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("Erro ao iniciar sessão de estudo:", error)
      setIsLoading(false)
      setStudyMode("select")
      alert("Erro ao iniciar sessão de estudo. Tente novamente.")
    }
  }

  const handleCustomQuantityStart = async () => {
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      alert("Usuário não autenticado")
      return
    }

    if (pendingTopicId) {
      startStudySession(pendingTopicId, "custom", customQuantity)
      setShowQuantityModal(false)
      setPendingTopicId(null)
    }
  }

  const handleTopicStart = async (topicId: string, mode: string = "normal") => {
    const validMode = isValidStudyMode(mode) 
      ? mode 
      : "normal"

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      alert("Usuário não autenticado")
      return
    }

    if (validMode === "custom") {
      setPendingTopicId(topicId)
      setPendingMode(validMode)
      setShowQuantityModal(true)
    } else {
      startStudySession(topicId, validMode)
    }
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (!selectedTopic) return

    setLastAnswer(isCorrect)

    // Efeito de confete ao acertar
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        zIndex: 9999,
      })
    }
    // Vibração ao errar (mobile)
    if (!isCorrect && typeof window !== "undefined") {
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100])
      }
      setIsTransitioning(true)
      setTimeout(() => setIsTransitioning(false), 600)
    }

    setSessionStats((prev: any) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

    if (!isCorrect) {
      setWrongCards((prev: any) => [...prev, flashcards[currentCardIndex]])
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await updateTopicProgress(selectedTopic, isCorrect ? "correct" : "incorrect", user.id)
        
        // Salvar card errado no banco de dados
        if (!isCorrect && !isStudyingWrongCards) {
          await saveWrongCard(user.id, flashcards[currentCardIndex].id, selectedTopic)
        }
        
        // Se está estudando cards errados e acertou, marcar como revisado
        if (isCorrect && isStudyingWrongCards) {
          await markWrongCardsAsReviewed(user.id, [flashcards[currentCardIndex].id])
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error)
    }

    // Atualizar progresso local
    setTopicProgress(prev => ({
      ...prev,
      [selectedTopic]: {
        ...prev[selectedTopic],
        totalStudied: prev[selectedTopic].totalStudied + 1,
        accuracy: Math.round(((prev[selectedTopic].accuracy * prev[selectedTopic].totalStudied) + (isCorrect ? 100 : 0)) / (prev[selectedTopic].totalStudied + 1)),
        xp: prev[selectedTopic].xp + (isCorrect ? 15 : 5),
        lastStudied: new Date().toISOString()
      }
    }))

    // Reset timer para próximo card
    setCardTimer(0)

    // Efeito visual por 900ms, depois avança com animação
    setTimeout(() => {
      setLastAnswer(null)
      setShowAnswer(false)
      
      // Animação de saída
      setIsCardAnimating(true)
      
      setTimeout(() => {
        // Modificação: Adicionar verificação para evitar repetição infinita
        const nextIndex = currentCardIndex + 1
        
        if (nextIndex < flashcards.length) {
          setCurrentCardIndex(nextIndex)
        } else {
          // Terminou a sessão - mostrar modal para continuar ou finalizar
          setLastSessionStats({
            correct: sessionStats.correct + (isCorrect ? 1 : 0),
            incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
          })
          
          // Modificação: Sempre finalizar a sessão ao chegar no último card
          resetSession()
          setShowStatsModal(true)
        }
        
        // Reset da animação após a transição
        setTimeout(() => {
          setIsCardAnimating(false)
        }, 100)
      }, 300)
    }, 900)
  }

  const resetSession = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    setWrongCards([])
    setSessionStartTime(null)
    setCardTimer(0)
    setIsFullscreen(false)
    setShowContinueModal(false)
    setIsStudyingWrongCards(false)
    // Recarregar contagem de cards errados
    loadWrongCardsCount()
  }

  const continueStudying = async () => {
    if (!selectedTopic) return
    
    setShowContinueModal(false)
    
    // Modificação: Impedir continuação infinita
    if (isStudyingWrongCards) {
      // Se estava estudando cards errados, finalizar sessão
      resetSession()
      setShowStatsModal(true)
      return
    }
    
    // Carregar mais cards (mesma quantidade)
    const config = getStudyModeConfig(studyModeType)
    
    try {
      setIsLoading(true)
      let moreCards: Flashcard[] = []
      
      // Modificação: Limitar a quantidade de cards adicionais
      const additionalCardsLimit = 10
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        // Modificação: Finalizar sessão se não houver usuário
        resetSession()
        setShowStatsModal(true)
        return
      }
      
      if (isStudyingWrongCards) {
        // Se estava estudando cards errados, carregar novamente
        const wrongCardsResult = await getWrongCardsByTopic(user.id, selectedTopic, 1, additionalCardsLimit)
        
        if (wrongCardsResult && Array.isArray(wrongCardsResult)) {
          moreCards = wrongCardsResult.flat().slice(0, additionalCardsLimit)
        } else {
          // Modificação: Finalizar sessão se não houver cards
          resetSession()
          setShowStatsModal(true)
          return
        }
      } else {
        // Carregar novos cards do tópico
        const allFlashcardsResult = await getAllFlashcardsByTopic(user.id, selectedTopic, 1, additionalCardsLimit)
        
        if (allFlashcardsResult && allFlashcardsResult.success && allFlashcardsResult.data) {
          moreCards = allFlashcardsResult.data.flashcards
        } else {
          // Modificação: Se não houver mais cards, finalizar sessão
          resetSession()
          setShowStatsModal(true)
          return
        }
      }
      
      // Modificação: Se não houver mais cards, finalizar sessão
      if (!moreCards || moreCards.length === 0) {
        resetSession()
        setShowStatsModal(true)
        return
      }
      
      // Atualizar flashcards e reiniciar sessão
      setFlashcards(moreCards)
      setCurrentCardIndex(0)
      setShowAnswer(false)
      setIsStudyingWrongCards(false)
      
      setIsLoading(false)
    } catch (error) {
      console.error("Erro ao carregar mais cards:", error)
      resetSession()
      setShowStatsModal(true)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEstimatedTimeRemaining = () => {
    if (!sessionStartTime || currentCardIndex === 0) return null
    
    const timeElapsed = (Date.now() - sessionStartTime.getTime()) / 1000 / 60 // em minutos
    const avgTimePerCard = timeElapsed / (currentCardIndex + 1)
    const cardsRemaining = flashcards.length - currentCardIndex - 1
    const estimatedMinutes = Math.ceil(avgTimePerCard * cardsRemaining)
    
    return estimatedMinutes > 0 ? `~${estimatedMinutes}min restantes` : "Quase terminando!"
  }

  const getLevelInfo = (xp: number) => {
    const level = Math.floor(xp / 1000) + 1
    const currentLevelXP = (level - 1) * 1000
    const nextLevelXP = level * 1000
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    
    return { level, progress, nextLevelXP: nextLevelXP - xp }
  }

  const getDifficultyLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: "Dominado", color: "text-green-600", bgColor: "bg-green-500/10" }
    if (accuracy >= 75) return { level: "Avançado", color: "text-emerald-600", bgColor: "bg-emerald-500/10" }
    if (accuracy >= 60) return { level: "Intermediário", color: "text-yellow-600", bgColor: "bg-yellow-500/10" }
    if (accuracy >= 40) return { level: "Básico", color: "text-purple-600", bgColor: "bg-purple-500/10" }
    return { level: "Iniciante", color: "text-red-600", bgColor: "bg-red-500/10" }
  }

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    const progress = topicProgress[topic.id]
    
    if (selectedDifficulty === "all") return matchesSearch
    
    if (!progress) return selectedDifficulty === "easy"
    
    const { level: diffLevel } = getDifficultyLevel(progress.accuracy)
    
    switch (selectedDifficulty) {
      case "easy": return matchesSearch && (diffLevel === "Iniciante" || diffLevel === "Básico")
      case "medium": return matchesSearch && (diffLevel === "Intermediário")
      case "hard": return matchesSearch && (diffLevel === "Avançado" || diffLevel === "Dominado")
      default: return matchesSearch
    }
  })

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // ==================== FUNÇÕES ADMINISTRATIVAS ====================

  const loadAdminFlashcards = async (topicId: string, page = 1) => {
    if (userRole !== "teacher" && userRole !== "admin") return

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return

      const result = await getAllFlashcardsByTopic(user.id, topicId, page, 10)
      if (result.success && result.data) {
        setAdminFlashcards(result.data.flashcards)
        setAdminTotal(result.data.total)
        setAdminPage(page)
      }
    } catch (error) {
      console.error("Erro ao carregar flashcards para administração:", error)
    }
  }

  const handleCreateFlashcard = async () => {
    if (!selectedTopic || !formQuestion.trim() || !formAnswer.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return

      const result = await createFlashcard(user.id, {
        topic_id: selectedTopic,
        question: formQuestion,
        answer: formAnswer
      })
      if (result.success) {
        setFormQuestion("")
        setFormAnswer("")
        setShowCreateModal(false)
        loadAdminFlashcards(selectedTopic, adminPage)
        alert("Flashcard criado com sucesso!")
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao criar flashcard:", error)
      alert("Erro ao criar flashcard")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFlashcard = async () => {
    if (!editingFlashcard || !formQuestion.trim() || !formAnswer.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return

      const result = await updateFlashcard(user.id, editingFlashcard.id, formQuestion, formAnswer)
      if (result.success) {
        setFormQuestion("")
        setFormAnswer("")
        setShowEditModal(false)
        setEditingFlashcard(null)
        loadAdminFlashcards(selectedTopic!, adminPage)
        alert("Flashcard atualizado com sucesso!")
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao atualizar flashcard:", error)
      alert("Erro ao atualizar flashcard")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFlashcard = async (flashcardId: number) => {
    if (!confirm("Tem certeza que deseja deletar este flashcard? Esta ação não pode ser desfeita.")) return

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return

      const result = await deleteFlashcard(user.id, flashcardId)
      if (result.success) {
        loadAdminFlashcards(selectedTopic!, adminPage)
        alert("Flashcard deletado com sucesso!")
      } else {
        alert(`Erro: ${result.error}`)
      }
    } catch (error) {
      console.error("Erro ao deletar flashcard:", error)
      alert("Erro ao deletar flashcard")
    }
  }

  const openEditModal = (flashcard: any) => {
    setEditingFlashcard(flashcard)
    setFormQuestion(flashcard.question)
    setFormAnswer(flashcard.answer)
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormQuestion("")
    setFormAnswer("")
    setEditingFlashcard(null)
  }

  const toggleAdminMode = () => {
    if (!isAdminMode && selectedTopic) {
      loadAdminFlashcards(selectedTopic)
    }
    setIsAdminMode(!isAdminMode)
  }

  // Adicionar nova função assíncrona para contar flashcards
  const getFlashcardCountForTopic = async (topicId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return 0

      const result = await getAllFlashcardsByTopic(user.id, topicId, 1, 1)
      
      // Verificar se o resultado é um array e tem dados
      if (result && result.success && result.data) {
        return result.data.total
      }
      
      return 0
    } catch (error) {
      console.error("Erro ao buscar contagem de flashcards:", error)
      return 0
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando flashcards...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Modo de estudo ativo
  if (studyMode === "study" && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100
    const estimatedTime = getEstimatedTimeRemaining()

    return (
      <div className={isFullscreen ? "fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" : "min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"}>
        <DashboardShell>
          <div className="max-w-5xl mx-auto space-y-4 py-4">
            
            {/* Header moderno e elegante */}
            <div className="relative">
              {/* Background decorativo */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
              
              <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                
                <CardContent className="p-6">
                                     <div className="flex items-center justify-between mb-4">
                    {/* Controles à esquerda */}
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        onClick={resetSession} 
                        className="group bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <ArrowRight className="h-5 w-5 mr-2 rotate-180 group-hover:animate-pulse" />
                        Sair
                      </Button>
                      
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={toggleFullscreen}
                          className="rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
                        >
                          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowTimer(!showTimer)}
                          className={`rounded-lg transition-all duration-200 ${showTimer ? "bg-emerald-500 text-white shadow-lg" : "hover:bg-white dark:hover:bg-gray-600"}`}
                        >
                          <Timer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Informações centrais */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                          {studyModeType === "quick" && "⚡ Revisão Rápida"}
                          {studyModeType === "review" && "🔄 Modo Revisão"}
                          {studyModeType === "test" && "⏱️ Modo Teste"}
                          {studyModeType === "normal" && "📚 Sessão Completa"}
                          {studyModeType === "custom" && "🎯 Quantidade Personalizada"}
                          {studyModeType === "wrong" && "❌ Cards Errados"}
                        </Badge>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        <p className="text-3xl font-black tracking-tight">
                          {currentCardIndex + 1} de {flashcards.length}
                        </p>
                      </div>
                      
                      {estimatedTime && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{estimatedTime}</p>
                      )}
                    </div>

                    {/* Timer e progresso à direita */}
                    <div className="text-right">
                      {showTimer ? (
                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-lg">
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-2">TEMPO DO CARD</p>
                          <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 font-mono tracking-wider">
                            {formatTimer(cardTimer)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Progresso</p>
                          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                                     {/* Barra de progresso moderna */}
                   <div className="relative mb-4">
                                         <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                        style={{width: `${progress}%`}}
                      >
                        <div className="h-full bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats da sessão modernizados */}
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
                      <div className="p-1 bg-green-500 rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-bold text-green-700 dark:text-green-300">{sessionStats.correct}</span>
                      <span className="text-sm text-green-600 dark:text-green-400">acertos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full border border-red-200 dark:border-red-800">
                      <div className="p-1 bg-red-500 rounded-full">
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-bold text-red-700 dark:text-red-300">{sessionStats.incorrect}</span>
                      <span className="text-sm text-red-600 dark:text-red-400">erros</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hints de teclado modernizados */}
                         {showKeyboardHints && (
               <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-700 shadow-xl rounded-2xl overflow-hidden">
                 <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-lg">
                        <Keyboard className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">Atalhos Rápidos:</span>
                        {[
                          { key: "Espaço", action: "Resposta" },
                          { key: "1", action: "Errei" },
                          { key: "2", action: "Acertei" },
                          { key: "F", action: "Tela cheia" },
                          { key: "T", action: "Timer" }
                        ].map((shortcut, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono shadow">
                              {shortcut.key}
                            </kbd>
                            <span className="text-gray-600 dark:text-gray-400">=</span>
                            <span className="text-gray-700 dark:text-gray-300">{shortcut.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowKeyboardHints(false)}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card principal ultra moderno */}
            <div className="relative">
              {/* Background decorativo para o card */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl transform rotate-1"></div>
              
              <Card className={`
                relative backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 
                border-0 shadow-2xl rounded-3xl overflow-hidden
                transform transition-all duration-500 hover:shadow-3xl
                ${isTransitioning ? 'card-incorrect-effect' : ''} 
                ${lastAnswer === true ? 'card-correct-effect' : ''} 
                ${lastAnswer === false ? 'card-incorrect-effect' : ''} 
                ${isCardAnimating ? 'card-exit' : 'card-enter'}
              `}>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                
                <CardContent className="p-8 flex flex-col justify-center items-center text-center min-h-[350px]">
                  {!showAnswer ? (
                                         <div className="space-y-6 max-w-2xl">
                       {/* Ícone com animação */}
                       <div className="flex items-center justify-center mb-4">
                                                 <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-2xl animate-pulse">
                           <Brain className="h-10 w-10 text-white" />
                         </div>
                      </div>
                      
                      {/* Pergunta estilizada */}
                      <div className="space-y-4">
                                                 <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-gray-800 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                          {currentCard.question}
                        </h2>
                      </div>
                      
                                             {/* Botão de mostrar resposta premium */}
                       <div className="pt-4">
                        <Button 
                          onClick={() => setShowAnswer(true)}
                                                     className="group bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 text-white px-10 py-4 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl transform active:scale-95"
                        >
                          <div className="flex items-center gap-3">
                            <span>Mostrar Resposta</span>
                            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  ) : (
                                         <div className="space-y-6 max-w-3xl answer-reveal">
                       {/* Ícone da resposta */}
                       <div className="flex items-center justify-center mb-4">
                                                 <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-2xl animate-bounce">
                           <BookOpen className="h-10 w-10 text-white" />
                         </div>
                      </div>
                      
                      {/* Área da resposta */}
                      <div className="space-y-6">
                        <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 rounded-2xl border border-blue-200 dark:border-blue-700">
                          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">💡 Resposta</h3>
                        </div>
                        
                                                 <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-inner">
                          <p className="text-2xl leading-relaxed font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {currentCard.answer}
                          </p>
                        </div>
                      </div>
                      
                                             {/* Botões de ação premium */}
                       <div className="flex gap-6 justify-center pt-4">
                        <Button 
                          onClick={() => handleAnswer(false)}
                          variant="outline"
                          size="lg"
                                                     className={`
                             group px-8 py-4 text-lg font-bold border-3 border-red-300 text-red-600 
                             hover:bg-red-500 hover:text-white hover:border-red-500 
                             transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 
                             rounded-2xl bg-red-50 dark:bg-red-900/20
                             ${lastAnswer === false ? 'bg-red-500 text-white border-red-500 button-error shadow-2xl' : ''}
                           `}
                          disabled={lastAnswer !== null}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-500 group-hover:bg-red-600 rounded-full transition-colors duration-300">
                              <XCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                              <div>Errei</div>
                              <div className="text-sm opacity-75">(Tecla 1)</div>
                            </div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={() => handleAnswer(true)}
                          size="lg"
                                                     className={`
                             group px-8 py-4 text-lg font-bold 
                             bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                             text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 
                             rounded-2xl shadow-xl
                             ${lastAnswer === true ? 'from-green-600 to-emerald-700 button-success shadow-2xl' : ''}
                           `}
                          disabled={lastAnswer !== null}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-600 group-hover:bg-green-700 rounded-full transition-colors duration-300">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left">
                              <div>Acertei</div>
                              <div className="text-sm opacity-75">(Tecla 2)</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
          </div>
        </DashboardShell>
      </div>
    )
  }

  // 1. Seleção de matéria
  if (!selectedSubject) {
    console.log("🔍 [RENDER] Renderizando seleção de matéria")
    console.log("🔍 [RENDER] subjects.length:", subjects.length)
    console.log("🔍 [RENDER] subjects:", subjects)
    console.log("🔍 [RENDER] isLoading:", isLoading)
    
    return (
      <DashboardShell>
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold">Escolha a Matéria</h1>
            <p className="text-muted-foreground mt-1">
              Selecione a matéria que deseja estudar
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, index) => {
              console.log("🔍 [RENDER] Renderizando subject:", subject)
              // Cores especiais para cada matéria seguindo o padrão do quiz
              const subjectColors = {
                'Português': {
                  gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
                  border: 'border-emerald-200 dark:border-emerald-800',
                  hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
                  shadow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900',
                  badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                  button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
                  title: 'from-emerald-600 to-emerald-800',
                  icon: '📚',
                  desc: 'Domine gramática, interpretação de texto, literatura e redação com nossos flashcards interativos!'
                },
                'Regulamentos': {
                  gradient: 'from-amber-400 via-amber-500 to-amber-600',
                  border: 'border-amber-200 dark:border-amber-800',
                  hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
                  shadow: 'hover:shadow-amber-100 dark:hover:shadow-amber-900',
                  badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                  button: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
                  title: 'from-amber-600 to-amber-800',
                  icon: '⚖️',
                  desc: 'Aprenda normas militares, legislação e regulamentos específicos de forma eficiente!'
                }
              }

              const defaultColors = {
                gradient: 'from-slate-400 via-slate-500 to-slate-600',
                border: 'border-slate-200 dark:border-slate-800',
                hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-700',
                shadow: 'hover:shadow-slate-100 dark:hover:shadow-slate-900',
                badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
                button: 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
                title: 'from-slate-600 to-slate-800',
                icon: '🎯',
                desc: 'Estude flashcards interativos sobre os principais tópicos desta matéria.'
              }

              const config = subjectColors[subject.name as keyof typeof subjectColors] || defaultColors

              return (
                <Card 
                  key={subject.id}
                  className={`
                    relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl 
                    ${config.border} ${config.hoverBorder} ${config.shadow}
                    bg-gradient-to-br from-white via-gray-50 to-gray-100 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                    min-h-[320px] flex flex-col cursor-pointer group
                  `}
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  {/* Gradiente decorativo no topo */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config.gradient}`} />
                  
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse" />
                  
                  <CardHeader className="flex-1 relative text-center pb-4">
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${config.gradient} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{config.icon}</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className={`${config.badge} font-bold px-4 py-2 text-sm tracking-wide mb-4`}>
                      Matéria
                    </Badge>
                    
                    <CardTitle className={`text-3xl font-black bg-gradient-to-r ${config.title} bg-clip-text text-transparent leading-tight mb-4 group-hover:scale-105 transition-transform duration-300`}>
                      {subject.name}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-medium">
                      {config.desc}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0 relative text-center">
                    <div className="space-y-4">
                      {/* Estatísticas simuladas */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {subject.name.toLowerCase().includes('português') ? (
                            <span>Gramática, Literatura, Redação</span>
                          ) : (
                            <span>Regulamentos, Legislação</span>
                          )}
                        </span>
                        <span className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>Nível {Math.floor(Math.random() * 5) + 1}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 1000) + 100} estudantes</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 50) + 10} min</span>
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full mt-6 bg-gradient-to-r ${config.button} text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      <Play className="mr-3 h-6 w-6" />
                      Estudar {subject.name}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {subjects.length === 0 && (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <CardContent>
                <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                  <BookOpenText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">Nenhuma matéria disponível</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto mb-8">
                  As matérias ainda não foram configuradas no sistema. Em breve novos conteúdos serão adicionados!
                </p>
                <Button asChild className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 px-8 py-3 text-lg font-semibold">
                  <Link href="/dashboard">
                    <ArrowRight className="mr-3 h-5 w-5" />
                    Voltar ao Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    )
  }

  // 4. Página principal de tópicos (após escolher matéria)
  return (
    <DashboardShell>
              <div className="space-y-6">
        {/* Header com Stats Globais */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedSubject(null)}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold">
                {selectedSubject === 1 ? "📝 Português" : "⚖️ Regulamentos"}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {selectedSubject === 1 
                ? "Domine gramática, interpretação de texto e literatura"
                : "Aprenda regulamentos militares e legislação específica"
              }
            </p>
          </div>

          {/* Stats Cards Rápidas */}
          <div className="flex gap-3">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <Flame className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{studyStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">dias consecutivos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{studyStats.totalXP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP total</p>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStatsModal(true)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Stats
            </Button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar tópicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Filtro por dificuldade */}
            <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as "all" | "easy" | "medium" | "hard")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{filteredTopics.length} tópicos encontrados</span>
            </div>
            
            {/* Botão modo administrativo para professores/admins */}
            {(userRole === "teacher" || userRole === "admin") && (
              <Button
                variant={isAdminMode ? "default" : "outline"}
                size="sm"
                onClick={toggleAdminMode}
                className={isAdminMode ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white" : "border-purple-300 text-purple-600 hover:bg-purple-50"}
              >
                <Settings className="h-4 w-4 mr-2" />
                {isAdminMode ? "Sair do Admin" : "Modo Admin"}
                {userRole === "admin" && <Shield className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
        </div>

        {/* Interface Administrativa (apenas para professores/admins) */}
        {isAdminMode && (userRole === "teacher" || userRole === "admin") && (
          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Users className="h-5 w-5" />
                Painel Administrativo - Gerenciar Flashcards
                {userRole === "admin" && <Shield className="h-4 w-4 text-purple-600" />}
              </CardTitle>
              <CardDescription>
                Clique em um tópico abaixo para gerenciar seus flashcards
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Interface de Administração de Flashcards */}
        {isAdminMode && selectedTopic && adminFlashcards.length >= 0 && (
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                                     Gerenciar Flashcards - {filteredTopics.find((t: Topic) => t.id === selectedTopic)?.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      resetForm()
                      setShowCreateModal(true)
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Flashcard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTopic(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Fechar
                  </Button>
                </div>
              </div>
              <CardDescription>
                Total: {adminTotal} flashcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {adminFlashcards.map((flashcard: any, index: number) => (
                  <Card key={flashcard.id} className="border-gray-200 hover:border-purple-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Pergunta:</Label>
                            <p className="text-sm mt-1">{flashcard.question}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Resposta:</Label>
                            <p className="text-sm mt-1">{flashcard.answer}</p>
                          </div>
                                                     <p className="text-xs text-gray-500">
                             ID: #{flashcard.id}
                           </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(flashcard)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFlashcard(flashcard.id)}
                            className="text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {adminFlashcards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum flashcard encontrado para este tópico.</p>
                    <p className="text-sm">Clique em "Novo Flashcard" para criar o primeiro!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Tópicos Melhorado */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic, index) => {
          const progress = topicProgress[topic.id] || {
            accuracy: 0,
            lastStudied: null,
            streak: 0,
            totalStudied: 0,
            level: 1,
            xp: 0,
            bestScore: 0,
            timeSpent: 0
          }
          
          const levelInfo = getLevelInfo(progress.xp)
          const isPortuguese = selectedSubject === 1
          
          // Sistema de cores rotativas para tópicos
          const topicColors = [
            {
              gradient: 'from-blue-400 via-blue-500 to-blue-600',
              border: 'border-blue-200 dark:border-blue-800',
              hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
              shadow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900',
              badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
              title: 'text-blue-800 dark:text-blue-200',
              iconBg: 'bg-blue-500/10 dark:bg-blue-500/20'
            },
            {
              gradient: 'from-purple-400 via-purple-500 to-purple-600',
              border: 'border-purple-200 dark:border-purple-800',
              hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
              shadow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900',
              badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
              title: 'text-purple-800 dark:text-purple-200',
              iconBg: 'bg-purple-500/10 dark:bg-purple-500/20'
            },
            {
              gradient: 'from-teal-400 via-teal-500 to-teal-600',
              border: 'border-teal-200 dark:border-teal-800',
              hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
              shadow: 'hover:shadow-teal-100 dark:hover:shadow-teal-900',
              badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
              button: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
              title: 'text-teal-800 dark:text-teal-200',
              iconBg: 'bg-teal-500/10 dark:bg-teal-500/20'
            },
            {
              gradient: 'from-pink-400 via-pink-500 to-pink-600',
              border: 'border-pink-200 dark:border-pink-800',
              hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
              shadow: 'hover:shadow-pink-100 dark:hover:shadow-pink-900',
              badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
              button: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
              title: 'text-pink-800 dark:text-pink-200',
              iconBg: 'bg-pink-500/10 dark:bg-pink-500/20'
            },
            {
              gradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
              border: 'border-indigo-200 dark:border-indigo-800',
              hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
              shadow: 'hover:shadow-indigo-100 dark:hover:shadow-indigo-900',
              badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
              button: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
              title: 'text-indigo-800 dark:text-indigo-200',
              iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20'
            }
          ]

          // Sistema de cores por dificuldade baseado na precisão
          const getDifficultyConfig = (accuracy: number) => {
            if (accuracy >= 80) {
              return {
                gradient: 'from-green-400 via-green-500 to-green-600',
                difficultyBadge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                difficultyText: 'Fácil',
                difficultyIcon: '🟢'
              }
            } else if (accuracy >= 50) {
              return {
                gradient: 'from-yellow-400 via-orange-500 to-orange-600',
                difficultyBadge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                difficultyText: 'Médio',
                difficultyIcon: '🟡'
              }
            } else {
              return {
                gradient: 'from-red-400 via-red-500 to-red-600',
                difficultyBadge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                difficultyText: 'Difícil',
                difficultyIcon: '🔴'
              }
            }
          }

          const config = topicColors[index % topicColors.length]
          const difficultyConfig = getDifficultyConfig(progress.accuracy)
          
          return (
            <Card 
              key={topic.id} 
              className={`
                relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                ${config.border} ${config.hoverBorder} ${config.shadow}
                bg-gradient-to-br from-white via-gray-50 to-gray-100 
                dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                min-h-[380px] flex flex-col group
              `}
            >
              {/* Gradiente decorativo no topo */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
              
              {/* Badge de nível no canto */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className={`bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
                  Nv. {levelInfo.level}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg`}>
                    <span className="text-xl text-white">{isPortuguese ? "📚" : "⚖️"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className={`${config.badge} font-semibold px-2 py-1 text-xs`}>
                      Tópico
                    </Badge>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.difficultyBadge}`}>
                      <span>{difficultyConfig.difficultyIcon}</span>
                      <span>{difficultyConfig.difficultyText}</span>
                    </div>
                  </div>
                </div>
                
                <CardTitle className={`text-lg font-bold ${config.title} leading-tight mb-3 group-hover:scale-105 transition-transform duration-300`}>
                  {topic.name}
                </CardTitle>
                
                {/* Progresso e XP */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className={`font-medium ${config.title}`}>
                      {progress.accuracy}%
                    </span>
                  </div>
                  <Progress value={progress.accuracy} className={`h-2 [&>div]:bg-gradient-to-r [&>div]:${difficultyConfig.gradient}`} />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">XP para próximo nível</span>
                    <span className={`font-medium ${config.title}`}>
                      {levelInfo.nextLevelXP}
                    </span>
                  </div>
                  <Progress value={levelInfo.progress} className={`h-2 [&>div]:bg-gradient-to-r [&>div]:${config.gradient}`} />
                </div>

                {/* Stats adicionais */}
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>{progress.totalStudied} estudadas</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(progress.timeSpent)}</span>
                  </div>
                  {progress.streak > 0 && (
                    <div className={`flex items-center gap-1 ${config.title}`}>
                      <Flame className="h-3 w-3" />
                      <span>{progress.streak} dias</span>
                    </div>
                  )}
                  {wrongCardsCount[topic.id] > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-3 w-3" />
                      <span>{wrongCardsCount[topic.id]} erradas</span>
                    </div>
                  )}
                  {progress.lastStudied && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <RefreshCw className="h-3 w-3" />
                      <span>{new Date(progress.lastStudied).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-end pt-0">
                <div className="space-y-2">
                  {/* Botão principal */}
                  {isAdminMode ? (
                    <Button 
                      onClick={() => {
                        setSelectedTopic(topic.id)
                        loadAdminFlashcards(topic.id)
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white border-0 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" 
                      disabled={isLoading}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Gerenciar Flashcards
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleTopicStart(topic.id, "custom")} 
                      className={`
                        w-full bg-gradient-to-r ${config.button} text-white border-0 font-semibold py-3
                        transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                        focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                      `}
                      disabled={isLoading}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {progress.totalStudied === 0 ? "Começar" : "Continuar"}
                    </Button>
                  )}
                  
                  {/* Botões de modo */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTopicStart(topic.id, "quick")}
                      className={`text-xs transition-all duration-200 hover:scale-105 ${config.badge.replace('100', '50').replace('800', '600').replace('900', '50').replace('200', '600')} border-current hover:border-current`}
                      title="Revisão rápida (5 cards)"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Rápido
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTopicStart(topic.id, "test")}
                      className={`text-xs transition-all duration-200 hover:scale-105 ${config.badge.replace('100', '50').replace('800', '600').replace('900', '50').replace('200', '600')} border-current hover:border-current`}
                      title="Modo teste cronometrado"
                    >
                      <Timer className="h-3 w-3 mr-1" />
                      Teste
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {progress.totalStudied > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTopicStart(topic.id, "review")}
                        className="text-xs hover:bg-green-50 hover:border-green-300 text-green-600 transition-all duration-200 hover:scale-105"
                        title="Revisar cards estudados"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Revisar
                      </Button>
                    )}
                    
                    {wrongCardsCount[topic.id] > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTopicStart(topic.id, "wrong")}
                        className="text-xs hover:bg-red-50 hover:border-red-300 text-red-600 transition-all duration-200 hover:scale-105"
                        title={`Revisar ${wrongCardsCount[topic.id]} cards errados`}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Errados ({wrongCardsCount[topic.id]})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>

        {/* Estado vazio */}
        {filteredTopics.length === 0 && topics.length > 0 && (
          <Card className="text-center py-16 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-800 dark:to-yellow-900 border-yellow-200 dark:border-yellow-700 hover:shadow-xl transition-all duration-300">
            <CardContent>
              <div className="p-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mb-6 w-fit">
                <Search className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">Nenhum tópico encontrado</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-lg leading-relaxed max-w-md mx-auto mb-8">
                Tente ajustar os filtros ou buscar por outro termo para encontrar tópicos disponíveis.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDifficulty("all")
                }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 px-8 py-3 text-lg font-semibold"
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {topics.length === 0 && (
                          <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-800 dark:to-purple-900 border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300">
            <CardContent>
                              <div className="p-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 mx-auto mb-6 w-fit">
                <BookOpenText className="h-16 w-16 text-white" />
              </div>
                              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent">Nenhum tópico disponível</h3>
              <p className="text-orange-700 dark:text-orange-300 text-lg leading-relaxed max-w-md mx-auto mb-8">
                Os tópicos de flashcards ainda não foram configurados para esta matéria. Em breve haverá novos conteúdos!
              </p>
                              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-3 text-lg font-semibold">
                <Link href="/dashboard">
                  <ArrowRight className="mr-3 h-5 w-5" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Estatísticas Detalhadas */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Suas Estatísticas
            </DialogTitle>
            <DialogDescription>
              Acompanhe seu progresso detalhado nos estudos
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Geral</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{studyStats.totalXP.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">XP Total</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{studyStats.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Sequência Atual</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{formatTime(studyStats.totalTimeStudied)}</p>
                    <p className="text-sm text-muted-foreground">Tempo Total</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{studyStats.averageAccuracy}%</p>
                    <p className="text-sm text-muted-foreground">Precisão Média</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4">
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
                        : 'border-muted bg-muted/50'
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    {achievement.unlocked && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Progresso por Tópico</h4>
                {Object.entries(topicProgress).slice(0, 5).map(([topicId, progress]) => {
                  const topic = topics.find(t => t.id === topicId)
                  if (!topic) return null
                  
                  return (
                    <div key={topicId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{topic.name}</span>
                        <span className="text-muted-foreground">{progress.accuracy}%</span>
                      </div>
                      <Progress value={progress.accuracy} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de fim de sessão */}
      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">🎉 Sessão Concluída!</DialogTitle>
            <DialogDescription className="text-center">
              Parabéns! Você completou sua sessão de estudos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600">{lastSessionStats.correct}</p>
                <p className="text-sm text-muted-foreground">Acertos</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-600">{lastSessionStats.incorrect}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium">
                Precisão: {Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                +{lastSessionStats.correct * 15 + lastSessionStats.incorrect * 5} XP ganhos
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setShowFinishModal(false)}>
              Continuar Estudando
            </Button>
            <Button onClick={resetSession} className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800">
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para escolher quantidade de cards */}
      <Dialog open={showQuantityModal} onOpenChange={setShowQuantityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quantos cards você quer estudar?
            </DialogTitle>
            <DialogDescription>
              Escolha a quantidade de flashcards para esta sessão de estudos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[5, 10, 15, 20].map((quantity) => (
                <Button
                  key={quantity}
                  variant={customQuantity === quantity ? "default" : "outline"}
                  onClick={() => setCustomQuantity(quantity)}
                  className={customQuantity === quantity ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : ""}
                >
                  {quantity}
                </Button>
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ou escolha uma quantidade personalizada:</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(parseInt(e.target.value) || 1)}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">{customQuantity}</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Tempo estimado: {Math.ceil(customQuantity * 0.5)} - {Math.ceil(customQuantity * 1.5)} minutos
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuantityModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCustomQuantityStart}
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

             {/* Modal para continuar estudando */}
       <Dialog open={showContinueModal} onOpenChange={setShowContinueModal}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="text-center text-2xl">🎉 Sessão Concluída!</DialogTitle>
             <DialogDescription className="text-center">
               Parabéns! Você completou {flashcards.length} flashcards.
             </DialogDescription>
           </DialogHeader>
           
           {/* Estatísticas da sessão */}
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4 text-center">
               <div className="space-y-1">
                 <p className="text-3xl font-bold text-green-600">{lastSessionStats.correct}</p>
                 <p className="text-sm text-muted-foreground">Acertos</p>
               </div>
               <div className="space-y-1">
                 <p className="text-3xl font-bold text-red-600">{lastSessionStats.incorrect}</p>
                 <p className="text-sm text-muted-foreground">Erros</p>
               </div>
             </div>
             
             <div className="text-center">
               <p className="text-xl font-medium mb-2">
                 Precisão: {Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100)}%
               </p>
               <p className="text-sm text-muted-foreground">
                 +{lastSessionStats.correct * 15 + lastSessionStats.incorrect * 5} XP ganhos
               </p>
             </div>
           </div>
           
           <div className="space-y-3">
                                                       <Button 
                 onClick={continueStudying}
                 className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-lg py-3"
               >
               <Play className="h-5 w-5 mr-2" />
               Continuar Estudando (+{flashcards.length} cards)
             </Button>
             <Button 
               onClick={resetSession}
               variant="outline"
               className="w-full border-green-300 text-green-600 hover:bg-green-50 text-lg py-3"
             >
               <CheckCircle className="h-5 w-5 mr-2" />
               Finalizar e Voltar
             </Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* Modal Criar Flashcard */}
       <Dialog open={showCreateModal} onOpenChange={(open) => {
         setShowCreateModal(open)
         if (!open) resetForm()
       }}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Plus className="h-5 w-5" />
               Criar Novo Flashcard
             </DialogTitle>
             <DialogDescription>
               Adicione uma nova pergunta e resposta para o tópico selecionado
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="question">Pergunta</Label>
               <Textarea
                 id="question"
                 placeholder="Digite a pergunta do flashcard..."
                 value={formQuestion}
                 onChange={(e) => setFormQuestion(e.target.value)}
                 className="min-h-[100px]"
               />
             </div>
             <div>
               <Label htmlFor="answer">Resposta</Label>
               <Textarea
                 id="answer"
                 placeholder="Digite a resposta do flashcard..."
                 value={formAnswer}
                 onChange={(e) => setFormAnswer(e.target.value)}
                 className="min-h-[100px]"
               />
             </div>
           </div>
           <div className="flex gap-3">
             <Button 
               onClick={handleCreateFlashcard}
               disabled={isSubmitting || !formQuestion.trim() || !formAnswer.trim()}
               className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700"
             >
               <Save className="h-4 w-4 mr-2" />
               {isSubmitting ? "Salvando..." : "Criar Flashcard"}
             </Button>
             <Button 
               onClick={() => setShowCreateModal(false)}
               variant="outline" 
               className="flex-1"
               disabled={isSubmitting}
             >
               <X className="h-4 w-4 mr-2" />
               Cancelar
             </Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* Modal Editar Flashcard */}
       <Dialog open={showEditModal} onOpenChange={(open) => {
         setShowEditModal(open)
         if (!open) resetForm()
       }}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Edit className="h-5 w-5" />
               Editar Flashcard
             </DialogTitle>
             <DialogDescription>
               Modifique a pergunta e resposta do flashcard
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="edit-question">Pergunta</Label>
               <Textarea
                 id="edit-question"
                 placeholder="Digite a pergunta do flashcard..."
                 value={formQuestion}
                 onChange={(e) => setFormQuestion(e.target.value)}
                 className="min-h-[100px]"
               />
             </div>
             <div>
               <Label htmlFor="edit-answer">Resposta</Label>
               <Textarea
                 id="edit-answer"
                 placeholder="Digite a resposta do flashcard..."
                 value={formAnswer}
                 onChange={(e) => setFormAnswer(e.target.value)}
                 className="min-h-[100px]"
               />
             </div>
           </div>
           <div className="flex gap-3">
             <Button 
               onClick={handleEditFlashcard}
               disabled={isSubmitting || !formQuestion.trim() || !formAnswer.trim()}
               className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700"
             >
               <Save className="h-4 w-4 mr-2" />
               {isSubmitting ? "Salvando..." : "Salvar Alterações"}
             </Button>
             <Button 
               onClick={() => setShowEditModal(false)}
               variant="outline" 
               className="flex-1"
               disabled={isSubmitting}
             >
               <X className="h-4 w-4 mr-2" />
               Cancelar
             </Button>
           </div>
         </DialogContent>
       </Dialog>

       {showQuantityModal && pendingTopicId && (
         <FlashcardQuantityModal
           topicName={topics.find(t => t.id === pendingTopicId)?.name || "Tópico"}
           totalFlashcards={() => getFlashcardCountForTopic(pendingTopicId)}
           onStartStudy={(quantity: number) => {
             setCustomQuantity(quantity)
             handleCustomQuantityStart()
           }}
           onClose={() => {
             setShowQuantityModal(false)
             setPendingTopicId(null)
             setPendingMode("normal")
           }}
         />
       )}
    </DashboardShell>
  )
}
