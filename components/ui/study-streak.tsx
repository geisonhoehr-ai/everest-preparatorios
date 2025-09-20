"use client"

import { Flame } from "lucide-react"

interface StudyStreakProps {
  days: number
  maxDays?: number
}

export function StudyStreak({ days, maxDays = 7 }: StudyStreakProps) {
  const renderDots = () => {
    const dots = []
    for (let i = 0; i < maxDays; i++) {
      const isActive = i < days
      dots.push(
        <div
          key={i}
          className={`w-1 h-1 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          style={{ transform: 'none' }}
        />
      )
    }
    return dots
  }

  return (
    <div className="flex flex-1 w-full h-full items-center justify-center p-1">
      <div className="flex items-center gap-2">
        <div style={{ transform: 'none' }}>
          <Flame className="h-6 w-6 text-orange-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white" style={{ opacity: 1, transform: 'none' }}>
            {days} dias
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400" style={{ opacity: 0.8 }}>
            Sequência de estudos
          </p>
          <div className="flex gap-1 mt-1 justify-center">
            {renderDots()}
          </div>
        </div>
      </div>
    </div>
  )
}
