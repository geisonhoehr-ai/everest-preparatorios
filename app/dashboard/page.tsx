'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Brain, 
  Zap,
  Sword,
  Shield,
  Scroll,
  Gem,
  CrownIcon,
  Flame,
  Star,
  Award,
  Clock,
  Calendar,
  BarChart3,
  Users,
  Medal,
  Trophy as TrophyIcon,
  FileText,
  CheckCircle,
  Plus,
  GraduationCap,
  BookText,
  PlayCircle
} from 'lucide-react'
import { 
  getRank, 
  getNextRankInfo, 
  getRankProgress, 
  getAllLeagues 
} from '@/lib/ranking'
import { 
  getUserGamificationStats, 
  getAvailableAchievements, 
  getUserAchievementProgress,
  checkAndUnlockAchievements,
  syncExistingData,
  updateUserStreak
} from '@/lib/gamification-actions'
import { useAuth } from '@/hooks/use-auth'
import { DashboardShell } from '@/components/dashboard-shell'

interface UserStats {
  totalScore: number
  currentLevel: number
  currentRank: string
  currentLeague: string
  totalXP: number
  flashcardsCompleted: number
  quizzesCompleted: number
  lessonsCompleted: number
  currentStreak: number
  longestStreak: number
  achievementsUnlocked: number
  totalStudyTime: number
}

interface Achievement {
  id: number
  achievement_key: string
  title: string
  description: string
  icon: string
  category: string
  xp_reward: number
  score_reward: number
  requirements: any
  is_active: boolean
}

interface UserAchievementProgress {
  id: number
  user_uuid: string
  achievement_key: string
  current_progress: number
  required_progress: number
  is_unlocked: boolean
  unlocked_at: string | null
}

