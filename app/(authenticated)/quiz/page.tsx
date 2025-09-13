"use client"

import { useState, useEffect, useTransition } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  BrainCircuit, 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Star, 
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
  Shield,
  BookOpenText
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context"
import { updateQuizProgress, getAllSubjects, getTopicsBySubject, getAllQuizzesByTopic, createQuiz, updateQuiz, deleteQuiz, createTopic, updateTopic, deleteTopic } from "../../server-actions"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export default function QuizPage() {
  const { user, profile } = useAuth()
  
  // Debug: verificar dados do usuário
  console.log('🔍 Debug Quiz - User:', user)
  console.log('🔍 Debug Quiz - Profile:', profile)
  console.log('🔍 Debug Quiz - Profile Role:', profile?.role)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [quizMode, setQuizMode] = useState<"select" | "quiz" | "finished">("select")
  const [quizStats, setQuizStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizTime, setQuizTime] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  
  // Estados para CRUD de quizzes
  const [editingQuiz, setEditingQuiz] = useState<Question | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: ''
  })
  
  // Estados para CRUD de tópicos
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)
  const [isTopicLoading, setIsTopicLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: ''
  })

  // Carregar subjects quando o componente for montado
  useEffect(() => {
    if (user?.id) {
      loadSubjects()
    }
  }, [user?.id])

  // Garantir que sempre sejam arrays válidos
  const safeSubjects = Array.isArray(subjects) ? subjects : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeQuestions = Array.isArray(questions) ? questions : []

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

  const loadQuestions = async (quizId: string) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando questões do Supabase para quiz ${quizId}...`)
      
      if (!profile?.user_id) {
        console.error("❌ Usuário não autenticado")
        return
      }
      
      const result = await getAllQuizzesByTopic(quizId)
      console.log("🔍 Resultado da busca:", result)
      
      if (result && result.length > 0) {
        // Converter quizzes para o formato de questões esperado
        const formattedQuestions = result.map((quiz: any) => ({
          id: quiz.id,
          question: quiz.question_text,
          options: Array.isArray(quiz.options) ? quiz.options : [],
          correct_answer: Array.isArray(quiz.options) ? quiz.options.indexOf(quiz.correct_answer) : 0,
          explanation: quiz.explanation || "Explicação não disponível"
        }))
        
        console.log("✅ Questões formatadas:", formattedQuestions)
        setQuestions(formattedQuestions)
        console.log("✅ Questões carregadas:", formattedQuestions.length)
      } else {
        console.log("ℹ️ Nenhuma questão encontrada para este quiz")
        setQuestions([])
      }
      
    } catch (error) {
      console.error("❌ Erro ao carregar questões:", error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadQuizzesForTopic = async (topicId: string) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando quizzes para tópico ${topicId}...`)
      
      // Buscar quizzes que pertencem a este tópico
      const { data: quizzes, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("topic_id", topicId)
        .order("id")
      
      if (error) {
        console.error("❌ Erro ao buscar quizzes:", error)
        return []
      }
      
      console.log(`✅ Quizzes encontrados para tópico ${topicId}:`, quizzes?.length || 0)
      return quizzes || []
      
    } catch (error) {
      console.error("❌ Erro inesperado ao buscar quizzes:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Funções para CRUD de quizzes
  const handleEditQuiz = (quiz: Question) => {
    console.log("🔧 [Debug] handleEditQuiz chamado com:", quiz)
    setEditingQuiz(quiz)
    setEditForm({
      question: quiz.question,
      options: quiz.options,
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation
    })
    setIsEditDialogOpen(true)
    console.log("🔧 [Debug] Modal de quiz deve estar aberto agora")
  }

  const handleSaveEdit = async () => {
    if (!profile?.user_id) return
    
    try {
      if (editingQuiz) {
        // Editar quiz existente
        const result = await updateQuiz(profile.user_id, editingQuiz.id.toString(), {
          question_text: editForm.question,
          options: editForm.options,
          correct_answer: editForm.options[editForm.correct_answer],
          explanation: editForm.explanation
        })
        
        if (result.success) {
          setQuestions(prev => 
            prev.map(q => q.id === editingQuiz.id 
              ? { 
                  ...q, 
                  question: editForm.question,
                  options: editForm.options,
                  correct_answer: editForm.correct_answer,
                  explanation: editForm.explanation
                }
              : q
            )
          )
        }
      } else {
        // Criar novo quiz
        if (!selectedTopic) {
          alert("Selecione um tópico primeiro")
          return
        }
        
        const result = await createQuiz(profile.user_id, {
          quiz_id: selectedTopic,
          question_text: editForm.question,
          options: editForm.options,
          correct_answer: editForm.options[editForm.correct_answer],
          explanation: editForm.explanation
        })
        
        if (result.success && result.data) {
          const newQuestion = {
            id: result.data.id,
            question: editForm.question,
            options: editForm.options,
            correct_answer: editForm.correct_answer,
            explanation: editForm.explanation
          }
          setQuestions(prev => [newQuestion, ...prev])
        }
      }
      
      setIsEditDialogOpen(false)
      setEditingQuiz(null)
      setEditForm({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: ''
      })
    } catch (error) {
      console.error("Erro ao salvar quiz:", error)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!profile?.user_id) return
    
    if (confirm("Tem certeza que deseja excluir este quiz?")) {
      try {
        const result = await deleteQuiz(profile.user_id, quizId.toString())
        if (result.success) {
          setQuestions(prev => prev.filter(q => q.id !== quizId))
        }
      } catch (error) {
        console.error("Erro ao excluir quiz:", error)
      }
    }
  }

  // Funções para CRUD de tópicos
  const handleEditTopic = (topic: Topic) => {
    console.log("🔧 [Debug] handleEditTopic chamado com:", topic)
    console.log("🔧 [Debug] Profile disponível:", profile)
    console.log("🔧 [Debug] User disponível:", user)
    setEditingTopic(topic)
    setTopicForm({
      name: topic.name,
      description: topic.description
    })
    setIsTopicDialogOpen(true)
    console.log("🔧 [Debug] Modal de tópico deve estar aberto agora")
  }

  const handleSaveTopic = async () => {
    console.log("🔧 [Debug] handleSaveTopic chamado")
    console.log("🔧 [Debug] Profile user_id:", profile?.user_id)
    console.log("🔧 [Debug] Selected subject:", selectedSubject)
    console.log("🔧 [Debug] Editing topic:", editingTopic)
    console.log("🔧 [Debug] Topic form:", topicForm)
    
    if (!profile?.user_id || !selectedSubject) {
      console.log("❌ [Debug] Falta profile.user_id ou selectedSubject")
      return
    }
    
    setIsTopicLoading(true)
    
    startTransition(async () => {
      try {
      if (editingTopic) {
        console.log("🔧 [Debug] Editando tópico existente")
        // Editar tópico existente
        const result = await updateTopic(profile.user_id, editingTopic.id, {
          name: topicForm.name,
          description: topicForm.description
        })
        
        console.log("🔧 [Debug] Resultado da atualização:", result)
        
        if (result.success) {
          setTopics(prev => 
            prev.map(t => t.id === editingTopic.id 
              ? { ...t, name: topicForm.name, description: topicForm.description }
              : t
            )
          )
        }
      } else {
        console.log("🔧 [Debug] Criando novo tópico")
        // Criar novo tópico
        const result = await createTopic(profile.user_id, {
          subject_id: selectedSubject,
          name: topicForm.name,
          description: topicForm.description
        })
        
        console.log("🔧 [Debug] Resultado da criação:", result)
        
        if (result.success && result.data) {
          const newTopic = {
            id: result.data.id.toString(),
            name: result.data.name,
            description: result.data.description || `Estude e pratique ${result.data.name.toLowerCase()}`
          }
          setTopics(prev => [...prev, newTopic])
        }
      }
      
      setIsTopicDialogOpen(false)
      setEditingTopic(null)
      setTopicForm({ name: '', description: '' })
      } catch (error) {
        console.error("❌ [Debug] Erro ao salvar tópico:", error)
      } finally {
        setIsTopicLoading(false)
      }
    })
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!profile?.user_id) return
    
    if (confirm("Tem certeza que deseja excluir este tópico? Todos os quizzes associados também serão removidos.")) {
      try {
        const result = await deleteTopic(profile.user_id, topicId)
        if (result.success) {
          setTopics(prev => prev.filter(t => t.id !== topicId))
        }
      } catch (error) {
        console.error("Erro ao excluir tópico:", error)
      }
    }
  }

  const startQuiz = async (topicId: string, timeLimit: number = 0) => {
    setSelectedTopic(topicId)
    
    // Primeiro, buscar quizzes disponíveis para este tópico
    const availableQuizzes = await loadQuizzesForTopic(topicId)
    
    if (availableQuizzes.length === 0) {
      console.log("❌ Nenhum quiz encontrado para este tópico")
      setQuestions([])
      setQuizMode("quiz") // Vai mostrar a tela de "nenhuma questão disponível"
      return
    }
    
    // Encontrar o primeiro quiz que tenha questões
    let selectedQuizId = null
    for (const quiz of availableQuizzes) {
      const questions = await getAllQuizzesByTopic(quiz.id.toString())
      if (questions && questions.length > 0) {
        selectedQuizId = quiz.id.toString()
        console.log(`✅ Quiz selecionado: ${quiz.title} (ID: ${quiz.id}) com ${questions.length} questões`)
        break
      }
    }
    
    if (!selectedQuizId) {
      console.log("❌ Nenhum quiz com questões encontrado para este tópico")
      setQuestions([])
      setQuizMode("quiz") // Vai mostrar a tela de "nenhuma questão disponível"
      return
    }
    
    // Carregar questões do quiz selecionado
    await loadQuestions(selectedQuizId)
    setQuizMode("quiz")
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizStats({ correct: 0, incorrect: 0 })
    setQuizTime(timeLimit)
    setTimeLeft(timeLimit)
  }

  const submitAnswer = () => {
    if (selectedAnswer === null) return

    const currentQuestion = safeQuestions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correct_answer

    setQuizStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }))

      setShowResult(true)
  }

  const nextQuestion = async () => {
    if (currentQuestionIndex < safeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Finalizar quiz e salvar progresso
      if (user && selectedTopic) {
        try {
          const totalQuestions = safeQuestions.length
          const correctAnswers = quizStats.correct
          const timeSpent = quizTime > 0 ? quizTime - timeLeft : 0
          
          const result = await updateQuizProgress(
            user.id, 
            selectedTopic, 
            correctAnswers, 
            totalQuestions, 
            timeSpent
          )
          
          if (result.success && result.xpGained !== undefined) {
            setXpGained(result.xpGained)
            console.log(`✅ Quiz finalizado! +${result.xpGained} XP ganho!`)
          }
        } catch (error) {
          console.error('❌ Erro ao salvar progresso do quiz:', error)
        }
      }
      
      setQuizMode("finished")
    }
  }

  const resetQuiz = () => {
    setQuizMode("select")
    setSelectedTopic(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizStats({ correct: 0, incorrect: 0 })
    setTimeLeft(0)
    setQuizTime(0)
  }

  // Timer
  useEffect(() => {
    if (quizMode === "quiz" && quizTime > 0 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQuizMode("finished")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizMode, quizTime, timeLeft])

  useEffect(() => {
    loadSubjects()
  }, [])

  if (isLoading && quizMode === "select") {
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
                Selecione a matéria que deseja testar com quiz
              </p>
            </div>
            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
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
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                    {subject.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {subject.description || "Teste seus conhecimentos"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Brain className="h-4 w-4" />
                        <span>Tópicos</span>
                      </span>
                      <span className="font-medium">
                        -
                      </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Play className="h-4 w-4" />
                        <span>Questões</span>
                      </span>
                      <span className="font-medium">0</span>
                </div>
                </div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                    <Play className="mr-3 h-6 w-6" />
                    Fazer Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {safeSubjects.length === 0 && (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent>
                <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                  <BrainCircuit className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Nenhuma matéria disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
                  No momento não há matérias disponíveis para quiz. Tente novamente mais tarde.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </RoleGuard>
    )
  }

  // Seleção de tópico
  if (quizMode === "select") {
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
                  Escolha um tópico para fazer quiz
                </p>
              </div>
            </div>
            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Abrir modal de criação de tópico
                    setTopicForm({ name: '', description: '' })
                    setEditingTopic(null)
                    setIsTopicDialogOpen(true)
                  }}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Tópico
                </Button>
                <Button 
                  onClick={() => {
                    // Abrir modal de criação de quiz
                    setEditForm({
                      question: '',
                      options: ['', '', '', ''],
                      correct_answer: 0,
                      explanation: ''
                    })
                    setEditingQuiz(null)
                    setIsEditDialogOpen(true)
                  }}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Quiz
                </Button>
              </div>
            )}
          </div>
              
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
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-500 relative"
                >
                  {/* Ícones de edição para admin/teacher */}
                  {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log("🔧 [Debug] Botão de editar tópico clicado!")
                          handleEditTopic(topic)
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
                          handleDeleteTopic(topic.id)
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  )}
                  
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
                    <div className="space-y-3">
                      <Button 
                        onClick={() => startQuiz(topic.id, 0)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Play className="mr-3 h-6 w-6" />
                        Quiz Livre
                      </Button>
                      <Button 
                        onClick={() => startQuiz(topic.id, 300)}
                        variant="outline"
                        className="w-full"
                      >
                        <Clock className="mr-3 h-6 w-6" />
                        Quiz 5 min
                      </Button>
                      {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                        <Button 
                          onClick={() => {
                            // Abrir modal de gerenciamento de quizzes do tópico
                            setSelectedTopic(topic.id)
                            setEditForm({
                              question: '',
                              options: ['', '', '', ''],
                              correct_answer: 0,
                              explanation: ''
                            })
                            setEditingQuiz(null)
                            setIsEditDialogOpen(true)
                          }}
                          variant="outline"
                          className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                        >
                          <Settings className="mr-3 h-6 w-6" />
                          Gerenciar Quizzes
                        </Button>
                      )}
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

  // Modo de quiz - sem questões
  if (quizMode === "quiz" && safeQuestions.length === 0) {
    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={resetQuiz}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Voltar
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {safeTopics.find(t => t.id === selectedTopic)?.name}
              </h1>
            </div>
            <div className="w-32"></div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent>
                <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                  <BookOpenText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Nenhuma questão disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto mb-6">
                  Não há questões disponíveis para este tópico no momento. Tente outro tópico ou aguarde mais conteúdo.
                </p>
                <Button 
                  onClick={resetQuiz}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
                >
                  <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                  Voltar aos Tópicos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleGuard>
    )
  }

  // Modo de quiz
  if (quizMode === "quiz" && safeQuestions.length > 0) {
    const currentQuestion = safeQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / safeQuestions.length) * 100

    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={resetQuiz}
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
                Questão {currentQuestionIndex + 1} de {safeQuestions.length}
              </p>
              {xpGained > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ⭐ +{xpGained} XP
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {quizTime > 0 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-bold">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
        </div>
      </div>

          <div className="max-w-4xl mx-auto">
            <Card className="min-h-[500px] flex flex-col justify-center relative">
              {/* Ícones de edição para admin/teacher */}
              {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log("🔧 [Debug] Botão de editar quiz clicado!")
                      handleEditQuiz(currentQuestion)
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
                      handleDeleteQuiz(currentQuestion.id)
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              )}
              
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {currentQuestion.question}
                  </h2>
                  
                  <RadioGroup
                    value={selectedAnswer?.toString()}
                    onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                    className="space-y-4"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
                  {showResult && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        {selectedAnswer === currentQuestion.correct_answer ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        <h3 className="text-lg font-semibold">
                          {selectedAnswer === currentQuestion.correct_answer ? "Correto!" : "Incorreto!"}
                        </h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  {!showResult ? (
                    <Button 
                      onClick={submitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Responder
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextQuestion}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      {currentQuestionIndex < safeQuestions.length - 1 ? "Próxima" : "Finalizar"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6">
              <Button 
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                Anterior
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Acertos: <span className="font-bold text-green-600">{quizStats.correct}</span> | 
                  Erros: <span className="font-bold text-red-600">{quizStats.incorrect}</span>
                </p>
              </div>
              
              <Button 
                onClick={() => setCurrentQuestionIndex(Math.min(safeQuestions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === safeQuestions.length - 1}
                variant="outline"
              >
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
    </div>
      </RoleGuard>
    )
  }

  // Quiz finalizado
  if (quizMode === "finished") {
    const totalQuestions = quizStats.correct + quizStats.incorrect
    const accuracy = totalQuestions > 0 ? (quizStats.correct / totalQuestions) * 100 : 0

    return (
      <RoleGuard allowedRoles={['student', 'teacher', 'admin']}>
        <div className="space-y-6 p-6">
          <div className="text-center">
            <div className="mx-auto mb-6 p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-fit">
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Quiz Finalizado!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Parabéns por completar o quiz!
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {quizStats.correct}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Acertos</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {quizStats.incorrect}
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
                onClick={resetQuiz}
                variant="outline"
                className="px-8 py-3"
            >
                <RotateCcw className="mr-2 h-5 w-5" />
                Fazer Novamente
            </Button>
            <Button 
                onClick={() => setSelectedSubject(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
            >
                <BrainCircuit className="mr-2 h-5 w-5" />
                Escolher Outra Matéria
            </Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  // Debug: verificar estado do modal
  console.log("🔧 [Debug] Estado do modal de quiz:", { isEditDialogOpen, editingQuiz })
  console.log("🔧 [Debug] Estado do modal de tópico:", { isTopicDialogOpen, editingTopic })

  return (
    <PagePermissionGuard pageName="quiz">
      {/* Modal de Edição de Tópico */}
      {isTopicDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingTopic ? 'Editar Tópico' : 'Novo Tópico'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {editingTopic 
                ? 'Atualize as informações do tópico'
                : 'Crie um novo tópico para a matéria'
              }
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="topic-name" className="text-sm font-medium">
                  Nome do Tópico
                </label>
                <Input
                  id="topic-name"
                  placeholder="Digite o nome do tópico..."
                  value={topicForm.name}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="topic-description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="topic-description"
                  placeholder="Digite a descrição do tópico..."
                  value={topicForm.description}
                  onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsTopicDialogOpen(false)
                    setEditingTopic(null)
                    setTopicForm({ name: '', description: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveTopic} disabled={isTopicLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isTopicLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Quiz - Versão Simplificada */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingQuiz ? 'Editar Quiz' : 'Novo Quiz'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {editingQuiz 
                ? 'Atualize as informações do quiz'
                : 'Crie um novo quiz para a plataforma'
              }
            </p>
            
            <div className="space-y-4">
              {!editingQuiz && (
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
                <label className="text-sm font-medium">Opções de Resposta</label>
                {editForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={editForm.correct_answer === index}
                      onChange={() => setEditForm(prev => ({ ...prev, correct_answer: index }))}
                      className="w-4 h-4"
                    />
                    <Input
                      placeholder={`Opção ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editForm.options]
                        newOptions[index] = e.target.value
                        setEditForm(prev => ({ ...prev, options: newOptions }))
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-explanation" className="text-sm font-medium">
                  Explicação
                </label>
                <Textarea
                  id="edit-explanation"
                  placeholder="Digite a explicação da resposta..."
                  value={editForm.explanation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingQuiz(null)
                    setEditForm({
                      question: '',
                      options: ['', '', '', ''],
                      correct_answer: 0,
                      explanation: ''
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PagePermissionGuard>
  )
}