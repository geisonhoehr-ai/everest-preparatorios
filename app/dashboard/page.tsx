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
  Trophy as TrophyIcon
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
  const { user } = useAuth()
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
    <div className="container mx-auto px-4 py-8 space-y-8">
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
              <Trophy className="h-5 w-5" />
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
                      <span>Pontuação necessária</span>
                      <span>{league.maxScore.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Seu progresso</span>
                      <span>{userStats.totalScore.toLocaleString()}</span>
                    </div>
                    
                    <Progress 
                      value={Math.min(100, (userStats.totalScore / league.maxScore) * 100)} 
                      className="h-2" 
                    />
                    
                    <div className="flex justify-between items-center">
                      <Badge variant={hasCompleted ? 'default' : 'secondary'}>
                        {hasCompleted ? 'Completa' : 'Em Progresso'}
                      </Badge>
                      {isCurrentLeague && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          Atual
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
  )
} 