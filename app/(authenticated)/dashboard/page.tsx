"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context-custom"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { getTotalUsers, getTotalContent, getTotalTests, getUserRanking } from "../../server-actions"
import { CourseProgressCard } from "@/components/dashboard/course-progress-card"
import { ActivityStreakCard } from "@/components/dashboard/activity-streak-card"
import { PlatformMetricsCard } from "@/components/dashboard/platform-metrics-card"
import { WeeklyGoalsCard } from "@/components/dashboard/weekly-goals-card"
import { NextActionCard } from "@/components/dashboard/next-action-card"
import { CommunityInteractionsCard } from "@/components/dashboard/community-interactions-card"

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    totalTests: 0,
    userRanking: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggleMode, setToggleMode] = useState<'cursos' | 'comunidade'>('cursos')

  // Dados para os cards baseados na imagem atual
  const dashboardData = {
    courseProgress: {
      courses: [
        { name: "Do Zero ao SaaS 01: Autenticação, Banco de Dados e MCP", progress: 100, completed: true },
        { name: "Do Zero ao SaaS 02: Como criar um bom design?", progress: 100, completed: true },
        { name: "Do Zero ao SaaS 01: Primeiros Passos", progress: 100, completed: true },
        { name: "Aulas Extras", progress: 25, completed: false }
      ]
    },
    activityStreak: {
      currentStreak: 2,
      longestStreak: 15,
      weeklyActivities: [false, false, false, false, false, true, true]
    },
    platformMetrics: {
      totalUsers: stats.totalUsers || 1234,
      totalContent: stats.totalContent || 456,
      quizzesCompleted: stats.totalTests || 7890,
      userRanking: stats.userRanking || 5
    },
    weeklyGoals: {
      goals: [
        { id: "1", description: "Revisar 5 flashcards pendentes", completed: false, priority: 'high' as const },
        { id: "2", description: "Criar 1 novo quiz para módulo X", completed: false, priority: 'medium' as const },
        { id: "3", description: "Responder a 3 dúvidas na comunidade", completed: false, priority: 'medium' as const },
        { id: "4", description: "Concluir módulo 'Design de UI'", completed: false, priority: 'low' as const }
      ],
      completedCount: 0,
      totalCount: 4
    },
    nextAction: {
      type: 'review' as const,
      title: "Revisar Flashcards",
      description: "Conceitos de Banco de Dados",
      priority: 'high' as const,
      estimatedTime: 15,
      actionUrl: "/flashcards"
    },
    communityInteractions: {
      interactions: [
        {
          id: "1",
          type: 'question' as const,
          title: "Dúvida de Aluno",
          description: "Como funciona o RLS no Supabase?",
          priority: 'high' as const,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'pending' as const,
          url: "/community/questions/1"
        },
        {
          id: "2",
          type: 'review' as const,
          title: "Novo Flashcard para aprovação",
          description: "Tipos de Joins SQL",
          priority: 'medium' as const,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'pending' as const,
          url: "/flashcards/review/2"
        },
        {
          id: "3",
          type: 'comment' as const,
          title: "Comentário em sua aula",
          description: "Ótima explicação!",
          priority: 'low' as const,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'completed' as const,
          url: "/community/comments/3"
        }
      ]
    }
  }

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [totalUsers, totalContent, totalTests, userRanking] = await Promise.all([
          getTotalUsers(),
          getTotalContent(),
          getTotalTests(),
          getUserRanking(user?.id || '')
        ])

        setStats({
          totalUsers: totalUsers?.count || 0,
          totalContent: totalContent?.count || 0,
          totalTests: totalTests?.count || 0,
          userRanking: typeof userRanking?.position === 'number' ? userRanking.position : 0
        })
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
        setError('Erro ao carregar estatísticas')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Manter estrutura atual */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getGreeting()}, Professor!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Continue seu aprendizado onde parou
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Entrou agora? Aqui o seu guia.
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${
              toggleMode === 'cursos' 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Cursos
            </span>
            <button
              onClick={() => setToggleMode(toggleMode === 'cursos' ? 'comunidade' : 'cursos')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-800"
            >
              <div 
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
                  toggleMode === 'comunidade' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${
              toggleMode === 'comunidade' 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Comunidade
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Cards - Estilo Jason */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Linha 1: Foco no Professor */}
          <CourseProgressCard data={dashboardData.courseProgress} />
          <ActivityStreakCard data={dashboardData.activityStreak} />
          <WeeklyGoalsCard data={dashboardData.weeklyGoals} />
          
          {/* Linha 2: Gestão da Plataforma */}
          <PlatformMetricsCard data={dashboardData.platformMetrics} />
          <NextActionCard data={dashboardData.nextAction} />
          <CommunityInteractionsCard data={dashboardData.communityInteractions} />
          
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}