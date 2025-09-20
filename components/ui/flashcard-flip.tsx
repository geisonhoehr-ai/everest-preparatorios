"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, RotateCcw } from "lucide-react"

interface FlashcardFlipProps {
  question: string
  answer: string
  className?: string
  onFlip?: (isShowingAnswer: boolean) => void
}

export function FlashcardFlip({ 
  question, 
  answer, 
  className,
  onFlip 
}: FlashcardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFlip = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setIsFlipped(!isFlipped)
      onFlip?.(!isFlipped)
      setTimeout(() => setIsAnimating(false), 150)
    }, 150)
  }

  const handleReset = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setIsFlipped(false)
      onFlip?.(false)
      setTimeout(() => setIsAnimating(false), 150)
    }, 150)
  }

  return (
    <div className={cn("relative w-full h-80 perspective-1000", className)}>
      {/* Card Container */}
      <div 
        className={cn(
          "relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front Card (Question) */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-200 dark:border-blue-500/50 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-blue-900/20 flex flex-col items-center justify-center p-8 text-center",
            isFlipped ? "rotate-y-180" : ""
          )}
          style={{
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 dark:bg-blue-600 rounded-full mx-auto">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">
              Pergunta
            </h3>
            <p className="text-gray-800 dark:text-gray-200 text-xl leading-relaxed">
              {question}
            </p>
          </div>
        </div>

        {/* Back Card (Answer) */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 border-2 border-green-200 dark:border-green-500/50 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-green-900/20 flex flex-col items-center justify-center p-8 text-center rotate-y-180",
            isFlipped ? "" : "rotate-y-180"
          )}
          style={{
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full mx-auto">
              <EyeOff className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">
              Resposta
            </h3>
            <p className="text-gray-800 dark:text-gray-200 text-xl leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
        <button
          onClick={handleFlip}
          disabled={isAnimating}
          className={cn(
            "px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg",
            "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
            "dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800",
            "dark:shadow-orange-900/30 dark:hover:shadow-orange-900/50"
          )}
        >
          {isFlipped ? "Ver Pergunta" : "Ver Resposta"}
        </button>
        
        {isFlipped && (
          <button
            onClick={handleReset}
            disabled={isAnimating}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg",
              "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
              "dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-800",
              "dark:shadow-gray-900/30 dark:hover:shadow-gray-900/50"
            )}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className={cn(
          "absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-pulse",
          isFlipped && "animate-bounce"
        )} />
        <div className={cn(
          "absolute bottom-20 left-6 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse",
          isFlipped && "animate-ping"
        )} />
        <div className={cn(
          "absolute top-20 left-8 w-1.5 h-1.5 bg-green-400 rounded-full opacity-50 animate-pulse",
          isFlipped && "animate-bounce"
        )} />
      </div>
    </div>
  )
}
