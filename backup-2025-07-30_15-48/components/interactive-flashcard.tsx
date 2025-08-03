"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, Play, RotateCcw, CheckCircle, XCircle, ArrowRight, Eye, EyeOff, Moon, Sun, Brain, Target, Trophy, Star
} from "lucide-react"
// @ts-ignore
import confetti from 'canvas-confetti'

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

export default function InteractiveFlashcard({
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

  useEffect(() => {
    const cached = localStorage.getItem(`flashcard-${title}`)
    if (cached) {
      const data = JSON.parse(cached)
      setScore(data.score || 0)
      setUserAnswers(data.userAnswers || {})
      setCompleted(data.completed || false)
    }
  }, [title])

  const saveToCache = (newScore: number, newUserAnswers: { [key: number]: boolean }, newCompleted: boolean) => {
    localStorage.setItem(`flashcard-${title}`, JSON.stringify({
      score: newScore,
      userAnswers: newUserAnswers,
      completed: newCompleted,
      timestamp: Date.now()
    }))
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
    })
  }

  const startSession = () => {
    setIsStarted(true)
    setCurrentIndex(0)
    setShowAnswer(false)
    setShowFeedback(false)
  }

  const handleAnswer = (isCorrect: boolean) => {
    setLastAnswerCorrect(isCorrect)
    setShowFeedback(true)
    
    if (isCorrect) {
      triggerConfetti()
    }

    const newUserAnswers = { ...userAnswers, [currentIndex]: isCorrect }
    const newScore = isCorrect ? score + 1 : score
    
    setUserAnswers(newUserAnswers)
    setScore(newScore)
    
    // Hide feedback after 1.5 seconds
    setTimeout(() => {
      setShowFeedback(false)
      
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        setCompleted(true)
        saveToCache(newScore, newUserAnswers, true)
      }
    }, 1500)
  }

  const resetSession = () => {
    setIsStarted(false)
    setCurrentIndex(0)
    setShowAnswer(false)
    setScore(0)
    setCompleted(false)
    setUserAnswers({})
    setShowFeedback(false)
    localStorage.removeItem(`flashcard-${title}`)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const currentFlashcard = flashcards[currentIndex]
  const progress = isStarted ? ((currentIndex + 1) / flashcards.length) * 100 : 0
  const accuracy = completed ? Math.round((score / flashcards.length) * 100) : 0

  const getFinalMessage = () => {
    if (accuracy === 100) {
      return {
        title: "🎉 Excelente! Você é um gênio!",
        message: "Parabéns! Você demonstrou conhecimento excepcional. Continue assim e você será aprovado no EAOF!",
        color: "text-green-600"
      }
    } else if (accuracy >= 80) {
      return {
        title: "🎯 Muito bem! Você está no caminho certo!",
        message: "Ótimo desempenho! Com mais estudo e nossa plataforma, você vai arrasar no EAOF!",
        color: "text-blue-600"
      }
    } else if (accuracy >= 60) {
      return {
        title: "👍 Bom trabalho! Mas ainda pode melhorar!",
        message: "Você tem potencial! Nossa plataforma vai te ajudar a chegar ao topo!",
        color: "text-yellow-600"
      }
    } else if (accuracy >= 40) {
      return {
        title: "📚 Precisa estudar mais!",
        message: "Não desanime! Nossa plataforma tem tudo que você precisa para passar no EAOF!",
        color: "text-orange-600"
      }
    } else {
      return {
        title: "🚨 URGENTE: Você precisa do nosso curso!",
        message: "Com esse resultado, você PRECISA do nosso curso extensivo! Não perca mais tempo, garanta sua vaga AGORA!",
        color: "text-red-600"
      }
    }
  }

  const finalMessage = getFinalMessage()

  return (
    <Card className={`w-full max-w-md mx-auto transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${badgeColor} text-white`}>
            {icon}
            Tópico
          </Badge>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        <CardTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </CardTitle>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isStarted ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Brain className="w-4 h-4" />
              <span>{flashcards.length} flashcards</span>
            </div>
            <Button onClick={startSession} className={`w-full ${accentColor} text-white hover:opacity-90`}>
              <Play className="w-4 h-4 mr-2" />
              Começar
            </Button>
          </div>
        ) : !completed ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Feedback overlay */}
            {showFeedback && (
              <div className={`fixed inset-0 flex items-center justify-center z-50 ${
                lastAnswerCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <div className={`p-8 rounded-lg text-center ${
                  lastAnswerCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {lastAnswerCorrect ? (
                    <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  ) : (
                    <XCircle className="w-16 h-16 mx-auto mb-4" />
                  )}
                  <h3 className="text-2xl font-bold mb-2">
                    {lastAnswerCorrect ? 'Correto!' : 'Incorreto!'}
                  </h3>
                  <p className="text-lg">
                    {lastAnswerCorrect ? 'Parabéns!' : 'Continue tentando!'}
                  </p>
                </div>
              </div>
            )}
            
            <div className={`p-6 rounded-lg border-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
            } min-h-[120px] flex items-center justify-center`}>
              <div className="text-center">
                <p className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {showAnswer ? currentFlashcard.answer : currentFlashcard.question}
                </p>
                <Button variant="outline" onClick={() => setShowAnswer(!showAnswer)} className="text-sm">
                  {showAnswer ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showAnswer ? 'Ocultar Resposta' : 'Ver Resposta'}
                </Button>
              </div>
            </div>
            {showAnswer && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleAnswer(false)} 
                  variant="outline" 
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Errei
                </Button>
                <Button 
                  onClick={() => handleAnswer(true)} 
                  className={`flex-1 ${accentColor} text-white hover:opacity-90`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acertei
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Trophy className={`w-12 h-12 ${accuracy >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-2 ${finalMessage.color}`}>
                {finalMessage.title}
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {finalMessage.message}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Pontuação</p>
                  <p className="text-2xl font-bold">{score}/{flashcards.length}</p>
                </div>
                <div>
                  <p className="font-medium">Precisão</p>
                  <p className="text-2xl font-bold">{accuracy}%</p>
                </div>
              </div>
            </div>
            <Button onClick={resetSession} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 