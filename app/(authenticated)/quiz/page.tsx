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
  BookOpenText,
  Sparkles,
  Rocket,
  Gamepad2,
  Cpu,
  Wifi,
  Smartphone,
  Monitor,
  GraduationCap,
  BookOpen,
  FileText,
  ChevronRight,
  BarChart3,
  Lightbulb,
  CheckCircle2
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context-custom"
import { useAdminMode } from "@/hooks/use-admin-mode"
import { AdminModeToggle } from "@/components/admin-mode-toggle"
import { QuizEditor } from "@/components/quiz/quiz-editor"
import { QuestionEditor } from "@/components/quiz/question-editor"
import { updateQuizProgress, getAllSubjects, getTopicsBySubject, getAllQuizzesByTopic, getQuizWithQuestions, createQuiz, updateQuiz, deleteQuiz, createTopic, updateTopic, deleteTopic, createQuestion, updateQuestion, deleteQuestion } from "../../server-actions"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface para subjects
interface Subject {
  id: string
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
  const { isAdminMode, canUseAdminMode } = useAdminMode()
  
  // Debug logs
  console.log('🔧 [QUIZ_PAGE] isAdminMode:', isAdminMode)
  console.log('🔧 [QUIZ_PAGE] canUseAdminMode:', canUseAdminMode)
  
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<{ id: string; title: string; description?: string; topic_id: string } | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [quizMode, setQuizMode] = useState<"select" | "quiz" | "finished">("select")
  const [quizStats, setQuizStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizTime, setQuizTime] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  
  // Estados para modo admin/edição
  const [isEditingQuiz, setIsEditingQuiz] = useState(false)
  const [isEditingTopic, setIsEditingTopic] = useState(false)
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<any>(null)
  const [editingTopic, setEditingTopic] = useState<any>(null)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)

  // Carregar subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getAllSubjects()
        setSubjects(data)
        if (data.length > 0) {
          setSelectedSubject(data[0].id)
        }
      } catch (error) {
        console.error('Erro ao carregar subjects:', error)
      }
    }
    loadSubjects()
  }, [])

  // Carregar topics quando subject muda
  useEffect(() => {
    if (selectedSubject) {
      const loadTopics = async () => {
        try {
          const data = await getTopicsBySubject(selectedSubject)
          // Mapear dados para incluir campos obrigatórios da interface Topic
          const topicsWithDefaults = data.map(topic => ({
            id: topic.id,
            name: topic.name,
            description: '', // Campo não disponível na API
            flashcardCount: 0 // Será atualizado quando carregarmos os flashcards
          }))
          setTopics(topicsWithDefaults)
          if (topicsWithDefaults.length > 0) {
            setSelectedTopic(topicsWithDefaults[0].id)
          }
        } catch (error) {
          console.error('Erro ao carregar topics:', error)
        }
      }
      loadTopics()
    }
  }, [selectedSubject])

  // Carregar questions quando topic muda
  useEffect(() => {
    if (selectedTopic) {
      const loadQuestions = async () => {
        setIsLoading(true)
        try {
          const { quiz, questions: questionsData } = await getQuizWithQuestions(selectedTopic)
          
          // Armazenar dados do quiz atual
          setCurrentQuiz(quiz)
          
          // Mapear dados para incluir campos obrigatórios da interface Question
          const questionsWithDefaults = questionsData.map(q => ({
            id: q.id,
            question: q.question_text, // Mapear question_text para question
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation
          }))
          setQuestions(questionsWithDefaults)
          setUserAnswers(new Array(questionsWithDefaults.length).fill(null))
        } catch (error) {
          console.error('Erro ao carregar questions:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadQuestions()
    }
  }, [selectedTopic])

  const startQuiz = () => {
    if (questions.length > 0) {
      setQuizMode("quiz")
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setQuizStats({ correct: 0, incorrect: 0 })
      setQuizTime(0)
      setTimeLeft(questions.length * 60) // 1 minuto por pergunta
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...userAnswers]
      newAnswers[currentQuestionIndex] = selectedAnswer
      setUserAnswers(newAnswers)

      if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
        setQuizStats(prev => ({ ...prev, correct: prev.correct + 1 }))
      } else {
        setQuizStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        setQuizMode("finished")
      }
    }
  }

  const resetQuiz = () => {
    setQuizMode("select")
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizStats({ correct: 0, incorrect: 0 })
    setUserAnswers([])
  }

  const getScorePercentage = () => {
    if (questions.length === 0) return 0
    return Math.round((quizStats.correct / questions.length) * 100)
  }

  return (
    <PagePermissionGuard pageName="quiz">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header Clean */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Admin Mode Toggle */}
            {canUseAdminMode && (
              <div className="flex justify-end mb-6">
                <AdminModeToggle />
              </div>
            )}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                  Quiz Interativo
                </h1>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Rocket className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Teste seus conhecimentos com quizzes dinâmicos e feedback instantâneo
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookOpenText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total de Questões</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{questions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Corretas</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{quizStats.correct}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Incorretas</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{quizStats.incorrect}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Pontuação</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{getScorePercentage()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {quizMode === "select" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sidebar de Controles */}
              <div className="lg:col-span-1 space-y-6">
                {/* Seletor de Matéria */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Matéria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedSubject || ""} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Selecione uma matéria" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Seletor de Tópico */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <BookOpenText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Tópico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedTopic || ""} onValueChange={setSelectedTopic}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Selecione um tópico" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Botão Iniciar Quiz */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardContent className="p-6">
                    <Button
                      onClick={startQuiz}
                      disabled={!selectedTopic || questions.length === 0 || isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Iniciar Quiz
                        </>
                      )}
                    </Button>
                    {questions.length > 0 && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-2">
                        {questions.length} questões disponíveis
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Área Principal */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                        </div>
                        <p className="text-slate-900 dark:text-white text-lg">Carregando questões...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : questions.length === 0 ? (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full">
                          <BookOpenText className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Nenhuma questão encontrada</h3>
                        <p className="text-slate-600 dark:text-slate-400">Selecione uma matéria e tópico para começar</p>
                        
                        {/* Botão para criar quiz no modo admin */}
                        {isAdminMode && selectedTopic && (
                          <div className="mt-6 space-y-4">
                            <Button
                              onClick={() => {
                                setEditingQuiz({ topic_id: selectedTopic })
                                setIsEditingQuiz(true)
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Novo Quiz
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <CardContent className="p-8">
                      <div className="text-center space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Preparado!</h2>
                          </div>
                          
                          {/* Botões de edição no modo admin */}
                          {isAdminMode && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (currentQuiz) {
                                    setEditingQuiz(currentQuiz)
                                    setIsEditingQuiz(true)
                                  }
                                }}
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Quiz
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingQuestion({ quiz_id: questions[0]?.id })
                                  setIsEditingQuestion(true)
                                }}
                                className="border-green-300 text-green-600 hover:bg-green-50"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Questão
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-lg">
                          Você tem <span className="text-blue-600 dark:text-blue-400 font-semibold">{questions.length}</span> questões para responder.
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          Cada questão terá 4 alternativas. Escolha a resposta correta e teste seus conhecimentos!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {quizMode === "quiz" && questions.length > 0 && (
            <div className="space-y-6">
              {/* Progresso */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progresso do Quiz</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{currentQuestionIndex + 1} de {questions.length}</span>
                  </div>
                  <Progress 
                    value={((currentQuestionIndex + 1) / questions.length) * 100} 
                    className="h-2 bg-slate-200 dark:bg-slate-700"
                  />
                </CardContent>
              </Card>

              {/* Questão Atual */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Pergunta */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">QUESTÃO {currentQuestionIndex + 1}</h3>
                      </div>
                      <p className="text-xl text-slate-900 dark:text-white leading-relaxed font-medium">
                        {questions[currentQuestionIndex].question}
                      </p>
                    </div>

                    {/* Alternativas */}
                    <div className="space-y-3">
                      <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => handleAnswerSelect(parseInt(value))}>
                        {questions[currentQuestionIndex].options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer">
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="text-blue-600 dark:text-blue-400" />
                            <Label htmlFor={`option-${index}`} className="text-slate-900 dark:text-white cursor-pointer flex-1 text-base">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Botão Próxima */}
                    <div className="flex justify-center pt-6">
                      <Button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswer === null}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
                      >
                        {currentQuestionIndex < questions.length - 1 ? (
                          <>
                            Próxima Questão
                            <ChevronRight className="h-5 w-5 ml-2" />
                          </>
                        ) : (
                          <>
                            Finalizar Quiz
                            <Trophy className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {quizMode === "finished" && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="space-y-8">
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Trophy className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Concluído!</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{quizStats.correct}</p>
                        <p className="text-green-600 dark:text-green-400 font-medium">Corretas</p>
                      </div>
                      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{quizStats.incorrect}</p>
                        <p className="text-red-600 dark:text-red-400 font-medium">Incorretas</p>
                      </div>
                      <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <Trophy className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{getScorePercentage()}%</p>
                        <p className="text-orange-600 dark:text-orange-400 font-medium">Pontuação</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={resetQuiz}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
                      >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Fazer Novamente
                      </Button>
                      <Button
                        onClick={() => setQuizMode("select")}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-8 py-3 text-lg font-medium"
                      >
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Novo Quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formulários de Edição - Modo Admin */}
          {isAdminMode && (
            <>
              {/* Editor de Quiz */}
              {isEditingQuiz && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <QuizEditor
                      quiz={editingQuiz}
                      topics={topics}
                      onSave={async (quizData) => {
                        try {
                          if (editingQuiz.id) {
                            await updateQuiz(editingQuiz.id, quizData)
                          } else {
                            await createQuiz(quizData)
                          }
                          setIsEditingQuiz(false)
                          setEditingQuiz(null)
                          // Recarregar dados se necessário
                        } catch (error) {
                          console.error('Erro ao salvar quiz:', error)
                        }
                      }}
                      onCancel={() => {
                        setIsEditingQuiz(false)
                        setEditingQuiz(null)
                      }}
                      isEditing={!!editingQuiz.id}
                    />
                  </div>
                </div>
              )}

              {/* Editor de Questão */}
              {isEditingQuestion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <QuestionEditor
                      question={editingQuestion}
                      onSave={async (questionData) => {
                        try {
                          if (editingQuestion.id) {
                            await updateQuestion(editingQuestion.id, questionData)
                          } else {
                            if (!selectedTopic) {
                              throw new Error('Tópico não selecionado')
                            }
                            await createQuestion({ ...questionData, quiz_id: selectedTopic })
                          }
                          setIsEditingQuestion(false)
                          setEditingQuestion(null)
                          // Recarregar dados se necessário
                        } catch (error) {
                          console.error('Erro ao salvar questão:', error)
                        }
                      }}
                      onCancel={() => {
                        setIsEditingQuestion(false)
                        setEditingQuestion(null)
                      }}
                      isEditing={!!editingQuestion.id}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PagePermissionGuard>
  )
}
