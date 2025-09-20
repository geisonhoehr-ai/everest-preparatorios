"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StandardCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function StandardCard({ children, className, onClick }: StandardCardProps) {
  return (
    <div 
      className={cn(
        "relative h-[420px] w-full max-w-[300px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px] xl:max-w-[380px] 2xl:max-w-[380px] mx-auto cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="absolute bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 h-[420px] w-full rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl border flex flex-col cursor-pointer"
           style={{
             transformOrigin: "center top",
             boxShadow: "rgba(0, 0, 0, 0.25) 0px 25px 50px -12px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px",
             top: "0px",
             zIndex: 3,
             transform: "none"
           }}>
        {children}
      </div>
    </div>
  )
}

interface CourseCardProps {
  title: string
  subtitle: string
  metrics: {
    completed: number
    averageProgress: number
    lessonsDone: number
  }
  courses: Array<{
    name: string
    progress: number
  }>
  overallProgress: number
  onClick?: () => void
}

export function CourseCard({ 
  title, 
  subtitle, 
  metrics, 
  courses, 
  overallProgress, 
  onClick 
}: CourseCardProps) {
  return (
    <StandardCard onClick={onClick}>
      <div className="font-normal text-gray-700 dark:text-neutral-200 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg h-12 flex items-center leading-tight">
                  <span className="line-clamp-2">{title}</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              </div>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="lucide lucide-chevron-right h-5 w-5 text-gray-400"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {metrics.completed}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Concluídos
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {metrics.averageProgress}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Progresso Médio
              </div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {metrics.lessonsDone}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Aulas Feitas
              </div>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cursos inclusos:
            </p>
            <div className="space-y-1 h-[90px] flex flex-col justify-start">
              {courses.slice(0, 3).map((course, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {course.name}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    course.progress === 100 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : course.progress > 0
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  )}>
                    {course.progress}%
                  </span>
                </div>
              ))}
              {courses.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-auto">
                  +{courses.length - 3} mais
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Progresso Geral
              </span>
              <span className="text-gray-900 dark:text-white font-bold">
                {overallProgress}%
              </span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full shadow-sm" 
                style={{
                  backgroundColor: "#f97316",
                  width: `${overallProgress}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </StandardCard>
  )
}

interface MetricCardProps {
  title: string
  value: string | number | ReactNode
  subtitle?: string
  icon?: ReactNode
  className?: string
}

export function MetricCard({ title, value, subtitle, icon, className }: MetricCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
