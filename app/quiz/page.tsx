"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BrainCircuit, Play, CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import { getAllTopics, getQuizzesByTopic, getQuizQuestions, submitQuizResult, getAllSubjects, getTopicsBySubject } from "@/actions"
import Link from "next/link"

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

export default function QuizPage() {
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

  useEffect(() => {
    async function fetchSubjects() {
      const data = await getAllSubjects();
      console.log('Subjects:', data);
      setSubjects(data);
      setIsLoading(false); // <-- Garante que o loading termina
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    async function fetchTopics() {
      if (selectedSubject) {
        const data = await getTopicsBySubject(selectedSubject)
        setTopics(data)
      }
    }
    fetchTopics()
  }, [selectedSubject])

  const loadQuizzes = async (topicId: string) => {
    setIsLoading(true)
    try {
      const quizzesData = await getQuizzesByTopic(topicId)
      setQuizzes(quizzesData)
      setSelectedTopic(topicId)
      setMode("quizzes")
    } catch (error) {
      console.error("Erro ao carregar quizzes:", error)
      alert("Erro ao carregar quizzes. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = async (quiz: Quiz) => {
    setIsLoading(true)
    try {
      const questionsData = await getQuizQuestions(quiz.id)
      if (questionsData.length > 0) {
        setQuestions(questionsData)
        setSelectedQuiz(quiz)
        setCurrentQuestionIndex(0)
        setSelectedAnswer("")
        setUserAnswers([])
        setShowResult(false)
        setMode("quiz")
      } else {
        alert("Este quiz não possui questões disponíveis.")
      }
    } catch (error) {
      console.error("Erro ao carregar questões:", error)
      alert("Erro ao carregar questões. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = selectedAnswer
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(newAnswers[currentQuestionIndex + 1] || "")
    } else {
      finishQuiz(newAnswers)
    }
  }

  const finishQuiz = async (answers: string[]) => {
    if (!selectedQuiz) return

    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct_answer) {
        correct++
      }
    })

    const score = Math.round((correct / questions.length) * 100)

    try {
      await submitQuizResult(selectedQuiz.id, score, correct, questions.length - correct, questions.length)
    } catch (error) {
      console.error("Erro ao salvar resultado:", error)
    }

    setQuizResult({ score, correct, total: questions.length })
    setMode("result")
  }

  const resetQuiz = () => {
    setMode("topics")
    setSelectedTopic(null)
    setSelectedQuiz(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setUserAnswers([])
    setShowResult(false)
    setQuizResult(null)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (mode === "result" && quizResult) {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto mb-4">
                {quizResult.score >= 70 ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">{quizResult.score >= 70 ? "Parabéns!" : "Continue estudando!"}</CardTitle>
              <CardDescription>Você completou o quiz: {selectedQuiz?.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{quizResult.score}%</div>
                <p className="text-muted-foreground">
                  {quizResult.correct} de {quizResult.total} questões corretas
                </p>
              </div>

              <Progress value={quizResult.score} className="h-3" />

              <div className="flex gap-4 justify-center">
                <Button onClick={resetQuiz} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Fazer Outro Quiz
                </Button>
                <Button asChild>
                  <Link href="/">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  if (mode === "quiz" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedQuiz?.title}</h1>
            <p className="text-muted-foreground">
              Questão {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>
          <Button variant="outline" onClick={resetQuiz}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Sair do Quiz
          </Button>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>
              <Button onClick={handleNextQuestion} disabled={!selectedAnswer}>
                {currentQuestionIndex === questions.length - 1 ? "Finalizar Quiz" : "Próxima"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  if (mode === "quizzes") {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
            <p className="text-muted-foreground">Tópico: {topics.find((t) => t.id === selectedTopic)?.name}</p>
          </div>
          <Button variant="outline" onClick={() => setMode("topics")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Voltar aos Tópicos
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">Quiz</Badge>
                </div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription>{quiz.description || "Teste seus conhecimentos neste quiz"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => startQuiz(quiz)} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {quizzes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum quiz disponível</h3>
              <p className="text-muted-foreground">Não há quizzes disponíveis para este tópico no momento.</p>
            </CardContent>
          </Card>
        )}
      </DashboardShell>
    )
  }

  // Renderização principal
  if (!selectedSubject) {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Escolha a Matéria</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-b from-[#FF8800] to-[#FF4000] text-white border-none" onClick={() => setSelectedSubject(subject.id)}>
              <CardHeader>
                <CardTitle className="text-2xl text-center">{subject.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </DashboardShell>
    )
  }

  // Remover etapa intermediária de seleção de tópico
  if (mode === "topics") {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Escolha o Tópico</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow min-h-[220px] flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  {/* Opcional: mostrar quantidade de quizzes se disponível */}
                  {/* <Badge variant="secondary">{quizCounts[topic.id] !== undefined ? `${quizCounts[topic.id]} quizzes` : "..."}</Badge> */}
                </div>
                <CardTitle className="text-lg">{topic.name}</CardTitle>
                <CardDescription>Faça quizzes sobre este tópico</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Button onClick={() => loadQuizzes(topic.id)} className="w-full mt-2 bg-gradient-to-b from-[#FF8800] to-[#FF4000] text-white border-none hover:brightness-110">
                  <Play className="mr-2 h-4 w-4" />
                  Ver Quizzes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button variant="outline" className="mt-8" onClick={() => setSelectedSubject(null)}>
          Voltar às Matérias
        </Button>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
          <p className="text-muted-foreground">Escolha um tópico para fazer quizzes e testar seus conhecimentos</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <Badge variant="secondary">Tópico</Badge>
              </div>
              <CardTitle className="text-lg">{topic.name}</CardTitle>
              <CardDescription>Faça quizzes sobre este tópico</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadQuizzes(topic.id)} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Ver Quizzes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tópico disponível</h3>
            <p className="text-muted-foreground mb-4">Os tópicos de quiz ainda não foram configurados.</p>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowRight className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}
