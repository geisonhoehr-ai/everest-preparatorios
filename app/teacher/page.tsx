"use client";

import { useAuth } from "@/lib/auth-simple";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Target, 
  PenTool, 
  BarChart3, 
  Calendar,
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) { // Apenas quando o estado de carregamento do useAuth for resolvido
      if (!user) {
        console.log('❌ [TEACHER] Usuário não autenticado, redirecionando para login');
        router.push('/login');
      } else if (user.role !== 'teacher' && user.role !== 'admin') {
        console.log('❌ [TEACHER] Role insuficiente:', user.role, 'redirecionando para dashboard');
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Mostrar loading enquanto o useAuth está carregando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado ou não tiver o role correto após o carregamento,
  // o useEffect acima já terá iniciado o redirecionamento.
  // Retornar null aqui evita renderizar o conteúdo da página antes do redirecionamento.
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Painel do Professor
                </h1>
                <p className="text-gray-300 text-sm">
                  Bem-vindo, {user.email?.split('@')[0] || 'Professor'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {user.role === 'teacher' ? 'Professor' : 'Administrador'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-300 border-gray-600 hover:bg-gray-700">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-400">
                    Total de Alunos
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">85</div>
                <div className="text-sm text-gray-400">Alunos matriculados</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-green-400">
                    Alunos Ativos
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">67</div>
                <div className="text-sm text-gray-400">Estudando esta semana</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-purple-400">
                    Média Geral
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">78%</div>
                <div className="text-sm text-gray-400">Performance geral</div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/membros">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-white">Alunos</h3>
                      <p className="text-sm text-gray-400">Gerenciar turmas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/flashcards">
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-orange-400" />
                    <div>
                      <h3 className="font-semibold text-white">Flashcards</h3>
                      <p className="text-sm text-gray-400">Criar conteúdo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/quiz">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20 hover:border-green-500/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-white">Quizzes</h3>
                      <p className="text-sm text-gray-400">Criar avaliações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/redacao">
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <PenTool className="h-6 w-6 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Redações</h3>
                      <p className="text-sm text-gray-400">Corrigir trabalhos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Mensagem de Sucesso */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">✅ Sistema de Autenticação Funcionando!</h3>
                <p className="text-gray-300">
                  Login persistente e controle de acesso por perfil implementados com sucesso.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Role: {user.role} | Email: {user.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
