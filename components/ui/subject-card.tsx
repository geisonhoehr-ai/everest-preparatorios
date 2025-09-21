"use client"

import { ChevronRight, User, Clock, BookOpen } from "lucide-react"

interface SubjectCardProps {
  title: string
  subtitle: string
  completedCount: number
  totalCount: number
  averageProgress: number
  lessonsCompleted: number
  includedItems: Array<{
    title: string
    progress: number
  }>
  overallProgress: number
  onClick?: () => void
  className?: string
}

export const SubjectCard = ({
  title,
  subtitle,
  completedCount,
  totalCount,
  averageProgress,
  lessonsCompleted,
  includedItems,
  overallProgress,
  onClick,
  className
}: SubjectCardProps) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-3xl p-6 border border-neutral-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-orange-300 dark:hover:border-orange-500 min-h-[400px] flex flex-col ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full space-y-5">
        {/* Header with Tags */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold text-white bg-orange-500">
              {title}
            </span>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
            overallProgress === 100 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : overallProgress > 0 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {overallProgress === 100 ? 'Concluído' : overallProgress > 0 ? 'Em Andamento' : 'Não Iniciado'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <User className="h-3 w-3" />
              <span className="font-medium">Prof. Maria Silva</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Duração não informada</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <BookOpen className="h-3 w-3" />
              <span className="font-medium">{totalCount} flashcards</span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                {lessonsCompleted}/{totalCount} flashcards
              </span>
              <span className="text-gray-900 dark:text-white font-bold text-lg">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${overallProgress}%`,
                  background: overallProgress === 100 
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                    : overallProgress > 50 
                    ? 'linear-gradient(90deg, #f97316, #ea580c)' 
                    : overallProgress > 0 
                    ? 'linear-gradient(90deg, #eab308, #ca8a04)' 
                    : 'linear-gradient(90deg, #3b82f6, #2563eb)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {overallProgress > 0 && (
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white text-sm font-semibold py-3 rounded-xl shadow-lg transition-all duration-200">
            {overallProgress === 100 ? 'Continuar curso' : 'Iniciar curso'}
          </button>
        )}
      </div>
    </div>
  )
}
