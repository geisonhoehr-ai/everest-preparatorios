"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrainCircuit, Play, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Star, Share2, Copy, Settings, Plus, Edit, Trash2, Save, X, Eye, EyeOff, Users, Shield, Target, Clock, RefreshCw, BookOpen } from "lucide-react"
import { 
  getAllTopics, 
  getQuizzesByTopic, 
  getQuizQuestions, 
  submitQuizResult, 
  getAllSubjects, 
  getTopicsBySubject,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzesByTopic,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getAllQuestionsByQuiz
} from "@/actions"
import { getUserRoleClient, getAuthAndRole } from "@/lib/get-user-role"
import { PageAuthWrapper } from "@/components/page-auth-wrapper"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { DebugTheme } from "@/components/debug-theme"
import { SearchQuizzes } from "@/components/search-quizzes"

interface Topic {
  id: string
  name: string
}

interface Quiz {
  id: number
  topic_id: string
  title: string
  description: string | null
}

interface QuizQuestion {
  id: number
  quiz_id: number
  question_text: string
  options: string[]
  correct_answer: string
  explanation: string | null
}

export default function QuizPage() {
  return (
    <PageAuthWrapper>
      <DashboardShell>
        <QuizPageContent />
      </DashboardShell>
    </PageAuthWrapper>
  )
}

