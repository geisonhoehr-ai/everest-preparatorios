"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { PageAuthWrapper } from "@/components/page-auth-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BrainCircuit, 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Star, 
  Share2, 
  Copy, 
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
  Target, 
  Clock, 
  RefreshCw, 
  BookOpen,
  Search,
  Flame,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Timer,
  Brain,
  Maximize,
  Minimize,
  Keyboard
} from "lucide-react"
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
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import confetti from "canvas-confetti"
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
  progress: number
  maxProgress: number
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
  
  // Estados para formulários
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formQuestion, setFormQuestion] = useState("")
  const [formOptions, setFormOptions] = useState(["", "", "", ""])
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("")
  const [formExplanation, setFormExplanation] = useState("")
  
  // Estados para progresso e estatísticas
  const [topicProgress, setTopicProgress] = useState<{ [key: string]: TopicProgress }>({})
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalTime: 0,
    streak: 0
  })
  
  const { toast } = useToast()
  const supabase = createClient()

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar disciplinas
      const subjectsData = await getAllSubjects()
      setSubjects(subjectsData)
      
      // Carregar tópicos
      const topicsData = await getAllTopics()
      setTopics(topicsData)
      
      // Carregar estatísticas
      await loadStats()
      
      // Verificar role do usuário
      const { role } = await getAuthAndRole()
      setUserRole(role)
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos quizzes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Aqui você pode implementar a lógica para carregar estatísticas
      // Por enquanto, vamos usar dados mockados
      setStats({
        totalQuizzes: 25,
        completedQuizzes: 18,
        averageScore: 85,
        totalTime: 120,
        streak: 5
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const handleSubjectChange = async (subjectId: number) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(null)
    setSelectedQuiz(null)
    
    try {
      const topicsData = await getTopicsBySubject(subjectId)
      setTopics(topicsData)
    } catch (error) {
      console.error("Erro ao carregar tópicos:", error)
    }
  }

  const handleTopicSelect = async (topicId: string) => {
    setSelectedTopic(topicId)
    setMode("quizzes")
    
    try {
      const quizzesData = await getAllQuizzesByTopic(topicId)
      setQuizzes(quizzesData)
      setFilteredQuizzes(quizzesData)
    } catch (error) {
      console.error("Erro ao carregar quizzes:", error)
    }
  }

  const handleQuizSelect = async (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setMode("quiz")
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedAnswer("")
    
    try {
      const questionsData = await getAllQuestionsByQuiz(quiz.id)
      setQuestions(questionsData)
    } catch (error) {
      console.error("Erro ao carregar questões:", error)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      const newAnswers = [...userAnswers]
      newAnswers[currentQuestionIndex] = selectedAnswer
      setUserAnswers(newAnswers)
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer("")
      } else {
        finishQuiz(newAnswers)
      }
    }
  }

  const finishQuiz = async (finalAnswers: string[]) => {
    try {
      const correctAnswers = questions.map(q => q.correct_answer)
      const correct = finalAnswers.filter((answer, index) => answer === correctAnswers[index]).length
      const score = Math.round((correct / questions.length) * 100)
      
      const result = {
        score,
        correct,
        total: questions.length
      }
      
      setQuizResult(result)
      setShowResult(true)
      setMode("result")
      
             // Submeter resultado
       if (selectedQuiz) {
         await submitQuizResult(selectedQuiz.id, score, correct, questions.length - correct, questions.length)
       }
      
      // Mostrar confetti se acertou mais de 80%
      if (score >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
      
    } catch (error) {
      console.error("Erro ao finalizar quiz:", error)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedAnswer("")
    setShowResult(false)
    setQuizResult(null)
    setMode("quiz")
  }

  const goBackToTopics = () => {
    setSelectedTopic(null)
    setSelectedQuiz(null)
    setMode("topics")
  }

  const goBackToQuizzes = () => {
    setSelectedQuiz(null)
    setMode("quizzes")
  }

  // Renderizar conteúdo baseado no modo
  const renderContent = () => {
    switch (mode) {
      case "topics":
        return renderTopicsView()
      case "quizzes":
        return renderQuizzesView()
      case "quiz":
        return renderQuizView()
      case "result":
        return renderResultView()
      default:
        return renderTopicsView()
    }
  }

  const renderTopicsView = () => (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Completados</p>
                <p className="text-2xl font-bold text-blue-400">{stats.completedQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Média de Acertos</p>
                <p className="text-2xl font-bold text-green-400">{stats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-muted-foreground">Sequência Atual</p>
                <p className="text-2xl font-bold text-purple-400">{stats.streak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Total</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalTime}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de disciplina */}
      <div className="mb-6">
        <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
          Selecione uma Disciplina
        </Label>
        <Select value={selectedSubject?.toString() || ""} onValueChange={(value) => handleSubjectChange(parseInt(value))}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Escolha uma disciplina" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid de tópicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {topics.map((topic) => {
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
          
          return (
            <Card 
              key={topic.id} 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-blue-500/50"
              onClick={() => handleTopicSelect(topic.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {topic.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Brain className="w-3 h-3 mr-1" />
                    Quiz
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-blue-400 font-medium">{progress.totalStudied} quizzes</span>
                </div>
                
                <Progress 
                  value={progress.totalStudied > 0 ? Math.min((progress.totalStudied / 10) * 100, 100) : 0} 
                  className="h-2 bg-slate-700"
                />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Melhor Score: {progress.bestScore}%</span>
                  <span>Nível {progress.level}</span>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTopicSelect(topic.id)
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderQuizzesView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={goBackToTopics} className="mb-4">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Voltar aos Tópicos
          </Button>
          <h2 className="text-2xl font-bold text-white">
            Quizzes de {topics.find(t => t.id === selectedTopic)?.name}
          </h2>
        </div>
        
        {userRole === 'admin' && (
          <Button onClick={() => setShowCreateQuizModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Quiz
          </Button>
        )}
      </div>

             {/* Busca */}
       <SearchQuizzes 
         onSearch={(query) => {
           if (query.trim() === '') {
             setFilteredQuizzes(quizzes)
           } else {
             const filtered = quizzes.filter(quiz => 
               quiz.title.toLowerCase().includes(query.toLowerCase()) || 
               (quiz.description && quiz.description.toLowerCase().includes(query.toLowerCase()))
             )
             setFilteredQuizzes(filtered)
           }
         }}
       />

      {/* Grid de quizzes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.map((quiz) => (
          <Card 
            key={quiz.id} 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-green-500/50"
            onClick={() => handleQuizSelect(quiz)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                  {quiz.title}
                </CardTitle>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <BrainCircuit className="w-3 h-3 mr-1" />
                  Quiz
                </Badge>
              </div>
              {quiz.description && (
                <CardDescription className="text-muted-foreground">
                  {quiz.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questões</span>
                <span className="text-green-400 font-medium">10</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tempo Estimado</span>
                <span className="text-green-400 font-medium">15 min</span>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuizSelect(quiz)
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderQuizView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do quiz */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={goBackToQuizzes}>
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Voltar aos Quizzes
        </Button>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </p>
          <Progress 
            value={((currentQuestionIndex + 1) / questions.length) * 100} 
            className="w-32 h-2 bg-slate-700"
          />
        </div>
      </div>

      {/* Questão atual */}
      {questions[currentQuestionIndex] && (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {questions[currentQuestionIndex].question_text}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`}
                    className="border-slate-600 text-blue-500"
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-white hover:text-blue-400 transition-colors"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>
              
              <Button 
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finalizar" : "Próxima"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderResultView = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-white mb-2">
            {quizResult && quizResult.score >= 80 ? "🎉 Parabéns!" : "📚 Continue Estudando!"}
          </CardTitle>
          <CardDescription className="text-lg">
            Você completou o quiz com sucesso!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-400 mb-2">
              {quizResult?.score}%
            </div>
            <p className="text-muted-foreground">
              {quizResult?.correct} de {quizResult?.total} questões corretas
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{quizResult?.score}%</span>
            </div>
            <Progress 
              value={quizResult?.score || 0} 
              className="h-3 bg-slate-700"
            />
          </div>
          
          {/* Ações */}
          <div className="flex space-x-4">
            <Button 
              onClick={restartQuiz} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={goBackToQuizzes} 
              variant="outline" 
              className="flex-1"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Voltar aos Quizzes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs para navegação */}
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4">
          <TabsTrigger 
            value="topics" 
            onClick={() => setMode("topics")}
            className={mode === "topics" ? "bg-blue-600 text-white" : ""}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tópicos
          </TabsTrigger>
          <TabsTrigger 
            value="quizzes" 
            onClick={() => setMode("quizzes")}
            className={mode === "quizzes" ? "bg-blue-600 text-white" : ""}
            disabled={!selectedTopic}
          >
            <BrainCircuit className="w-4 h-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger 
            value="quiz" 
            onClick={() => setMode("quiz")}
            className={mode === "quiz" ? "bg-blue-600 text-white" : ""}
            disabled={!selectedQuiz}
          >
            <Play className="w-4 h-4 mr-2" />
            Quiz Ativo
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            onClick={() => setMode("result")}
            className={mode === "result" ? "bg-blue-600 text-white" : ""}
            disabled={!showResult}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Resultado
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics" className="mt-6">
          {renderTopicsView()}
        </TabsContent>
        
        <TabsContent value="quizzes" className="mt-6">
          {renderQuizzesView()}
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-6">
          {renderQuizView()}
        </TabsContent>
        
        <TabsContent value="result" className="mt-6">
          {renderResultView()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
