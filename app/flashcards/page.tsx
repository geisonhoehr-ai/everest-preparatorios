"use client"

import { useState, useEffect } from "react"
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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff
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
import { DashboardShell } from "@/components/dashboard-shell"
import { getUserRoleClient, ensureUserRole, checkAuthentication, getAuthAndRole } from "@/lib/get-user-role"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Topic {
  id: string
  name: string
  subject_id?: number
}

// Configurações de cores para as matérias
const subjectColors = {
  "Português": {
    gradient: "from-blue-500 to-purple-600",
    border: "border-blue-200 dark:border-blue-700",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-600",
    shadow: "shadow-blue-100 dark:shadow-blue-900/20",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    title: "from-blue-600 to-purple-600",
    button: "from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
    icon: "📚",
    desc: "Domine a língua portuguesa com questões atualizadas"
  },
  "Direito Aeronáutico": {
    gradient: "from-emerald-500 to-teal-600",
    border: "border-emerald-200 dark:border-emerald-700",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-600",
    shadow: "shadow-emerald-100 dark:shadow-emerald-900/20",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    title: "from-emerald-600 to-teal-600",
    button: "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    icon: "✈️",
    desc: "Legislação aeronáutica e normas de aviação"
  }
}

const defaultColors = {
  gradient: "from-gray-500 to-gray-600",
  border: "border-gray-200 dark:border-gray-700",
  hoverBorder: "hover:border-gray-300 dark:hover:border-gray-600",
  shadow: "shadow-gray-100 dark:shadow-gray-900/20",
  badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  title: "from-gray-600 to-gray-600",
  button: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
  icon: "📖",
  desc: "Matéria para estudo"
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
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)

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
        }
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao verificar autenticação:', error)
      }
    }

    checkAuthAndRole()
  }, [])

  useEffect(() => {
    if (topics && Array.isArray(topics) && topics.length > 0) {
      const progress: { [topicId: string]: TopicProgress } = {}
      topics.forEach(topic => {
        if (topic && topic.id) {
          progress[topic.id] = generateTopicProgress(topic.id)
        }
      })
      setTopicProgress(progress)
      loadWrongCardsCount()
    }
  }, [topics])

  const loadWrongCardsCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id && topics && Array.isArray(topics)) {
        const counts: { [topicId: string]: number } = {}
        for (const topic of topics) {
          if (topic && topic.id) {
            const count = await getWrongCardsCount(user.id, topic.id)
            counts[topic.id] = count
          }
        }
        setWrongCardsCount(counts)
      }
    } catch (error) {
      console.error("❌ [DEBUG] Erro ao carregar contagem de cards errados:", error)
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
      
      // Primeiro, definir dados padrão para garantir funcionamento imediato
      const defaultSubjects = [
        { id: 1, name: "Português" },
        { id: 2, name: "Regulamentos" }
      ]
      setSubjects(defaultSubjects)
      console.log("✅ [DEBUG] Subjects padrão definidos imediatamente:", defaultSubjects)
      
      // Tentar carregar dados reais do servidor
      console.log("🔍 [DEBUG] Chamando getAllSubjects()...")
        const subjectsData = await getAllSubjects()
      console.log("📚 [DEBUG] Resposta de getAllSubjects():", subjectsData)
      
      // Se conseguimos dados reais, atualizar
      if (subjectsData && Array.isArray(subjectsData) && subjectsData.length > 0) {
        console.log("✅ [DEBUG] Dados reais obtidos, atualizando subjects...")
          setSubjects(subjectsData)
        console.log("✅ [DEBUG] Subjects atualizados:", subjectsData)
      } else {
        console.log("📚 [DEBUG] Mantendo subjects padrão (dados reais vazios)")
        }

      // Sempre carregar tópicos após definir subjects
      await loadTopics()
      
      } catch (error) {
      console.error("❌ [DEBUG] Erro ao carregar matérias:", error)
      console.error("❌ [DEBUG] Stack trace:", error instanceof Error ? error.stack : 'N/A')
      
      // Em caso de erro, manter subjects padrão (já definidos acima)
      console.log("✅ [DEBUG] Mantendo subjects padrão devido ao erro")
      
      // Carregar tópicos mesmo com erro
      await loadTopics()
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
      console.log('🔍 [DEBUG] Carregando tópicos...')
      
      // Primeiro, definir tópicos padrão para garantir funcionamento imediato
      const defaultTopics = [
        { id: "fonetica-fonologia", name: "Fonetica e Fonologia" },
        { id: "ortografia", name: "Ortografia" },
        { id: "morfologia", name: "Morfologia" },
        { id: "sintaxe", name: "Sintaxe" },
        { id: "semantica", name: "Semântica" },
        { id: "estilistica", name: "Estilística" },
        { id: "literatura", name: "Literatura" },
        { id: "gramatica", name: "Gramática" },
        { id: "redacao", name: "Redação" },
        { id: "interpretacao", name: "Interpretação de Texto" },
        { id: "regulamentos-gerais", name: "Regulamentos Gerais" },
        { id: "normas-especificas", name: "Normas Específicas" },
        { id: "procedimentos", name: "Procedimentos" },
        { id: "legislacao", name: "Legislação" }
      ]
      setTopics(defaultTopics)
      console.log('✅ [DEBUG] Tópicos padrão definidos imediatamente:', defaultTopics.length)
      
      // Tentar carregar dados reais do servidor
      const topicsData = await getAllTopics()
      console.log('📝 [DEBUG] Tópicos carregados do servidor:', topicsData)
      
      // Se conseguimos dados reais, atualizar
      if (topicsData && Array.isArray(topicsData) && topicsData.length > 0) {
        setTopics(topicsData)
        console.log('✅ [DEBUG] Tópicos reais setados:', topicsData.length)
      } else {
        console.log('📚 [DEBUG] Mantendo tópicos padrão (dados reais vazios)')
      }
    } catch (error) {
      console.error("❌ [DEBUG] Erro ao carregar tópicos:", error)
      
      // Em caso de erro, manter tópicos padrão (já definidos acima)
      console.log('✅ [DEBUG] Mantendo tópicos padrão devido ao erro')
    } finally {
      setIsLoading(false)
    }
  }

  const getStudyModeConfig = (mode: string) => {
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
        return { quantity: customQuantity, title: "Quantidade Personalizada", description: `${customQuantity} cards selecionados` }
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
      const config = getStudyModeConfig(validMode)
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
      let cards: Flashcard[] = []
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
      
      // Adicionar efeito de Sparkles para feedback visual
      setShowAnswerFeedback(true)
      setTimeout(() => setShowAnswerFeedback(false), 2000)
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

  const filteredTopics = (topics || []).filter(topic => {
    if (!topic || !topic.name) return false
    
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

      const result = await createFlashcard(user.id, selectedTopic, formQuestion, formAnswer)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando flashcards...</p>
        </div>
      </div>
    )
  }



  // Modo de estudo ativo
  if (studyMode === "study" && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100
    const estimatedTime = getEstimatedTimeRemaining()

    return (
      <div className={isFullscreen ? "fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" : "min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"}>
        <div className="max-w-5xl mx-auto space-y-4 py-4">
          {/* Conteúdo do modo de estudo aqui */}
          <div>Modo de estudo ativo</div>
        </div>
      </div>
    )
  }

  // 1. Seleção de matéria
  if (!selectedSubject) {
    return (
      <DashboardShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Escolha a Matéria</h1>
            <p className="text-muted-foreground mt-1">
              Selecione uma matéria para começar a estudar com flashcards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
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
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`} />
                          Flashcards disponíveis
                        </span>
                        <span className="font-semibold">500+</span>
                      </div>
                      
                      <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {subject.name.toLowerCase().includes('português') ? (
                          <>
                            <span>• Gramática</span>
                            <span>• Literatura</span>
                            <span>• Interpretação</span>
                          </>
                        ) : (
                          <>
                            <span>• Normas</span>
                            <span>• Legislação</span>
                            <span>• Condutas</span>
                          </>
                        )}
                      </div>
                      
                      <Button 
                        className={`
                          w-full bg-gradient-to-r ${config.button} text-white font-bold py-4 text-lg
                          transform transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl
                          border-0 focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
                          group-hover:animate-pulse
                        `}
                      >
                        <Play className="mr-3 h-6 w-6" />
                        Estudar {subject.name}
                      </Button>
                    </div>
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

  // 2. Estado de loading ou tópicos
  return (
    <DashboardShell>
      <div>Carregando tópicos...</div>
    </DashboardShell>
  )
}
