"use client"

import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, Play, RotateCcw, CheckCircle, XCircle, ArrowRight, Eye, EyeOff, Moon, Sun, Brain, Target, Trophy, Star
} from "lucide-react"
// @ts-ignore
import confetti from 'canvas-confetti'
import { useKeyboardNavigation, useAriaAttributes } from '@/hooks/use-keyboard-navigation'

interface Flashcard {
  id: number
  question: string
  answer: string
}

interface InteractiveFlashcardProps {
  title: string
  description: string
  flashcards: Flashcard[]
  accentColor: string
  badgeColor: string
  icon: React.ReactNode
}

const InteractiveFlashcard = memo(function InteractiveFlashcard({
  title,
  description,
  flashcards,
  accentColor,
  badgeColor,
  icon
}: InteractiveFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: boolean }>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)

  // Memoizar valores calculados
  const progress = useMemo(() => {
    return flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0
  }, [currentIndex, flashcards.length])

  const currentCard = useMemo(() => {
    return flashcards[currentIndex] || null
  }, [flashcards, currentIndex])

  const scorePercentage = useMemo(() => {
    return flashcards.length > 0 ? (score / flashcards.length) * 100 : 0
  }, [score, flashcards.length])

  // Callbacks otimizados
  const handleStart = useCallback(() => {
    setIsStarted(true)
    setCurrentIndex(0)
    setShowAnswer(false)
    setScore(0)
    setCompleted(false)
    setUserAnswers({})
    setShowFeedback(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsStarted(false)
    setCurrentIndex(0)
    setShowAnswer(false)
    setScore(0)
    setCompleted(false)
    setUserAnswers({})
    setShowFeedback(false)
  }, [])

  const handleToggleAnswer = useCallback(() => {
    setShowAnswer(prev => !prev)
  }, [])

  const handleAnswer = useCallback((isCorrect: boolean) => {
    const newScore = isCorrect ? score + 1 : score
    setScore(newScore)
    setUserAnswers(prev => ({ ...prev, [currentIndex]: isCorrect }))
    setLastAnswerCorrect(isCorrect)
    setShowFeedback(true)

    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }

    setTimeout(() => {
      setShowFeedback(false)
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        setCompleted(true)
      }
    }, 1500)
  }, [score, currentIndex, flashcards.length])

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
      setShowFeedback(false)
    } else {
      setCompleted(true)
    }
  }, [currentIndex, flashcards.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowAnswer(false)
      setShowFeedback(false)
    }
  }, [currentIndex])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  // Navegação por teclado
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: handleToggleAnswer,
    onEscape: handleReset,
    onArrowLeft: handlePrevious,
    onArrowRight: handleNext,
    onSpace: handleToggleAnswer,
  })

  // ARIA attributes
  const cardAriaAttributes = useAriaAttributes({
    role: 'region',
    label: `Flashcard ${currentIndex + 1} de ${flashcards.length}`,
    expanded: showAnswer,
  })

  // Efeitos
  useEffect(() => {
    const cached = localStorage.getItem(`flashcard-${title}`)
    if (cached) {
      const data = JSON.parse(cached)
      setCurrentIndex(data.currentIndex || 0)
      setScore(data.score || 0)
      setUserAnswers(data.userAnswers || {})
      setIsStarted(data.isStarted || false)
      setCompleted(data.completed || false)
    }
  }, [title])

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem(`flashcard-${title}`, JSON.stringify({
        currentIndex,
        score,
        userAnswers,
        isStarted,
        completed
      }))
    }
  }, [currentIndex, score, userAnswers, isStarted, completed, title])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Renderização condicional otimizada
  if (!isStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <p className="text-gray-600">{description}</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <Badge variant="secondary" className={`${badgeColor} text-white`}>
              {flashcards.length} flashcards
            </Badge>
          </div>
          <Button 
            onClick={handleStart}
            className={`${accentColor} text-white hover:opacity-90 transition-opacity`}
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Começar Estudo
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (completed) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Parabéns!</CardTitle>
          <p className="text-gray-600">Você completou todos os flashcards!</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {score}/{flashcards.length}
            </div>
            <div className="text-lg text-gray-600">
              {scorePercentage.toFixed(1)}% de acerto
            </div>
            <Progress value={scorePercentage} className="mt-4" />
          </div>
          <div className="space-y-2">
            <Button 
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="w-full max-w-2xl mx-auto"
      {...cardAriaAttributes}
    >
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Desativar modo escuro" : "Ativar modo escuro"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              aria-label="Reiniciar flashcards"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} de {flashcards.length}
          </span>
          <span className="text-sm text-gray-600">
            Pontuação: {score}
          </span>
        </div>
        
        <Progress value={progress} className="mb-4" />
      </CardHeader>

      <CardContent>
        {currentCard && (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Pergunta
              </h3>
              <p className="text-lg">{currentCard.question}</p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleToggleAnswer}
                variant="outline"
                className="w-full"
                aria-expanded={showAnswer}
                aria-controls="answer-content"
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar Resposta
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mostrar Resposta
                  </>
                )}
              </Button>
            </div>

            {showAnswer && (
              <div 
                id="answer-content"
                className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50'}`}
                role="region"
                aria-label="Resposta"
              >
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Resposta
                </h4>
                <p className="text-lg">{currentCard.answer}</p>
              </div>
            )}

            {showAnswer && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="destructive"
                  className="flex-1"
                  aria-label="Marcar como incorreto"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Incorreto
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  aria-label="Marcar como correto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Correto
                </Button>
              </div>
            )}

            {showFeedback && (
              <div className={`p-4 rounded-lg text-center ${
                lastAnswerCorrect 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center justify-center">
                  {lastAnswerCorrect ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  {lastAnswerCorrect ? 'Correto!' : 'Incorreto!'}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentIndex === 0}
                aria-label="Flashcard anterior"
              >
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                variant="outline"
                disabled={currentIndex === flashcards.length - 1}
                aria-label="Próximo flashcard"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default InteractiveFlashcard