export default function DashboardPage() {
  const { user, role } = useAuth()
  
  // DEBUG: Mostrar informações do usuário
  console.log('🔍 [DASHBOARD DEBUG] User:', user)
  console.log('🔍 [DASHBOARD DEBUG] User role:', role)
  console.log('🔍 [DASHBOARD DEBUG] User metadata:', user?.user_metadata)
  
  // TEMPORÁRIO: Para teste, permitir forçar o role via URL
  const [forcedRole, setForcedRole] = useState<string | null>(null)
  
  useEffect(() => {
    // Verificar se há um parâmetro de role na URL
    const urlParams = new URLSearchParams(window.location.search)
    const roleParam = urlParams.get('role')
    if (roleParam) {
      setForcedRole(roleParam)
      console.log('🔧 [DASHBOARD] Role forçado via URL:', roleParam)
    }
  }, [])
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 0,
    currentLevel: 1,
    currentRank: 'Novato da Guilda',
    currentLeague: 'Aprendizes',
    totalXP: 0,
    flashcardsCompleted: 0,
    quizzesCompleted: 0,
    lessonsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievementsUnlocked: 0,
    totalStudyTime: 0
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievementProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [recentUnlocked, setRecentUnlocked] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Carrega dados de gamificação
      const [stats, allAchievements, userProgress] = await Promise.all([
        getUserGamificationStats(user.id),
        getAvailableAchievements(),
        getUserAchievementProgress(user.id)
      ])

      if (stats) {
        setUserStats({
          totalScore: stats.total_score,
          currentLevel: stats.current_level,
          currentRank: stats.current_rank,
          currentLeague: stats.current_league,
          totalXP: stats.total_xp,
          flashcardsCompleted: stats.flashcards_completed,
          quizzesCompleted: stats.quizzes_completed,
          lessonsCompleted: stats.lessons_completed,
          currentStreak: stats.current_streak,
          longestStreak: stats.longest_streak,
          achievementsUnlocked: stats.achievements_unlocked,
          totalStudyTime: stats.total_study_time
        })
      }

      setAchievements(allAchievements)
      setUserAchievements(userProgress)

      // Sincroniza dados existentes na primeira vez
      if (stats && stats.total_score === 0) {
        await syncExistingData(user.id)
        // Recarrega os dados
        const updatedStats = await getUserGamificationStats(user.id)
        if (updatedStats) {
          setUserStats({
            totalScore: updatedStats.total_score,
            currentLevel: updatedStats.current_level,
            currentRank: updatedStats.current_rank,
            currentLeague: updatedStats.current_league,
            totalXP: updatedStats.total_xp,
            flashcardsCompleted: updatedStats.flashcards_completed,
            quizzesCompleted: updatedStats.quizzes_completed,
            lessonsCompleted: updatedStats.lessons_completed,
            currentStreak: updatedStats.current_streak,
            longestStreak: updatedStats.longest_streak,
            achievementsUnlocked: updatedStats.achievements_unlocked,
            totalStudyTime: updatedStats.total_study_time
          })
        }
      }

      // Atualiza streak
      await updateUserStreak(user.id)

      // Verifica conquistas
      const unlocked = await checkAndUnlockAchievements(user.id)
      if (unlocked.length > 0) {
        setRecentUnlocked(unlocked)
        // Recarrega dados após desbloquear conquistas
        setTimeout(() => {
          loadDashboardData()
        }, 2000)
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLeagueColor = (league: string) => {
    switch (league) {
      case 'Aprendizes': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Aventureiros': return 'bg-green-100 text-green-800 border-green-200'
      case 'Heróis': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Mestres': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Lendas': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRankProgressValue = () => {
    const progress = getRankProgress(userStats.totalScore)
    return progress.progress
  }

  const getAchievementProgress = (achievementKey: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_key === achievementKey)
    if (!userAchievement) return 0
    
    return Math.min(100, (userAchievement.current_progress / userAchievement.required_progress) * 100)
  }

  const isAchievementUnlocked = (achievementKey: string) => {
    return userAchievements.some(ua => ua.achievement_key === achievementKey && ua.is_unlocked)
  }

  // Determinar o tipo de usuário (com fallback para role forçado)
  const effectiveRole = forcedRole || role
  const isTeacher = effectiveRole === 'teacher'
  const isAdmin = effectiveRole === 'admin'
  const isStudent = effectiveRole === 'student' || !effectiveRole

  // DEBUG: Mostrar os flags de role
  console.log('🔍 [DASHBOARD DEBUG] Flags:', { isTeacher, isAdmin, isStudent, effectiveRole, forcedRole, originalRole: role })

  // Renderizar dashboard baseado no role
  if (isTeacher) {
    console.log('👨‍🏫 [DASHBOARD] Renderizando dashboard do professor')
    return (
      <DashboardShell>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header do Professor */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              👨‍🏫 Painel do Professor
            </h1>
            <p className="text-xl text-muted-foreground">
              Bem-vindo, Professor {user?.user_metadata?.full_name || 'Tiago Costa'}! 
              Gerencie seus alunos e acompanhe o progresso da plataforma.
            </p>
            {/* DEBUG: Mostrar role atual */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>DEBUG:</strong> Role detectado: {effectiveRole || 'Nenhum'} | 
                Email: {user?.email || 'Nenhum'} | 
                Role forçado: {forcedRole ? 'Sim' : 'Não'}
              </p>
              {/* Botões para testar diferentes roles */}
              <div className="flex gap-2 mt-2 justify-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setForcedRole('teacher')}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  Forçar Professor
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setForcedRole('admin')}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Forçar Admin
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setForcedRole('student')}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  Forçar Aluno
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setForcedRole(null)}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Estatísticas Principais do Professor */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">247</div>
                <p className="text-xs text-blue-600">
                  +12 este mês
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Redações Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">23</div>
                <p className="text-xs text-orange-600">
                  Para corrigir hoje
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Taxa de Aprovação</CardTitle>
                <Trophy className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">94.2%</div>
                <p className="text-xs text-green-600">
                  +2.1% vs mês passado
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Turmas Ativas</CardTitle>
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">8</div>
                <p className="text-xs text-purple-600">
                  3 turmas novas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Conteúdo do Professor */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
              <TabsTrigger value="redacoes">📝 Redações</TabsTrigger>
              <TabsTrigger value="turmas">👥 Turmas</TabsTrigger>
              <TabsTrigger value="ranking">🏆 Ranking</TabsTrigger>
              <TabsTrigger value="atividades">⚡ Atividades</TabsTrigger>
              <TabsTrigger value="calendario">📅 Calendário</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resumo de Atividades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Resumo de Atividades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Flashcards Estudados</span>
                        <span className="text-lg font-bold text-blue-600">1,247</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Quizzes Completados</span>
                        <span className="text-lg font-bold text-green-600">892</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">Lições Assistidas</span>
                        <span className="text-lg font-bold text-purple-600">2,156</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium">Redações Enviadas</span>
                        <span className="text-lg font-bold text-orange-600">156</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Próximas Aulas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      Próximas Aulas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Português - Turma A</p>
                          <p className="text-xs text-muted-foreground">Hoje, 14:00</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Em 2h
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Redação - Turma B</p>
                          <p className="text-xs text-muted-foreground">Amanhã, 10:00</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Amanhã
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Matemática - Turma C</p>
                          <p className="text-xs text-muted-foreground">Quinta, 16:00</p>
                        </div>
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          Em 3 dias
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Performance das Turmas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Gráfico de Performance das Turmas</p>
                      <p className="text-sm">Integração com biblioteca de gráficos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Redações */}
            <TabsContent value="redacoes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gerenciamento de Redações</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Redação
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <FileText className="h-5 w-5" />
                      Pendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">23</div>
                    <p className="text-sm text-orange-600 mt-2">
                      Redações aguardando correção
                    </p>
                    <Button variant="outline" className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                      Ver Pendentes
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Corrigidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">156</div>
                    <p className="text-sm text-green-600 mt-2">
                      Redações já corrigidas
                    </p>
                    <Button variant="outline" className="w-full mt-3 border-green-300 text-green-700 hover:bg-green-100">
                      Ver Corrigidas
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Clock className="h-5 w-5" />
                      Média de Tempo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">2.3h</div>
                    <p className="text-sm text-blue-600 mt-2">
                      Tempo médio para correção
                    </p>
                    <Button variant="outline" className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                      Ver Estatísticas
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Redações Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Redações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: 1, aluno: "João Silva", turma: "Turma A", tema: "Sustentabilidade", status: "Pendente", tempo: "2h atrás" },
                      { id: 2, aluno: "Maria Santos", turma: "Turma B", tema: "Tecnologia", status: "Corrigida", tempo: "4h atrás" },
                      { id: 3, aluno: "Pedro Costa", turma: "Turma A", tema: "Educação", status: "Pendente", tempo: "6h atrás" },
                    ].map((redacao) => (
                      <div key={redacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{redacao.aluno}</p>
                          <p className="text-sm text-muted-foreground">{redacao.turma} • {redacao.tema}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={redacao.status === 'Pendente' ? 'destructive' : 'default'}>
                            {redacao.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{redacao.tempo}</span>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Turmas */}
            <TabsContent value="turmas" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gerenciamento de Turmas</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Turma
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { nome: "Turma A - EAOF 2026", alunos: 32, progresso: 78, proximaAula: "Hoje, 14:00" },
                  { nome: "Turma B - Redação", alunos: 28, progresso: 65, proximaAula: "Amanhã, 10:00" },
                  { nome: "Turma C - Matemática", alunos: 35, progresso: 82, proximaAula: "Quinta, 16:00" },
                  { nome: "Turma D - Português", alunos: 30, progresso: 71, proximaAula: "Sexta, 15:00" },
                  { nome: "Turma E - História", alunos: 25, progresso: 58, proximaAula: "Segunda, 11:00" },
                  { nome: "Turma F - Geografia", alunos: 27, progresso: 63, proximaAula: "Terça, 13:00" },
                ].map((turma, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{turma.nome}</CardTitle>
                      <CardDescription>{turma.alunos} alunos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso Geral</span>
                          <span>{turma.progresso}%</span>
                        </div>
                        <Progress value={turma.progresso} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Próxima aula: {turma.proximaAula}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Ver Alunos
                        </Button>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Ranking */}
            <TabsContent value="ranking" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ranking e Performance</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Por Turma</Button>
                  <Button variant="outline" size="sm">Geral</Button>
                  <Button variant="outline" size="sm">Este Mês</Button>
                </div>
              </div>

              {/* Top 10 Alunos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top 10 Alunos - Ranking Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { posicao: 1, nome: "Ana Beatriz", turma: "Turma A", pontos: 2847, nivel: "Lenda da Torre Eterna" },
                      { posicao: 2, nome: "Carlos Eduardo", turma: "Turma B", pontos: 2756, nivel: "Avatar do Conhecimento" },
                      { posicao: 3, nome: "Fernanda Lima", turma: "Turma A", pontos: 2689, nivel: "Guardião do Portal do Tempo" },
                      { posicao: 4, nome: "Roberto Silva", turma: "Turma C", pontos: 2598, nivel: "Profeta das Runas" },
                      { posicao: 5, nome: "Juliana Costa", turma: "Turma B", pontos: 2487, nivel: "Lâmina do Infinito" },
                    ].map((aluno) => (
                      <div key={aluno.posicao} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                          {aluno.posicao}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{aluno.nome}</p>
                          <p className="text-sm text-muted-foreground">{aluno.turma} • {aluno.nivel}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{aluno.pontos.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">pontos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ranking por Turmas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Melhor Turma - Este Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">🏆</div>
                      <h4 className="text-xl font-semibold">Turma A - EAOF 2026</h4>
                      <p className="text-muted-foreground">Média: 87.3 pontos</p>
                      <p className="text-sm text-green-600">+12.5% vs mês passado</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Aluno Destaque</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">⭐</div>
                      <h4 className="text-xl font-semibold">Ana Beatriz</h4>
                      <p className="text-muted-foreground">Turma A</p>
                      <p className="text-sm text-green-600">+45% de progresso</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Atividades */}
            <TabsContent value="atividades" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Atividades dos Alunos</h3>
                <Button variant="outline">Ver Todas</Button>
              </div>

              {/* Atividades Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { tipo: "Quiz", aluno: "João Silva", turma: "Turma A", resultado: "95%", tempo: "5 min atrás" },
                      { tipo: "Flashcard", aluno: "Maria Santos", turma: "Turma B", resultado: "20/25", tempo: "12 min atrás" },
                      { tipo: "Redação", aluno: "Pedro Costa", turma: "Turma A", resultado: "Enviada", tempo: "1h atrás" },
                      { tipo: "Lição", aluno: "Ana Beatriz", turma: "Turma C", resultado: "Completa", tempo: "2h atrás" },
                      { tipo: "Prova", aluno: "Carlos Eduardo", turma: "Turma B", resultado: "87%", tempo: "3h atrás" },
                    ].map((atividade, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          atividade.tipo === 'Quiz' ? 'bg-blue-100 text-blue-600' :
                          atividade.tipo === 'Flashcard' ? 'bg-green-100 text-green-600' :
                          atividade.tipo === 'Redação' ? 'bg-orange-100 text-orange-600' :
                          atividade.tipo === 'Lição' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {atividade.tipo === 'Quiz' ? <GraduationCap className="h-5 w-5" /> :
                           atividade.tipo === 'Flashcard' ? <BookText className="h-5 w-5" /> :
                           atividade.tipo === 'Redação' ? <FileText className="h-5 w-5" /> :
                           atividade.tipo === 'Lição' ? <PlayCircle className="h-5 w-5" /> :
                           <Target className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{atividade.aluno}</p>
                          <p className="text-sm text-muted-foreground">{atividade.turma} • {atividade.tipo}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{atividade.resultado}</p>
                          <p className="text-xs text-muted-foreground">{atividade.tempo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas de Atividades */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">+23% vs ontem</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89.2%</div>
                    <p className="text-xs text-muted-foreground">+5.1% vs semana passada</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24min</div>
                    <p className="text-xs text-muted-foreground">Por atividade</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">198</div>
                    <p className="text-xs text-muted-foreground">Nas últimas 24h</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Calendário */}
            <TabsContent value="calendario" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Calendário e Agendamentos</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aula
                </Button>
              </div>

              {/* Próximos Eventos */}
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { data: "Hoje", hora: "14:00", evento: "Aula de Português - Turma A", tipo: "Aula", status: "Confirmada" },
                      { data: "Amanhã", hora: "10:00", evento: "Correção de Redações - Turma B", tipo: "Correção", status: "Pendente" },
                      { data: "Quinta", hora: "16:00", evento: "Aula de Matemática - Turma C", tipo: "Aula", status: "Confirmada" },
                      { data: "Sexta", hora: "15:00", evento: "Reunião com Coordenação", tipo: "Reunião", status: "Confirmada" },
                      { data: "Segunda", hora: "11:00", evento: "Aula de História - Turma E", tipo: "Aula", status: "Agendada" },
                    ].map((evento, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="text-center min-w-[80px]">
                          <p className="font-medium text-sm">{evento.data}</p>
                          <p className="text-lg font-bold text-blue-600">{evento.hora}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{evento.evento}</p>
                          <p className="text-sm text-muted-foreground">{evento.tipo}</p>
                        </div>
                        <Badge variant={evento.status === 'Confirmada' ? 'default' : 'secondary'}>
                          {evento.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendário Visual */}
              <Card>
                <CardHeader>
                  <CardTitle>Calendário do Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Calendário Interativo</p>
                      <p className="text-sm">Integração com componente de calendário</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardShell>
    )
  }

  if (isAdmin) {
    return (
      <DashboardShell>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header do Admin */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              👑 Painel Administrativo
            </h1>
            <p className="text-xl text-muted-foreground">
              Bem-vindo, Administrador! Gerencie toda a plataforma Everest.
            </p>
          </div>

          {/* Estatísticas do Admin */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  Usuários ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Professores ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conteúdo</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,156</div>
                <p className="text-xs text-muted-foreground">
                  Itens de conteúdo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 79.880</div>
                <p className="text-xs text-muted-foreground">
                  Este mês
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações do Admin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Gerenciar Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Gerencie todos os usuários, roles e permissões da plataforma.
                </p>
                <Button className="w-full">
                  Gerenciar Usuários
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Aprove e gerencie todo o conteúdo da plataforma.
                </p>
                <Button className="w-full">
                  Gerenciar Conteúdo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Visualize relatórios detalhados de uso e performance.
                </p>
                <Button className="w-full">
                  Ver Relatórios
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Dashboard do Aluno (código existente)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando seu reino de conhecimento...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header do Dashboard */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🏰 Seu Reino de Conhecimento
          </h1>
          <p className="text-xl text-muted-foreground">
            Bem-vindo, {user?.user_metadata?.full_name || 'Guerreiro'}! Continue sua jornada épica.
          </p>
        </div>

        {/* Conquistas Recentes */}
        {recentUnlocked.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Trophy className="h-5 h-5" />
                🎉 Conquista Desbloqueada!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                Parabéns! Você desbloqueou: <strong>{recentUnlocked.join(', ')}</strong>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Card Principal RPG */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <CrownIcon className="h-8 w-8 text-yellow-600" />
              {userStats.currentRank}
            </CardTitle>
            <CardDescription className="text-lg">
              {getRank(userStats.totalScore).insignia} {getRank(userStats.totalScore).blessing}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{userStats.currentLevel}</div>
                <div className="text-sm text-muted-foreground">Nível</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{userStats.totalXP}</div>
                <div className="text-sm text-muted-foreground">XP Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{userStats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Dias Seguidos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{userStats.achievementsUnlocked}</div>
                <div className="text-sm text-muted-foreground">Conquistas</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para próximo rank</span>
                <span>{getRankProgressValue()}%</span>
              </div>
              <Progress value={getRankProgressValue()} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Próximo: {getNextRankInfo(userStats.totalScore)?.rank?.name || 'Rank Máximo'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">📊 Estatísticas</TabsTrigger>
            <TabsTrigger value="achievements">🏆 Conquistas</TabsTrigger>
            <TabsTrigger value="activities">⚡ Atividades</TabsTrigger>
            <TabsTrigger value="leagues">🗡️ Ligas RPG</TabsTrigger>
          </TabsList>

          {/* Estatísticas */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pontuação Total</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalScore.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{userStats.totalScore > 0 ? Math.floor(userStats.totalScore / 100) : 0} XP
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.flashcardsCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    Completados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.quizzesCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    Finalizados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lições</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.lessonsCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    Assistidas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Streak e Tempo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Sequência de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{userStats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Dias seguidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-foreground">{userStats.longestStreak}</div>
                    <div className="text-xs text-muted-foreground">Recorde pessoal</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Tempo de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{Math.floor(userStats.totalStudyTime / 60)}</div>
                    <div className="text-sm text-muted-foreground">Horas totais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-foreground">{userStats.totalStudyTime % 60}</div>
                    <div className="text-xs text-muted-foreground">Minutos</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conquistas */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = isAchievementUnlocked(achievement.achievement_key)
                const progress = getAchievementProgress(achievement.achievement_key)
                
                return (
                  <Card key={achievement.id} className={isUnlocked ? 'border-green-200 bg-green-50' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-2xl">{achievement.icon}</span>
                        {achievement.title}
                      </CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                          {isUnlocked ? 'Desbloqueado' : achievement.category}
                        </Badge>
                        <div className="text-right text-sm">
                          <div className="font-semibold">+{achievement.xp_reward} XP</div>
                          <div className="text-muted-foreground">+{achievement.score_reward} pts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Atividades */}
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumo de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userStats.flashcardsCompleted}</div>
                    <div className="text-sm text-muted-foreground">Flashcards Estudados</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userStats.quizzesCompleted}</div>
                    <div className="text-sm text-muted-foreground">Quizzes Completados</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{userStats.lessonsCompleted}</div>
                    <div className="text-sm text-muted-foreground">Lições Assistidas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ligas RPG */}
          <TabsContent value="leagues" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAllLeagues().map((league) => {
                const isCurrentLeague = userStats.currentLeague === league.name
                const hasCompleted = userStats.totalScore >= league.maxScore
                
                return (
                  <Card key={league.name} className={isCurrentLeague ? 'border-purple-200 bg-purple-50' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🗡️</span>
                        {league.name}
                      </CardTitle>
                      <CardDescription>Liga com {league.totalRanks} ranks disponíveis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{Math.round((userStats.totalScore / league.maxScore) * 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.min((userStats.totalScore / league.maxScore) * 100, 100)} 
                        className="h-2" 
                      />
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={isCurrentLeague ? 'default' : 'secondary'}>
                          {isCurrentLeague ? 'Liga Atual' : league.name}
                        </Badge>
                        {hasCompleted && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            ✅ Concluída
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
} 