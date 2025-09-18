"use client"

import { useState, useEffect } from "react"
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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Brain
} from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/context/auth-context"
import { getAllTopicIds, getFlashcardsByTopic, createFlashcard, updateFlashcard, deleteFlashcard } from "../../../actions-flashcards-simples"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Flashcard {
  id: number
  topic_id: string
  question: string
  answer: string
}

interface Topic {
  id: string
  name: string
  description: string
  flashcardCount: number
}

export default function FlashcardsPageSimples() {
  const { user, profile } = useAuth()
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState<"select" | "study" | "finished">("select")
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [flashcardError, setFlashcardError] = useState<string | null>(null)
  
  // Estados para edição
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    question: '',
    answer: ''
  })

  // Carregar tópicos quando o componente for montado
  useEffect(() => {
    if (user?.id) {
      loadTopics()
    }
  }, [user?.id])

  const loadTopics = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Carregando tópicos dos flashcards...")
      
      const topicIds = await getAllTopicIds()
      console.log("✅ Topic IDs encontrados:", topicIds.length)
      
      // Criar objetos de tópicos com contagem de flashcards
      const topicsWithCount = await Promise.all(
        topicIds.map(async (topicId) => {
          const flashcards = await getFlashcardsByTopic(topicId, 1)
          return {
            id: topicId,
            name: formatTopicName(topicId),
            description: `Estude e pratique ${formatTopicName(topicId).toLowerCase()}`,
            flashcardCount: flashcards.length
          }
        })
      )
      
      console.log("✅ Tópicos formatados:", topicsWithCount.length)
      setTopics(topicsWithCount)
      
    } catch (error) {
      console.error("❌ Erro ao carregar tópicos:", error)
      setFlashcardError("Erro ao carregar tópicos")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTopicName = (topicId: string): string => {
    return topicId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const loadFlashcards = async (topicId: string) => {
    try {
      setIsLoading(true)
      console.log(`📚 Carregando flashcards para tópico: ${topicId}`)
      
      const flashcardsData = await getFlashcardsByTopic(topicId, 50)
      console.log("✅ Flashcards carregados:", flashcardsData.length)
      
      if (flashcardsData.length === 0) {
        setFlashcardError("Nenhum flashcard encontrado para este tópico")
        setFlashcards([])
      } else {
        setFlashcards(flashcardsData)
        setFlashcardError(null)
      }
      
    } catch (error) {
      console.error("❌ Erro ao carregar flashcards:", error)
      setFlashcardError("Erro ao carregar flashcards")
      setFlashcards([])
    } finally {
      setIsLoading(false)
    }
  }

  const startStudy = (topicId: string) => {
    console.log("🎯 Iniciando estudo para tópico:", topicId)
    setSelectedTopic(topicId)
    loadFlashcards(topicId)
    setStudyMode("study")
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  const resetStudy = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setFlashcards([])
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    setFlashcardError(null)
  }

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
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

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  const markCorrect = () => {
    setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    nextCard()
  }

  const markIncorrect = () => {
    setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
    nextCard()
  }

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard)
    setEditForm({
      question: flashcard.question,
      answer: flashcard.answer
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveFlashcard = async () => {
    if (!editingFlashcard) return
    
    try {
      const result = await updateFlashcard(
        editingFlashcard.id,
        editForm.question,
        editForm.answer
      )
      
      if (result.success) {
        // Atualizar o flashcard na lista
        setFlashcards(prev => prev.map(f => 
          f.id === editingFlashcard.id 
            ? { ...f, question: editForm.question, answer: editForm.answer }
            : f
        ))
        setIsEditDialogOpen(false)
        setEditingFlashcard(null)
      } else {
        alert("Erro ao salvar: " + result.error)
      }
    } catch (error) {
      console.error("Erro ao salvar flashcard:", error)
      alert("Erro ao salvar flashcard")
    }
  }

  const handleDeleteFlashcard = async (flashcardId: number) => {
    if (!confirm("Tem certeza que deseja deletar este flashcard?")) return
    
    try {
      const result = await deleteFlashcard(flashcardId)
      
      if (result.success) {
        // Remover o flashcard da lista
        setFlashcards(prev => prev.filter(f => f.id !== flashcardId))
      } else {
        alert("Erro ao deletar: " + result.error)
      }
    } catch (error) {
      console.error("Erro ao deletar flashcard:", error)
      alert("Erro ao deletar flashcard")
    }
  }

  // Loading state
  if (isLoading && topics.length === 0) {
    return (
      <PagePermissionGuard pageName="flashcards">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando flashcards...</p>
          </div>
        </div>
      </PagePermissionGuard>
    )
  }

  // Seleção de tópicos
  if (studyMode === "select") {
    return (
      <PagePermissionGuard pageName="flashcards">
        <RoleGuard allowedRoles={['student', 'teacher', 'administrator']}>
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Flashcards
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Escolha um tópico para estudar
                </p>
              </div>
            </div>

            {flashcardError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{flashcardError}</p>
              </div>
            )}

            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {topics.map((topic) => (
                <Card 
                  key={topic.id}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 hover:border-orange-500"
                  onClick={() => startStudy(topic.id)}
                >
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-orange-600 transition-colors duration-300">
                      {topic.name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Flashcards</span>
                        </span>
                        <span className="font-semibold text-orange-600">
                          {topic.flashcardCount}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-medium py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 transform hover:scale-105">
                      <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-6 sm:w-6" />
                      <span className="hidden sm:inline">Estudar </span>{topic.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {topics.length === 0 && !isLoading && (
              <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardContent>
                  <div className="p-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 mx-auto mb-6 w-fit">
                    <Brain className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                    Nenhum tópico disponível
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
                    Não há flashcards disponíveis no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </RoleGuard>
      </PagePermissionGuard>
    )
  }

  // Modo de estudo
  if (studyMode === "study" && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100

    return (
      <PagePermissionGuard pageName="flashcards">
        <RoleGuard allowedRoles={['student', 'teacher', 'administrator']}>
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={resetStudy}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                <span className="text-sm sm:text-base">Voltar</span>
              </Button>
              <div className="text-center order-first sm:order-none">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTopicName(selectedTopic || '')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Flashcard {currentCardIndex + 1} de {flashcards.length}
                </p>
              </div>
              <div className="w-full sm:w-32 flex items-center gap-2 order-last sm:order-none">
                <Progress value={progress} className="h-2 flex-1" />
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-0">
              <Card className="min-h-[250px] sm:min-h-[300px] md:min-h-[400px] flex flex-col justify-center relative">
                {/* Ícones de edição para admin/teacher */}
                {(profile?.role === 'administrator' || profile?.role === 'teacher') && (
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFlashcard(currentCard)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFlashcard(currentCard.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                )}
                
                <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                  <div className="mb-6">
                    <p className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
                      {showAnswer ? currentCard.answer : currentCard.question}
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={toggleAnswer}
                    className="mb-6"
                  >
                    {showAnswer ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showAnswer ? 'Ocultar Resposta' : 'Ver Resposta'}
                  </Button>
                  
                  {showAnswer && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={markIncorrect}
                        variant="outline"
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Errei
                      </Button>
                      <Button 
                        onClick={markCorrect}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Acertei
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-3 sm:mt-4 md:mt-6 gap-3 sm:gap-4 md:gap-0">
                <Button 
                  onClick={previousCard}
                  disabled={currentCardIndex === 0}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                >
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Anterior</span>
                </Button>
                
                <div className="text-center order-first sm:order-none">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-green-600">{sessionStats.correct}</span> acertos | 
                    <span className="font-bold text-red-600"> {sessionStats.incorrect}</span> erros
                  </p>
                </div>
                
                <Button 
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                >
                  <span className="text-sm sm:text-base">Próximo</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </RoleGuard>
      </PagePermissionGuard>
    )
  }

  // Sessão finalizada
  if (studyMode === "finished") {
    const totalCards = sessionStats.correct + sessionStats.incorrect
    const accuracy = totalCards > 0 ? (sessionStats.correct / totalCards) * 100 : 0

    return (
      <PagePermissionGuard pageName="flashcards">
        <RoleGuard allowedRoles={['student', 'teacher', 'administrator']}>
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
                  onClick={() => setStudyMode("select")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Escolher Outro Tópico
                </Button>
              </div>
            </div>
          </div>
        </RoleGuard>
      </PagePermissionGuard>
    )
  }

  // Modal de edição
  return (
    <PagePermissionGuard pageName="flashcards">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Flashcard</DialogTitle>
            <DialogDescription>
              Edite a pergunta e resposta do flashcard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pergunta</label>
              <Textarea
                value={editForm.question}
                onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Resposta</label>
              <Textarea
                value={editForm.answer}
                onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFlashcard}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PagePermissionGuard>
  )
}
