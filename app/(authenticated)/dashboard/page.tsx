"use client"

import { useState, useEffect } from "react"
import { useRequireAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, BookOpen, Trophy, Loader2 } from "lucide-react"
import ProgressWidget from "@/components/progress-widget"
import { getTotalUsers, getTotalContent, getTotalTests, getUserRanking } from "@/server-actions"

export default function DashboardPage() {
  const { user, profile } = useRequireAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    totalTests: 0,
    userRanking: 'N/A'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getWelcomeMessage = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Bem-vindo, Administrador!'
      case 'teacher':
        return 'Bem-vindo, Professor!'
      case 'student':
        return 'Bem-vindo, Estudante!'
      default:
        return 'Bem-vindo ao Everest Preparatórios!'
    }
  }

  const getRoleDescription = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Gerencie toda a plataforma e usuários'
      case 'teacher':
        return 'Gerencie suas turmas e conteúdos'
      case 'student':
        return 'Estude e pratique para seus objetivos'
      default:
        return 'Acesse todas as funcionalidades da plataforma'
    }
  }

  useEffect(() => {
    loadDashboardStats()
  }, [user?.id])

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [usersResult, contentResult, testsResult, rankingResult] = await Promise.all([
        getTotalUsers(),
        getTotalContent(),
        getTotalTests(),
        user?.id ? getUserRanking(user.id) : Promise.resolve({ position: 'N/A' })
      ])
      
      setStats({
        totalUsers: usersResult.count,
        totalContent: contentResult.count,
        totalTests: testsResult.count,
        userRanking: rankingResult.position
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
        <p className="text-muted-foreground">{getRoleDescription()}</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários cadastrados
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conteúdos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalContent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Flashcards, quizzes e cursos
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provas Realizadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalTests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Tentativas de quiz
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.userRanking === 'N/A' ? 'N/A' : `#${stats.userRanking}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua posição atual
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Widget de Progresso para Estudantes */}
      {profile?.role === 'student' && (
        <ProgressWidget />
      )}

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Detalhes da sua conta no Everest Preparatórios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-sm">{profile?.display_name || 'Não definido'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Conta</label>
              <p className="text-sm capitalize">{profile?.role || 'Não definido'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
              <p className="text-sm">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                  : 'Não disponível'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
