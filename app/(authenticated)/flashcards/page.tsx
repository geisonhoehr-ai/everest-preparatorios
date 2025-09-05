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
import { StudentOnly } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context"
import { updateFlashcardProgress } from "@/actions"

// Dados mock das matérias (baseado no backup)
const MOCK_SUBJECTS = [
  { id: 1, name: "Português", description: "Gramática, Literatura e Redação" },
  { id: 2, name: "Regulamentos", description: "Normas e Regulamentos Aeronáuticos" },
  { id: 3, name: "Matemática", description: "Álgebra, Geometria e Cálculo" },
  { id: 4, name: "Física", description: "Mecânica, Termodinâmica e Eletromagnetismo" },
  { id: 5, name: "Química", description: "Química Orgânica, Inorgânica e Físico-química" },
  { id: 6, name: "Biologia", description: "Biologia Celular, Genética e Ecologia" }
]

// Dados mock dos tópicos (baseado no backup)
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
}

export default function FlashcardsPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS)
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState<"select" | "study" | "finished">("select")
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [xpGained, setXpGained] = useState(0)

  // Garantir que subjects sempre seja um array válido
  const safeSubjects = Array.isArray(subjects) ? subjects : []
  const safeTopics = Array.isArray(topics) ? topics : []
  const safeFlashcards = Array.isArray(flashcards) ? flashcards : []

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Carregando matérias...")
      
      // Simular delay de carregamento
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
      
      // Simular delay de carregamento
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

  const loadFlashcards = async (topicId: string) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando flashcards para tópico ${topicId}...`)
      
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock flashcards para demonstração
      const mockFlashcards: Flashcard[] = [
        {
          id: 1,
          topic_id: topicId,
          question: "O que é um fonema?",
          answer: "Fonema é a menor unidade sonora distintiva de uma língua, capaz de diferenciar significados entre palavras."
        },
        {
          id: 2,
          topic_id: topicId,
          question: "Qual a diferença entre 'mas' e 'mais'?",
          answer: "'Mas' é uma conjunção adversativa (ex: 'Estudou, mas não passou'). 'Mais' é um advérbio de intensidade ou numeral (ex: 'Ele tem mais livros')."
        },
        {
          id: 3,
          topic_id: topicId,
          question: "O que é um ditongo?",
          answer: "Ditongo é o encontro de uma vogal com uma semivogal na mesma sílaba. Exemplos: 'cau-sa', 'rei-no', 'pai-xão'."
        }
      ]
      
      setFlashcards(mockFlashcards)
      console.log("✅ Flashcards carregados:", mockFlashcards.length)
      
    } catch (error) {
      console.error("❌ Erro ao carregar flashcards:", error)
      setFlashcards([])
    } finally {
      setIsLoading(false)
    }
  }

  const startStudy = (topicId: string) => {
    setSelectedTopic(topicId)
    loadFlashcards(topicId)
    setStudyMode("study")
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  const nextCard = () => {
    if (currentCardIndex < safeFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    } else {
      setStudyMode("finished")
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const markCorrect = async () => {
    setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    
    // Salvar progresso no Supabase
    if (user && selectedTopic) {
      try {
        const result = await updateFlashcardProgress(user.id, selectedTopic, true, 0)
        if (result.success) {
          setXpGained(prev => prev + result.xpGained)
          console.log(`✅ +${result.xpGained} XP ganho!`)
        }
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error)
      }
    }
    
    nextCard()
  }

  const markIncorrect = async () => {
    setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
    
    // Salvar progresso no Supabase
    if (user && selectedTopic) {
      try {
        const result = await updateFlashcardProgress(user.id, selectedTopic, false, 0)
        if (result.success) {
          setXpGained(prev => prev + result.xpGained)
          console.log(`✅ +${result.xpGained} XP ganho!`)
        }
      } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error)
      }
    }
    
    nextCard()
  }

  const resetStudy = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setFlashcards([])
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  if (isLoading && studyMode === "select") {
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
              Selecione a matéria que deseja estudar com flashcards
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
                    <BookOpenText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                    {subject.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {subject.description || "Estude e pratique seus conhecimentos"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4" />
                        <span>Tópicos</span>
                      </span>
                      <span className="font-medium">
                        {MOCK_TOPICS[subject.id as keyof typeof MOCK_TOPICS]?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Play className="h-4 w-4" />
                        <span>Flashcards</span>
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                    <Play className="mr-3 h-6 w-6" />
                    Estudar {subject.name}
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
      </StudentOnly>
    )
  }

  // Seleção de tópico
  if (studyMode === "select") {
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
                Escolha um tópico para estudar
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
                  onClick={() => startStudy(topic.id)}
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
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                      <Play className="mr-3 h-6 w-6" />
                      Estudar Tópico
                    </Button>
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

  // Modo de estudo
  if (studyMode === "study" && safeFlashcards.length > 0) {
    const currentCard = safeFlashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / safeFlashcards.length) * 100

    return (
      <StudentOnly>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={resetStudy}
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
                Flashcard {currentCardIndex + 1} de {safeFlashcards.length}
              </p>
              {xpGained > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ⭐ +{xpGained} XP
                  </span>
                </div>
              )}
            </div>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="min-h-[400px] flex flex-col justify-center">
              <CardContent className="p-8 text-center">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentCard.question}
                  </h2>
                  
                  {showAnswer && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Resposta:
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  {!showAnswer ? (
                    <Button 
                      onClick={() => setShowAnswer(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Mostrar Resposta
                    </Button>
                  ) : (
                    <div className="flex gap-4">
                      <Button 
                        onClick={markIncorrect}
                        variant="destructive"
                        className="px-8 py-3 text-lg"
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        Errei
                      </Button>
                      <Button 
                        onClick={markCorrect}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Acertei
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6">
              <Button 
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                variant="outline"
              >
                <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                Anterior
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Acertos: <span className="font-bold text-green-600">{sessionStats.correct}</span> | 
                  Erros: <span className="font-bold text-red-600">{sessionStats.incorrect}</span>
                </p>
              </div>
              
              <Button 
                onClick={nextCard}
                disabled={currentCardIndex === safeFlashcards.length - 1}
                variant="outline"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </StudentOnly>
    )
  }

  // Sessão finalizada
  if (studyMode === "finished") {
    const totalCards = sessionStats.correct + sessionStats.incorrect
    const accuracy = totalCards > 0 ? (sessionStats.correct / totalCards) * 100 : 0

    return (
      <StudentOnly>
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
      </StudentOnly>
    )
  }

  return null
}