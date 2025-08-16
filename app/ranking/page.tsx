"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Crown, 
  Star, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  Sword,
  Shield,
  Scroll,
  Gem,
  Zap,
  Flame,
  BookOpen,
  Brain,
  PenTool,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { getAllLeagues, getRank, getRankProgress } from "@/lib/ranking";

interface UserRanking {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  currentRank: any;
  league: string;
  level: number;
  totalFlashcards: number;
  completedFlashcards: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  avatar?: string;
}

export default function RankingPage() {
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "streak" | "flashcards">("score");

  // Dados mockados para demonstração
  const [users, setUsers] = useState<UserRanking[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@email.com",
      totalScore: 8500,
      currentRank: getRank(8500),
      league: "Aventureiros",
      level: 10,
      totalFlashcards: 150,
      completedFlashcards: 120,
      totalQuizzes: 15,
      averageScore: 85,
      currentStreak: 12
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@email.com",
      totalScore: 12000,
      currentRank: getRank(12000),
      league: "Heróis",
      level: 14,
      totalFlashcards: 150,
      completedFlashcards: 145,
      totalQuizzes: 20,
      averageScore: 92,
      currentStreak: 25
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@email.com",
      totalScore: 3500,
      currentRank: getRank(3500),
      league: "Aprendizes",
      level: 8,
      totalFlashcards: 150,
      completedFlashcards: 80,
      totalQuizzes: 8,
      averageScore: 78,
      currentStreak: 7
    },
    {
      id: "4",
      name: "Ana Oliveira",
      email: "ana@email.com",
      totalScore: 18000,
      currentRank: getRank(18000),
      league: "Mestres",
      level: 18,
      totalFlashcards: 150,
      completedFlashcards: 150,
      totalQuizzes: 25,
      averageScore: 95,
      currentStreak: 30
    },
    {
      id: "5",
      name: "Carlos Lima",
      email: "carlos@email.com",
      totalScore: 6000,
      currentRank: getRank(6000),
      league: "Aventureiros",
      level: 9,
      totalFlashcards: 150,
      completedFlashcards: 95,
      totalQuizzes: 12,
      averageScore: 82,
      currentStreak: 15
    }
  ]);

  const allLeagues = getAllLeagues();

  // Filtrar e ordenar usuários
  const filteredUsers = users
    .filter(user => {
      const matchesLeague = selectedLeague === "all" || user.league === selectedLeague;
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesLeague && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.totalScore - a.totalScore;
        case "streak":
          return b.currentStreak - a.currentStreak;
        case "flashcards":
          return b.completedFlashcards - a.completedFlashcards;
        default:
          return b.totalScore - a.totalScore;
      }
    });

  // Obter estatísticas da liga
  const getLeagueStats = (leagueName: string) => {
    const leagueUsers = users.filter(user => user.league === leagueName);
    if (leagueUsers.length === 0) return null;

    const totalUsers = leagueUsers.length;
    const avgScore = Math.round(leagueUsers.reduce((sum, user) => sum + user.totalScore, 0) / totalUsers);
    const avgStreak = Math.round(leagueUsers.reduce((sum, user) => sum + user.currentStreak, 0) / totalUsers);

    return { totalUsers, avgScore, avgStreak };
  };

  // Obter cor da liga
  const getLeagueColor = (leagueName: string) => {
    const leagueColors: Record<string, any> = {
      "Aprendizes": {
        card: "bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/20 dark:to-blue-600/30",
        border: "border-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
      },
      "Aventureiros": {
        card: "bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/20 dark:to-green-600/30",
        border: "border-green-500/20",
        text: "text-green-600 dark:text-green-400",
        badge: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
      },
      "Heróis": {
        card: "bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/20 dark:to-purple-600/30",
        border: "border-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
      },
      "Mestres": {
        card: "bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-900/20 dark:to-orange-600/30",
        border: "border-orange-500/20",
        text: "text-orange-600 dark:text-orange-400",
        badge: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
      },
      "Lendas": {
        card: "bg-gradient-to-br from-red-500/10 to-red-600/20 dark:from-red-900/20 dark:to-red-600/30",
        border: "border-red-500/20",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
      }
    };

    return leagueColors[leagueName] || leagueColors["Aprendizes"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="h-16 w-16 text-yellow-500 mr-4" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Ranking Épico
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                A Jornada dos Heróis do Conhecimento
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Compita com outros estudantes, suba de liga e torne-se uma lenda na plataforma Everest Preparatórios
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">{users.length}</div>
              <p className="text-sm text-gray-400">Estudantes Ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">
                {Math.round(users.reduce((sum, user) => sum + user.totalScore, 0) / users.length)}
              </div>
              <p className="text-sm text-gray-400">Pontuação Média</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Flame className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-500">
                {Math.round(users.reduce((sum, user) => sum + user.currentStreak, 0) / users.length)}
              </div>
              <p className="text-sm text-gray-400">Streak Médio</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-500">
                {Math.round(users.reduce((sum, user) => sum + user.averageScore, 0) / users.length)}%
              </div>
              <p className="text-sm text-gray-400">Média nos Quizzes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Ligas</option>
            {allLeagues.map(league => (
              <option key={league.name} value={league.name}>{league.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Ordenar por Pontuação</option>
            <option value="streak">Ordenar por Streak</option>
            <option value="flashcards">Ordenar por Flashcards</option>
          </select>
        </div>

        {/* Tabs com Ranking e Ligas */}
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 mb-8">
            <TabsTrigger value="ranking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Ranking Geral
            </TabsTrigger>
            <TabsTrigger value="leagues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Visão das Ligas
            </TabsTrigger>
          </TabsList>

          {/* Tab de Ranking Geral */}
          <TabsContent value="ranking" className="space-y-6">
            <div className="space-y-4">
              {filteredUsers.map((user, index) => {
                const leaguePalette = getLeagueColor(user.league);
                const rankProgress = getRankProgress(user.totalScore);
                
                return (
                  <Card 
                    key={user.id}
                    className={`transition-all duration-300 hover-lift ${
                      index === 0 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40 ring-2 ring-yellow-500/50' 
                        : index === 1 
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40 ring-2 ring-gray-400/50'
                          : index === 2
                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/40 ring-2 ring-orange-500/50'
                            : 'bg-gradient-to-br from-white/5 to-white/10 border-white/20'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        {/* Posição e Informações Básicas */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            {index === 0 && <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-1" />}
                            {index === 1 && <Crown className="h-8 w-8 text-gray-400 mx-auto mb-1" />}
                            {index === 2 && <Star className="h-8 w-8 text-orange-500 mx-auto mb-1" />}
                            {index > 2 && <div className="h-8 w-8 flex items-center justify-center text-2xl font-bold text-gray-400">#{index + 1}</div>}
                            <div className={`text-sm font-medium ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              index === 2 ? 'text-orange-500' : 
                              'text-gray-400'
                            }`}>
                              {index === 0 ? '🥇 1º Lugar' : 
                               index === 1 ? '🥈 2º Lugar' : 
                               index === 2 ? '🥉 3º Lugar' : 
                               `${index + 1}º Lugar`}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{user.name}</h3>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Rank e Liga */}
                        <div className="text-center">
                          <div className="text-2xl mb-1">{user.currentRank.insignia.split(' ')[0]}</div>
                          <Badge className={`${leaguePalette.badge} text-sm px-3 py-1`}>
                            {user.currentRank.name}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">{user.league} • Nível {user.currentRank.level}</p>
                        </div>

                        {/* Estatísticas */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">{user.totalScore.toLocaleString()}</div>
                          <p className="text-sm text-gray-400">Pontos</p>
                        </div>

                        {/* Progresso */}
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-400 mb-1">{user.currentStreak}</div>
                          <p className="text-sm text-gray-400">Dias Streak</p>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
                            Ver Perfil
                          </Button>
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/20">
                            Desafiar
                          </Button>
                        </div>
                      </div>

                      {/* Barra de Progresso para Próximo Rank */}
                      {!rankProgress.isMaxRank && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progresso para {rankProgress.nextRank.name}</span>
                            <span className="text-blue-400">{rankProgress.scoreNeeded} pontos restantes</span>
                          </div>
                          <Progress value={rankProgress.progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab de Visão das Ligas */}
          <TabsContent value="leagues" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allLeagues.map((league) => {
                const leaguePalette = getLeagueColor(league.name);
                const leagueStats = getLeagueStats(league.name);
                const leagueUsers = users.filter(user => user.league === league.name);
                
                return (
                  <Card 
                    key={league.name}
                    className={`${leaguePalette.card} ${leaguePalette.border} hover-lift transition-all duration-300`}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="text-4xl mb-2">
                        {league.name === "Aprendizes" && "🪄"}
                        {league.name === "Aventureiros" && "🗡️"}
                        {league.name === "Heróis" && "🛡️"}
                        {league.name === "Mestres" && "🔥"}
                        {league.name === "Lendas" && "🌌"}
                      </div>
                      <CardTitle className="text-xl">{league.name}</CardTitle>
                      <Badge className={`${leaguePalette.badge} text-sm`}>
                        {league.totalRanks} Ranks • {league.minScore} - {league.maxScore} pts
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {leagueStats ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-400">{leagueStats.totalUsers}</div>
                              <p className="text-xs text-gray-400">Estudantes</p>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-400">{leagueStats.avgScore.toLocaleString()}</div>
                              <p className="text-xs text-gray-400">Pontos Média</p>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-400">{leagueStats.avgStreak}</div>
                              <p className="text-xs text-gray-400">Streak Média</p>
                            </div>
                          </div>

                          {/* Top 3 da Liga */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-center text-gray-300 mb-3">Top da Liga</p>
                            {leagueUsers
                              .sort((a, b) => b.totalScore - a.totalScore)
                              .slice(0, 3)
                              .map((user, index) => (
                                <div key={user.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${
                                      index === 0 ? 'text-yellow-500' : 
                                      index === 1 ? 'text-gray-400' : 
                                      'text-orange-500'
                                    }`}>
                                      #{index + 1}
                                    </span>
                                    <span className="text-sm">{user.name}</span>
                                  </div>
                                  <span className="text-sm text-gray-400">{user.totalScore.toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum estudante nesta liga ainda</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
