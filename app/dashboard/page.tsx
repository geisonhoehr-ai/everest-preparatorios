"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Target, 
  Flame, 
  Star, 
  BookOpen, 
  Brain, 
  PenTool, 
  Users, 
  TrendingUp,
  Award,
  Zap,
  Crown,
  Sparkles,
  Timer,
  Calendar,
  BarChart3,
  ArrowRight,
  Sword,
  Shield,
  Scroll,
  Gem,
  Crown as CrownIcon
} from "lucide-react";
import { getRank, getNextRankInfo, getRankProgress, getAllLeagues } from "@/lib/ranking";

interface UserStats {
  totalFlashcards: number;
  completedFlashcards: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  totalStudyTime: number;
  rank: number;
  totalUsers: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  totalScore: number; // Novo campo para o sistema RPG
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: string;
  unlockedAt?: string;
}

// Color palettes based on categories
const getColorPalette = (category: string, index: number = 0) => {
  const palettes: Record<string, any> = {
    level: {
      card: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-900/20 dark:to-emerald-600/30",
      border: "border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    },
    ranking: {
      card: "bg-gradient-to-br from-amber-500/10 to-amber-600/20 dark:from-amber-900/20 dark:to-amber-600/30",
      border: "border-amber-500/20",
      text: "text-amber-600 dark:text-emerald-400",
      badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
    },
    progress: {
      card: "bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/20 dark:to-blue-600/30",
      border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
    },
    achievement: {
      card: "bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/20 dark:to-purple-600/30",
      border: "border-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
    },
    unlocked: {
      card: "bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 dark:from-yellow-900/20 dark:to-yellow-600/30",
      border: "border-yellow-500/20",
      text: "text-yellow-600 dark:text-yellow-400",
      badge: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
    },
    flashcards: {
      card: "bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/20 dark:to-green-600/30",
      border: "border-green-500/20",
      text: "text-green-600 dark:text-green-400",
      badge: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
    }
  };

  return palettes[category] || palettes.achievement;
};

// Função para obter cor da liga
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

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalFlashcards: 150,
    completedFlashcards: 87,
    totalQuizzes: 12,
    averageScore: 78,
    currentStreak: 5,
    totalStudyTime: 1250,
    rank: 23,
    totalUsers: 156,
    level: 7,
    xp: 3420,
    nextLevelXp: 4000,
    totalScore: 1500 // Score inicial para demonstração
  });

  // Conquistas zeradas para novos usuários
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Primeira Vitória",
      description: "Complete seu primeiro quiz",
      icon: <Trophy className="h-8 w-8" />,
      unlocked: false, // Começa bloqueada
      progress: 0, // Progresso zerado
      maxProgress: 1,
      category: "achievement"
    },
    {
      id: "2",
      title: "Maratonista",
      description: "Estude por 7 dias seguidos",
      icon: <Flame className="h-8 w-8" />,
      unlocked: false, // Começa bloqueada
      progress: 0, // Progresso zerado
      maxProgress: 7,
      category: "achievement"
    },
    {
      id: "3",
      title: "Mestre dos Cards",
      description: "Complete 100 flashcards",
      icon: <Brain className="h-8 w-8" />,
      unlocked: false, // Começa bloqueada
      progress: 0, // Progresso zerado
      maxProgress: 100,
      category: "achievement"
    },
    {
      id: "4",
      title: "Escritor Nato",
      description: "Envie 10 redações",
      icon: <PenTool className="h-8 w-8" />,
      unlocked: false, // Começa bloqueada
      progress: 0, // Progresso zerado
      maxProgress: 10,
      category: "achievement"
    },
    {
      id: "5",
      title: "Primeira Liga",
      description: "Complete a Liga dos Aprendizes",
      icon: <CrownIcon className="h-8 w-8" />,
      unlocked: false, // Começa bloqueada
      progress: 0, // Progresso zerado
      maxProgress: 5,
      category: "achievement"
    }
  ]);

  // Obter informações do ranking RPG
  const currentRank = getRank(userStats.totalScore);
  const rankProgress = getRankProgress(userStats.totalScore);
  const allLeagues = getAllLeagues();

  const progressPercentage = (userStats.completedFlashcards / userStats.totalFlashcards) * 100;
  const xpProgress = ((userStats.xp % 1000) / 1000) * 100;

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
      }
      @keyframes pulse-soft {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .float-animation { animation: float 3s ease-in-out infinite; }
      .shimmer { 
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      .glow { animation: glow 2s ease-in-out infinite alternate; }
      .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      .hover-lift:hover { transform: translateY(-8px); transition: all 0.3s ease; }
      .card-gradient {
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const levelPalette = getColorPalette('level');
  const rankingPalette = getColorPalette('ranking');
  const progressPalette = getColorPalette('progress');
  const leaguePalette = getLeagueColor(currentRank.league);

  return (
    <DashboardShell>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Continue sua jornada épica rumo à aprovação no CIAAR
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`flex items-center gap-1 ${getColorPalette('achievement').badge}`}>
              <Flame className="h-3 w-3" />
              {userStats.currentStreak} dias consecutivos
            </Badge>
            <Badge className={`${levelPalette.badge} flex items-center gap-1 pulse-soft`}>
              <Crown className="h-3 w-3" />
              Nível {userStats.level}
            </Badge>
          </div>
        </div>

        {/* Card Principal do Ranking RPG */}
        <Card className={`${leaguePalette.card} ${leaguePalette.border} hover-lift transition-all duration-300`}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl mr-4">{currentRank.insignia.split(' ')[0]}</div>
              <div>
                <CardTitle className="text-2xl mb-2">{currentRank.name}</CardTitle>
                <Badge className={`${leaguePalette.badge} text-lg px-4 py-2`}>
                  {currentRank.league} • Nível {currentRank.level}
                </Badge>
              </div>
            </div>
            <p className="text-lg italic text-gray-300">"{currentRank.blessing}"</p>
          </CardHeader>
          <CardContent>
            {!rankProgress.isMaxRank ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Progresso para o próximo rank</p>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <span className="text-sm text-gray-400">{rankProgress.currentRank.name}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold">{rankProgress.nextRank.name}</span>
                  </div>
                  <Progress value={rankProgress.progress} className="h-3 mb-2" />
                  <p className="text-sm text-gray-400">
                    Faltam {rankProgress.scoreNeeded} pontos para {rankProgress.nextRank.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 text-lg">
                  🏆 Rank Máximo Alcançado!
                </Badge>
                <p className="text-sm text-gray-400 mt-2">
                  Você é uma {currentRank.name} - Parabéns!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Status Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card de Nível e XP */}
          <Card className={`${levelPalette.card} ${levelPalette.border} hover-lift transition-all duration-300`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Nível Atual</CardTitle>
                <Crown className={`h-5 w-5 ${levelPalette.text} float-animation`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-4xl font-bold ${levelPalette.text}`}>{userStats.level}</span>
                <span className="text-muted-foreground mb-1">Aspirante</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XP</span>
                  <span className={levelPalette.text}>{userStats.xp} / {userStats.nextLevelXp}</span>
                </div>
                <div className="relative">
                  <Progress value={xpProgress} className="h-3" />
                  <div className="absolute inset-0 shimmer rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Ranking */}
          <Card className={`${rankingPalette.card} ${rankingPalette.border} hover-lift transition-all duration-300`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ranking Geral</CardTitle>
                <Trophy className={`h-5 w-5 ${rankingPalette.text} float-animation`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-4xl font-bold ${rankingPalette.text}`}>#{userStats.rank}</span>
                <span className="text-muted-foreground mb-1">de {userStats.totalUsers}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Subiu 3 posições essa semana</span>
              </div>
            </CardContent>
          </Card>

          {/* Card de Progresso Geral */}
          <Card className={`${progressPalette.card} ${progressPalette.border} hover-lift transition-all duration-300`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Progresso Total</CardTitle>
                <Target className={`h-5 w-5 ${progressPalette.text} float-animation`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-4xl font-bold ${progressPalette.text}`}>{Math.round(progressPercentage)}%</span>
                <span className="text-muted-foreground mb-1">concluído</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-3" />
                <div className="absolute inset-0 shimmer rounded-full"></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {userStats.completedFlashcards} de {userStats.totalFlashcards} cards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Conquistas e Estatísticas */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="leagues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Ligas RPG
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              Atividades
            </TabsTrigger>
          </TabsList>

          {/* Tab de Conquistas */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const palette = getColorPalette(achievement.category);
                return (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all duration-300 hover-lift ${
                      achievement.unlocked 
                        ? `${palette.card} ${palette.border}` 
                        : 'bg-card/50 opacity-75 border-muted'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg transition-all duration-300 ${
                          achievement.unlocked 
                            ? `${palette.card} ${palette.text} pulse-soft` 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span className={achievement.unlocked ? palette.text : ''}>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={(achievement.progress / achievement.maxProgress) * 100} 
                                className="h-2"
                              />
                              {achievement.unlocked && <div className="absolute inset-0 shimmer rounded-full"></div>}
                            </div>
                          </div>
                        </div>
                        {achievement.unlocked ? (
                          <Badge className={`${palette.badge} pulse-soft`}>
                            Desbloqueado!
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab de Ligas RPG */}
          <TabsContent value="leagues" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allLeagues.map((league) => {
                const leaguePalette = getLeagueColor(league.name);
                const isCurrentLeague = league.name === currentRank.league;
                const isCompleted = userStats.totalScore >= league.maxScore;
                
                return (
                  <Card 
                    key={league.name}
                    className={`transition-all duration-300 hover-lift ${
                      isCurrentLeague 
                        ? `${leaguePalette.card} ${leaguePalette.border} ring-2 ring-offset-2 ring-offset-background ring-blue-500` 
                        : isCompleted 
                          ? 'bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20' 
                          : 'bg-card/50 opacity-75 border-muted'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                        {isCurrentLeague && <Badge className={`${leaguePalette.badge} pulse-soft`}>Atual</Badge>}
                        {isCompleted && <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">Completa</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold mb-1">{league.totalRanks}</p>
                          <p className="text-sm text-muted-foreground">Ranks</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Pontuação</span>
                            <span>{league.minScore} - {league.maxScore}</span>
                          </div>
                          <Progress 
                            value={isCompleted ? 100 : Math.min(100, ((userStats.totalScore - league.minScore) / (league.maxScore - league.minScore)) * 100)} 
                            className="h-2"
                          />
                        </div>
                        {isCurrentLeague && (
                          <p className="text-xs text-center text-blue-400">
                            Você está nesta liga!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab de Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Flashcards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {userStats.completedFlashcards}/{userStats.totalFlashcards}
                  </div>
                  <Progress value={progressPercentage} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(progressPercentage)}% concluído
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {userStats.totalQuizzes}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Média: {userStats.averageScore}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-green-500" />
                    Tempo de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {Math.round(userStats.totalStudyTime / 60)}h
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userStats.totalStudyTime} minutos total
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Atividades */}
          <TabsContent value="activities" className="space-y-6">
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Streak Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500 mb-2">
                    {userStats.currentStreak} dias
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Continue estudando para manter seu streak!
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                    Progresso Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Flashcards</span>
                      <span className="text-green-500">+12 esta semana</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quizzes</span>
                      <span className="text-blue-500">+3 esta semana</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP Ganho</span>
                      <span className="text-purple-500">+450 esta semana</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
} 