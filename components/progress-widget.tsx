"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, BookOpen, Brain, Clock, Target } from "lucide-react"
import { useAuth } from "@/context/auth-context-custom"
import { getUserProgress } from "@/actions"

interface UserStats {
  total_xp: number
  level: number
  streak_days: number
  total_study_time: number
  flashcards_studied: number
  quizzes_completed: number
  correct_answers: number
  total_answers: number
}

interface UserRanking {
  total_score: number
  rank_position: number
}

export default function ProgressWidget() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [ranking, setRanking] = useState<UserRanking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user])

  const loadProgress = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const result = await getUserProgress(user.id)
      
      if (result.success) {
        setStats(result.stats)
        setRanking(result.ranking)
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelFromXP = (xp: number) => {
    if (xp >= 1000) return "Mestre"
    if (xp >= 750) return "Expert"
    if (xp >= 500) return "Avançado"
    if (xp >= 250) return "Intermediário"
    return "Básico"
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Mestre":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      case "Expert":
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
      case "Avançado":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "Intermediário":
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case "Básico":
        return "bg-gradient-to-r from-gray-500 to-gray-600"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600"
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getAccuracyRate = () => {
    if (!stats || stats.total_answers === 0) return 0
    return Math.round((stats.correct_answers / stats.total_answers) * 100)
  }

  const getNextLevelXP = () => {
    if (!stats) return 0
    const currentLevel = stats.level
    return currentLevel * 500 // 500 XP por nível
  }

  const getCurrentLevelProgress = () => {
    if (!stats) return 0
    const currentLevel = stats.level
    const currentLevelXP = (currentLevel - 1) * 500
    const nextLevelXP = currentLevel * 500
    const progressXP = stats.total_xp - currentLevelXP
    const levelXP = nextLevelXP - currentLevelXP
    
    return Math.min((progressXP / levelXP) * 100, 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando progresso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum progresso encontrado. Comece estudando!
          </p>
        </CardContent>
      </Card>
    )
  }

  const level = getLevelFromXP(stats.total_xp)
  const accuracyRate = getAccuracyRate()
  const levelProgress = getCurrentLevelProgress()

  return (
    <div className="space-y-6">
      {/* Nível e XP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Nível {stats.level}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.total_xp} XP total
              </div>
            </div>
            <Badge className={`${getLevelColor(level)} text-white`}>
              {level}
            </Badge>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progresso para o próximo nível</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Estudo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.flashcards_studied}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Flashcards Estudados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.quizzes_completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Quizzes Completados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {accuracyRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Taxa de Acerto
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(stats.total_study_time)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tempo de Estudo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking */}
      {ranking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                #{ranking.rank_position}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Posição no Ranking
              </div>
              <div className="text-lg font-semibold text-orange-600 mt-2">
                {ranking.total_score} pontos
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sequência de Estudos */}
      {stats.streak_days > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Trophy className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.streak_days} dias
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sequência de Estudos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
