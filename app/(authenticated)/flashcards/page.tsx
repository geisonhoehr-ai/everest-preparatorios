"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
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
  Shield,
  FileText,
  BookMarked,
  GraduationCap,
  Library,
  Sparkles,
  Rocket,
  Gamepad2,
  Cpu,
  Wifi,
  Smartphone,
  Monitor
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context-supabase"
import { updateFlashcardProgress, getAllSubjects, getTopicsBySubject, getFlashcardsForReview, updateFlashcardProgressSM2, getCardsForReview, getNewCards, getFlashcardProgressStats, getAllFlashcardCategories, getAllFlashcardTags, addFlashcardCategory, addFlashcardTag, removeFlashcardCategory, removeFlashcardTag, getFlashcardCategoriesAndTags, createStudySession, endStudySession, getStudySessionsHistory, getStudyAnalytics, createStudyGoal, getStudyGoals, updateStudyGoalProgress, getAllFlashcardsByTopicSimple } from "../../server-actions"
import { getFlashcardsByTopic, createFlashcard, updateFlashcard, deleteFlashcard } from "../../../actions-flashcards-simples"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  flashcardCount: number
}

interface Flashcard {
  id: number
  topic_id: string
  question: string
  answer: string
  categories?: FlashcardCategory[]
  tags?: FlashcardTag[]
}

interface FlashcardCategory {
  id: number
  name: string
  description?: string
  color: string
  icon?: string
}

interface FlashcardTag {
  id: number
  name: string
  color: string
}

