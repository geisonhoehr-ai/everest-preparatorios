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
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  },
  'coming-soon': {
    label: 'Em Breve',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
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
      className={`bg-white dark:bg-gray-900 rounded-3xl p-6 border border-neutral-200 dark:border-gray-700 transition-all duration-300 min-h-[300px] flex flex-col relative hover:shadow-xl cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:border-orange-300 dark:hover:border-orange-600 ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className="text-xs px-3 py-1.5 rounded-full font-semibold text-white shadow-sm"
              style={{ backgroundColor: categoryColor === 'bg-blue-500' ? 'rgb(59, 130, 246)' : 
                                              categoryColor === 'bg-green-500' ? 'rgb(34, 197, 94)' : 
                                              categoryColor === 'bg-orange-500' ? 'rgb(249, 115, 22)' : 
                                              categoryColor === 'bg-purple-500' ? 'rgb(139, 92, 246)' : 'rgb(59, 130, 246)' }}
            >
              {category}
            </span>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {author && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3 w-3" />
                <span className="font-medium">{author}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{duration}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <BookOpen className="h-3 w-3" />
              <span className="font-medium">{totalLessons} aulas</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                {completedLessons}/{totalLessons} aulas
              </span>
              <span className="text-gray-900 dark:text-white font-bold text-lg">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: progress === 100 
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                    : progress > 50 
                    ? 'linear-gradient(90deg, #f97316, #ea580c)' 
                    : progress > 0 
                    ? 'linear-gradient(90deg, #eab308, #ca8a04)' 
                    : 'linear-gradient(90deg, #3b82f6, #2563eb)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {status !== 'coming-soon' && (
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
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
  )
}
