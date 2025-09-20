"use client"

import { ChevronRight } from "lucide-react"

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
      className={`bg-white dark:bg-gray-900 rounded-3xl p-6 border border-neutral-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-orange-300 dark:hover:border-orange-600 h-[420px] flex flex-col ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-1 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{completedCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Concluídos</div>
          </div>
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{averageProgress}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Progresso Médio</div>
          </div>
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{lessonsCompleted}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Aulas Feitas</div>
          </div>
        </div>

        {/* Included Items */}
        <div className="mb-6 flex-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cursos inclusos:</p>
          <div className="space-y-2">
            {includedItems.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 truncate font-medium flex-1">{item.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ml-2 ${
                  item.progress === 100 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : item.progress > 0 
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {item.progress}%
                </span>
              </div>
            ))}
            {includedItems.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 font-medium">
                +{includedItems.length - 3} mais
              </div>
            )}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-semibold">Progresso Geral</span>
            <span className="text-gray-900 dark:text-white font-bold text-lg">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${overallProgress}%`,
                backgroundColor: overallProgress === 100 
                  ? '#22c55e'
                  : overallProgress > 0 
                  ? '#f97316'
                  : '#3b82f6'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
