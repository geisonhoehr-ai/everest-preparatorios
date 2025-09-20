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
  FileText
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context-custom"
import { updateQuizProgress, getAllSubjects, getTopicsBySubject, getAllQuizzesByTopic, createQuiz, updateQuiz, deleteQuiz, createTopic, updateTopic, deleteTopic } from "../../server-actions"
import { createClient } from '@supabase/supabase-js'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])

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
          const data = await getTopicsBySubject(selectedSubject.toString())
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
          const data = await getAllQuizzesByTopic(selectedTopic)
          // Mapear dados para incluir campos obrigatórios da interface Question
          const questionsWithDefaults = data.map(q => ({
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header Tecnológico */}
        <div className="relative overflow-hidden">
          {/* Background animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)]"></div>
          </div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          <div className="relative z-10 p-6">
            {/* Título Principal */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <BrainCircuit className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Quiz Interativo
                </h1>
                <div className="p-3 bg-gradient-to-r from-pink-500 to-orange-600 rounded-2xl shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Teste seus conhecimentos com quizzes dinâmicos e feedback instantâneo
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <BookOpenText className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total de Questões</p>
                      <p className="text-2xl font-bold text-white">{questions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600/20 to-green-800/20 border-green-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Corretas</p>
                      <p className="text-2xl font-bold text-white">{quizStats.correct}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-600/20 to-red-800/20 border-red-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Incorretas</p>
                      <p className="text-2xl font-bold text-white">{quizStats.incorrect}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border-orange-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pontuação</p>
                      <p className="text-2xl font-bold text-white">{getScorePercentage()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto">
            
            {quizMode === "select" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sidebar de Controles */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Seletor de Matéria */}
                  <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <GraduationCap className="h-5 w-5 text-purple-400" />
                        Matéria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedSubject?.toString()} onValueChange={(value) => setSelectedSubject(parseInt(value))}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione uma matéria" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()} className="text-white hover:bg-slate-700">
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Seletor de Tópico */}
                  <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <BookOpenText className="h-5 w-5 text-pink-400" />
                        Tópico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedTopic || ""} onValueChange={setSelectedTopic}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione um tópico" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id} className="text-white hover:bg-slate-700">
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Botão Iniciar Quiz */}
                  <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <Button
                        onClick={startQuiz}
                        disabled={!selectedTopic || questions.length === 0 || isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg"
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
                        <p className="text-sm text-gray-400 text-center mt-2">
                          {questions.length} questões disponíveis
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Área Principal */}
                <div className="lg:col-span-2">
                  {isLoading ? (
                    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-purple-500/20 rounded-full">
                            <BrainCircuit className="h-8 w-8 text-purple-400 animate-pulse" />
                          </div>
                          <p className="text-white text-lg">Carregando questões...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : questions.length === 0 ? (
                    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-500/20 rounded-full">
                            <BookOpenText className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-white">Nenhuma questão encontrada</h3>
                          <p className="text-gray-400">Selecione uma matéria e tópico para começar</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-8">
                        <div className="text-center space-y-6">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <BrainCircuit className="h-6 w-6 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Quiz Preparado!</h2>
                          </div>
                          <p className="text-gray-300 text-lg">
                            Você tem <span className="text-purple-400 font-semibold">{questions.length}</span> questões para responder.
                          </p>
                          <p className="text-gray-400">
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
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progresso do Quiz</span>
                      <span className="text-sm text-white">{currentQuestionIndex + 1} de {questions.length}</span>
                    </div>
                    <Progress 
                      value={((currentQuestionIndex + 1) / questions.length) * 100} 
                      className="h-2 bg-slate-700"
                    />
                  </CardContent>
                </Card>

                {/* Questão Atual */}
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm min-h-[500px]">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Pergunta */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-purple-400">QUESTÃO {currentQuestionIndex + 1}</h3>
                        </div>
                        <p className="text-xl text-white leading-relaxed">
                          {questions[currentQuestionIndex].question}
                        </p>
                      </div>

                      {/* Alternativas */}
                      <div className="space-y-3">
                        <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => handleAnswerSelect(parseInt(value))}>
                          {questions[currentQuestionIndex].options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors">
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} className="text-purple-500" />
                              <Label htmlFor={`option-${index}`} className="text-white cursor-pointer flex-1">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Botão Próxima */}
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswer === null}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                        >
                          {currentQuestionIndex < questions.length - 1 ? (
                            <>
                              Próxima Questão
                              <ArrowRight className="h-5 w-5 ml-2" />
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
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-6">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                          <Trophy className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Quiz Concluído!</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-green-600/20 rounded-lg border border-green-500/30">
                          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{quizStats.correct}</p>
                          <p className="text-green-400">Corretas</p>
                        </div>
                        <div className="p-6 bg-red-600/20 rounded-lg border border-red-500/30">
                          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{quizStats.incorrect}</p>
                          <p className="text-red-400">Incorretas</p>
                        </div>
                        <div className="p-6 bg-orange-600/20 rounded-lg border border-orange-500/30">
                          <Trophy className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">{getScorePercentage()}%</p>
                          <p className="text-orange-400">Pontuação</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button
                          onClick={resetQuiz}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg mr-4"
                        >
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Fazer Novamente
                        </Button>
                        <Button
                          onClick={() => setQuizMode("select")}
                          variant="outline"
                          className="border-slate-600 text-white hover:bg-slate-700 px-8 py-3 text-lg"
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
          </div>
        </div>
      </div>
    </PagePermissionGuard>
  )
}