function QuizPageContent() {
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizResult, setQuizResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<"topics" | "quizzes" | "quiz" | "result">("topics")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  
  // Estados para modo admin
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false)
  const [showEditQuizModal, setShowEditQuizModal] = useState(false)
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false)
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [adminQuizzes, setAdminQuizzes] = useState<Quiz[]>([])
  const [adminQuestions, setAdminQuestions] = useState<QuizQuestion[]>([])
  const [adminPage, setAdminPage] = useState(1)
  const [adminTotal, setAdminTotal] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados dos formulários
  const [formQuizTitle, setFormQuizTitle] = useState("")
  const [formQuizDescription, setFormQuizDescription] = useState("")
  const [formQuestionText, setFormQuestionText] = useState("")
  const [formOptions, setFormOptions] = useState(["", "", "", ""])
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("")
  const [formExplanation, setFormExplanation] = useState("")

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 [QUIZ PAGE] Iniciando carregamento de dados...")

        // Verificação otimizada de autenticação e role (mesmo padrão do flashcards)
        const { user, role, isAuthenticated } = await getAuthAndRole()
        
        console.log("🔍 [QUIZ PAGE] getAuthAndRole result:", { user: !!user, role, isAuthenticated })
        
        if (isAuthenticated && user) {
          console.log("✅ [QUIZ PAGE] Usuário autenticado:", user.email)
          console.log("✅ [QUIZ PAGE] Role do usuário:", role)
          setUserRole(role)
        } else {
          console.log("❌ [QUIZ PAGE] Usuário não autenticado")
          setUserRole('student')
        }

        // Buscar subjects
        console.log("🔍 [QUIZ PAGE] Buscando subjects...")
        const subjectsData = await getAllSubjects()
        if (subjectsData && subjectsData.length > 0) {
          setSubjects(subjectsData)
          console.log("✅ [QUIZ PAGE] Subjects carregados:", subjectsData.length)
        }

      } catch (error) {
        console.error("❌ [QUIZ PAGE] Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Erro ao carregar dados",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    async function fetchTopics() {
      if (selectedSubject) {
        try {
          console.log("🔍 [QUIZ PAGE] Carregando topics para subject:", selectedSubject)
          const data = await getTopicsBySubject(selectedSubject)
          console.log("✅ [QUIZ PAGE] Topics carregados:", data)
          setTopics(data)
        } catch (error) {
          console.error("❌ [QUIZ PAGE] Erro ao carregar topics:", error)
          setTopics([])
        }
      } else {
        setTopics([])
      }
    }
    fetchTopics()
  }, [selectedSubject])
  
  // Efeito para filtrar quizzes com base no termo de busca
  useEffect(() => {
    if (quizzes.length > 0) {
      if (searchTerm.trim() === '') {
        // Se não houver termo de busca, mostrar todos os quizzes
        setFilteredQuizzes(quizzes)
      } else {
        // Filtrar quizzes com base no termo de busca
        const filtered = quizzes.filter(quiz => 
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setFilteredQuizzes(filtered)
        console.log(`🔍 [QUIZ PAGE] Filtrados ${filtered.length} quizzes para o termo "${searchTerm}"`)
      }
    } else {
      setFilteredQuizzes([])
    }
  }, [quizzes, searchTerm])

         const loadQuizzes = async (topicId: string) => {
    setIsLoading(true)
    try {
      console.log("🔍 [QUIZ PAGE] Carregando quizzes para tópico:", topicId)
      const quizzesData = await getQuizzesByTopic(topicId)
      console.log("✅ [QUIZ PAGE] Quizzes carregados:", quizzesData)
      
      setQuizzes(quizzesData)
      setFilteredQuizzes(quizzesData) // Inicialmente, os quizzes filtrados são os mesmos que os carregados
      setSelectedTopic(topicId)
      setMode("quizzes")
    } catch (error) {
      console.error("❌ [QUIZ PAGE] Erro ao carregar quizzes:", error)
      alert("Erro ao carregar quizzes. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar quizzes no modo admin
  const loadAdminQuizzes = async (topicId: string) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      const { quizzes: data, total } = await getAllQuizzesByTopic(user.id, topicId, adminPage, 10)
      setAdminQuizzes(data)
      setAdminTotal(total)
      setSelectedTopic(topicId)
      setMode("quizzes") // Adicionar esta linha para definir o mode
    } catch (error) {
      console.error("Erro ao carregar quizzes do admin:", error)
      alert("Erro ao carregar quizzes. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar questões no modo admin
  const loadAdminQuestions = async (quizId: number) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      const data = await getAllQuestionsByQuiz(user.id, quizId)
      setAdminQuestions(data)
      setSelectedQuiz(adminQuizzes.find(q => q.id === quizId) || null)
      setMode("quiz") // Adicionar esta linha para definir o mode
    } catch (error) {
      console.error("Erro ao carregar questões do admin:", error)
      alert("Erro ao carregar questões. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = async (quiz: Quiz) => {
    setIsLoading(true)
    try {
      const questionsData = await getQuizQuestions(quiz.id)
      if (questionsData.length > 0) {
        setQuestions(questionsData)
        setSelectedQuiz(quiz)
        setCurrentQuestionIndex(0)
        setSelectedAnswer("")
        setUserAnswers([])
        setShowResult(false)
        setMode("quiz")
      } else {
        alert("Este quiz não possui questões disponíveis.")
      }
    } catch (error) {
      console.error("Erro ao carregar questões:", error)
      alert("Erro ao carregar questões. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = selectedAnswer
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(newAnswers[currentQuestionIndex + 1] || "")
    } else {
      finishQuiz(newAnswers)
    }
  }

  const finishQuiz = async (answers: string[]) => {
    if (!selectedQuiz) return

    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct_answer) {
        correct++
      }
    })

    const score = Math.round((correct / questions.length) * 100)

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await submitQuizResult(selectedQuiz.id, score, correct, questions.length - correct, questions.length, user.id)
      }
    } catch (error) {
      console.error("Erro ao salvar resultado:", error)
    }

    setQuizResult({ score, correct, total: questions.length })
    setMode("result")
    
    // Confetti effect
    if (score >= 70) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const colors = ['#10B981', '#059669', '#047857', '#065F46']
          const confetti = document.createElement('div')
          confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: confetti-fall 3s linear forwards;
          `
          document.body.appendChild(confetti)
          setTimeout(() => confetti.remove(), 3000)
        }, i * 100)
      }
    }
  }

  const resetQuiz = () => {
    setMode("topics")
    setSelectedTopic(null)
    setSelectedQuiz(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setUserAnswers([])
    setShowResult(false)
    setQuizResult(null)
    // Remover setIsAdminMode(false) para não interferir com o modo admin
  }

  // Função para resetar apenas o modo de estudo, mantendo o modo admin
  const resetStudyMode = () => {
    setMode("topics")
    setSelectedTopic(null)
    setSelectedQuiz(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setUserAnswers([])
    setShowResult(false)
    setQuizResult(null)
    // Não desativa o modo admin automaticamente
  }

  // Função para resetar completamente (incluindo modo admin)
  const resetAll = () => {
    setMode("topics")
    setSelectedTopic(null)
    setSelectedQuiz(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setUserAnswers([])
    setShowResult(false)
    setQuizResult(null)
    setIsAdminMode(false) // Desativa o modo admin
  }

  // Funções do modo admin
  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode)
  }

  const handleCreateQuiz = async () => {
    if (!selectedTopic || !formQuizTitle.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      await createQuiz(user.id, selectedTopic, formQuizTitle.trim(), formQuizDescription.trim())
      setShowCreateQuizModal(false)
      resetQuizForm()
      await loadAdminQuizzes(selectedTopic)
      alert("Quiz criado com sucesso!")
    } catch (error) {
      console.error("Erro ao criar quiz:", error)
      alert("Erro ao criar quiz. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditQuiz = async () => {
    if (!editingQuiz || !formQuizTitle.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      await updateQuiz(user.id, editingQuiz.id, formQuizTitle.trim(), formQuizDescription.trim())
      setShowEditQuizModal(false)
      setEditingQuiz(null)
      resetQuizForm()
      if (selectedTopic) {
        await loadAdminQuizzes(selectedTopic)
      }
      alert("Quiz atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar quiz:", error)
      alert("Erro ao atualizar quiz. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm("Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.")) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      await deleteQuiz(user.id, quizId)
      if (selectedTopic) {
        await loadAdminQuizzes(selectedTopic)
      }
      alert("Quiz excluído com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir quiz:", error)
      alert("Erro ao excluir quiz. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateQuestion = async () => {
    if (!selectedQuiz || !formQuestionText.trim() || !formCorrectAnswer.trim()) return

    const validOptions = formOptions.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      alert("É necessário pelo menos 2 opções de resposta.")
      return
    }

    if (!validOptions.includes(formCorrectAnswer.trim())) {
      alert("A resposta correta deve estar entre as opções disponíveis.")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      await createQuizQuestion(
        user.id,
        selectedQuiz.id,
        formQuestionText.trim(),
        validOptions,
        formCorrectAnswer.trim(),
        formExplanation.trim()
      )
      setShowCreateQuestionModal(false)
      resetQuestionForm()
      await loadAdminQuestions(selectedQuiz.id)
      alert("Questão criada com sucesso!")
    } catch (error) {
      console.error("Erro ao criar questão:", error)
      alert("Erro ao criar questão. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditQuestion = async () => {
    if (!editingQuestion || !formQuestionText.trim() || !formCorrectAnswer.trim()) return

    const validOptions = formOptions.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      alert("É necessário pelo menos 2 opções de resposta.")
      return
    }

    if (!validOptions.includes(formCorrectAnswer.trim())) {
      alert("A resposta correta deve estar entre as opções disponíveis.")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      await updateQuizQuestion(
        user.id,
        editingQuestion.id,
        formQuestionText.trim(),
        validOptions,
        formCorrectAnswer.trim(),
        formExplanation.trim()
      )
      setShowEditQuestionModal(false)
      setEditingQuestion(null)
      resetQuestionForm()
      if (selectedQuiz) {
        await loadAdminQuestions(selectedQuiz.id)
      }
      alert("Questão atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar questão:", error)
      alert("Erro ao atualizar questão. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.")) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        alert("Usuário não autenticado")
        return
      }
      
      await deleteQuizQuestion(user.id, questionId)
      if (selectedQuiz) {
        await loadAdminQuestions(selectedQuiz.id)
      }
      alert("Questão excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir questão:", error)
      alert("Erro ao excluir questão. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditQuizModal = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setFormQuizTitle(quiz.title)
    setFormQuizDescription(quiz.description || "")
    setShowEditQuizModal(true)
  }

  const openEditQuestionModal = (question: QuizQuestion) => {
    setEditingQuestion(question)
    setFormQuestionText(question.question_text)
    setFormOptions([...question.options, "", "", "", ""].slice(0, 4))
    setFormCorrectAnswer(question.correct_answer)
    setFormExplanation(question.explanation || "")
    setShowEditQuestionModal(true)
  }

  const resetQuizForm = () => {
    setFormQuizTitle("")
    setFormQuizDescription("")
  }

  const resetQuestionForm = () => {
    setFormQuestionText("")
    setFormOptions(["", "", "", ""])
    setFormCorrectAnswer("")
    setFormExplanation("")
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formOptions]
    newOptions[index] = value
    setFormOptions(newOptions)
  }

     // CSS adicional para animações
   useEffect(() => {
     const style = document.createElement('style')
     style.textContent = `
       @keyframes confetti-fall {
         to {
           transform: translateY(100vh) rotate(360deg);
           opacity: 0;
         }
       }
       
       @keyframes successPulse {
         0%, 100% { transform: scale(1); }
         50% { transform: scale(1.05); }
       }
       
       @keyframes errorShake {
         0%, 100% { transform: translateX(0); }
         25% { transform: translateX(-5px); }
         75% { transform: translateX(5px); }
       }
       
       @keyframes float {
         0%, 100% { transform: translateY(0px); }
         50% { transform: translateY(-10px); }
       }
       
       @keyframes shimmer {
         0% { background-position: -200% 0; }
         100% { background-position: 200% 0; }
       }
       
       @keyframes glow {
         0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
         50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
       }
       
       .button-success {
         animation: successPulse 0.6s ease-in-out;
       }
       
       .button-error {
         animation: errorShake 0.6s ease-in-out;
       }
       
       .card-float {
         animation: float 6s ease-in-out infinite;
       }
       
       .shimmer-effect {
         background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
         background-size: 200% 100%;
         animation: shimmer 2s infinite;
       }
       
       .line-clamp-3 {
         display: -webkit-box;
         -webkit-line-clamp: 3;
         -webkit-box-orient: vertical;
         overflow: hidden;
       }
     `
     document.head.appendChild(style)
     return () => {
       document.head.removeChild(style)
     }
   }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Renderizar baseado no modo
  if (mode === "topics" && !selectedSubject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Quiz</h1>
          <p className="text-muted-foreground mt-1">
            Escolha uma matéria para começar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card 
              key={subject.id} 
              className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-emerald-200 dark:border-emerald-800 cursor-pointer"
              onClick={() => setSelectedSubject(subject.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Matéria
                  </Badge>
                </div>
                <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">
                  {subject.name}
                </CardTitle>
                <CardDescription>
                  Explore quizzes sobre {subject.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (mode === "topics") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Tópicos</h1>
            <p className="text-muted-foreground">Matéria: {subjects.find((s) => s.id === selectedSubject)?.name}</p>
          </div>
          
          <div className="flex gap-2">
            {(userRole === 'teacher' || userRole === 'admin') && (
              <Button 
                onClick={() => setIsAdminMode(!isAdminMode)} 
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                {isAdminMode ? 'Modo Aluno' : 'Modo Admin'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedSubject(null)} className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950">
              Voltar às Matérias
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => {
            // Sistema de cores por índice
            const topicColors = [
              {
                gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
                border: 'border-emerald-200 dark:border-emerald-800',
                hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
                shadow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900',
                badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
                title: 'text-emerald-800 dark:text-emerald-200',
                iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20'
              },
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
              }
            ]
            
            const config = topicColors[index % topicColors.length]
            
            return (
              <Card 
                key={topic.id} 
                className={`
                  hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer
                  ${config.border} ${config.hoverBorder} ${config.shadow}
                `}
                onClick={() => isAdminMode ? loadAdminQuizzes(topic.id) : loadQuizzes(topic.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-full ${config.iconBg}`}>
                      <BrainCircuit className={`h-6 w-6 ${config.title}`} />
                    </div>
                    <Badge variant="secondary" className={`${config.badge}`}>
                      Tópico
                    </Badge>
                  </div>
                  
                  <CardTitle className={`text-xl font-bold ${config.title} leading-tight mb-3`}>
                    {topic.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    Explore quizzes interativos sobre este tópico e teste seus conhecimentos de forma dinâmica e envolvente!
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    onClick={() => isAdminMode ? loadAdminQuizzes(topic.id) : loadQuizzes(topic.id)} 
                    className={`
                      w-full bg-gradient-to-r ${config.button} text-white font-semibold py-3
                      transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                      border-0 focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                    `}
                  >
                    {isAdminMode ? (
                      <>
                        <Settings className="mr-2 h-5 w-5" />
                        Gerenciar Quizzes
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Ver Quizzes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <Button variant="outline" className="mt-8 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950" onClick={() => setSelectedSubject(null)}>
          Voltar às Matérias
        </Button>
      </div>
    )
  }

  if (mode === "quizzes") {
    console.log("🔍 [QUIZ PAGE] userRole para renderização:", userRole)
    console.log("🔍 [QUIZ PAGE] Deve mostrar botão admin:", userRole === 'teacher' || userRole === 'admin')
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Quizzes</h1>
            <p className="text-muted-foreground">Tópico: {topics.find((t) => t.id === selectedTopic)?.name}</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Componente de busca */}
            <div className="w-full md:w-[300px]">
              <SearchQuizzes
                onSearch={(query) => setSearchTerm(query)}
                placeholder="Buscar quizzes..."
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              {(userRole === 'teacher' || userRole === 'admin') && (
                <Button 
                  onClick={toggleAdminMode} 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Modo Admin
                </Button>
              )}
              <Button variant="outline" onClick={() => isAdminMode ? resetStudyMode() : resetAll()} className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950">
                <RotateCcw className="mr-2 h-4 w-4" />
                Voltar aos Tópicos
              </Button>
            </div>
          </div>
        </div>

        {filteredQuizzes.length === 0 && searchTerm.trim() !== '' ? (
          <div className="text-center py-10">
            <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum quiz encontrado</h3>
            <p className="text-muted-foreground mb-4">Não encontramos quizzes para o termo &quot;{searchTerm}&quot;</p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz, index) => {
              // Sistema de cores por dificuldade baseado no título
              const getDifficultyLevel = (title: string, index: number) => {
                const lowerTitle = title.toLowerCase()
                if (lowerTitle.includes('básico') || lowerTitle.includes('iniciante') || lowerTitle.includes('fácil')) {
                  return 'easy'
                } else if (lowerTitle.includes('avançado') || lowerTitle.includes('difícil') || lowerTitle.includes('expert')) {
                  return 'hard'
                }
                // Alternar entre níveis baseado no índice se não especificado
                return index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard'
              }

              const level = getDifficultyLevel(quiz.title, index)
              
              // Sistema de cores similar ao dos flashcards
              const topicColors = [
                {
                  gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
                  border: 'border-emerald-200 dark:border-emerald-800',
                  hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
                  shadow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900',
                  badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
                  button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
                  title: 'text-emerald-800 dark:text-emerald-200',
                  iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20'
                },
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
                }
              ]
              
              const config = topicColors[index % topicColors.length]
              
              return (
                <Card 
                  key={quiz.id} 
                  className={`
                    hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer
                    ${config.border} ${config.hoverBorder} ${config.shadow}
                  `}
                  onClick={() => startQuiz(quiz)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full ${config.iconBg}`}>
                        <BrainCircuit className={`h-6 w-6 ${config.title}`} />
                      </div>
                      <Badge variant="secondary" className={`${config.badge}`}>
                        {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Médio' : 'Difícil'}
                      </Badge>
                    </div>
                    
                    <CardTitle className={`text-xl font-bold ${config.title} leading-tight mb-3`}>
                      {quiz.title}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {quiz.description || 'Teste seus conhecimentos com este quiz interativo!'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => startQuiz(quiz)} 
                      className={`
                        w-full bg-gradient-to-r ${config.button} text-white font-semibold py-3
                        transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                        border-0 focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                      `}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Iniciar Quiz
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Modo padrão - mostrar tópicos
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Quiz</h1>
        <p className="text-muted-foreground mt-1">
          Escolha um tópico para fazer quizzes e testar seus conhecimentos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BrainCircuit className="h-8 w-8 text-emerald-600" />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Tópico</Badge>
              </div>
              <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">{topic.name}</CardTitle>
              <CardDescription>Faça quizzes sobre este tópico</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadQuizzes(topic.id)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                <Play className="mr-2 h-4 w-4" />
                Ver Quizzes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-800 dark:to-purple-900 border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300">
          <CardContent>
            <div className="p-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 mx-auto mb-6 w-fit">
              <BrainCircuit className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent">Nenhum tópico disponível</h3>
            <p className="text-orange-700 dark:text-orange-300 text-lg leading-relaxed max-w-md mx-auto mb-8">
              Os tópicos de quiz ainda não foram configurados para esta matéria. Em breve haverá novos conteúdos!
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
  )
}
