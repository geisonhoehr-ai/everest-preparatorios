"use client"

import { useState, useEffect } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { CourseCard, CourseGrid } from "@/components/ui/course-card"
import { TopicCard } from "@/components/ui/topic-card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Play, RotateCcw, CheckCircle, XCircle, Eye, EyeOff, Edit, Save, X, Plus, Trash2, Loader2 } from "lucide-react"
import { getAllSubjects, getSubjectsWithStats, getTopicsBySubject, getFlashcardsByTopic, updateFlashcard, createFlashcard, deleteFlashcard, recordFlashcardResponse, getFlashcardsForReview, getDifficultFlashcards, invalidateCache } from "../../server-actions"
import { useAuth } from "@/context/auth-context-custom"
import { FlashcardFlip } from "@/components/ui/flashcard-flip"
import { cn } from "@/lib/utils"
import { createSampleFlashcardProgress } from "../../server-actions"

interface SubjectWithStats {
  id: number
  title: string
  subtitle: string
  completedCount: number
  totalCount: number
  averageProgress: number
  lessonsCompleted: number
  includedItems: Array<{
    title: string
    progress: number
  }>
  overallProgress: number
  totalFlashcards?: number
}

interface Topic {
  id: string
  name: string
  description?: string
  flashcardCount: number
}

interface Flashcard {
  id: string
  question: string
  answer: string
  topic_id: string
  created_at: string
}

