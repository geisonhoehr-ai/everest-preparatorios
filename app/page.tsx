"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRoleClient } from "@/lib/get-user-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, BookOpen, Target, Trophy, Zap, Shield, ArrowRight, Play, Clock, Award, Medal, TrendingUp, BarChart3, Brain, CheckSquare, Moon, Video, FileText, Headphones, MessageCircle, Gift, Bookmark, Calendar } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const role = await getUserRoleClient(user.email);
          console.log("User role on landing page:", role);
          
          if (role === "teacher") {
            router.push("/teacher");
          } else if (role === "admin" || role === "student") {
            router.push("/dashboard");
          } else {
            // Se tiver usuário mas não tiver role, vai para dashboard
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setChecking(false);
      }
    }
    checkAndRedirect();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="text-lg font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
      {/* Header/Navigation */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Everest Preparatórios
              </span>
            </div>
            <Link href="/login">
              <Button variant="outline" className="bg-white text-black hover:bg-gray-100 font-semibold">
                Área do Aluno
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{
        backgroundImage: 'url(https://www.todamateria.com.br/monte-everest/)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Star className="w-4 h-4 mr-2" />
              Plataforma #1 para CIAAR
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">
              Conquiste sua
              <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Vaga no CIAAR
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              A plataforma mais completa para estudar Português e Redação para o concurso da Força Aérea Brasileira. 
              <span className="text-orange-400 font-semibold"> 785+ flashcards</span>, simulados exclusivos e correção de redações.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>7 dias grátis</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-500 mr-2" />
                <span>Cancelamento a qualquer momento</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-500 mr-2" />
                <span>+80 alunos aprovados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Principal */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para conquistar sua
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> vaga no EAOF 2026?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Junte-se aos mais de 80 alunos aprovados que já passaram no EAOF com nossa metodologia comprovada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://pay.kiwify.com.br/vNzKPkd" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-4">
                <Zap className="w-5 h-5 mr-2" />
                Garantir Minha Vaga - R$ 998,50
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-lg px-8 py-4">
                <ArrowRight className="w-5 h-5 mr-2" />
                Já tenho conta
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            ⚡ Oferta por tempo limitado - Vagas restritas
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Everest Preparatórios
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Plataforma não oficial, sem vínculo com a Força Aérea Brasileira.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-orange-400 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Suporte</a>
            </div>
            <p className="text-gray-500 text-xs mt-6">
              &copy; {new Date().getFullYear()} Everest Preparatórios. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
