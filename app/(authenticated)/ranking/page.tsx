"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Crown, Star, TrendingUp, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { useAuth } from "@/context/auth-context-custom"
import { getGlobalRanking, getUserProgress, addSampleScores, getUserDetailedStats } from "../../server-actions"

interface RankingUser {
  user_id: string
  total_score: number
  rank_position: number
  user_profiles: {
    display_name: string
    role: string
  }[]
}

interface UserStats {
  total_xp: number
  level: number
  flashcards_studied: number
  quizzes_completed: number
  correct_answers: number
  total_answers: number
}

interface DetailedStats {
  totalScore: number
  totalXP: number
  level: number
  flashcardsStudied: number
  averageFlashcardQuality: number
  quizzesCompleted: number
  averageQuizScore: number
  averageQuizAccuracy: number
  lessonsCompleted: number
  currentStreak: number
  totalActivities: number
  lastActivity: string | null
}

export default function RankingPage() {
  const { user } = useAuth()
  const [rankings, setRankings] = useState<RankingUser[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingScores, setIsAddingScores] = useState(false)

  useEffect(() => {
    loadRankingData()
  }, [])

  const loadRankingData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Carregar ranking global
      const rankingResult = await getGlobalRanking(20)
      if (rankingResult.success && rankingResult.rankings) {
        setRankings(rankingResult.rankings)
      } else {
        setError("Erro ao carregar ranking")
      }

      // Carregar estatísticas do usuário atual
      if (user) {
        const progressResult = await getUserProgress(user.id)
        if (progressResult.success && progressResult.stats) {
          setUserStats(progressResult.stats)
        }

        // Carregar estatísticas detalhadas
        const detailedResult = await getUserDetailedStats(user.id)
        if (detailedResult.success && detailedResult.stats) {
          setDetailedStats(detailedResult.stats)
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do ranking:", err)
      setError("Erro ao carregar dados")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSampleScores = async () => {
    try {
      setIsAddingScores(true)
      const result = await addSampleScores()
      if (result.success) {
        // Recarregar dados após adicionar pontuações
        await loadRankingData()
      }
    } catch (err) {
      console.error("Erro ao adicionar pontuações de exemplo:", err)
    } finally {
      setIsAddingScores(false)
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{position}</span>;
    }
  };

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
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "Expert":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "Avançado":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "Intermediário":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "Básico":
        return "bg-gradient-to-r from-gray-500 to-gray-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando ranking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Trophy className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Erro no Ranking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Não foi possível carregar o ranking. Tente novamente.
            </p>
            <Button onClick={loadRankingData} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <BackButton pageName="Ranking" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ranking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Veja sua posição entre os melhores estudantes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddSampleScores} 
            variant="outline" 
            size="sm"
            disabled={isAddingScores}
          >
            {isAddingScores ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            {isAddingScores ? "Adicionando..." : "Dados de Exemplo"}
          </Button>
          <Button onClick={loadRankingData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Top 3 Podium */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
            <CardHeader>
              <CardTitle className="text-center text-yellow-800 dark:text-yellow-200">
                🏆 Pódium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rankings.slice(0, 3).map((user, index) => {
                const level = getLevelFromXP(user.total_score)
                return (
                  <div key={user.user_id} className={`flex items-center gap-4 p-4 rounded-2xl ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-800/30 dark:to-yellow-700/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/30 dark:to-gray-600/30' :
                    'bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-800/30 dark:to-amber-700/30'
                  }`}>
                    <div className="flex-shrink-0">
                      {getPositionIcon(user.rank_position)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {user.user_profiles?.[0]?.display_name || 'Usuário'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.total_score} pontos
                      </div>
                    </div>
                    <Badge className={getLevelColor(level)}>
                      {level}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Full Ranking */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ranking Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankings.length > 0 ? rankings.map((user, index) => {
                  const level = getLevelFromXP(user.total_score)
                  const initials = getInitials(user.user_profiles?.[0]?.display_name || 'Usuário')
                  return (
                    <div key={user.user_id} className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10' : ''
                    }`}>
                      <div className="flex-shrink-0 w-8 text-center">
                        {getPositionIcon(user.rank_position)}
                      </div>
                      
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {initials}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {user.user_profiles?.[0]?.display_name || 'Usuário'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.total_score} pontos
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(level)}>
                          {level}
                        </Badge>
                        {index < 3 && (
                          <Star className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum usuário no ranking ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {rankings.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total de Participantes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {rankings.length > 0 ? rankings[0].total_score : 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Maior Pontuação</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {detailedStats?.totalScore || userStats?.total_xp || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Sua Pontuação</div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      {detailedStats && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Suas Estatísticas
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Acompanhe seu progresso detalhado
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {detailedStats.level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nível Atual</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {detailedStats.totalXP} XP
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {detailedStats.flashcardsStudied}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Flashcards</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Qualidade: {detailedStats.averageFlashcardQuality}/5
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {detailedStats.quizzesCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Média: {detailedStats.averageQuizAccuracy}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {detailedStats.currentStreak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sequência</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  dias consecutivos
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-indigo-600 mb-1">
                  {detailedStats.totalActivities}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Atividades</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-pink-600 mb-1">
                  {detailedStats.lessonsCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aulas Completadas</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-teal-600 mb-1">
                  {detailedStats.lastActivity ? 
                    new Date(detailedStats.lastActivity).toLocaleDateString('pt-BR') : 
                    'Nunca'
                  }
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Última Atividade</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