export default function FlashcardsPage() {
  const { user, profile } = useAuth()
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentView, setCurrentView] = useState<'subjects' | 'topics' | 'flashcards'>('subjects')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null)
  const [studyFlashcards, setStudyFlashcards] = useState<Flashcard[]>([])
  const [studyMode, setStudyMode] = useState<'normal' | 'review' | 'difficult'>('normal')
  const [isCreatingTestData, setIsCreatingTestData] = useState(false)
  const [reviewFlashcards, setReviewFlashcards] = useState<any[]>([])
  const [difficultFlashcards, setDifficultFlashcards] = useState<any[]>([])

  // Função para limpar texto corrompido
  const cleanText = (text: string) => {
    if (!text) return ""
    // Remove caracteres não-ASCII problemáticos e normaliza
    return text
      .replace(/[^\x00-\x7F]/g, "") // Remove caracteres não-ASCII
      .replace(/\s+/g, " ") // Normaliza espaços
      .trim()
  }
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para modo de edição
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    topic_id: ""
  })


  // Carregar subjects com estatísticas
  useEffect(() => {
    const loadSubjects = async () => {
      console.log('🚀 INICIANDO CARREGAMENTO DE SUBJECTS...')
      console.log('👤 User ID:', user?.id)
      try {
        setIsLoading(true)
        console.log('📞 Chamando getSubjectsWithStats...')
        const data = await getSubjectsWithStats(user?.id)
        console.log('📊 Subjects carregados:', data)
        console.log('📊 Quantidade de subjects:', data.length)
        console.log('📊 Nomes dos subjects:', data.map(s => s.title))
        console.log('🔍 Português nos dados:', data.find(s => s.title === 'Português'))
        console.log('🔍 Regulamentos nos dados:', data.find(s => s.title === 'Regulamentos'))
        setSubjects(data)
      } catch (error) {
        console.error('❌ Erro ao carregar subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user?.id) {
    loadSubjects()
    } else {
      console.log('⚠️ User ID não disponível ainda')
    }
  }, [user?.id])

  const loadTopics = async (subjectId: string) => {
    setIsLoading(true)
    
    try {
      // Carregar tópicos reais do banco
      const topicsData = await getTopicsBySubject(subjectId)
      
      // Transformar dados para o formato esperado
      const formattedTopics = await Promise.all(
        topicsData.map(async (topic) => {
          // Buscar flashcards para contar
          const flashcardsData = await getFlashcardsByTopic(topic.id)
          return {
            id: topic.id,
            name: topic.name,
            description: (topic as any).description || `Tópico de ${topic.name}`,
            flashcardCount: flashcardsData.length
          }
        })
      )
      
      setTopics(formattedTopics)
        } catch (error) {
      console.error('Erro ao carregar tópicos:', error)
      setTopics([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubjectClick = async (subjectId: string) => {
    setSelectedSubject(subjectId)
    setCurrentView('topics')
    await loadTopics(subjectId)
  }

  const loadFlashcards = async (topicId: string) => {
        setIsLoading(true)
    
    try {
      // Carregar flashcards reais do banco
      const flashcardsData = await getFlashcardsByTopic(topicId)
      setFlashcards(flashcardsData)
          setCurrentCardIndex(0)
          setShowAnswer(false)
        } catch (error) {
          console.error('Erro ao carregar flashcards:', error)
      setFlashcards([])
        } finally {
          setIsLoading(false)
        }
      }

  const handleTopicClick = async (topicId: string) => {
    setSelectedTopic(topicId)
    setStudyFlashcards([])
    setSelectedQuantity(null)
    setCurrentView('flashcards')
    await loadFlashcards(topicId)
  }

  const handleBackToSubjects = () => {
    setSelectedSubject(null)
    setSelectedTopic(null)
    setTopics([])
    setFlashcards([])
    setCurrentView('subjects')
  }

  const handleBackToTopics = () => {
    setSelectedTopic(null)
    setFlashcards([])
    setCurrentView('topics')
  }

  // Função para obter o flashcard atual baseado no modo de estudo
  const getCurrentFlashcard = () => {
    if (studyMode === 'normal') {
      return studyFlashcards[currentCardIndex]
    } else if (studyMode === 'review') {
      return reviewFlashcards[currentCardIndex]?.flashcards
    } else if (studyMode === 'difficult') {
      return difficultFlashcards[currentCardIndex]?.flashcards
    }
    return null
  }

  // Função para obter o comprimento do array atual baseado no modo de estudo
  const getCurrentFlashcardsLength = () => {
    if (studyMode === 'normal') {
      return studyFlashcards.length
    } else if (studyMode === 'review') {
      return reviewFlashcards.length
    } else if (studyMode === 'difficult') {
      return difficultFlashcards.length
    }
    return 0
  }

  // Função para processar resposta do flashcard
  const handleFlashcardAnswer = async (isCorrect: boolean, quality: number = 3) => {
    if (!user?.id) return

    const currentFlashcard = getCurrentFlashcard()
    if (currentFlashcard) {
      const result = await recordFlashcardResponse(user.id, currentFlashcard.id, isCorrect, quality)
      if (result.success) {
        console.log(`✅ Resposta registrada: ${isCorrect ? 'Correto' : 'Incorreto'} (Qualidade: ${quality})`)
        
        // Aguardar um pouco para mostrar o feedback antes de avançar
        setTimeout(() => {
          // Avançar automaticamente para o próximo flashcard
          if (currentCardIndex < getCurrentFlashcardsLength() - 1) {
            setCurrentCardIndex(currentCardIndex + 1)
            setShowAnswer(false) // Garantir que a próxima pergunta mostre a pergunta, não a resposta
          }
        }, 2000) // 2 segundos para mostrar o feedback
      }
    }
  }

  const handleNextCard = () => {
    if (currentCardIndex < getCurrentFlashcardsLength() - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  // Funções para modo de edição
  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard)
    setFormData({
      question: flashcard.question,
      answer: flashcard.answer,
      topic_id: flashcard.topic_id
    })
  }

  const handleCreateFlashcard = () => {
    setIsCreating(true)
    setFormData({
      question: "",
      answer: "",
      topic_id: selectedTopic || ""
    })
  }

  const handleSaveFlashcard = async () => {
    if (!formData.question || !formData.answer) {
      alert("Por favor, preencha todos os campos")
      return
    }

    try {
      if (editingFlashcard) {
        // Atualizar flashcard existente
        const result = await updateFlashcard(
          user?.id || "",
          parseInt(editingFlashcard.id),
          formData.question,
          formData.answer
        )
        
        if (result.success) {
          // Invalidar cache para garantir dados atualizados
          await invalidateCache('flashcards')
          
          // Atualizar lista local
          setFlashcards(flashcards.map(f => 
            f.id === editingFlashcard.id 
              ? { ...f, question: formData.question, answer: formData.answer }
              : f
          ))
          setEditingFlashcard(null)
          alert("Flashcard atualizado com sucesso!")
        } else {
          alert("Erro ao atualizar flashcard: " + result.error)
        }
      } else if (isCreating) {
        // Criar novo flashcard
        const result = await createFlashcard(user?.id || "", {
          topic_id: formData.topic_id,
          question: formData.question,
          answer: formData.answer
        })
        
        if (result.success) {
          // Invalidar cache para garantir dados atualizados
          await invalidateCache('flashcards')
          
          // Recarregar flashcards
          if (selectedTopic) {
            loadFlashcards(selectedTopic)
          }
          setIsCreating(false)
          alert("Flashcard criado com sucesso!")
        } else {
          alert("Erro ao criar flashcard: " + result.error)
        }
      }
      
      setFormData({ question: "", answer: "", topic_id: "" })
    } catch (error) {
      console.error("Erro ao salvar flashcard:", error)
      alert("Erro ao salvar flashcard")
    }
  }

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!confirm("Tem certeza que deseja excluir este flashcard?")) {
      return
    }

    try {
      const result = await deleteFlashcard(user?.id || "", parseInt(flashcardId))
      if (result.success) {
        // Atualizar lista local
        setFlashcards(flashcards.filter(f => f.id !== flashcardId))
        
        // Ajustar índice se necessário
        if (currentCardIndex >= flashcards.length - 1) {
          setCurrentCardIndex(Math.max(0, flashcards.length - 2))
        }
        
        alert("Flashcard excluído com sucesso!")
      } else {
        alert("Erro ao excluir flashcard: " + result.error)
      }
    } catch (error) {
      console.error("Erro ao excluir flashcard:", error)
      alert("Erro ao excluir flashcard")
    }
  }

  const cancelEdit = () => {
    setEditingFlashcard(null)
    setIsCreating(false)
    setFormData({ question: "", answer: "", topic_id: "" })
  }

  const canEdit = profile?.role === "teacher" || profile?.role === "administrator"

  // Função para selecionar quantidade e iniciar estudo
  const handleStartStudy = (quantity: number) => {
    setSelectedQuantity(quantity)
    setStudyMode('normal')
    // Embaralha os flashcards e seleciona a quantidade escolhida
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    const selectedCards = shuffled.slice(0, Math.min(quantity, flashcards.length))
    setStudyFlashcards(selectedCards)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    console.log(`🎯 Iniciando estudo normal com ${selectedCards.length} flashcards`)
  }

  // Função para iniciar sessão de revisão
  const handleStartReview = async () => {
    setIsLoading(true)
    try {
      const result = await getFlashcardsForReview(user?.id || '', selectedTopic || undefined)
      if (result.success && result.flashcards.length > 0) {
        setStudyMode('review')
        setReviewFlashcards(result.flashcards)
        setCurrentCardIndex(0)
        setShowAnswer(false)
        console.log(`📚 Iniciando revisão com ${result.flashcards.length} flashcards`)
      } else {
        console.log('📚 Nenhum flashcard para revisão encontrado')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar flashcards para revisão:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para iniciar sessão de flashcards difíceis
  const handleStartDifficult = async () => {
    setIsLoading(true)
    try {
      const result = await getDifficultFlashcards(user?.id || '', selectedTopic || undefined, 10)
      if (result.success && result.flashcards.length > 0) {
        setStudyMode('difficult')
        setDifficultFlashcards(result.flashcards)
        setCurrentCardIndex(0)
        setShowAnswer(false)
        console.log(`🔥 Iniciando estudo de flashcards difíceis com ${result.flashcards.length} flashcards`)
      } else {
        console.log('🔥 Nenhum flashcard difícil encontrado')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar flashcards difíceis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para voltar à seleção de quantidade
  const handleBackToSelection = () => {
    setSelectedQuantity(null)
    setStudyFlashcards([])
    setStudyMode('normal')
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const handleCreateTestData = async () => {
    setIsCreatingTestData(true)
    try {
      const result = await createSampleFlashcardProgress()
      if (result.success) {
        alert(`✅ Dados de teste criados com sucesso! ${result.count} registros de progresso foram adicionados.`)
        // Recarregar dados se necessário
        if (selectedSubject) {
          await loadTopics(selectedSubject)
        }
      } else {
        alert('❌ Erro ao criar dados de teste.')
      }
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error)
      alert('❌ Erro ao criar dados de teste.')
    } finally {
      setIsCreatingTestData(false)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  // Loading state
  if (isLoading && subjects.length === 0) {
    return (
      <PagePermissionGuard pageName="flashcards">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando matérias...</p>
            </div>
          </div>
        </div>
      </PagePermissionGuard>
    )
  }


  return (
    <PagePermissionGuard pageName="flashcards">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton pageName="Flashcards" />
          {currentView === 'topics' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToSubjects}
              className="hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {currentView === 'flashcards' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackToTopics}
              className="hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Flashcards</h1>
        </div>
          
        {currentView === 'subjects' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">Selecione uma matéria para começar</h2>
            </div>

            <CourseGrid>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <CourseCard
                  key={subject.id}
                  title={subject.title}
                    description={subject.subtitle}
                    category={subject.title}
                    status={subject.overallProgress === 100 ? 'completed' : subject.overallProgress > 0 ? 'in-progress' : 'not-started'}
                    progress={subject.overallProgress}
                    totalLessons={subject.totalCount}
                    completedLessons={subject.lessonsCompleted}
                    author="Prof. Tiago Costa"
                    totalFlashcards={subject.totalFlashcards || 0}
                  onClick={() => handleSubjectClick(subject.id.toString())}
                />
                ))
              ) : isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Carregando matérias...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma matéria encontrada</p>
            </div>
              )}
            </CourseGrid>
          </div>
        )}

        {currentView === 'topics' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Tópicos de {subjects.find(s => s.id.toString() === selectedSubject)?.title}
              </h2>
        </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando tópicos...</p>
                            </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    title={topic.name}
                    description={topic.description || `Tópico de ${topic.name}`}
                    category={subjects.find(s => s.id.toString() === selectedSubject)?.title || ''}
                    categoryColor="bg-blue-500"
                    status={topic.flashcardCount > 20 ? 'completed' : topic.flashcardCount > 10 ? 'in-progress' : 'not-started'}
                    author="Prof. Tiago Costa"
                    duration={`${topic.flashcardCount} flashcards`}
                    totalLessons={topic.flashcardCount}
                    completedLessons={topic.flashcardCount > 20 ? topic.flashcardCount : Math.floor(topic.flashcardCount * 0.6)}
                    progress={topic.flashcardCount > 20 ? 100 : topic.flashcardCount > 10 ? 60 : 0}
                    onClick={() => handleTopicClick(topic.id)}
                  />
                ))}
                                </div>
            )}
          </div>
        )}

        {currentView === 'flashcards' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {topics.find(t => t.id === selectedTopic)?.name}
              </h2>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateFlashcard}
                      size="sm"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4" />
                      Novo
                    </Button>
                    <Button
                      onClick={() => setIsEditMode(!isEditMode)}
                      size="sm"
                      variant={isEditMode ? "default" : "outline"}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {isEditMode ? "Visualizar" : "Editar"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando flashcards...</p>
                </div>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Nenhum flashcard encontrado</h3>
                <p className="text-muted-foreground">Este tópico ainda não possui flashcards.</p>
                {canEdit && (
                  <Button
                    onClick={handleCreateFlashcard}
                    className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Flashcard
                  </Button>
                )}
              </div>
            ) : !selectedQuantity ? (
              /* Seletor de Quantidade */
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-orange-500 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Escolha quantos flashcards estudar
                </h3>
                <p className="text-muted-foreground mb-8">
                  Este tópico possui {flashcards.length} flashcards disponíveis
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-3xl mx-auto">
                  {[5, 10, 15, 20, 25, 30].map((quantity) => (
                    <Button
                      key={quantity}
                      onClick={() => handleStartStudy(quantity)}
                      disabled={quantity > flashcards.length}
                      variant={quantity > flashcards.length ? "outline" : "default"}
                      className={cn(
                        "h-16 text-lg font-semibold transition-all duration-300",
                        quantity > flashcards.length 
                          ? "opacity-50 cursor-not-allowed" 
                          : "bg-orange-500 hover:bg-orange-600 text-white hover:scale-105"
                      )}
                    >
                      {quantity}
                      {quantity > flashcards.length && (
                        <span className="block text-xs opacity-75">Indisponível</span>
                      )}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <Button
                    onClick={() => handleStartStudy(flashcards.length)}
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  >
                    Estudar todos ({flashcards.length})
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <Button
                      onClick={handleStartReview}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Revisar Flashcards
                    </Button>
                    <Button
                      onClick={handleStartDifficult}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Flashcards Difíceis
                    </Button>
                  </div>

                  {/* Botão para criar dados de teste (apenas para admin/teacher) */}
                  {(profile?.role === 'administrator' || profile?.role === 'teacher') && (
                    <div className="mt-4">
                      <Button
                        onClick={handleCreateTestData}
                        disabled={isCreatingTestData}
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
                      >
                        {isCreatingTestData ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Criando dados...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Dados de Teste
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informações do Estudo */}
                <div className={cn(
                  "border rounded-lg p-4 text-center",
                  studyMode === 'normal' && "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-600",
                  studyMode === 'review' && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600",
                  studyMode === 'difficult' && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(
                        "font-medium",
                        studyMode === 'normal' && "text-orange-800 dark:text-orange-200",
                        studyMode === 'review' && "text-blue-800 dark:text-blue-200",
                        studyMode === 'difficult' && "text-red-800 dark:text-red-200"
                      )}>
                        {studyMode === 'normal' && `Estudando ${studyFlashcards.length} flashcards selecionados`}
                        {studyMode === 'review' && `Revisando ${reviewFlashcards.length} flashcards com erro`}
                        {studyMode === 'difficult' && `Estudando ${difficultFlashcards.length} flashcards difíceis`}
                      </p>
                      <p className={cn(
                        "text-sm",
                        studyMode === 'normal' && "text-orange-600 dark:text-orange-300",
                        studyMode === 'review' && "text-blue-600 dark:text-blue-300",
                        studyMode === 'difficult' && "text-red-600 dark:text-red-300"
                      )}>
                        {studyMode === 'normal' && `De ${flashcards.length} flashcards disponíveis`}
                        {studyMode === 'review' && `Baseado no sistema de repetição espaçada`}
                        {studyMode === 'difficult' && `Flashcards com maior dificuldade`}
                      </p>
                    </div>
                    <Button
                      onClick={handleBackToSelection}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "hover:bg-opacity-20",
                        studyMode === 'normal' && "border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-800",
                        studyMode === 'review' && "border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800",
                        studyMode === 'difficult' && "border-red-200 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-800"
                      )}
                    >
                      Alterar Modo
                    </Button>
                  </div>
                </div>

                {/* Debug Info - Remove em produção */}
                {process.env.NODE_ENV === 'development' && studyFlashcards.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600 rounded-lg p-4 text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Debug Info:</p>
                    <p className="text-yellow-700 dark:text-yellow-200 font-medium">
                      Flashcard atual: "{cleanText(studyFlashcards[currentCardIndex]?.question || "").substring(0, 50)}..."
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-200 font-medium">
                      Resposta: "{cleanText(studyFlashcards[currentCardIndex]?.answer || "").substring(0, 50)}..."
                    </p>
                  </div>
                )}

                {/* Formulário de Criação/Edição */}
                {(isCreating || editingFlashcard) && (
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {editingFlashcard ? "Editar Flashcard" : "Novo Flashcard"}
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="question">Pergunta</Label>
                        <Textarea
                          id="question"
                          value={formData.question}
                          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                          placeholder="Digite a pergunta..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="answer">Resposta</Label>
                        <Textarea
                          id="answer"
                          value={formData.answer}
                          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                          placeholder="Digite a resposta..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveFlashcard}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {editingFlashcard ? "Atualizar" : "Criar"}
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Flashcard com efeito flip */}
                {!isCreating && !editingFlashcard && (
                  <div className="relative">
                <FlashcardFlip
                      question={cleanText(getCurrentFlashcard()?.question || "")}
                      answer={cleanText(getCurrentFlashcard()?.answer || "")}
                  onFlip={(isShowingAnswer) => setShowAnswer(isShowingAnswer)}
                      onAnswer={handleFlashcardAnswer}
                  className="mx-auto"
                />

                    {/* Botões de Edição no Card */}
                    {isEditMode && canEdit && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          onClick={() => handleEditFlashcard(flashcards[currentCardIndex])}
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteFlashcard(flashcards[currentCardIndex].id)}
                          size="sm"
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de Flashcards no Modo Edição */}
                {isEditMode && canEdit && !isCreating && !editingFlashcard && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                      Lista de Flashcards
                    </h3>
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {studyFlashcards.map((flashcard, index) => (
                        <Card key={flashcard.id} className={index === currentCardIndex ? "ring-2 ring-orange-500" : ""}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">#{index + 1}</Badge>
                                  {index === currentCardIndex && (
                                    <Badge className="bg-orange-500">Atual</Badge>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pergunta:</Label>
                                  <p className="text-gray-900 dark:text-gray-100 text-sm line-clamp-2 font-medium">{cleanText(flashcard.question)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Resposta:</Label>
                                  <p className="text-gray-900 dark:text-gray-100 text-sm line-clamp-2 font-medium">{cleanText(flashcard.answer)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  onClick={() => setCurrentCardIndex(index)}
                                  variant="outline"
                                  size="sm"
                                  title="Visualizar"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleEditFlashcard(flashcard)}
                                  variant="outline"
                                  size="sm"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteFlashcard(flashcard.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controles de Navegação */}
                {!isEditMode && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePreviousCard}
                    disabled={currentCardIndex === 0}
                    className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNextCard}
                              disabled={currentCardIndex === getCurrentFlashcardsLength() - 1}
                    className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  >
                    Próximo
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
                )}

                {/* Progresso */}
                {!isEditMode && (
                  <div className="flex justify-center mt-6">
                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Flashcard {currentCardIndex + 1} de {getCurrentFlashcardsLength()}</span>
                            <span>{Math.round(((currentCardIndex + 1) / getCurrentFlashcardsLength()) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${((currentCardIndex + 1) / getCurrentFlashcardsLength()) * 100}%` }}
                            />
                          </div>
                        </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PagePermissionGuard>
  )
}