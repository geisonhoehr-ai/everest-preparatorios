"use client";

import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
  GraduationCap,
  FileText
} from "lucide-react";

// Carregamento lazy dos componentes pesados
const LevelUpModal = lazy(() => import("@/components/level-up-modal"));

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
    }
  };

  return palettes[category] || palettes.progress;
};

const getDifficultyColor = (level: number) => {
  if (level <= 3) return "text-green-500";
  if (level <= 6) return "text-yellow-500";
  if (level <= 9) return "text-orange-500";
  return "text-red-500";
};

function DashboardPageContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTeacher, setIsTeacher] = useState(false)
  
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

  const [loading, setLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({
    newLevel: 1,
    newTitle: '',
    insignia: '',
    blessing: '',
    activity: ''
  });
  const supabase = createClient();

  // Obter usuário logado (SIMPLIFICADO)
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error || !currentUser) {
          router.push('/login')
          return
        }

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_uuid', currentUser.id)
          .single()

        if (roleData) {
          setUser({ ...currentUser, role: roleData.role })
          setIsTeacher(roleData.role === 'teacher' || roleData.role === 'admin')
        } else {
          setUser({ ...currentUser, role: 'student' })
          setIsTeacher(false)
        }
        
        setIsLoading(false)
      } catch (error) {
        router.push('/login')
      }
    }

    getUser()
  }, [])

  // Remover useEffect desnecessário

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

  // Loading state
  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Usuário não autenticado</h2>
            <p className="text-muted-foreground">Redirecionando para login...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header do Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Bem-vindo, {user.email?.split('@')[0] || 'Usuário'}!
            </h1>
            <p className="text-gray-300 mt-1">
              {isTeacher ? 'Professor' : 'Aluno'} • {userStats.generalRank}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              Nível {userStats.level}
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              XP {userStats.xp}
            </Badge>
          </div>
        </div>

        {/* Cards de Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Flashcard Progress */}
          <Card className={`${getColorPalette('progress').card} ${getColorPalette('progress').border} hover-lift`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${getColorPalette('progress').text}`}>
                  Flashcards
                </CardTitle>
                <BookOpen className={`h-5 w-5 ${getColorPalette('progress').text}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progresso</span>
                  <span className="text-white font-medium">
                    {userStats.completedFlashcards}/{userStats.totalFlashcards}
                  </span>
                </div>
                <Progress 
                  value={progressPercentage || 0} 
                  className="h-2 bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Nível {userStats.flashcardLevel}</span>
                  <span>{userStats.flashcardXP} XP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Progress */}
          <Card className={`${getColorPalette('level').card} ${getColorPalette('level').border} hover-lift`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${getColorPalette('level').text}`}>
                  Quizzes
                </CardTitle>
                <Target className={`h-5 w-5 ${getColorPalette('level').text}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completados</span>
                  <span className="text-white font-medium">{userStats.totalQuizzes}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {userStats.averageScore}%
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Nível {userStats.quizLevel}</span>
                  <span>{userStats.quizXP} XP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className={`${getColorPalette('ranking').card} ${getColorPalette('ranking').border} hover-lift`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${getColorPalette('ranking').text}`}>
                  Sequência
                </CardTitle>
                <Flame className={`h-5 w-5 ${getColorPalette('ranking').text}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-white">
                  {userStats.currentStreak} dias
                </div>
                <div className="text-sm text-gray-400">
                  Sequência atual de estudo
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Ranking</span>
                  <span>#{userStats.rank}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card className={`${getColorPalette('achievement').card} ${getColorPalette('achievement').border} hover-lift`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${getColorPalette('achievement').text}`}>
                  XP Total
                </CardTitle>
                <Star className={`h-5 w-5 ${getColorPalette('achievement').text}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-white">
                  {userStats.xp}
                </div>
                <div className="text-sm text-gray-400">
                  Para próximo nível: {userStats.nextLevelXp - userStats.xp}
                </div>
                <Progress 
                  value={xpProgress} 
                  className="h-2 bg-gray-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
            <CardDescription className="text-gray-400">
              Acesse rapidamente as funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/flashcards">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Flashcards</span>
                </Button>
              </Link>
              
              <Link href="/quiz">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-500 hover:text-white transition-all">
                  <Target className="h-6 w-6" />
                  <span className="text-sm">Quizzes</span>
                </Button>
              </Link>
              
              <Link href="/provas">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-500 hover:text-white transition-all">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Provas</span>
                </Button>
              </Link>
              
              <Link href="/redacao">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all">
                  <PenTool className="h-6 w-6" />
                  <span className="text-sm">Redação</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Conquistas</CardTitle>
            <CardDescription className="text-gray-400">
              Suas conquistas e progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-green-500/20 border-green-500/30 text-green-300'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${achievement.unlocked ? 'text-green-400' : 'text-gray-500'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs opacity-80">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progresso</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1 bg-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Level Up */}
      <Suspense fallback={<div>Carregando...</div>}>
        {showLevelUp && (
          <LevelUpModal
            open={showLevelUp}
            onOpenChange={setShowLevelUp}
            newLevel={levelUpData.newLevel}
            newTitle={levelUpData.newTitle}
            insignia={levelUpData.insignia}
            blessing={levelUpData.blessing}
            activity={levelUpData.activity}
          />
        )}
      </Suspense>
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return <DashboardPageContent />;
} 