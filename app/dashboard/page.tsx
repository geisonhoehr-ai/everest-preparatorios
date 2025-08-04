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
import { LevelUpModal } from "@/components/level-up-modal";
import { 
  getUserRPGProgress, 
  getGeneralRanking, 
  getCategoryRanking,
  getUserAchievements,
  updateStudyStreak,
  addActivityXP
} from "@/lib/rpg-system";
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
  ArrowRight
} from "lucide-react";

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
  // RPG System
  generalRank: string;
  flashcardRank: string;
  quizRank: string;
  redacaoRank: string;
  provaRank: string;
  flashcardLevel: number;
  quizLevel: number;
  redacaoLevel: number;
  provaLevel: number;
  flashcardXP: number;
  quizXP: number;
  redacaoXP: number;
  provaXP: number;
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
      text: "text-amber-600 dark:text-amber-400",
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
      button: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
    },
    quiz: {
      card: "bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-900/20 dark:to-orange-600/30",
      border: "border-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      button: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
    },
    redacao: {
      card: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 dark:from-indigo-900/20 dark:to-indigo-600/30",
      border: "border-indigo-500/20",
      text: "text-indigo-600 dark:text-indigo-400",
      button: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
    },
    community: {
      card: "bg-gradient-to-br from-pink-500/10 to-pink-600/20 dark:from-pink-900/20 dark:to-pink-600/30",
      border: "border-pink-500/20",
      text: "text-pink-600 dark:text-pink-400",
      button: "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
    }
  };

  return palettes[category] || palettes.progress;
};