export default function FlashcardsPage() {
  const { user, profile } = useAuth()
  
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyMode, setStudyMode] = useState<'review' | 'new' | 'all'>('review')
  const [isLoading, setIsLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studySession, setStudySession] = useState<any>(null)
  const [stats, setStats] = useState({
    totalCards: 0,
    reviewedCards: 0,
    newCards: 0,
    accuracy: 0
  })

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

  // Carregar flashcards quando topic muda
  useEffect(() => {
    if (selectedTopic) {
      const loadFlashcards = async () => {
        setIsLoading(true)
        try {
          let result: any
          if (studyMode === 'review') {
            result = await getCardsForReview(selectedTopic)
          } else if (studyMode === 'new') {
            result = await getNewCards(selectedTopic)
          } else {
            result = await getAllFlashcardsByTopicSimple(selectedTopic)
          }
          
          const data: Flashcard[] = result.success ? result.data : []
          setFlashcards(data)
          setCurrentCardIndex(0)
          setIsFlipped(false)
          setShowAnswer(false)
        } catch (error) {
          console.error('Erro ao carregar flashcards:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadFlashcards()
    }
  }, [selectedTopic, studyMode])

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const handleCardRating = async (rating: number) => {
    if (flashcards[currentCardIndex]) {
      try {
        await updateFlashcardProgressSM2(user?.id || '', flashcards[currentCardIndex].id, rating)
        
        // Próximo card
        if (currentCardIndex < flashcards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1)
          setIsFlipped(false)
          setShowAnswer(false)
        } else {
          // Sessão concluída
          alert('Parabéns! Você completou esta sessão de estudo!')
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso:', error)
      }
    }
  }

  const resetSession = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
  }

  return (
    <PagePermissionGuard pageName="flashcards">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Header Tecnológico */}
        <div className="relative overflow-hidden">
          {/* Background animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
          </div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          <div className="relative z-10 p-6">
            {/* Título Principal */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Flashcards Inteligentes
                </h1>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Domine qualquer assunto com nossa tecnologia de repetição espaçada
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total de Cards</p>
                      <p className="text-2xl font-bold text-white">{stats.totalCards}</p>
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
                      <p className="text-sm text-gray-400">Revisados</p>
                      <p className="text-2xl font-bold text-white">{stats.reviewedCards}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Star className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Novos</p>
                      <p className="text-2xl font-bold text-white">{stats.newCards}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border-orange-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Target className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Precisão</p>
                      <p className="text-2xl font-bold text-white">{stats.accuracy}%</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sidebar de Controles */}
              <div className="lg:col-span-1 space-y-6">
                {/* Seletor de Matéria */}
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <GraduationCap className="h-5 w-5 text-blue-400" />
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
                      <BookOpenText className="h-5 w-5 text-purple-400" />
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
                            <div className="flex items-center justify-between w-full">
                              <span>{topic.name}</span>
                              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400">
                                {topic.flashcardCount}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Modo de Estudo */}
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Gamepad2 className="h-5 w-5 text-cyan-400" />
                      Modo de Estudo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant={studyMode === 'review' ? 'default' : 'outline'}
                      className={`w-full justify-start ${studyMode === 'review' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-white hover:bg-slate-700'}`}
                      onClick={() => setStudyMode('review')}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revisão
                    </Button>
                    <Button
                      variant={studyMode === 'new' ? 'default' : 'outline'}
                      className={`w-full justify-start ${studyMode === 'new' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}`}
                      onClick={() => setStudyMode('new')}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Novos Cards
                    </Button>
                    <Button
                      variant={studyMode === 'all' ? 'default' : 'outline'}
                      className={`w-full justify-start ${studyMode === 'all' ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-white hover:bg-slate-700'}`}
                      onClick={() => setStudyMode('all')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Todos os Cards
                    </Button>
                  </CardContent>
                </Card>

                {/* Controles */}
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Settings className="h-5 w-5 text-orange-400" />
                      Controles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-white hover:bg-slate-700"
                      onClick={resetSession}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reiniciar Sessão
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-white hover:bg-slate-700"
                      onClick={() => window.location.reload()}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Recarregar Cards
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Área Principal do Flashcard */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-blue-500/20 rounded-full">
                          <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
                        </div>
                        <p className="text-white text-lg">Carregando flashcards...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : flashcards.length === 0 ? (
                  <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-500/20 rounded-full">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Nenhum flashcard encontrado</h3>
                        <p className="text-gray-400">Selecione uma matéria e tópico para começar</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Progresso */}
                    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Progresso da Sessão</span>
                          <span className="text-sm text-white">{currentCardIndex + 1} de {flashcards.length}</span>
                        </div>
                        <Progress 
                          value={((currentCardIndex + 1) / flashcards.length) * 100} 
                          className="h-2 bg-slate-700"
                        />
                      </CardContent>
                    </Card>

                    {/* Flashcard Principal */}
                    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm min-h-[400px]">
                      <CardContent className="p-8">
                        <div className="h-full flex flex-col justify-center">
                          {flashcards[currentCardIndex] && (
                            <div className="text-center space-y-6">
                              {/* Pergunta */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                  <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-blue-400">PERGUNTA</h3>
                                </div>
                                <p className="text-xl text-white leading-relaxed">
                                  {flashcards[currentCardIndex].question}
                                </p>
                              </div>

                              {/* Resposta (quando mostrada) */}
                              {showAnswer && (
                                <div className="space-y-4 pt-6 border-t border-slate-600">
                                  <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                      <CheckCircle className="h-5 w-5 text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-400">RESPOSTA</h3>
                                  </div>
                                  <p className="text-xl text-white leading-relaxed">
                                    {flashcards[currentCardIndex].answer}
                                  </p>
                                </div>
                              )}

                              {/* Botão de Virar */}
                              {!showAnswer && (
                                <Button
                                  onClick={handleCardFlip}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                                >
                                  <Eye className="h-5 w-5 mr-2" />
                                  Mostrar Resposta
                                </Button>
                              )}

                              {/* Botões de Avaliação (quando resposta mostrada) */}
                              {showAnswer && (
                                <div className="space-y-4">
                                  <p className="text-gray-400">Como você se saiu?</p>
                                  <div className="flex justify-center gap-3">
                                    <Button
                                      variant="outline"
                                      className="border-red-500 text-red-400 hover:bg-red-500/20"
                                      onClick={() => handleCardRating(1)}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Difícil
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
                                      onClick={() => handleCardRating(3)}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Médio
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="border-green-500 text-green-400 hover:bg-green-500/20"
                                      onClick={() => handleCardRating(5)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Fácil
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PagePermissionGuard>
  )
}
