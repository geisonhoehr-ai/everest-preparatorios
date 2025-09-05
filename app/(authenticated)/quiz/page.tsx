"use client"

import { useState, useEffect } from "react"
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
  Shield
} from "lucide-react"
import { StudentOnly } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context"
import { updateQuizProgress } from "@/actions"

// Dados mock das matérias
const MOCK_SUBJECTS = [
  { id: 1, name: "Português", description: "Gramática, Literatura e Redação" },
  { id: 2, name: "Regulamentos", description: "Normas e Regulamentos Aeronáuticos" },
  { id: 3, name: "Matemática", description: "Álgebra, Geometria e Cálculo" },
  { id: 4, name: "Física", description: "Mecânica, Termodinâmica e Eletromagnetismo" },
  { id: 5, name: "Química", description: "Química Orgânica, Inorgânica e Físico-química" },
  { id: 6, name: "Biologia", description: "Biologia Celular, Genética e Ecologia" }
]

// Dados mock dos tópicos
const MOCK_TOPICS = {
  1: [ // Português
    { id: "fonetica-fonologia", name: "Fonetica e Fonologia", description: "Estudo dos sons da língua" },
    { id: "ortografia", name: "Ortografia", description: "Escrita correta das palavras" },
    { id: "acentuacao-grafica", name: "Acentuação Gráfica", description: "Regras de acentuação" },
    { id: "morfologia-classes", name: "Morfologia: Classes de Palavras", description: "Classificação das palavras" },
    { id: "morfologia-flexao", name: "Morfologia: Flexão", description: "Variação das palavras" },
    { id: "sintaxe-termos-essenciais", name: "Sintaxe: Termos Essenciais", description: "Sujeito e predicado" },
    { id: "sintaxe-termos-integrantes", name: "Sintaxe: Termos Integrantes", description: "Complementos verbais e nominais" },
    { id: "sintaxe-termos-acessorios", name: "Sintaxe: Termos Acessórios", description: "Adjuntos e apostos" },
    { id: "sintaxe-periodo-composto", name: "Sintaxe: Período Composto", description: "Orações coordenadas e subordinadas" },
    { id: "concordancia", name: "Concordância Verbal e Nominal", description: "Regras de concordância" },
    { id: "regencia", name: "Regência Verbal e Nominal", description: "Regência dos verbos e nomes" },
    { id: "crase", name: "Crase", description: "Uso do acento grave" },
    { id: "colocacao-pronominal", name: "Colocação Pronominal", description: "Posição dos pronomes" },
    { id: "semantica-estilistica", name: "Semântica e Estilística", description: "Significado e estilo" }
  ],
  2: [ // Regulamentos
    { id: "regulamento-aeronautico", name: "Regulamento Aeronáutico", description: "Normas da aviação civil" },
    { id: "codigo-brasileiro-aeronautico", name: "Código Brasileiro Aeronáutico", description: "Lei 7.565/86" },
    { id: "regulamento-habilitacao", name: "Regulamento de Habilitação", description: "RBHA 61" },
    { id: "regulamento-operacoes", name: "Regulamento de Operações", description: "RBAC 121" }
  ]
}

// Dados mock das questões
const MOCK_QUESTIONS = {
  "fonetica-fonologia": [
    {
      id: 1,
      question: "O que é um fonema?",
      options: [
        "A menor unidade sonora distintiva de uma língua",
        "Uma letra do alfabeto",
        "Um som qualquer",
        "Uma sílaba"
      ],
      correct_answer: 0,
      explanation: "Fonema é a menor unidade sonora distintiva de uma língua, capaz de diferenciar significados entre palavras."
    },
    {
      id: 2,
      question: "Qual a diferença entre vogal e consoante?",
      options: [
        "Não há diferença",
        "Vogal é mais alta que consoante",
        "Vogal não tem obstáculo na passagem do ar, consoante tem",
        "Consoante é mais baixa que vogal"
      ],
      correct_answer: 2,
      explanation: "Vogal é produzida sem obstáculo na passagem do ar, enquanto consoante tem obstáculo total ou parcial."
    }
  ],
  "ortografia": [
    {
      id: 1,
      question: "Qual a grafia correta?",
      options: [
        "Exceção",
        "Excessão",
        "Excecão",
        "Excesssão"
      ],
      correct_answer: 0,
      explanation: "A grafia correta é 'exceção' com 'ç' e 'ão'."
    }
  ]
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
  const { user } = useAuth()
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS)
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

  // Garantir que sempre sejam arrays válidos
  const safeSubjects = Array.isArray(subjects) ? subjects : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeQuestions = Array.isArray(questions) ? questions : []

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Carregando matérias...")
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setSubjects(MOCK_SUBJECTS)
      console.log("✅ Matérias carregadas:", MOCK_SUBJECTS.length)
      
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
      console.log(`📚 Carregando tópicos para matéria ${subjectId}...`)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      const subjectTopics = MOCK_TOPICS[subjectId as keyof typeof MOCK_TOPICS] || []
      setTopics(subjectTopics)
      console.log("✅ Tópicos carregados:", subjectTopics.length)
      
    } catch (error) {
      console.error("❌ Erro ao carregar tópicos:", error)
      setTopics([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadQuestions = async (topicId: string) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando questões para tópico ${topicId}...`)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      const topicQuestions = MOCK_QUESTIONS[topicId as keyof typeof MOCK_QUESTIONS] || []
      setQuestions(topicQuestions)
      console.log("✅ Questões carregadas:", topicQuestions.length)
      
    } catch (error) {
      console.error("❌ Erro ao carregar questões:", error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = (topicId: string, timeLimit: number = 0) => {
    setSelectedTopic(topicId)
    loadQuestions(topicId)
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
      <StudentOnly>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
              </div>
            </div>
      </StudentOnly>
    )
  }

  // Seleção de matéria
  if (!selectedSubject) {
    return (
      <StudentOnly>
        <div className="space-y-6 p-6">
              <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Escolha a Matéria
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Selecione a matéria que deseja testar com quiz
            </p>
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
                        {MOCK_TOPICS[subject.id as keyof typeof MOCK_TOPICS]?.length || 0}
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
      </StudentOnly>
    )
  }

  // Seleção de tópico
  if (quizMode === "select") {
    return (
      <StudentOnly>
        <div className="space-y-6 p-6">
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
      </StudentOnly>
    )
  }

  // Modo de quiz
  if (quizMode === "quiz" && safeQuestions.length > 0) {
    const currentQuestion = safeQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / safeQuestions.length) * 100

    return (
      <StudentOnly>
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
            <Card className="min-h-[500px] flex flex-col justify-center">
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
      </StudentOnly>
    )
  }

  // Quiz finalizado
  if (quizMode === "finished") {
    const totalQuestions = quizStats.correct + quizStats.incorrect
    const accuracy = totalQuestions > 0 ? (quizStats.correct / totalQuestions) * 100 : 0

    return (
      <StudentOnly>
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
      </StudentOnly>
    )
  }

  return null
}