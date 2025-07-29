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
import { BrainCircuit, Play, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Star, Share2, Copy, Settings, Plus, Edit, Trash2, Save, X, Eye, EyeOff, Users, Shield } from "lucide-react"
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
import { getUserRoleClient } from "@/lib/get-user-role"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

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

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔍 [QUIZ PAGE] Iniciando carregamento de dados...")
        
        // Verificar autenticação primeiro
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error("❌ [QUIZ PAGE] Usuário não autenticado")
          setIsLoading(false)
          return
        }
        
        console.log("✅ [QUIZ PAGE] Usuário autenticado:", user.email)
        
        // Buscar subjects
        console.log("🔍 [QUIZ PAGE] Buscando subjects...")
        const subjectsData = await getAllSubjects()
        console.log("✅ [QUIZ PAGE] Subjects carregados:", subjectsData)
        
        if (!subjectsData || subjectsData.length === 0) {
          console.warn("⚠️ [QUIZ PAGE] Nenhum subject encontrado")
        }
        
        setSubjects(subjectsData)
        
        // Obter role do usuário
        console.log("🔍 [QUIZ PAGE] Buscando role do usuário...")
        const role = await getUserRoleClient(user.id)
        console.log("✅ [QUIZ PAGE] Role do usuário:", role)
        setUserRole(role)
        
      } catch (error) {
        console.error("❌ [QUIZ PAGE] Erro ao carregar dados:", error)
        console.error("❌ [QUIZ PAGE] Detalhes do erro:", {
          message: error.message,
          stack: error.stack
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
        const data = await getTopicsBySubject(selectedSubject)
        setTopics(data)
      }
    }
    fetchTopics()
  }, [selectedSubject])

         const loadQuizzes = async (topicId: string) => {
    setIsLoading(true)
    try {
      console.log("🔍 [QUIZ PAGE] Carregando quizzes para tópico:", topicId)
      const quizzesData = await getQuizzesByTopic(topicId)
      console.log("✅ [QUIZ PAGE] Quizzes carregados:", quizzesData)
      
      setQuizzes(quizzesData)
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
    setIsAdminMode(false)
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

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (mode === "result" && quizResult) {
    const taxaAcerto = quizResult.total > 0 ? Math.round((quizResult.correct / quizResult.total) * 100) : 0;
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <div className="mx-auto mb-4">
                {taxaAcerto === 100 ? (
                  <Trophy className="h-16 w-16 text-yellow-400 mb-1 animate-bounce" />
                ) : taxaAcerto >= 70 ? (
                  <Star className="h-16 w-16 text-emerald-500 mb-1 animate-pulse" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500 mb-1 animate-bounce" />
                )}
              </div>
              <CardTitle className="text-3xl bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                {taxaAcerto === 100
                  ? "🎉 Parabéns, você gabaritou!"
                  : taxaAcerto >= 70
                  ? "⭐ Ótimo desempenho!"
                  : "📚 Continue estudando!"}
              </CardTitle>
              <CardDescription className="text-lg">Você completou o quiz: {selectedQuiz?.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600 mb-4">{taxaAcerto}%</div>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-emerald-100 dark:bg-emerald-900 p-4 rounded-lg">
                    <p className="text-emerald-600 font-bold text-2xl">{quizResult.correct}</p>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">Acertos</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                    <p className="text-red-600 font-bold text-2xl">{quizResult.total - quizResult.correct}</p>
                    <p className="text-red-700 dark:text-red-300 text-sm">Erros</p>
                  </div>
                </div>
              </div>
              <Progress value={taxaAcerto} className="h-4 bg-emerald-100 dark:bg-emerald-900">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000" style={{width: `${taxaAcerto}%`}} />
              </Progress>
              <div className="mt-6 flex flex-col items-center gap-4">
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Compartilhe seu resultado:</span>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                    onClick={() => {
                      const text = `Acabei de fazer um quiz no Everest Preparatórios!\nAcertos: ${quizResult.correct}\nErros: ${quizResult.total - quizResult.correct}\nTaxa de acerto: ${taxaAcerto}%\nhttps://everest-preparatorios.vercel.app`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
                    }}
                  >
                    <Share2 className="mr-1 h-4 w-4" /> WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                    onClick={() => {
                      const text = `Acabei de fazer um quiz no Everest Preparatórios!\nAcertos: ${quizResult.correct}\nErros: ${quizResult.total - quizResult.correct}\nTaxa de acerto: ${taxaAcerto}%\nhttps://everest-preparatorios.vercel.app`;
                      navigator.clipboard.writeText(text)
                      alert("Resultado copiado para a área de transferência!")
                    }}
                  >
                    <Copy className="mr-1 h-4 w-4" /> Copiar
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={resetQuiz} variant="outline" className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Fazer Outro Quiz
                </Button>
                <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Link href="/dashboard">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  if (mode === "quiz" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">{selectedQuiz?.title}</h1>
            <p className="text-muted-foreground">
              Questão {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>
          <Button variant="outline" onClick={resetQuiz} className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950">
            <RotateCcw className="mr-2 h-4 w-4" />
            Sair do Quiz
          </Button>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-3 bg-emerald-100 dark:bg-emerald-900">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500" style={{width: `${progress}%`}} />
          </Progress>
        </div>

        <Card className="max-w-3xl mx-auto border-emerald-200 dark:border-emerald-800">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700">
                  <RadioGroupItem value={option} id={`option-${index}`} className="border-emerald-300 text-emerald-600" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
              >
                Anterior
              </Button>
              <Button 
                onClick={handleNextQuestion} 
                disabled={!selectedAnswer}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finalizar Quiz" : "Próxima"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  // Renderização do modo admin para questões
  if (isAdminMode && selectedQuiz && mode === "quiz") {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Questões</h1>
            <p className="text-muted-foreground">Quiz: {selectedQuiz.title}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateQuestionModal(true)} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Questão
            </Button>
            <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Voltar aos Quizzes
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {adminQuestions.map((question, index) => (
            <Card key={question.id} className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
                    <CardDescription className="mt-2">{question.question_text}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditQuestionModal(question)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className={`p-2 rounded flex items-center gap-2 ${option === question.correct_answer ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-gray-50 dark:bg-gray-900'}`}>
                      {option === question.correct_answer && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      {option}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Explicação:</strong> {question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {adminQuestions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma questão cadastrada</h3>
              <p className="text-muted-foreground mb-4">Comece criando a primeira questão para este quiz.</p>
              <Button onClick={() => setShowCreateQuestionModal(true)} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Questão
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal para criar questão */}
        <Dialog open={showCreateQuestionModal} onOpenChange={setShowCreateQuestionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Questão</DialogTitle>
              <DialogDescription>
                Adicione uma nova questão ao quiz "{selectedQuiz.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question-text">Texto da Questão</Label>
                <Textarea
                  id="question-text"
                  placeholder="Digite a questão..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Opções de Resposta</Label>
                {formOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Opção ${index + 1}${index < 2 ? ' (obrigatória)' : ' (opcional)'}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="correct-answer">Resposta Correta</Label>
                <Select value={formCorrectAnswer} onValueChange={setFormCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a resposta correta" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.filter(opt => opt.trim()).map((option, index) => (
                      <SelectItem key={index} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="explanation">Explicação (Opcional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explique por que esta é a resposta correta..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateQuestionModal(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuestion} disabled={isSubmitting} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Questão"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para editar questão */}
        <Dialog open={showEditQuestionModal} onOpenChange={setShowEditQuestionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Questão</DialogTitle>
              <DialogDescription>
                Modifique a questão do quiz "{selectedQuiz.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-question-text">Texto da Questão</Label>
                <Textarea
                  id="edit-question-text"
                  placeholder="Digite a questão..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Opções de Resposta</Label>
                {formOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Opção ${index + 1}${index < 2 ? ' (obrigatória)' : ' (opcional)'}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-md"
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="edit-correct-answer">Resposta Correta</Label>
                <Select value={formCorrectAnswer} onValueChange={setFormCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a resposta correta" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.filter(opt => opt.trim()).map((option, index) => (
                      <SelectItem key={index} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-explanation">Explicação (Opcional)</Label>
                <Textarea
                  id="edit-explanation"
                  placeholder="Explique por que esta é a resposta correta..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditQuestionModal(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleEditQuestion} disabled={isSubmitting} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    )
  }

  // Renderização do modo admin para quizzes
  if (isAdminMode && selectedTopic && mode === "quizzes") {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Quizzes</h1>
            <p className="text-muted-foreground">Tópico: {topics.find((t) => t.id === selectedTopic)?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateQuizModal(true)} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Quiz
            </Button>
            <Button variant="outline" onClick={() => setMode("topics")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Voltar aos Tópicos
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BrainCircuit className="h-8 w-8 text-emerald-600" />
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openEditQuizModal(quiz)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteQuiz(quiz.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription>{quiz.description || "Teste seus conhecimentos neste quiz"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => loadAdminQuestions(quiz.id)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Gerenciar Questões
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {adminQuizzes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum quiz cadastrado</h3>
              <p className="text-muted-foreground mb-4">Comece criando o primeiro quiz para este tópico.</p>
              <Button onClick={() => setShowCreateQuizModal(true)} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Quiz
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal para criar quiz */}
        <Dialog open={showCreateQuizModal} onOpenChange={setShowCreateQuizModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Quiz</DialogTitle>
              <DialogDescription>
                Adicione um novo quiz ao tópico "{topics.find((t) => t.id === selectedTopic)?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quiz-title">Título do Quiz</Label>
                <input
                  id="quiz-title"
                  type="text"
                  placeholder="Digite o título do quiz..."
                  value={formQuizTitle}
                  onChange={(e) => setFormQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="quiz-description">Descrição (Opcional)</Label>
                <Textarea
                  id="quiz-description"
                  placeholder="Descreva o conteúdo do quiz..."
                  value={formQuizDescription}
                  onChange={(e) => setFormQuizDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateQuizModal(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuiz} disabled={isSubmitting} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Quiz"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para editar quiz */}
        <Dialog open={showEditQuizModal} onOpenChange={setShowEditQuizModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Quiz</DialogTitle>
              <DialogDescription>
                Modifique as informações do quiz
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-quiz-title">Título do Quiz</Label>
                <input
                  id="edit-quiz-title"
                  type="text"
                  placeholder="Digite o título do quiz..."
                  value={formQuizTitle}
                  onChange={(e) => setFormQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="edit-quiz-description">Descrição (Opcional)</Label>
                <Textarea
                  id="edit-quiz-description"
                  placeholder="Descreva o conteúdo do quiz..."
                  value={formQuizDescription}
                  onChange={(e) => setFormQuizDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditQuizModal(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleEditQuiz} disabled={isSubmitting} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    )
  }

  if (mode === "quizzes") {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Quizzes</h1>
            <p className="text-muted-foreground">Tópico: {topics.find((t) => t.id === selectedTopic)?.name}</p>
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
            <Button variant="outline" onClick={() => setMode("topics")} className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950">
              <RotateCcw className="mr-2 h-4 w-4" />
              Voltar aos Tópicos
            </Button>
          </div>
        </div>

                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {quizzes.map((quiz, index) => {
             // Determinar nível baseado no título ou posição
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
             
             const levelConfig = {
               easy: {
                 gradient: 'from-green-400 via-green-500 to-green-600',
                 border: 'border-green-200 dark:border-green-800',
                 hoverBorder: 'hover:border-green-300 dark:hover:border-green-700',
                 shadow: 'hover:shadow-green-100 dark:hover:shadow-green-900',
                 icon: 'text-green-600',
                 badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                 button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                 title: 'text-green-800 dark:text-green-200',
                 levelText: 'Fácil',
                 levelIcon: '🟢'
               },
               medium: {
                 gradient: 'from-yellow-400 via-orange-500 to-orange-600',
                 border: 'border-orange-200 dark:border-orange-800',
                 hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
                 shadow: 'hover:shadow-orange-100 dark:hover:shadow-orange-900',
                 icon: 'text-orange-600',
                 badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                 button: 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
                 title: 'text-orange-800 dark:text-orange-200',
                 levelText: 'Médio',
                 levelIcon: '🟡'
               },
               hard: {
                 gradient: 'from-red-400 via-red-500 to-red-600',
                 border: 'border-red-200 dark:border-red-800',
                 hoverBorder: 'hover:border-red-300 dark:hover:border-red-700',
                 shadow: 'hover:shadow-red-100 dark:hover:shadow-red-900',
                 icon: 'text-red-600',
                 badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                 button: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                 title: 'text-red-800 dark:text-red-200',
                 levelText: 'Difícil',
                 levelIcon: '🔴'
               }
             }

             const config = levelConfig[level]

             return (
               <Card 
                 key={quiz.id} 
                 className={`
                   relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                   ${config.border} ${config.hoverBorder} ${config.shadow}
                   bg-gradient-to-br from-white via-gray-50 to-gray-100 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                   min-h-[280px] flex flex-col
                 `}
               >
                 {/* Gradiente decorativo no topo */}
                 <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
                 
                 <CardHeader className="flex-1 pb-2">
                   <div className="flex items-start justify-between mb-3">
                     <div className={`p-3 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg`}>
                       <BrainCircuit className="h-6 w-6 text-white" />
                     </div>
                     <div className="flex flex-col items-end gap-2">
                       <Badge variant="secondary" className={`${config.badge} font-semibold px-3 py-1 text-xs`}>
                         Quiz
                       </Badge>
                       <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                         <span>{config.levelIcon}</span>
                         <span>{config.levelText}</span>
                       </div>
                     </div>
                   </div>
                   
                   <CardTitle className={`text-xl font-bold ${config.title} leading-tight mb-3`}>
                     {quiz.title}
                   </CardTitle>
                   
                   <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">
                     {quiz.description || "Teste seus conhecimentos neste quiz interativo e descubra o quanto você sabe sobre este tópico!"}
                   </CardDescription>
                 </CardHeader>
                 
                 <CardContent className="pt-0">
                   <div className="space-y-3">
                     {/* Barra de progresso simulada baseada no nível */}
                     <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                       <span>Dificuldade:</span>
                       <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                         <div 
                           className={`h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
                           style={{ 
                             width: level === 'easy' ? '33%' : level === 'medium' ? '66%' : '100%' 
                           }}
                         />
                       </div>
                     </div>
                     
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
                   </div>
                 </CardContent>
               </Card>
             )
           })}
        </div>

                 {quizzes.length === 0 && (
           <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
             <CardContent>
               <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                 <BrainCircuit className="h-16 w-16 text-white" />
               </div>
               <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">Nenhum quiz disponível</h3>
               <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
                 Não há quizzes disponíveis para este tópico no momento. Novos conteúdos serão adicionados em breve!
               </p>
               <div className="mt-8">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   Em desenvolvimento
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
      </DashboardShell>
    )
  }

  // Renderização principal - seleção de matéria
  if (!selectedSubject) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Quiz</h1>
            <p className="text-muted-foreground">Escolha uma matéria para fazer quizzes e testar seus conhecimentos</p>
          </div>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <Button 
              onClick={toggleAdminMode} 
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Modo Admin
            </Button>
          )}
        </div>
                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
           {subjects.map((subject, index) => {
             // Cores especiais para cada matéria
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
                 desc: 'Teste seus conhecimentos em gramática, interpretação de texto, literatura e redação!'
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
                 desc: 'Domine os regulamentos militares e fique pronto para qualquer questão da banca!'
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
               desc: 'Faça quizzes interativos sobre os principais tópicos desta matéria.'
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
                   min-h-[300px] flex flex-col cursor-pointer group
                 `}
               >
                 {/* Gradiente decorativo no topo */}
                 <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config.gradient}`} />
                 
                 {/* Efeito de brilho no hover */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse" />
                 
                 <CardHeader className="flex-1 relative">
                   <div className="flex items-start justify-between mb-6">
                     <div className={`p-4 rounded-2xl bg-gradient-to-r ${config.gradient} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                       <span className="text-2xl">{config.icon}</span>
                     </div>
                     <Badge variant="secondary" className={`${config.badge} font-bold px-4 py-2 text-sm tracking-wide`}>
                       Matéria
                     </Badge>
                   </div>
                   
                   <CardTitle className={`text-3xl font-black bg-gradient-to-r ${config.title} bg-clip-text text-transparent leading-tight mb-4 group-hover:scale-105 transition-transform duration-300`}>
                     {subject.name}
                   </CardTitle>
                   
                   <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-medium">
                     {config.desc}
                   </CardDescription>
                 </CardHeader>
                 
                 <CardContent className="pt-0 relative">
                   <div className="space-y-4">
                     {/* Estatísticas simuladas */}
                     <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                       <span className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`} />
                         Quizzes disponíveis
                       </span>
                       <span className="font-semibold">15+</span>
                     </div>
                     
                     <Button 
                       className={`
                         w-full bg-gradient-to-r ${config.button} text-white font-bold py-4 text-lg
                         transform transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl
                         border-0 focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
                         group-hover:animate-pulse
                       `} 
                       onClick={() => setSelectedSubject(subject.id)}
                     >
                       <Play className="mr-3 h-6 w-6" />
                       Começar Quiz
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             )
           })}
        </div>
      </DashboardShell>
    )
  }

  // Seleção de tópico
  if (mode === "topics") {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Escolha o Tópico</h1>
            <p className="text-muted-foreground">Selecione um tópico para ver os quizzes disponíveis</p>
          </div>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <Button 
              onClick={toggleAdminMode} 
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Modo Admin
            </Button>
          )}
        </div>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
           {topics.map((topic, index) => {
             // Cores rotativas para os tópicos
             const topicColors = [
               {
                 gradient: 'from-blue-400 via-blue-500 to-blue-600',
                 border: 'border-blue-200 dark:border-blue-800',
                 hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
                 shadow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900',
                 badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                 button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                 title: 'text-blue-800 dark:text-blue-200'
               },
               {
                 gradient: 'from-purple-400 via-purple-500 to-purple-600',
                 border: 'border-purple-200 dark:border-purple-800',
                 hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
                 shadow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900',
                 badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                 button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                 title: 'text-purple-800 dark:text-purple-200'
               },
               {
                 gradient: 'from-teal-400 via-teal-500 to-teal-600',
                 border: 'border-teal-200 dark:border-teal-800',
                 hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
                 shadow: 'hover:shadow-teal-100 dark:hover:shadow-teal-900',
                 badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
                 button: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
                 title: 'text-teal-800 dark:text-teal-200'
               },
               {
                 gradient: 'from-pink-400 via-pink-500 to-pink-600',
                 border: 'border-pink-200 dark:border-pink-800',
                 hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
                 shadow: 'hover:shadow-pink-100 dark:hover:shadow-pink-900',
                 badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
                 button: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
                 title: 'text-pink-800 dark:text-pink-200'
               },
               {
                 gradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
                 border: 'border-indigo-200 dark:border-indigo-800',
                 hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
                 shadow: 'hover:shadow-indigo-100 dark:hover:shadow-indigo-900',
                 badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                 button: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
                 title: 'text-indigo-800 dark:text-indigo-200'
               }
             ]

             const config = topicColors[index % topicColors.length]

             return (
               <Card 
                 key={topic.id} 
                 className={`
                   relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                   ${config.border} ${config.hoverBorder} ${config.shadow}
                   bg-gradient-to-br from-white via-gray-50 to-gray-100 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
                   min-h-[240px] flex flex-col
                 `}
               >
                 {/* Gradiente decorativo no topo */}
                 <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
                 
                 <CardHeader className="flex-1">
                   <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg`}>
                       <BrainCircuit className="h-6 w-6 text-white" />
                     </div>
                     <Badge variant="secondary" className={`${config.badge} font-semibold px-3 py-1`}>
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
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
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
    </DashboardShell>
  )
}
