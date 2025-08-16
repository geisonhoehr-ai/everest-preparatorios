'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users, 
  Medal,
  Crown,
  Sword,
  Shield,
  Scroll,
  Gem,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { getAllLeagues, getRank } from '@/lib/ranking'
import { getGlobalRanking } from '@/lib/gamification-actions'

interface UserRanking {
  user_uuid: string
  total_score: number
  total_xp: number
  current_level: number
  current_rank: string
  current_league: string
  profiles?: {
    full_name: string
    avatar_url: string
  }
}

export default function RankingPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'xp' | 'level'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [users, setUsers] = useState<UserRanking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRankingData()
  }, [])

  const loadRankingData = async () => {
    try {
      setLoading(true)
      const rankingData = await getGlobalRanking(100)
      setUsers(rankingData)
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtra usuários baseado na liga selecionada
  const filteredUsers = users.filter(user => {
    if (selectedLeague === 'all') return true
    return user.current_league === selectedLeague
  })

  // Filtra por termo de busca
  const searchedUsers = filteredUsers.filter(user => {
    if (!searchTerm) return true
    const userName = user.profiles?.full_name || 'Usuário'
    return userName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Ordena usuários
  const sortedUsers = searchedUsers.sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortBy) {
      case 'score':
        aValue = a.total_score
        bValue = b.total_score
        break
      case 'xp':
        aValue = a.total_xp
        bValue = b.total_xp
        break
      case 'level':
        aValue = a.current_level
        bValue = b.current_level
        break
      default:
        aValue = a.total_score
        bValue = b.total_score
    }

    if (sortOrder === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

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

  const getLeagueStats = (leagueName: string) => {
    const leagueUsers = users.filter(user => user.current_league === leagueName)
    if (leagueUsers.length === 0) return null

    const totalScore = leagueUsers.reduce((sum, user) => sum + user.total_score, 0)
    const totalXP = leagueUsers.reduce((sum, user) => sum + user.total_xp, 0)
    const avgLevel = Math.round(leagueUsers.reduce((sum, user) => sum + user.current_level, 0) / leagueUsers.length)

    return {
      totalUsers: leagueUsers.length,
      totalScore,
      totalXP,
      avgLevel
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando ranking épico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          🏆 Ranking Épico do Conhecimento
        </h1>
        <p className="text-xl text-muted-foreground">
          Descubra quem são os verdadeiros mestres da sabedoria
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Guerreiros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Participantes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.total_score, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pontos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.total_xp, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Experiência total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Médio</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(users.reduce((sum, user) => sum + user.current_level, 0) / users.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média da comunidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Liga */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Liga</label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todas as Ligas</option>
                {getAllLeagues().map((league) => (
                  <option key={league.name} value={league.name}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Usuário</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'xp' | 'level')}
                  className="flex-1 p-2 border rounded-md"
                >
                  <option value="score">Pontuação</option>
                  <option value="xp">XP</option>
                  <option value="level">Nível</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ranking">🏆 Ranking Geral</TabsTrigger>
          <TabsTrigger value="leagues">🗡️ Visão das Ligas</TabsTrigger>
        </TabsList>

        {/* Ranking Geral */}
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Top Guerreiros do Conhecimento
              </CardTitle>
              <CardDescription>
                Ranking baseado em pontuação total - {sortedUsers.length} participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedUsers.map((user, index) => (
                  <div
                    key={user.user_uuid}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Posição */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        {index === 0 && <Medal className="h-8 w-8 text-yellow-500 mx-auto mb-1" />}
                        {index === 1 && <Medal className="h-8 w-8 text-gray-400 mx-auto mb-1" />}
                        {index === 2 && <Medal className="h-8 w-8 text-orange-600 mx-auto mb-1" />}
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-500' :
                          index === 2 ? 'text-orange-600' :
                          'text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Informações do Usuário */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(user.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {user.profiles?.full_name || 'Usuário'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.current_rank}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold">{user.total_score.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Pontos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{user.total_xp.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{user.current_level}</div>
                        <div className="text-xs text-muted-foreground">Nível</div>
                      </div>
                      <Badge className={getLeagueColor(user.current_league)}>
                        {user.current_league}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visão das Ligas */}
        <TabsContent value="leagues" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAllLeagues().map((league) => {
              const stats = getLeagueStats(league.name)
              if (!stats) return null

              return (
                <Card key={league.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🗡️</span>
                      {league.name}
                    </CardTitle>
                    <CardDescription>
                      {stats.totalUsers} guerreiros ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Estatísticas da Liga */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalScore.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Pontos Totais</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.totalXP.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP Total</div>
                      </div>
                    </div>

                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.avgLevel}</div>
                      <div className="text-xs text-muted-foreground">Nível Médio</div>
                    </div>

                    {/* Top 3 da Liga */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Top 3 da Liga</div>
                      {users
                        .filter(user => user.current_league === league.name)
                        .sort((a, b) => b.total_score - a.total_score)
                        .slice(0, 3)
                        .map((user, index) => (
                          <div key={user.user_uuid} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">#{index + 1}</span>
                              <span className="font-medium">
                                {user.profiles?.full_name || 'Usuário'}
                              </span>
                            </div>
                            <span className="font-bold">{user.total_score.toLocaleString()}</span>
                          </div>
                        ))}
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
