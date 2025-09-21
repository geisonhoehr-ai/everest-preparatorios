"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, RotateCcw, CheckCircle, XCircle } from "lucide-react"

interface FlashcardFlipProps {
  question: string
  answer: string
  className?: string
  onFlip?: (isShowingAnswer: boolean) => void
  onAnswer?: (isCorrect: boolean) => void
}

export function FlashcardFlip({ 
  question, 
  answer, 
  className,
  onFlip,
  onAnswer
}: FlashcardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleFlip = () => {
    if (isAnimating) return
    
    console.log('🔄 FlashcardFlip: handleFlip chamado, isFlipped atual:', isFlipped)
    
    setIsAnimating(true)
    setFeedback(null)
    setShowFeedback(false)
    
    setTimeout(() => {
      const newFlippedState = !isFlipped
      console.log('🔄 FlashcardFlip: Mudando para isFlipped:', newFlippedState)
      setIsFlipped(newFlippedState)
      onFlip?.(newFlippedState)
      setTimeout(() => setIsAnimating(false), 300)
    }, 150)
  }

  const handleReset = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setFeedback(null)
    setShowFeedback(false)
    
    setTimeout(() => {
      setIsFlipped(false)
      onFlip?.(false)
      setTimeout(() => setIsAnimating(false), 300)
    }, 150)
  }

  const handleAnswer = (isCorrect: boolean) => {
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    setShowFeedback(true)
    onAnswer?.(isCorrect)
    
    setTimeout(() => {
      setShowFeedback(false)
      setFeedback(null)
    }, 2000)
  }

  // Debug log para verificar o estado
  console.log('🎯 FlashcardFlip renderizando - isFlipped:', isFlipped, 'isAnimating:', isAnimating)

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      {/* Feedback Overlay */}
      {showFeedback && (
        <div className={cn(
          "absolute inset-0 z-50 flex items-center justify-center rounded-2xl transition-all duration-500",
          feedback === 'correct' 
            ? "bg-green-500/90 text-white" 
            : "bg-red-500/90 text-white"
        )}>
          <div className="text-center">
            {feedback === 'correct' ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-2 animate-bounce" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto mb-2 animate-bounce" />
            )}
            <p className="text-xl font-semibold">
              {feedback === 'correct' ? 'Correto!' : 'Incorreto!'}
            </p>
          </div>
        </div>
      )}

      {/* Card Container */}
      <div className="relative w-full h-96">
        {!isFlipped ? (
          /* Front Card (Question) */
          <div className="w-full h-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-500 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-gray-900/50 flex flex-col items-center justify-center p-8 text-center transition-all duration-500">
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500 dark:bg-blue-600 rounded-full mx-auto">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">
                Pergunta
              </h3>
              <p className="text-gray-800 dark:text-white text-xl leading-relaxed px-4 font-medium">
                {question}
              </p>
              <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                Pergunta
              </div>
            </div>
          </div>
        ) : (
          /* Back Card (Answer) */
          <div className="w-full h-full bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-500 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-gray-900/50 flex flex-col items-center justify-center p-8 text-center transition-all duration-500">
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full mx-auto">
                <EyeOff className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">
                Resposta
              </h3>
              <p className="text-gray-800 dark:text-white text-xl leading-relaxed px-4 font-medium">
                {answer}
              </p>
              <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                Resposta
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={handleFlip}
            disabled={isAnimating}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg",
              "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "focus:outline-none focus:ring-4 focus:ring-orange-300"
            )}
          >
            {isFlipped ? (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Ver Pergunta
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5 mr-2" />
                Ver Resposta
              </>
            )}
          </button>
          
          {isFlipped && (
            <button
              onClick={handleReset}
              disabled={isAnimating}
              className={cn(
                "px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg",
                "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "focus:outline-none focus:ring-4 focus:ring-gray-300"
              )}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Answer Feedback Buttons */}
        {isFlipped && (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={isAnimating || showFeedback}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg",
                "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "focus:outline-none focus:ring-4 focus:ring-green-300"
              )}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Correto
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={isAnimating || showFeedback}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg",
                "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                "focus:outline-none focus:ring-4 focus:ring-red-300"
              )}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Incorreto
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
