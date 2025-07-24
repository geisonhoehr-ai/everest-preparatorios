"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpenText, Play, RotateCcw, CheckCircle, XCircle, ArrowRight, BookOpen, Share2, Copy, Trophy, Star } from "lucide-react"
import { getAllTopics, getFlashcardsForReview, updateTopicProgress, getAllSubjects, getTopicsBySubject } from "@/actions"
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
import { createClient } from "@/lib/supabase/client"

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
        background: #111;
        color: #fff;
        font-weight: 600;
        border-radius: 0.5rem;
        box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
        transition: background 0.2s, color 0.2s;
      }
      .show-answer-btn:hover {
        background: #43a047;
        color: #fff;
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
      @keyframes flashError {
        0% { opacity: 0.7; }
        60% { opacity: 1; }
        100% { opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }
}

export default function FlashcardsPage() {
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
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
  const [refreshProgress, setRefreshProgress] = useState(0)
  const supabase = createClient();

  // Remover estados não utilizados
  // const [topicQuantity, setTopicQuantity] = useState<{ [topicId: string]: number }>({})
  // const [showQuantityInput, setShowQuantityInput] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubjects() {
      const data = await getAllSubjects();
      setSubjects(data);
      setIsLoading(false);
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    async function fetchTopics() {
      if (selectedSubject) {
        setIsLoading(true);
        const data = await getTopicsBySubject(selectedSubject)
        setTopics(data)
        setIsLoading(false);
      }
    }
    fetchTopics()
  }, [selectedSubject])

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

  // Atualizar progresso ao finalizar sessão
  useEffect(() => {
    if (refreshProgress > 0) {
      loadTopics()
    }
  }, [refreshProgress])

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

  // Adicionar overlay animado para erro
  const ErrorOverlay = () => (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(255, 88, 88, 0.25)',
      borderRadius: '1rem',
      pointerEvents: 'none',
      zIndex: 10,
      animation: 'flashError 0.7s',
    }} />
  )

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
    // Vibração e efeito de tremer ao errar (mobile e visual)
    if (!isCorrect && typeof window !== "undefined") {
      if (window.navigator.vibrate) {
        window.navigator.vibrate([40, 30, 40])
      }
      setIsTransitioning(true)
      setTimeout(() => setIsTransitioning(false), 600)
    }

    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }))

    if (!isCorrect) {
      setWrongCards((prev) => [...prev, flashcards[currentCardIndex]])
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await updateTopicProgress(selectedTopic, isCorrect ? "correct" : "incorrect", user.id)
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error)
    }

    // Efeito visual por 900ms, depois avança
    setTimeout(() => {
      setLastAnswer(null)
      setShowAnswer(false)
      setTimeout(() => {
        if (currentCardIndex < flashcards.length - 1) {
          setCurrentCardIndex((prev) => prev + 1)
        } else {
          setLastSessionStats({
            correct: sessionStats.correct + (isCorrect ? 1 : 0),
            incorrect: sessionStats.incorrect + (isCorrect ? 0 : 1),
          })
          setShowFinishModal(true)
          setRefreshProgress((v) => v + 1)
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

  // 1. Seleção de matéria
  if (!selectedSubject) {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Escolha a Matéria</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow min-h-[220px] flex flex-col justify-between bg-[#0d1117] border border-[#23272f]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BookOpen className="h-8 w-8 text-[#FF4000]" />
                  <div className="text-xs text-zinc-400">Matéria</div>
                </div>
                <CardTitle className="text-2xl text-white mt-2">{subject.name}</CardTitle>
                <CardDescription className="text-zinc-300 mt-2">
                  {subject.name === "Português"
                    ? "Domine a gramática, interpretação de texto e prepare-se para gabaritar as questões de Português!"
                    : subject.name === "Regulamentos"
                    ? "Aprenda tudo sobre os regulamentos militares e fique pronto para qualquer questão da banca!"
                    : "Estude os principais tópicos desta matéria com flashcards interativos."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#FF4000] text-white border-none hover:brightness-110 mt-4" onClick={() => setSelectedSubject(subject.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Começar Estudo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    )
  }

  // 2. Seleção de tópico (após escolher matéria)
  if (studyMode === "select" && selectedSubject) {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Flashcards</h1>
        <p className="text-muted-foreground mb-4">Escolha um tópico para começar a estudar com flashcards</p>
        <div className="flex items-center gap-2 mb-6">
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
        <Button variant="outline" className="mt-8" onClick={() => setSelectedSubject(null)}>
          Voltar às Matérias
        </Button>
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

  // 3. Estudo dos flashcards
  if (studyMode === "study" && flashcards.length > 0) {
    const currentCard = flashcards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / flashcards.length) * 100
    let cardFeedbackClass = ""
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
              {lastSessionStats.correct + lastSessionStats.incorrect === 0 ? null :
                lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect) === 1 ? (
                  <div className="flex flex-col items-center mt-2">
                    <Trophy className="h-8 w-8 text-yellow-400 mb-1 animate-bounce" />
                    <p className="text-green-600 font-bold">Parabéns, você gabaritou!</p>
                  </div>
                ) : lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect) >= 0.7 ? (
                  <div className="flex flex-col items-center mt-2">
                    <Star className="h-8 w-8 text-yellow-400 mb-1 animate-pulse" />
                    <p className="text-yellow-600 font-bold">Ótimo desempenho, continue praticando!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-2">
                    <XCircle className="h-8 w-8 text-red-500 mb-1 animate-shake" />
                    <p className="text-red-600 font-bold">Não desista, revise os errados e tente novamente!</p>
                  </div>
                )
              }
              {wrongCards.length > 0 && (
                <Button variant="destructive" className="animate-pulse" onClick={() => {
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
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Compartilhe seu resultado:</span>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `Acabei de revisar flashcards no Everest Preparatórios!\nAcertos: ${lastSessionStats.correct}\nErros: ${lastSessionStats.incorrect}\nTaxa de acerto: ${lastSessionStats.correct + lastSessionStats.incorrect > 0 ? Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100) : 0}%\nhttps://everest-preparatorios.vercel.app`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
                  }}
                >
                  <Share2 className="mr-1 h-4 w-4" /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `Acabei de revisar flashcards no Everest Preparatórios!\nAcertos: ${lastSessionStats.correct}\nErros: ${lastSessionStats.incorrect}\nTaxa de acerto: ${lastSessionStats.correct + lastSessionStats.incorrect > 0 ? Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100) : 0}%\nhttps://everest-preparatorios.vercel.app`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)
                  }}
                >
                  <Share2 className="mr-1 h-4 w-4" /> Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `Acabei de revisar flashcards no Everest Preparatórios!\nAcertos: ${lastSessionStats.correct}\nErros: ${lastSessionStats.incorrect}\nTaxa de acerto: ${lastSessionStats.correct + lastSessionStats.incorrect > 0 ? Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100) : 0}%\nhttps://everest-preparatorios.vercel.app`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://everest-preparatorios.vercel.app&quote=${encodeURIComponent(text)}`)
                  }}
                >
                  <Share2 className="mr-1 h-4 w-4" /> Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = `Acabei de revisar flashcards no Everest Preparatórios!\nAcertos: ${lastSessionStats.correct}\nErros: ${lastSessionStats.incorrect}\nTaxa de acerto: ${lastSessionStats.correct + lastSessionStats.incorrect > 0 ? Math.round((lastSessionStats.correct / (lastSessionStats.correct + lastSessionStats.incorrect)) * 100) : 0}%\nhttps://everest-preparatorios.vercel.app`;
                    navigator.clipboard.writeText(text)
                    alert("Resultado copiado para a área de transferência!")
                  }}
                >
                  <Copy className="mr-1 h-4 w-4" /> Copiar Resultado
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => { setShowFinishModal(false); setStudyMode("select"); setSelectedTopic(null); }}>Fechar</Button>
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

        <div className="mb-2 flex items-center justify-between w-full max-w-2xl mx-auto">
          <span className="text-sm font-medium">Card {currentCardIndex + 1} de {flashcards.length}</span>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {sessionStats.correct}</span>
            <span className="text-red-600">✗ {sessionStats.incorrect}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 max-w-2xl mx-auto mb-6" />

        {/* Contador acima do card, centralizado */}
        <div className="w-full flex justify-center mb-2">
          <span className="text-sm font-semibold opacity-80 text-zinc-700 dark:text-white bg-transparent">Card {currentCardIndex + 1} de {flashcards.length}</span>
        </div>

        {/* Centralizar verticalmente o card na área de estudo */}
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto">
          <Card className={`flashcard-gradient-bg w-full h-full border-2 ${cardFeedbackClass}`} style={{position: 'relative'}}>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{showAnswer ? 'Resposta' : 'Pergunta'}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="min-h-[200px] flex items-center justify-center p-6">
                <p className="text-lg leading-relaxed font-bold">{showAnswer ? currentCard.answer : currentCard.question}</p>
              </div>
              <div className="flex gap-4 justify-center mt-6">
                {showAnswer ? (
                  <>
                    <Button onClick={() => handleAnswer(false)} size="lg" className="btn-errei" disabled={lastAnswer !== null}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Errei
                    </Button>
                    <Button onClick={() => handleAnswer(true)} size="lg" className="btn-acertou" disabled={lastAnswer !== null}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Acertei
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setShowAnswer(true)} size="lg" className="show-answer-btn" disabled={lastAnswer !== null}>
                    Mostrar Resposta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Botão para gerar mais flashcards com IA */}
        {/* Removido conforme solicitado */}
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      {/* Seletor de quantidade de flashcards */}
      {/* Removido conforme solicitado */}

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
