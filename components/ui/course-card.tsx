"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Clock, User, BookOpen, ChevronRight } from "lucide-react"

interface CourseCardProps {
  title: string
  description?: string
  category: string
  categoryColor?: string
  status: 'completed' | 'in-progress' | 'not-started' | 'coming-soon'
  progress: number
  totalLessons: number
  completedLessons: number
  author?: string
  duration?: string
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
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  },
  'coming-soon': {
    label: 'Em Breve',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
  }
}

const categoryColors = {
  default: '#f97316', // orange-500
  'Do Zero ao SaaS': '#f97316',
  'Fundamentos 2.0': '#eab308', // yellow-500
  'Extras': '#f97316',
  'Cursor': '#0ea5e9', // sky-500
  'Simplificando o Técnico': '#f59e0b', // amber-500
  'Claude Code': '#f97316'
}

export function CourseCard({
  title,
  description,
  category,
  categoryColor,
  status,
  progress,
  totalLessons,
  completedLessons,
  author = 'Everest Preparatórios',
  duration = 'Duração não informada',
  onClick,
  className = ''
}: CourseCardProps) {
  const statusInfo = statusConfig[status]
  const color = categoryColor || categoryColors[category as keyof typeof categoryColors] || categoryColors.default
  
  const isDisabled = status === 'coming-soon'
  const buttonText = status === 'completed' ? 'Revisar curso' : 
                    status === 'in-progress' ? 'Continuar curso' : 
                    'Iniciar curso'

  return (
    <Card 
      className={`
        relative h-[420px] w-full max-w-[380px] mx-auto
        bg-card border-border rounded-3xl p-4 sm:p-5 md:p-6
        shadow-xl cursor-pointer transition-all duration-200
        hover:shadow-2xl flex flex-col overflow-hidden
        ${isDisabled ? 'opacity-60 cursor-not-allowed grayscale hover:grayscale-0' : ''}
        ${className}
      `}
      onClick={!isDisabled ? onClick : undefined}
    >
      {status === 'coming-soon' && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Em Breve
          </Badge>
        </div>
      )}

      <div className="flex flex-col h-full space-y-4">
        {/* Header com categoria e status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge 
              className="text-xs px-2 py-1 rounded-full font-medium text-white dark:text-black"
              style={{ backgroundColor: color }}
            >
              {category}
            </Badge>
          </div>
          <Badge className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-bold text-foreground text-lg mb-2 leading-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {description || 'Descrição não disponível'}
            </p>
          </div>

          {/* Informações do curso */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>{author}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{totalLessons} aulas</span>
            </div>
          </div>
        </div>

        {/* Footer com progresso */}
        <div className="mt-auto space-y-2 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              {completedLessons}/{totalLessons} aulas
            </span>
            <span className="text-foreground font-bold">
              {progress}%
            </span>
          </div>
          
          <Progress 
            value={progress} 
            variant={status === 'completed' ? 'success' : status === 'in-progress' ? 'warning' : 'gradient'}
            className="h-2 bg-muted"
          />
          
          {!isDisabled && (
            <div className="text-center pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Componente para grid de cursos
export function CourseGrid({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 ${className}`}>
      {children}
    </div>
  )
}
