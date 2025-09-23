"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context-custom"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/breadcrumb-nav"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Users, 
  FileText, 
  Brain, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Award,
  Calendar,
  Bookmark,
  MessageSquare,
  Zap
} from "lucide-react"
import { getDashboardStats } from "../../server-actions"

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("📊 [Dashboard] Carregando dados para:", user?.role, user?.id)

        const data = await getDashboardStats(user?.id, user?.role)
        console.log("📊 [Dashboard] Dados carregados:", data)
        
        setDashboardData(data)
      } catch (err) {
        console.error('❌ [Dashboard] Erro ao carregar dados:', err)
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id && user?.role) {
      loadDashboardData()
    }
  }, [user?.id, user?.role])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const getUserDisplayName = () => {
    if (user?.role === 'student') return "Estudante"
    if (user?.role === 'teacher') return "Professor"
    if (user?.role === 'administrator') return "Administrador"
    return "Usuário"
  }

  const getUserFirstName = () => {
    return user?.first_name || "Usuário"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 dark:border-orange-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <PageHeader
          title={`${getGreeting()}, ${getUserFirstName()}!`}
          description={`Bem-vindo ao seu painel de controle como ${getUserDisplayName()}`}
          breadcrumbItems={[
            { label: "Dashboard", current: true }
          ]}
        />
        <div className="mt-4">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Começar aprendizado
          </Button>
        </div>
      </div>

      {/* Dashboard Content based on user role */}
      <div className="flex-1">
        {dashboardData?.userType === 'student' && <StudentDashboard data={dashboardData} />}
        {dashboardData?.userType === 'teacher' && <TeacherDashboard data={dashboardData} />}
        {dashboardData?.userType === 'admin' && <AdminDashboard data={dashboardData} />}
        {dashboardData?.userType === 'default' && <DefaultDashboard data={dashboardData} />}
      </div>
    </div>
  )
}

