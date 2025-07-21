"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpenText, Play, RotateCcw, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { getAllTopics, getFlashcardsForReview, updateTopicProgress } from "@/actions"
import Link from "next/link"

interface Topic {
  id: string
  name: string
}

interface Flashcard {
  id: number
  topic_id: string
  question: string
  answer: string
}

export default function FlashcardsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [studyMode, setStudyMode] = useState<"select" | "study">("select")
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const topicsData = await getAllTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error("Erro ao carregar tópicos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startStudySession = async (topicId: string) => {
    setIsLoading(true)
    try {
      const cards = await getFlashcardsForReview(topicId, 20)
      if (cards.length > 0) {
        setFlashcards(cards)
        setSelectedTopic(topicId)
        setCurrentCardIndex(0)
        setShowAnswer(false)
        setStudyMode("study")
        setSessionStats({ correct: 0, incorrect: 0 })
      } else {
        alert("Nenhum flashcard disponível para este tópico no momento.")
      }
    } catch (error) {
      console.error("Erro ao carregar flashcards:", error)
      alert("Erro ao carregar flashcards. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (!selectedTopic) return

    // Atualizar estatísticas da sessão
    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

    // Atualizar progresso no banco
    try {
      await updateTopicProgress(selectedTopic, isCorrect ? "correct" : "incorrect")
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error)
    }

    // Próximo card ou finalizar sessão
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setShowAnswer(false)
    } else {
      // Sessão finalizada
      alert(
        `Sessão finalizada!\nAcertos: ${sessionStats.correct + (isCorrect ? 1 : 0)}\nErros: ${sessionStats.incorrect + (isCorrect ? 0 : 1)}`,
      )
      setStudyMode("select")
      setSelectedTopic(null)
    }
  }

  const resetSession = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando flashcards...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (studyMode === "study" && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100

    return (
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estudando Flashcards</h1>
            <p className="text-muted-foreground">Tópico: {topics.find((t) => t.id === selectedTopic)?.name}</p>
          </div>
          <Button variant="outline" onClick={resetSession}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Voltar aos Tópicos
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Card {currentCardIndex + 1} de {flashcards.length}
            </span>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">✓ {sessionStats.correct}</span>
              <span className="text-red-600">✗ {sessionStats.incorrect}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{showAnswer ? "Resposta" : "Pergunta"}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="min-h-[200px] flex items-center justify-center p-6">
              <p className="text-lg leading-relaxed">{showAnswer ? currentCard.answer : currentCard.question}</p>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              {!showAnswer ? (
                <Button onClick={() => setShowAnswer(true)} size="lg">
                  Mostrar Resposta
                </Button>
              ) : (
                <>
                  <Button onClick={() => handleAnswer(false)} variant="destructive" size="lg">
                    <XCircle className="mr-2 h-4 w-4" />
                    Errei
                  </Button>
                  <Button onClick={() => handleAnswer(true)} variant="default" size="lg">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Acertei
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground">Escolha um tópico para começar a estudar com flashcards</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BookOpenText className="h-8 w-8 text-primary" />
                <Badge variant="secondary">Disponível</Badge>
              </div>
              <CardTitle className="text-lg">{topic.name}</CardTitle>
              <CardDescription>Estude este tópico com flashcards interativos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => startStudySession(topic.id)} className="w-full" disabled={isLoading}>
                <Play className="mr-2 h-4 w-4" />
                Começar Estudo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpenText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tópico disponível</h3>
            <p className="text-muted-foreground mb-4">Os tópicos de flashcards ainda não foram configurados.</p>
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
