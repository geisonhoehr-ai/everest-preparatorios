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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import confetti from "canvas-confetti"

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

// Efeitos visuais customizados para feedback
if (typeof window !== "undefined") {
  const styleId = "flashcard-effects-style"
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.innerHTML = `
      .flashcard-gradient-bg {
        background: linear-gradient(to bottom, #FF8800 0%, #FF4000 100%);
        color: #fff;
        border-radius: 1rem;
        border: 1.5px solid rgba(255, 136, 0, 0.5);
        box-shadow: 0 4px 24px 0 rgba(255,123,0,0.10);
      }
      .card-correct-effect {
        background: linear-gradient(to bottom, #43e97b 0%, #38f9d7 100%) !important;
        color: #fff !important;
        border-radius: 1rem;
        border: 1.5px solid rgba(67, 233, 123, 0.5);
        box-shadow: 0 4px 24px 0 rgba(67,233,123,0.10);
        position: relative;
        z-index: 1;
      }
      .card-incorrect-effect {
        background: linear-gradient(to bottom, #ff5858 0%, #f857a6 100%) !important;
        color: #fff !important;
        border-radius: 1rem;
        border: 1.5px solid rgba(255, 88, 88, 0.5);
        box-shadow: 0 4px 24px 0 rgba(255,88,88,0.10);
        animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
      }
      @keyframes shake {
        0% { transform: translateX(0); }
        10%, 90% { transform: translateX(-6px); }
        20%, 80% { transform: translateX(8px); }
        30%, 50%, 70% { transform: translateX(-12px); }
        40%, 60% { transform: translateX(12px); }
        100% { transform: translateX(0); }
      }
      .show-answer-btn {
        background: #fff;
        color: #FF4000;
        font-weight: 600;
        border-radius: 0.5rem;
        box-shadow: 0 2px 8px 0 rgba(255,64,0,0.08);
        transition: background 0.2s, color 0.2s;
      }
      .show-answer-btn:hover {
        background: #ffe0b2;
        color: #ff8800;
      }
      .btn-errei {
        background: #e53935 !important;
        color: #fff !important;
        font-weight: 600;
        border-radius: 0.5rem;
      }
      .btn-errei:hover {
        background: #b71c1c !important;
      }
      .btn-acertou {
        background: #43a047 !important;
        color: #fff !important;
        font-weight: 600;
        border-radius: 0.5rem;
      }
      .btn-acertou:hover {
        background: #1b5e20 !important;
      }
      .flashcard-flip {
        perspective: 1200px;
      }
      .flashcard-flip-inner {
        transition: transform 0.6s cubic-bezier(.4,2,.6,1);
        transform-style: preserve-3d;
        position: relative;
      }
      .flashcard-flip.show-answer .flashcard-flip-inner {
        transform: rotateY(180deg);
      }
      .flashcard-flip-front, .flashcard-flip-back {
        backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0; left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .flashcard-flip-back {
        transform: rotateY(180deg);
      }
    `
    document.head.appendChild(style)
  }
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
  const [selectedQuantity, setSelectedQuantity] = useState(20)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [lastSessionStats, setLastSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [wrongCards, setWrongCards] = useState<Flashcard[]>([])
  const [lastAnswer, setLastAnswer] = useState<null | boolean>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [availableCounts, setAvailableCounts] = useState<{ [topicId: string]: number }>({})

  useEffect(() => {
    loadTopics()
  }, [])

  // Buscar quantidade de flashcards disponíveis por tópico
  useEffect(() => {
    async function fetchCounts() {
      const counts: { [topicId: string]: number } = {}
      for (const topic of topics) {
        // Busca todos os flashcards do tópico (limit alto só para contar)
        const cards = await getFlashcardsForReview(topic.id, 9999)
        counts[topic.id] = cards.length
      }
      setAvailableCounts(counts)
    }
    if (topics.length > 0) fetchCounts()
  }, [topics])

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
      const cards = await getFlashcardsForReview(topicId, selectedQuantity)
      if (cards.length > 0) {
        setFlashcards(cards)
        setSelectedTopic(topicId)
        setCurrentCardIndex(0)
        setShowAnswer(false)
        setStudyMode("study")
        setSessionStats({ correct: 0, incorrect: 0 })
        setWrongCards([])
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

    setLastAnswer(isCorrect)

    // Efeito de confete ao acertar
    if (isCorrect) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      })
    }
    // Vibração ao errar (mobile)
    if (!isCorrect && typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate([40, 30, 40])
    }

    // Atualizar estatísticas da sessão
    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

    // Guardar cards errados para revisão
    if (!isCorrect) {
      setWrongCards((prev) => [...prev, flashcards[currentCardIndex]])
    }

    // Atualizar progresso no banco
    try {
      await updateTopicProgress(selectedTopic, isCorrect ? "correct" : "incorrect")
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error)
    }

    // Mostrar feedback visual por 1s antes de avançar
    setTimeout(() => {
      setLastAnswer(null)
      setIsTransitioning(true)
      setShowAnswer(false)
      setTimeout(() => {
        setIsTransitioning(false)
        if (currentCardIndex < flashcards.length - 1) {
          setCurrentCardIndex((prev) => prev + 1)
        } else {
          // Sessão finalizada
          setLastSessionStats({
            correct: sessionStats.correct + (isCorrect ? 1 : 0),
            incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
          })
          setShowFinishModal(true)
          setStudyMode("select")
          setSelectedTopic(null)
        }
      }, 200)
    }, 900)
  }

  const resetSession = () => {
    setStudyMode("select")
    setSelectedTopic(null)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    setWrongCards([])
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
    let cardFeedbackClass = ""
    // Remover fundo colorido, manter apenas classes para efeitos visuais
    if (lastAnswer === true) cardFeedbackClass = "card-correct-effect"
    if (lastAnswer === false) cardFeedbackClass = "card-incorrect-effect"

    return (
      <DashboardShell>
        {/* Modal de conclusão */}
        <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sessão Finalizada!</DialogTitle>
              <DialogDescription>
                Você concluiu a sessão de flashcards.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center my-4">
              <p className="text-lg font-semibold mb-2">Estatísticas:</p>
              <div className="flex justify-center gap-6 mb-2">
                <span className="text-green-600 font-bold">Acertos: {lastSessionStats.correct}</span>
                <span className="text-red-600 font-bold">Erros: {lastSessionStats.incorrect}</span>
              </div>
              <p className="mb-2">Taxa de acerto: {lastSessionStats.correct + lastSessionStats.incorrect > 0 ? Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100) : 0}%</p>
              {wrongCards.length > 0 && (
                <Button variant="destructive" onClick={() => {
                  setFlashcards(wrongCards)
                  setCurrentCardIndex(0)
                  setShowAnswer(false)
                  setSessionStats({ correct: 0, incorrect: 0 })
                  setWrongCards([])
                  setShowFinishModal(false)
                  setStudyMode("study")
                }}>
                  Revisar apenas os errados ({wrongCards.length})
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowFinishModal(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-3xl font-bold tracking-tight">Estudando Flashcards</h1>
            <p className="text-muted-foreground">Tópico: {topics.find((t) => t.id === selectedTopic)?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">Disponíveis: {availableCounts[selectedTopic ?? ""] ?? "..."}</p>
          </div>
          <Button variant="outline" onClick={resetSession} className="w-full sm:w-auto mt-2 sm:mt-0">
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

        <div className={`flashcard-flip w-full max-w-2xl mx-auto${showAnswer ? " show-answer" : ""}`} style={{height: 360}}>
          <div className="flashcard-flip-inner" style={{height: 360}}>
            <Card className={`flashcard-gradient-bg w-full h-full border-2 ${cardFeedbackClass} flashcard-flip-front`}>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Pergunta</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="min-h-[200px] flex items-center justify-center p-6">
                  <p className="text-lg leading-relaxed">{currentCard.question}</p>
                </div>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => setShowAnswer(true)} size="lg" className="show-answer-btn" disabled={isTransitioning || lastAnswer !== null}>
                    Mostrar Resposta
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className={`flashcard-gradient-bg w-full h-full border-2 ${cardFeedbackClass} flashcard-flip-back`}>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Resposta</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="min-h-[200px] flex items-center justify-center p-6">
                  <p className="text-lg leading-relaxed">{currentCard.answer}</p>
                </div>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => handleAnswer(false)} size="lg" className="btn-errei" disabled={isTransitioning || lastAnswer !== null}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Errei
                  </Button>
                  <Button onClick={() => handleAnswer(true)} size="lg" className="btn-acertou" disabled={isTransitioning || lastAnswer !== null}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Acertei
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Botão para gerar mais flashcards com IA */}
        {/* Removido conforme solicitado */}
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      {/* Seletor de quantidade de flashcards */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground">Escolha um tópico para começar a estudar com flashcards</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm">Quantidade:</span>
          <input
            type="number"
            min={1}
            max={availableCounts[selectedTopic ?? ""] || 999}
            className="border rounded px-2 py-1 bg-background w-20"
            value={selectedQuantity}
            onChange={e => setSelectedQuantity(Number(e.target.value))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow min-h-[220px] flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BookOpenText className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{availableCounts[topic.id] !== undefined ? `${availableCounts[topic.id]} cards` : "..."}</Badge>
              </div>
              <CardTitle className="text-lg">{topic.name}</CardTitle>
              <CardDescription>Estude este tópico com flashcards interativos</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Button onClick={() => startStudySession(topic.id)} className="w-full mt-2" disabled={isLoading}>
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
