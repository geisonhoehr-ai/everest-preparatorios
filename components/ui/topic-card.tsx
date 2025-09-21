"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { User, Clock, BookOpen } from "lucide-react"

interface TopicCardProps {
  title: string
  description: string
  category: string
  categoryColor?: string
  status: 'completed' | 'in-progress' | 'not-started' | 'coming-soon'
  author?: string
  duration?: string
  totalLessons: number
  completedLessons: number
  progress: number
  onClick?: () => void
  className?: string
}

const statusConfig = {
  completed: {
    label: 'Concluído',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  },
  'in-progress': {
    label: 'Em Andamento',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
  },
  'not-started': {
    label: 'Não Iniciado',
    className: 'bg-muted text-muted-foreground'
  },
  'coming-soon': {
    label: 'Em Breve',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
  }
}

export const TopicCard = ({
  title,
  description,
  category,
  categoryColor = 'bg-orange-500',
  status,
  author,
  duration,
  totalLessons,
  completedLessons,
  progress,
  onClick,
  className
}: TopicCardProps) => {
  const currentStatus = statusConfig[status]

  return (
    <div 
      className={`bg-card border-border rounded-[2rem] p-6 border transition-all duration-300 h-[400px] flex flex-col cursor-pointer hover:scale-105 hover:shadow-xl ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className="text-xs px-3 py-1.5 rounded-full font-semibold text-white shadow-sm"
              style={{ 
                backgroundColor: categoryColor === 'bg-blue-500' ? 'rgb(139, 92, 246)' : 
                                              categoryColor === 'bg-green-500' ? 'rgb(34, 197, 94)' : 
                                              categoryColor === 'bg-orange-500' ? 'rgb(249, 115, 22)' : 
                                              categoryColor === 'bg-purple-500' ? 'rgb(139, 92, 246)' : 'rgb(139, 92, 246)'
              }}
            >
              {category}
            </span>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 min-h-0">
          <div>
            <h3 className="font-bold text-foreground text-xl mb-2 leading-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {author && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium">{author}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{duration}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span className="font-medium">{totalLessons} flashcards</span>
            </div>
          </div>
        </div>

        {/* Progress Section - Fixed at bottom */}
        <div className="space-y-3 mt-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-semibold">
                {completedLessons}/{totalLessons} flashcards
              </span>
              <span className="text-foreground font-bold text-lg">{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: progress === 100 
                    ? '#22c55e' 
                    : progress > 50 
                    ? '#f97316' 
                    : progress > 0 
                    ? '#eab308' 
                    : '#f97316'
                }}
              />
            </div>
          </div>

          {/* Action Button - Always at bottom */}
          {status !== 'coming-soon' && (
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-3 rounded-2xl shadow-lg transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              {status === 'completed' ? 'Continuar curso' : 'Iniciar curso'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}