// Difficulty colors for stats
const getDifficultyColor = (level: number) => {
  if (level <= 3) return 'from-green-500 to-green-600'; // Easy
  if (level <= 6) return 'from-orange-500 to-orange-600'; // Medium  
  return 'from-red-500 to-red-600'; // Hard
};

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalFlashcards: 0,
    completedFlashcards: 0,
    totalQuizzes: 0,
    averageScore: 0,
    currentStreak: 0,
    totalStudyTime: 0,
    rank: 0,
    totalUsers: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    // RPG System
    generalRank: 'Novato da Guilda',
    flashcardRank: 'Novato da Guilda',
    quizRank: 'Novato da Guilda',
    redacaoRank: 'Novato da Guilda',
    provaRank: 'Novato da Guilda',
    flashcardLevel: 1,
    quizLevel: 1,
    redacaoLevel: 1,
    provaLevel: 1,
    flashcardXP: 0,
    quizXP: 0,
    redacaoXP: 0,
    provaXP: 0
  });

  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({
    newLevel: 1,
    newTitle: '',
    insignia: '',
    blessing: '',
    activity: ''
  });
  const supabase = createClient();

  // Função para carregar dados do usuário
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Erro ao obter usuário:', authError);
        return;
      }

      // Carregar perfil do aluno
      const { data: studentProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_uuid', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', profileError);
        return;
      }

      // Se não existe perfil, criar um novo com dados zerados
      if (!studentProfile) {
        const initialProfile = {
          user_uuid: user.id,
          nome_completo: 'Novo Aluno',
          total_flashcards: 0,
          completed_flashcards: 0,
          total_quizzes: 0,
          completed_quizzes: 0,
          average_score: 0,
          current_streak: 0,
          longest_streak: 0,
          total_study_time: 0,
          total_xp: 0,
          current_level: 1,
          last_login_at: new Date().toISOString()
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('student_profiles')
          .insert(initialProfile)
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar perfil inicial:', insertError);
          return;
        }

        // Atualizar stats com dados zerados
        setUserStats({
          totalFlashcards: 0,
          completedFlashcards: 0,
          totalQuizzes: 0,
          averageScore: 0,
          currentStreak: 0,
          totalStudyTime: 0,
          rank: 0,
          totalUsers: 0,
          level: 1,
          xp: 0,
          nextLevelXp: 1000,
          // RPG System
          generalRank: 'Novato da Guilda',
          flashcardRank: 'Novato da Guilda',
          quizRank: 'Novato da Guilda',
          redacaoRank: 'Novato da Guilda',
          provaRank: 'Novato da Guilda',
          flashcardLevel: 1,
          quizLevel: 1,
          redacaoLevel: 1,
          provaLevel: 1,
          flashcardXP: 0,
          quizXP: 0,
          redacaoXP: 0,
          provaXP: 0
        });
      } else {
        // Atualizar last_login_at
        await supabase
          .from('student_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_uuid', user.id);

        // Carregar ranking geral
        const { data: allProfiles, error: rankingError } = await supabase
          .from('student_profiles')
          .select('total_xp')
          .order('total_xp', { ascending: false });

                 if (!rankingError && allProfiles) {
           const userRank = allProfiles.findIndex((profile: any) => profile.total_xp === studentProfile.total_xp) + 1;
          const totalUsers = allProfiles.length;

          // Atualizar stats com dados reais
          setUserStats({
            totalFlashcards: studentProfile.total_flashcards || 0,
            completedFlashcards: studentProfile.completed_flashcards || 0,
            totalQuizzes: studentProfile.total_quizzes || 0,
            averageScore: studentProfile.average_score || 0,
            currentStreak: studentProfile.current_streak || 0,
            totalStudyTime: studentProfile.total_study_time || 0,
            rank: userRank,
            totalUsers: totalUsers,
            level: studentProfile.current_level || 1,
            xp: studentProfile.total_xp || 0,
            nextLevelXp: ((studentProfile.current_level || 1) * 1000),
            // RPG System
            generalRank: studentProfile.general_rank || 'Novato da Guilda',
            flashcardRank: studentProfile.flashcard_rank || 'Novato da Guilda',
            quizRank: studentProfile.quiz_rank || 'Novato da Guilda',
            redacaoRank: studentProfile.redacao_rank || 'Novato da Guilda',
            provaRank: studentProfile.prova_rank || 'Novato da Guilda',
            flashcardLevel: studentProfile.flashcard_level || 1,
            quizLevel: studentProfile.quiz_level || 1,
            redacaoLevel: studentProfile.redacao_level || 1,
            provaLevel: studentProfile.prova_level || 1,
            flashcardXP: studentProfile.flashcard_xp || 0,
            quizXP: studentProfile.quiz_xp || 0,
            redacaoXP: studentProfile.redacao_xp || 0,
            provaXP: studentProfile.prova_xp || 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadUserData();
  }, []);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Primeira Vitória",
      description: "Complete seu primeiro quiz",
      icon: <Trophy className="h-8 w-8" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      category: "unlocked"
    },
    {
      id: "2",
      title: "Maratonista",
      description: "Estude por 7 dias seguidos",
      icon: <Flame className="h-8 w-8" />,
      unlocked: false,
      progress: 5,
      maxProgress: 7,
      category: "achievement"
    },
    {
      id: "3",
      title: "Mestre dos Cards",
      description: "Complete 100 flashcards",
      icon: <Brain className="h-8 w-8" />,
      unlocked: false,
      progress: 87,
      maxProgress: 100,
      category: "achievement"
    },
    {
      id: "4",
      title: "Escritor Nato",
      description: "Envie 10 redações",
      icon: <PenTool className="h-8 w-8" />,
      unlocked: false,
      progress: 6,
      maxProgress: 10,
      category: "achievement"
    }
  ]);

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

  // Loading state
  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-lg">Carregando seu progresso...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Header - Melhorado para mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Continue sua jornada rumo à aprovação no CIAAR
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Badge variant="outline" className={`flex items-center gap-1 text-xs sm:text-sm ${getColorPalette('achievement').badge}`}>
              <Flame className="h-3 w-3" />
              {userStats.currentStreak} dias consecutivos
            </Badge>
            <Badge className={`${levelPalette.badge} flex items-center gap-1 pulse-soft text-xs sm:text-sm`}>
              <Crown className="h-3 w-3" />
              Nível {userStats.level}
            </Badge>
          </div>
        </div>

        {/* Cards de Status Principal - Melhorado para mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Card de Nível e XP */}
          <Card className={`${levelPalette.card} ${levelPalette.border} hover-lift transition-all duration-300`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Nível Atual</CardTitle>
                <Crown className={`h-4 w-4 sm:h-5 sm:w-5 ${levelPalette.text} float-animation`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl sm:text-4xl font-bold ${levelPalette.text}`}>{userStats.level}</span>
                <span className="text-xs sm:text-sm text-muted-foreground mb-1">Aspirante</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">XP</span>
                  <span className={levelPalette.text}>{userStats.xp} / {userStats.nextLevelXp}</span>
                </div>
                <div className="relative">
                  <Progress value={xpProgress} className="h-2 sm:h-3 relative z-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Ranking */}
          <Card className={`${rankingPalette.card} ${rankingPalette.border} hover-lift transition-all duration-300`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Ranking Geral</CardTitle>
                <Trophy className={`h-4 w-4 sm:h-5 sm:w-5 ${rankingPalette.text} float-animation`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl sm:text-4xl font-bold ${rankingPalette.text}`}>#{userStats.rank}</span>
                <span className="text-xs sm:text-sm text-muted-foreground mb-1">de {userStats.totalUsers}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span className="text-xs sm:text-sm text-green-500">Subiu 3 posições essa semana</span>
              </div>
            </CardContent>
          </Card>

          {/* Card de Progresso Geral */}
          <Card className={`${progressPalette.card} ${progressPalette.border} hover-lift transition-all duration-300 sm:col-span-2 lg:col-span-1`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Progresso Total</CardTitle>
                <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${progressPalette.text} float-animation`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl sm:text-4xl font-bold ${progressPalette.text}`}>{Math.round(progressPercentage)}%</span>
                <span className="text-xs sm:text-sm text-muted-foreground mb-1">concluído</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-2 sm:h-3 relative z-10" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {userStats.completedFlashcards} de {userStats.totalFlashcards} cards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Conquistas e Estatísticas - Melhorado para mobile */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm">
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-xs sm:text-sm">
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-xs sm:text-sm">
              Atividades
            </TabsTrigger>
          </TabsList>

          {/* Tab de Conquistas */}
          <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                          achievement.unlocked 
                            ? `${palette.card} ${palette.text} pulse-soft` 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <div className="h-6 w-6 sm:h-8 sm:w-8">
                            {achievement.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg mb-1">{achievement.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">{achievement.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span>Progresso</span>
                              <span className={achievement.unlocked ? palette.text : ''}>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={(achievement.progress / achievement.maxProgress) * 100} 
                                className="h-2 relative z-10"
                              />
                            </div>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Badge className={`${palette.badge} pulse-soft text-xs`}>
                            Desbloqueado!
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab de Estatísticas */}
          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className={`${getColorPalette('redacao').card} ${getColorPalette('redacao').border} hover-lift transition-all duration-300`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Timer className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('redacao').text}`} />
                    <span className={`text-xl sm:text-2xl font-bold ${getColorPalette('redacao').text}`}>{Math.round(userStats.totalStudyTime / 60)}h</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tempo de estudo</p>
                </CardContent>
              </Card>

              <Card className={`${getColorPalette('flashcards').card} ${getColorPalette('flashcards').border} hover-lift transition-all duration-300`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Brain className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('flashcards').text}`} />
                    <span className={`text-xl sm:text-2xl font-bold ${getColorPalette('flashcards').text}`}>{userStats.completedFlashcards}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Cards estudados</p>
                </CardContent>
              </Card>

              <Card className={`${getColorPalette('quiz').card} ${getColorPalette('quiz').border} hover-lift transition-all duration-300`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('quiz').text}`} />
                    <span className={`text-xl sm:text-2xl font-bold ${getColorPalette('quiz').text}`}>{userStats.averageScore}%</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Média nos quizzes</p>
                </CardContent>
              </Card>

              <Card className={`${getColorPalette('community').card} ${getColorPalette('community').border} hover-lift transition-all duration-300`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('community').text}`} />
                    <span className={`text-xl sm:text-2xl font-bold ${getColorPalette('community').text}`}>{userStats.currentStreak}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dias de sequência</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Progresso Semanal */}
            <Card className={`${progressPalette.card} ${progressPalette.border} hover-lift transition-all duration-300`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className={`h-4 w-4 sm:h-5 sm:w-5 ${progressPalette.text}`} />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 sm:h-48 flex items-end justify-between gap-1 sm:gap-2">
                  {[65, 80, 45, 90, 75, 100, 85].map((height, index) => {
                    const difficultyGradient = getDifficultyColor(Math.floor(height / 20) + 1);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                        <div 
                          className={`w-full bg-gradient-to-t ${difficultyGradient} rounded-t hover-lift transition-all duration-300`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Atividades */}
          <TabsContent value="activities" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className={`group hover:shadow-lg transition-all hover:scale-[1.02] ${getColorPalette('flashcards').card} ${getColorPalette('flashcards').border}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <BookOpen className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('flashcards').text}`} />
                    Continuar Flashcards
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Você tem 63 cards para revisar hoje
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Progress value={30} className="h-2 sm:h-3 relative z-10" />
                  </div>
                  <Link href="/flashcards">
                    <Button className={`w-full ${getColorPalette('flashcards').button} shadow-lg text-sm`}>
                      Estudar Agora
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className={`group hover:shadow-lg transition-all hover:scale-[1.02] ${getColorPalette('redacao').card} ${getColorPalette('redacao').border}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PenTool className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('redacao').text}`} />
                    Nova Redação
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Pratique com o tema da semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-muted">
                    <p className="text-xs sm:text-sm font-medium">Tema: "Desafios da mobilidade urbana"</p>
                  </div>
                  <Link href="/redacao">
                    <Button className={`w-full ${getColorPalette('redacao').button} shadow-lg text-sm`}>
                      Começar Redação
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className={`group hover:shadow-lg transition-all hover:scale-[1.02] ${getColorPalette('quiz').card} ${getColorPalette('quiz').border}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('quiz').text}`} />
                    Quiz Rápido
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Teste seus conhecimentos em 10 minutos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">Português</Badge>
                    <Badge variant="secondary" className="bg-slate-500/20 text-slate-700 dark:text-slate-300 text-xs">10 questões</Badge>
                  </div>
                  <Link href="/quiz">
                    <Button className={`w-full ${getColorPalette('quiz').button} shadow-lg text-sm`}>
                      Iniciar Quiz
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className={`group hover:shadow-lg transition-all hover:scale-[1.02] ${getColorPalette('community').card} ${getColorPalette('community').border}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className={`h-4 w-4 sm:h-5 sm:w-5 ${getColorPalette('community').text}`} />
                    Comunidade
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Participe das discussões e tire dúvidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-muted">
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium">5 novas</span> respostas no seu tópico
                    </p>
                  </div>
                  <Link href="/community">
                    <Button className={`w-full ${getColorPalette('community').button} shadow-lg text-sm`}>
                      Ver Comunidade
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Level Up */}
      <LevelUpModal
        open={showLevelUp}
        onOpenChange={setShowLevelUp}
        newLevel={levelUpData.newLevel}
        newTitle={levelUpData.newTitle}
        insignia={levelUpData.insignia}
        blessing={levelUpData.blessing}
        activity={levelUpData.activity}
      />
    </DashboardShell>
  );
} 