"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  BrainCircuit, 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Star,
  Moon,
  Sun,
  Target,
  Clock,
  Award
} from "lucide-react"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

interface InteractiveQuizProps {
  title: string
  description: string
  questions: QuizQuestion[]
  accentColor: string
  badgeColor: string
  icon: React.ReactNode
}

export default function InteractiveQuiz({
  title,
  description,
  questions,
  accentColor,
  badgeColor,
  icon
}: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  // Carregar estado do cache
  useEffect(() => {
    const cached = localStorage.getItem(`quiz-${title}`)
    if (cached) {
      const data = JSON.parse(cached)
      setScore(data.score || 0)
      setUserAnswers(data.userAnswers || [])
      setCompleted(data.completed || false)
      setTimeSpent(data.timeSpent || 0)
    }
  }, [title])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && !completed) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, completed])

  // Salvar estado no cache
  const saveToCache = (newScore: number, newUserAnswers: string[], newCompleted: boolean, newTimeSpent: number) => {
    localStorage.setItem(`quiz-${title}`, JSON.stringify({
      score: newScore,
      userAnswers: newUserAnswers,
      completed: newCompleted,
      timeSpent: newTimeSpent,
      timestamp: Date.now()
    }))
  }

  const startQuiz = () => {
    setIsStarted(true)
    setCurrentIndex(0)
    setSelectedAnswer("")
    setScore(0)
    setUserAnswers([])
    setTimeSpent(0)
    setShowExplanation(false)
  }

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const newScore = isCorrect ? score + 1 : score
    const newUserAnswers = [...userAnswers, selectedAnswer]
    
    setScore(newScore)
    setUserAnswers(newUserAnswers)
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer("")
      setShowExplanation(false)
    } else {
      setCompleted(true)
      saveToCache(newScore, newUserAnswers, true, timeSpent)
    }
  }

  const resetQuiz = () => {
    setIsStarted(false)
    setCurrentIndex(0)
    setSelectedAnswer("")
    setScore(0)
    setCompleted(false)
    setUserAnswers([])
    setTimeSpent(0)
    setShowExplanation(false)
    localStorage.removeItem(`quiz-${title}`)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const currentQuestion = questions[currentIndex]
  const progress = isStarted ? ((currentIndex + 1) / questions.length) * 100 : 0
  const accuracy = completed ? Math.round((score / questions.length) * 100) : 0
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
            Quiz
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
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
              <BrainCircuit className="w-4 h-4" />
              <span>{questions.length} questões</span>
            </div>
            
            <Button 
              onClick={startQuiz}
              className={`w-full ${accentColor} text-white hover:opacity-90`}
            >
              <Play className="w-4 h-4 mr-2" />
              Começar Quiz
            </Button>
          </div>
        ) : !completed ? (
          <div className="space-y-4">
            {/* Progress and Timer */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Questão {currentIndex + 1} de {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
            </div>

            {/* Question */}
            <div className={`p-6 rounded-lg border-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-lg font-medium mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentQuestion.question}
              </p>
              
              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${index}`}
                      className={isDarkMode ? 'border-gray-600' : 'border-gray-300'}
                    />
                    <Label 
                      htmlFor={`option-${index}`}
                      className={`text-sm cursor-pointer ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={() => setShowExplanation(!showExplanation)}
                variant="outline"
                size="sm"
                disabled={!selectedAnswer}
              >
                {showExplanation ? 'Ocultar' : 'Ver'} Explicação
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className={`${accentColor} text-white`}
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Próxima
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Finalizar
                    <Trophy className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-blue-50'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                  <strong>Explicação:</strong> {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Trophy className={`w-12 h-12 ${accuracy >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Resultado Final</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Pontuação</p>
                  <p className="text-2xl font-bold">{score}/{questions.length}</p>
                </div>
                <div>
                  <p className="font-medium">Precisão</p>
                  <p className="text-2xl font-bold">{accuracy}%</p>
                </div>
                <div>
                  <p className="font-medium">Tempo</p>
                  <p className="text-lg font-bold">{formatTime(timeSpent)}</p>
                </div>
                <div>
                  <p className="font-medium">Velocidade</p>
                  <p className="text-lg font-bold">{Math.round(timeSpent / questions.length)}s/q</p>
                </div>
              </div>
            </div>

            <Button
              onClick={resetQuiz}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 