// Student Dashboard Component
function StudentDashboard({ data }: { data: any }) {
  const { stats, recentActivity } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Progresso em Flashcards */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Flashcards</h3>
          </div>
          <Badge variant="secondary">{stats.totalFlashcardsStudied}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Flashcards estudados
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-foreground font-medium">
              {Math.min(100, Math.round((stats.totalFlashcardsStudied / 784) * 100))}%
            </span>
          </div>
          <Progress 
            value={Math.min(100, Math.round((stats.totalFlashcardsStudied / 784) * 100))} 
            className="h-2"
          />
        </div>
      </Card>

      {/* Pontuação Total */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Pontuação</h3>
          </div>
          <Badge variant="secondary">{stats.totalScore}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Pontos acumulados
        </p>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-foreground">
            Continue estudando para ganhar mais pontos!
          </span>
        </div>
      </Card>

      {/* Streak de Atividade */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Sequência</h3>
          </div>
          <Badge variant="secondary">{stats.currentStreak} dias</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Dias consecutivos de atividade
        </p>
        <div className="flex space-x-1">
          {stats.activityStreak?.map((active: boolean, index: number) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                active ? 'bg-orange-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Redações */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Redações</h3>
          </div>
          <div className="flex space-x-1">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {stats.completedEssays}
            </Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              {stats.pendingEssays}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Concluídas / Pendentes
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de conclusão</span>
            <span className="text-foreground font-medium">
              {stats.completedEssays + stats.pendingEssays > 0 
                ? Math.round((stats.completedEssays / (stats.completedEssays + stats.pendingEssays)) * 100)
                : 0}%
            </span>
          </div>
          <Progress 
            value={stats.completedEssays + stats.pendingEssays > 0 
              ? Math.round((stats.completedEssays / (stats.completedEssays + stats.pendingEssays)) * 100)
              : 0} 
            className="h-2"
          />
        </div>
      </Card>

      {/* Aulas de Áudio */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Áudio</h3>
          </div>
          <Badge variant="secondary">{stats.completedAudioLessons}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Aulas de áudio concluídas
        </p>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-foreground">
            Mantenha o ritmo de estudo!
          </span>
        </div>
      </Card>

      {/* Quizzes */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Quizzes</h3>
          </div>
          <Badge variant="secondary">{stats.averageQuizScore}%</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Média de acertos
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className="text-foreground font-medium">
              {stats.averageQuizScore >= 70 ? 'Ótima' : stats.averageQuizScore >= 50 ? 'Boa' : 'Pode melhorar'}
            </span>
          </div>
          <Progress value={stats.averageQuizScore} className="h-2" />
        </div>
      </Card>
    </div>
  )
}

// Teacher Dashboard Component
function TeacherDashboard({ data }: { data: any }) {
  const { stats, recentActivity } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Conteúdo Criado */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Conteúdo</h3>
          </div>
          <Badge variant="secondary">{stats.subjectsCreated + stats.topicsCreated + stats.flashcardsCreated}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Total de conteúdo criado
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">{stats.subjectsCreated}</div>
            <div className="text-xs text-muted-foreground">Matérias</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{stats.topicsCreated}</div>
            <div className="text-xs text-muted-foreground">Tópicos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{stats.flashcardsCreated}</div>
            <div className="text-xs text-muted-foreground">Flashcards</div>
          </div>
        </div>
      </Card>

      {/* Redações para Corrigir */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Correções</h3>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {stats.essaysToCorrect}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Redações pendentes de correção
        </p>
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          <AlertCircle className="h-4 w-4 mr-2" />
          Ver Redações
        </Button>
      </Card>

      {/* Alunos */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Alunos</h3>
          </div>
          <Badge variant="secondary">{stats.totalStudents}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Total de alunos em suas turmas
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso médio</span>
            <span className="text-foreground font-medium">{stats.averageStudentProgress}%</span>
          </div>
          <Progress value={stats.averageStudentProgress} className="h-2" />
        </div>
      </Card>

      {/* Quizzes Criados */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Quizzes</h3>
          </div>
          <Badge variant="secondary">{stats.quizzesCreated}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Quizzes criados
        </p>
        <Button variant="outline" className="w-full">
          <Target className="h-4 w-4 mr-2" />
          Criar Novo Quiz
        </Button>
      </Card>

      {/* Estatísticas de Engajamento */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Engajamento</h3>
          </div>
          <Badge variant="secondary">{stats.averageStudentProgress}%</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Média de progresso dos alunos
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className="text-foreground font-medium">
              {stats.averageStudentProgress >= 70 ? 'Excelente' : stats.averageStudentProgress >= 50 ? 'Boa' : 'Pode melhorar'}
            </span>
          </div>
          <Progress value={stats.averageStudentProgress} className="h-2" />
        </div>
      </Card>

      {/* Ações Rápidas */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Ações</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ações rápidas disponíveis
        </p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Brain className="h-4 w-4 mr-2" />
            Criar Flashcard
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-2" />
            Nova Matéria
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Admin Dashboard Component
function AdminDashboard({ data }: { data: any }) {
  const { stats, recentActivity } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Usuários */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Usuários</h3>
          </div>
          <Badge variant="secondary">{stats.totalUsers}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Total de usuários na plataforma
        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">{stats.totalStudents}</div>
            <div className="text-xs text-muted-foreground">Alunos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{stats.totalTeachers}</div>
            <div className="text-xs text-muted-foreground">Professores</div>
          </div>
        </div>
      </Card>

      {/* Conteúdo */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Conteúdo</h3>
          </div>
          <Badge variant="secondary">{stats.totalSubjects + stats.totalFlashcards + stats.totalQuizzes}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Total de conteúdo na plataforma
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">{stats.totalSubjects}</div>
            <div className="text-xs text-muted-foreground">Matérias</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{stats.totalFlashcards}</div>
            <div className="text-xs text-muted-foreground">Flashcards</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{stats.totalQuizzes}</div>
            <div className="text-xs text-muted-foreground">Quizzes</div>
          </div>
        </div>
      </Card>

      {/* Estatísticas Gerais */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Atividade</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Atividade recente na plataforma
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tentativas de quiz</span>
            <span className="text-foreground font-medium">{recentActivity.quizAttempts?.length || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pontuações registradas</span>
            <span className="text-foreground font-medium">{recentActivity.scores?.length || 0}</span>
          </div>
        </div>
      </Card>

      {/* Ações Administrativas */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Administração</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ferramentas administrativas
        </p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Gerenciar Usuários
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Default Dashboard Component
function DefaultDashboard({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Bem-vindo!</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Configure seu perfil para ver estatísticas personalizadas
        </p>
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          <BookOpen className="h-4 w-4 mr-2" />
          Começar
        </Button>
      </Card>
    </div>
  )
}