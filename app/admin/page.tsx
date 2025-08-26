"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Brain, 
  PenTool, 
  Trophy, 
  TrendingUp,
  Crown,
  Settings,
  BarChart3,
  Activity,
  UserCheck,
  Shield,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalProvas: number;
  activeUsers: number;
  newUsersThisWeek: number;
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    totalProvas: 0,
    activeUsers: 0,
    newUsersThisWeek: 0
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Verificar role diretamente
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', user.email)
            .single();

          if (!roleError && roleData) {
            setUserRole(roleData.role);
            
            // Se não for admin, redirecionar
            if (roleData.role !== 'admin') {
              window.location.href = '/access-denied';
              return;
            }
          }
        }

        // Carregar estatísticas de admin (mock data por enquanto)
        setAdminStats({
          totalUsers: 150,
          totalTeachers: 8,
          totalStudents: 142,
          totalFlashcards: 1250,
          totalQuizzes: 45,
          totalProvas: 12,
          activeUsers: 89,
          newUsersThisWeek: 23
        });
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando painel administrativo...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, conteúdo e configurações do sistema.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {userRole || 'Carregando...'}
            </Badge>
            <Crown className="h-5 w-5 text-yellow-600" />
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{adminStats.newUsersThisWeek} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Ativos no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalFlashcards}</div>
              <p className="text-xs text-muted-foreground">
                Total no sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Administrativas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
              <CardDescription>
                Adicione, edite ou remova usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/membros">
                  Gerenciar Usuários
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Gerenciar Conteúdo
              </CardTitle>
              <CardDescription>
                Flashcards, quizzes e provas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/flashcards">
                  Gerenciar Conteúdo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Estatísticas e análises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">
                  Ver Relatórios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configurações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/settings">
                  Configurações
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Gerenciar Turmas
              </CardTitle>
              <CardDescription>
                Organize alunos em turmas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/turmas">
                  Gerenciar Turmas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Suporte
              </CardTitle>
              <CardDescription>
                Central de suporte e tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/suporte">
                  Ver Suporte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
} 
