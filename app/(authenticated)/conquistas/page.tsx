"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Clock, Award, Crown, Flame, BookOpen, RotateCcw, TrendingUp } from "lucide-react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { BackButton } from "@/components/ui/back-button"
import { getUserAchievements, getAllAchievements, getUserDetailedStats } from "../../server-actions"
import { useAuth } from "@/context/auth-context-custom"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points_reward: number
  condition_type: string
  condition_value: number
}

interface UserAchievement {
  id: string
  granted_at: string
  achievement: Achievement
}

interface UserStats {
  flashcardsStudied: number
  accuracy: number
  currentStreak: number
  flashcardsReviewed: number
  totalScore: number
}

const categoryIcons = {
  study: BookOpen,
  performance: Star,
  consistency: Flame,
  review: RotateCcw,
  milestone: Crown,
  mastery: Trophy
}

const categoryColors = {
  study: "bg-blue-100 text-blue-800",
  performance: "bg-green-100 text-green-800",
  consistency: "bg-orange-100 text-orange-800",
  review: "bg-purple-100 text-purple-800",
  milestone: "bg-yellow-100 text-yellow-800",
  mastery: "bg-red-100 text-red-800"
}

const categoryNames = {
  study: "Estudo",
  performance: "Performance",
  consistency: "Consistência",
  review: "Revisão",
  milestone: "Marco",
  mastery: "Maestria"
}

export default function ConquistasPage() {
  const { user } = useAuth()
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'earned' | 'available'>('earned')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const [achievementsResult, allAchievementsResult, statsResult] = await Promise.all([
        getUserAchievements(user.id),
        getAllAchievements(),
        getUserDetailedStats(user.id)
      ])

      if (achievementsResult.success) {
        setUserAchievements(achievementsResult.achievements)
      }

      if (allAchievementsResult.success) {
        setAllAchievements(allAchievementsResult.achievements)
      }

      if (statsResult.success) {
        setUserStats(statsResult.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar dados das conquistas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressForAchievement = (achievement: Achievement) => {
    if (!userStats) return 0

    switch (achievement.condition_type) {
      case 'flashcards_studied':
        return Math.min((userStats.flashcardsStudied / achievement.condition_value) * 100, 100)
      case 'accuracy':
        return Math.min((userStats.accuracy / achievement.condition_value) * 100, 100)
      case 'streak':
        return Math.min((userStats.currentStreak / achievement.condition_value) * 100, 100)
      case 'flashcards_reviewed':
        return Math.min((userStats.flashcardsReviewed / achievement.condition_value) * 100, 100)
      case 'total_points':
        return Math.min((userStats.totalScore / achievement.condition_value) * 100, 100)
      case 'mastery':
        const studyProgress = Math.min((userStats.flashcardsStudied / achievement.condition_value) * 100, 100)
        const accuracyProgress = Math.min((userStats.accuracy / 80) * 100, 100)
        return Math.min(studyProgress, accuracyProgress)
      default:
        return 0
    }
  }

  const getCurrentValueForAchievement = (achievement: Achievement) => {
    if (!userStats) return 0

    switch (achievement.condition_type) {
      case 'flashcards_studied':
        return userStats.flashcardsStudied
      case 'accuracy':
        return Math.round(userStats.accuracy)
      case 'streak':
        return userStats.currentStreak
      case 'flashcards_reviewed':
        return userStats.flashcardsReviewed
      case 'total_points':
        return userStats.totalScore
      case 'mastery':
        return userStats.flashcardsStudied
      default:
        return 0
    }
  }

  const earnedAchievements = userAchievements
  const availableAchievements = allAchievements.filter(achievement => 
    !userAchievements.some(ua => ua.achievement.id === achievement.id)
  )

  const totalPoints = earnedAchievements.reduce((sum, ua) => sum + ua.achievement.points_reward, 0)

  if (loading) {
    return (
      <PagePermissionGuard allowedRoles={['student', 'teacher', 'administrator']}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando conquistas...</p>
            </div>
          </div>
        </div>
      </PagePermissionGuard>
    )
  }

  return (
    <PagePermissionGuard allowedRoles={['student', 'teacher', 'administrator']}>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <BackButton pageName="Conquistas" />
          </div>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Conquistas
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Acompanhe seu progresso e desbloqueie novas conquistas estudando flashcards!
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {earnedAchievements.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conquistas Desbloqueadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPoints}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pontos de Conquistas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats?.flashcardsStudied || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Flashcards Estudados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(userStats?.accuracy || 0)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Taxa de Acertos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mx-auto">
            <button
              onClick={() => setActiveTab('earned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'earned'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Conquistadas ({earnedAchievements.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Disponíveis ({availableAchievements.length})
            </button>
          </div>

          {/* Achievements Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeTab === 'earned' ? (
              earnedAchievements.map((userAchievement) => {
                const achievement = userAchievement.achievement
                const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy
                
                return (
                  <Card key={userAchievement.id} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                      CONQUISTADA
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={categoryColors[achievement.category as keyof typeof categoryColors]}>
                            {categoryNames[achievement.category as keyof typeof categoryNames]}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-4 w-4" />
                            <span className="font-semibold">{achievement.points_reward}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Conquistada em: {new Date(userAchievement.granted_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              availableAchievements.map((achievement) => {
                const IconComponent = categoryIcons[achievement.category as keyof typeof categoryIcons] || Trophy
                const progress = getProgressForAchievement(achievement)
                const currentValue = getCurrentValueForAchievement(achievement)
                const isCompleted = progress >= 100
                
                return (
                  <Card key={achievement.id} className={`relative overflow-hidden ${
                    isCompleted ? 'ring-2 ring-yellow-400' : ''
                  }`}>
                    {isCompleted && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                        PRONTA!
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl opacity-60">{achievement.icon}</div>
                        <div>
                          <CardTitle className="text-lg opacity-60">{achievement.name}</CardTitle>
                          <CardDescription className="text-sm opacity-60">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={categoryColors[achievement.category as keyof typeof categoryColors]}
                          >
                            {categoryNames[achievement.category as keyof typeof categoryNames]}
                          </Badge>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Star className="h-4 w-4" />
                            <span className="font-semibold">{achievement.points_reward}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progresso:</span>
                            <span className="font-medium">
                              {currentValue} / {achievement.condition_value}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            {Math.round(progress)}% completo
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {activeTab === 'earned' && earnedAchievements.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma conquista ainda
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comece a estudar flashcards para desbloquear suas primeiras conquistas!
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'available' && availableAchievements.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Todas as conquistas desbloqueadas!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Parabéns! Você conquistou todas as conquistas disponíveis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PagePermissionGuard>
  )
}
