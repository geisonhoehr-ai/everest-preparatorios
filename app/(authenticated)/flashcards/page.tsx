"use client"

import { useState, useEffect } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { SubjectCard } from "@/components/ui/subject-card"
import { TopicCard } from "@/components/ui/topic-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Play, RotateCcw, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import { getAllSubjects, getSubjectsWithStats, getTopicsBySubject, getFlashcardsByTopic } from "../../server-actions"
import { useAuth } from "@/context/auth-context-custom"
import { FlashcardFlip } from "@/components/ui/flashcard-flip"

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
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentView, setCurrentView] = useState<'subjects' | 'topics' | 'flashcards'>('subjects')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar subjects com estatísticas
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoading(true)
        const data = await getSubjectsWithStats(user?.id)
        setSubjects(data)
      } catch (error) {
        console.error('Erro ao carregar subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSubjects()
  }, [user?.id])

  const handleSubjectClick = async (subjectId: string) => {
    setSelectedSubject(subjectId)
    setCurrentView('topics')
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

  const handleTopicClick = async (topicId: string) => {
    setSelectedTopic(topicId)
    setCurrentView('flashcards')
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

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
        </div>
          
        {currentView === 'subjects' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">Selecione uma matéria para começar</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  title={subject.title}
                  subtitle={subject.subtitle}
                  completedCount={subject.completedCount}
                  totalCount={subject.totalCount}
                  averageProgress={subject.averageProgress}
                  lessonsCompleted={subject.lessonsCompleted}
                  includedItems={subject.includedItems}
                  overallProgress={subject.overallProgress}
                  onClick={() => handleSubjectClick(subject.id.toString())}
                />
              ))}
            </div>
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
                    author="Prof. Maria Silva"
                    duration="2 horas"
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
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                {topics.find(t => t.id === selectedTopic)?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Flashcard {currentCardIndex + 1} de {flashcards.length}
              </p>
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
                <h3 className="text-xl font-semibold mb-2">Nenhum flashcard encontrado</h3>
                <p className="text-muted-foreground">Este tópico ainda não possui flashcards.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Flashcard com efeito flip */}
                <FlashcardFlip
                  question={flashcards[currentCardIndex]?.question || ""}
                  answer={flashcards[currentCardIndex]?.answer || ""}
                  onFlip={(isShowingAnswer) => setShowAnswer(isShowingAnswer)}
                  className="mx-auto"
                />

                {/* Controles */}
                <div className="flex justify-center items-center gap-4">
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
                    onClick={toggleAnswer}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showAnswer ? "Ocultar Resposta" : "Mostrar Resposta"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === flashcards.length - 1}
                    className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                  >
                    Próximo
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>

                {/* Progresso */}
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    {flashcards.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentCardIndex
                            ? 'bg-orange-500 shadow-lg scale-110'
                            : index < currentCardIndex
                            ? 'bg-orange-300 dark:bg-orange-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PagePermissionGuard>
  )
}