"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Shield
} from "lucide-react"
import { useAuth } from "@/context/auth-context-custom"
import { RoleGuard } from "@/components/role-guard"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalFlashcards: 0,
    totalQuestions: 0,
    totalUsers: 0,
    totalTopics: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Aqui você carregaria estatísticas reais do banco de dados
      // Por enquanto, vamos usar dados mockados
      setStats({
        totalFlashcards: 150,
        totalQuestions: 75,
        totalUsers: 25,
        totalTopics: 12
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const adminSections = [
    {
      title: "Flashcards",
      description: "Gerencie flashcards por matéria e tópico",
      icon: BookOpen,
      href: "/admin/flashcards",
      color: "orange",
      stats: stats.totalFlashcards,
      statLabel: "Flashcards"
    },
    {
      title: "Quizzes",
      description: "Crie e gerencie questões de quiz",
      icon: Brain,
      href: "/admin/quizzes",
      color: "blue",
      stats: stats.totalQuestions,
      statLabel: "Questões"
    },
    {
      title: "Calendário",
      description: "Gerencie eventos e cronogramas",
      icon: Calendar,
      href: "/admin/calendar",
      color: "green",
      stats: 8,
      statLabel: "Eventos"
    },
    {
      title: "Usuários",
      description: "Gerencie usuários e permissões",
      icon: Users,
      href: "/admin/users",
      color: "purple",
      stats: stats.totalUsers,
      statLabel: "Usuários"
    },
    {
      title: "Redações",
      description: "Gerencie temas e correções de redação",
      icon: FileText,
      href: "/admin/essays",
      color: "pink",
      stats: 45,
      statLabel: "Redações"
    },
    {
      title: "Estatísticas",
      description: "Visualize dados e relatórios",
      icon: BarChart3,
      href: "/admin/stats",
      color: "indigo",
      stats: "📊",
      statLabel: "Relatórios"
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      orange: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700",
      blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700",
      green: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700",
      purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700",
      pink: "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-700",
      indigo: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700"
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.orange
  }

  const quickActions = [
    {
      title: "Ver Ranking",
      description: "Acompanhe o desempenho dos alunos",
      icon: TrendingUp,
      href: "/ranking",
      color: "yellow"
    },
    {
      title: "Suporte",
      description: "Gerencie mensagens de suporte",
      icon: Settings,
      href: "/suporte",
      color: "gray"
    }
  ]

  return (
    <RoleGuard allowedRoles={["teacher", "administrator"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todo o conteúdo da plataforma
            </p>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.totalFlashcards}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flashcards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questões</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Usuários</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.totalTopics}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tópicos</div>
            </CardContent>
          </Card>
        </div>

        {/* Seções Administrativas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gerenciamento de Conteúdo
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => {
              const Icon = section.icon
              return (
                <Card 
                  key={section.title}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(section.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getColorClasses(section.color)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">
                        {section.stats} {section.statLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {section.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(section.href)}
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ações Rápidas
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card 
                  key={action.title}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informações da Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-gray-500">Usuário Logado</Label>
                <p className="text-gray-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Função</Label>
                <Badge className="ml-2">
                  {profile?.role === 'administrator' ? 'Administrador' : 'Professor'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Último Acesso</Label>
                <p className="text-gray-900 dark:text-white">
                  {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}