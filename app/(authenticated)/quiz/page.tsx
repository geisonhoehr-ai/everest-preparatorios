"use client"

import { useState, useEffect } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { SubjectCard } from "@/components/ui/subject-card"
import { TopicCard } from "@/components/ui/topic-card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/breadcrumb-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Play, RotateCcw, CheckCircle, XCircle, Trophy, Clock } from "lucide-react"
import { getAllSubjects, getSubjectsWithStats, getTopicsBySubject, getAllQuizzes, getQuizWithQuestions, startQuizAttempt, submitQuestionAnswer, finishQuizAttempt } from "../../server-actions"
import { useAuth } from "@/context/auth-context-custom"

interface SubjectWithStats {
  id: string
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

interface Quiz {
  id: string
  title: string
  description?: string
  subject_id?: string
  topic_id?: string
  subjects?: { name: string }[]
  topics?: { name: string }[]
  created_at: string
  questions?: Question[]
}

interface Question {
  id: string
  question_text: string
  answer_text: string
  question_type: string
  flashcard_id?: string
  options?: Array<{
    id: string
    option_text: string
    is_correct: boolean
  }>
}

interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  start_time: string
  end_time?: string
  score: number
  is_completed: boolean
}

export default function QuizPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [currentView, setCurrentView] = useState<'subjects' | 'quizzes' | 'quiz-taking'>('subjects')
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

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
    setCurrentView('quizzes')
    setIsLoading(true)
    
    try {
      // Carregar quizzes reais do banco
      const quizzesData = await getAllQuizzes()
      
      // Filtrar quizzes por matéria selecionada
      const filteredQuizzes = quizzesData.filter(quiz => 
        quiz.subject_id === subjectId
      )
      
      setQuizzes(filteredQuizzes)
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error)
      setQuizzes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizClick = async (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView('quiz-taking')
    setIsLoading(true)
    
    try {
      // Carregar quiz completo com perguntas
      const quizWithQuestions = await getQuizWithQuestions(quiz.topic_id || '')
      if (!quizWithQuestions) {
        console.error('Quiz não encontrado')
        return
      }

      // Combinar dados do quiz com as perguntas
      const fullQuiz: Quiz = {
        ...quiz,
        questions: quizWithQuestions.questions?.map(q => ({
          id: q.id,
          question_text: q.question_text,
          answer_text: q.correct_answer || '',
          question_type: 'multiple_choice',
          options: q.options || []
        }))
      }
      setSelectedQuiz(fullQuiz)

      // Iniciar tentativa de quiz
      if (!user?.id) {
        console.error('Usuário não encontrado')
        return
      }

      const attemptResult = await startQuizAttempt(user.id, quiz.id)
      if (attemptResult.success) {
        setCurrentAttempt(attemptResult.data)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setQuizCompleted(false)
        setFinalScore(0)
      } else {
        console.error('Erro ao iniciar quiz:', attemptResult.error)
      }
    } catch (error) {
      console.error('Erro ao iniciar quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSubjects = () => {
    setSelectedSubject(null)
    setQuizzes([])
    setSelectedQuiz(null)
    setCurrentAttempt(null)
    setCurrentView('subjects')
  }

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null)
    setCurrentAttempt(null)
    setCurrentView('quizzes')
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNextQuestion = async () => {
    if (!selectedQuiz || !currentAttempt) return

    const currentQuestion = selectedQuiz.questions?.[currentQuestionIndex]
    if (!currentQuestion) return

    const userAnswer = userAnswers[currentQuestion.id]
    if (!userAnswer) {
      alert('Por favor, selecione uma resposta antes de continuar.')
      return
    }

    // Submeter resposta
    const result = await submitQuestionAnswer(currentAttempt.id, currentQuestion.id, userAnswer)
    if (!result.success) {
      console.error('Erro ao submeter resposta:', result.error)
      return
    }

    // Ir para próxima pergunta ou finalizar quiz
    if (currentQuestionIndex < (selectedQuiz.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Finalizar quiz
      const finishResult = await finishQuizAttempt(currentAttempt.id)
      if (finishResult.success) {
        setFinalScore(finishResult.data.score)
        setQuizCompleted(true)
      }
    }
  }

  // Loading state
  if (isLoading && subjects.length === 0) {
    return (
      <PagePermissionGuard pageName="quiz">
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
    <PagePermissionGuard pageName="quiz">
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        {/* Header */}
        {currentView === 'subjects' && (
          <PageHeader
            title="Quiz"
            description="Escolha uma matéria para fazer um quiz"
            breadcrumbItems={[
              { label: "Quiz", current: true }
            ]}
            className="mb-8"
          />
        )}
        
        {currentView === 'quizzes' && (
          <PageHeader
            title={`Quiz - ${subjects.find(s => s.id === selectedSubject)?.title}`}
            breadcrumbItems={[
              { label: "Quiz", href: "/quiz" },
              { label: subjects.find(s => s.id === selectedSubject)?.title || "Matéria", current: true }
            ]}
            className="mb-8"
          />
        )}
        
        {currentView === 'quiz-taking' && (
          <PageHeader
            title={selectedQuiz?.title || "Quiz"}
            breadcrumbItems={[
              { label: "Quiz", href: "/quiz" },
              { label: subjects.find(s => s.id === selectedSubject)?.title || "Matéria", href: "/quiz" },
              { label: selectedQuiz?.title || "Quiz", current: true }
            ]}
            className="mb-8"
          />
        )}

        {currentView === 'subjects' && (
          <div className="space-y-8">
            
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
                  onClick={() => handleSubjectClick(subject.id)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'quizzes' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">
                Quizzes de {subjects.find(s => s.id === selectedSubject)?.title}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando quizzes...</p>
                </div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum quiz encontrado</h3>
                <p className="text-muted-foreground">Esta matéria ainda não possui quizzes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="cursor-pointer hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-orange-900/20 transition-all duration-300 hover:scale-[1.02] hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    onClick={() => handleQuizClick(quiz)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{quiz.title}</CardTitle>
                      {quiz.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{quiz.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>Quiz</span>
                        </div>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'quiz-taking' && selectedQuiz && (
          <div className="max-w-4xl mx-auto">
            {quizCompleted ? (
              // Tela de resultado
              <div className="text-center">
                <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <Trophy className="h-20 w-20 text-yellow-500 dark:text-yellow-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Concluído!</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Você obteve {finalScore}% de aproveitamento
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleBackToQuizzes} 
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                    >
                      Voltar aos Quizzes
                    </Button>
                    <Button 
                      onClick={() => {
                        setQuizCompleted(false)
                        setCurrentQuestionIndex(0)
                        setUserAnswers({})
                        setFinalScore(0)
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Refazer Quiz
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              // Tela de quiz
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{selectedQuiz.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pergunta {currentQuestionIndex + 1} de {selectedQuiz.questions?.length || 0}
                  </p>
                </div>

                {selectedQuiz.questions && selectedQuiz.questions[currentQuestionIndex] && (
                  <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        {selectedQuiz.questions?.[currentQuestionIndex]?.question_text}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedQuiz.questions?.[currentQuestionIndex]?.question_type === 'multiple_choice' ? (
                        // Múltipla escolha
                        <div className="space-y-3">
                          {selectedQuiz.questions?.[currentQuestionIndex]?.options?.map((option) => (
                            <Button
                              key={option.id}
                              variant={userAnswers[selectedQuiz.questions?.[currentQuestionIndex]?.id || ''] === option.id ? "default" : "outline"}
                              className={`w-full justify-start text-left transition-all duration-300 ${
                                userAnswers[selectedQuiz.questions?.[currentQuestionIndex]?.id || ''] === option.id 
                                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg" 
                                  : "border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/20"
                              }`}
                              onClick={() => handleAnswerSelect(selectedQuiz.questions?.[currentQuestionIndex]?.id || '', option.id)}
                            >
                              {option.option_text}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        // Resposta livre
                        <textarea
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800"
                          rows={4}
                          placeholder="Digite sua resposta aqui..."
                          value={userAnswers[selectedQuiz.questions?.[currentQuestionIndex]?.id || ''] || ''}
                          onChange={(e) => handleAnswerSelect(selectedQuiz.questions?.[currentQuestionIndex]?.id || '', e.target.value)}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button 
                    onClick={handleNextQuestion} 
                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
                  >
                    {currentQuestionIndex < (selectedQuiz.questions?.length || 0) - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PagePermissionGuard>
  )
}
