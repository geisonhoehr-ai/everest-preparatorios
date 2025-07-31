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
          const role = await getUserRoleClient(user.id);
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
            <Link href="/login-simple">
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
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400 mb-8">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup-simple">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login-simple">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Casos de Sucesso */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Casos de Sucesso
            </h2>
            <p className="text-xl text-gray-300">
              Mais de 80 alunos aprovados no EAOF com nossa metodologia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                SVE
              </h3>
              <div className="space-y-2">
                <div className="text-sm text-blue-100">🏆 ADRIANO PONTES NEPOMUCENO</div>
                <div className="text-sm text-blue-100">🏆 ALISSON ALVES OLIVEIRA LEITE</div>
                <div className="text-sm text-blue-100">🏆 VICTOR SALUSTRINO BEZERRA</div>
                <div className="text-sm text-blue-100">🏆 DENIS MOURA DE MELO</div>
                <div className="text-sm text-blue-100">🏆 ANTONIO DE PÁDUA AGUIAR FILHO</div>
                <div className="text-sm text-blue-100">🏆 REGINALDO CESAR DUARTE</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                GDS
              </h3>
              <div className="space-y-2">
                <div className="text-sm text-green-100">🏆 ALEXANDRE ALEX LUDOVINO DA FONSECA</div>
                <div className="text-sm text-green-100">🏆 ANDERSON BARBOSA MARTINS</div>
                <div className="text-sm text-green-100">🏆 DANIEL ELIAS VELASCO</div>
                <div className="text-sm text-green-100">🏆 MANUEL COSTA SOARES</div>
                <div className="text-sm text-green-100">🏆 MARCELO SANTOS PACHECO</div>
                <div className="text-sm text-green-100">🏆 ROBSON MARTINS REIS</div>
                <div className="text-sm text-green-100">🏆 THENÓRIO ALMEIDA LOPES DE ARAÚJO</div>
                <div className="text-sm text-green-100">🏆 THIAGO SOARES DE BARROS</div>
                <div className="text-sm text-green-100">🏆 WAGNER DA SILVA DE FARIAS</div>
                <div className="text-sm text-green-100">🏆 ROBERTO MÁRCIO DE MELO JUNIOR</div>
                <div className="text-sm text-green-100">🏆 GILSON CONCEIÇÃO DE ARAÚJO</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                CTA
              </h3>
              <div className="space-y-2">
                <div className="text-sm text-purple-100">🏆 ALINE VEIGA DO NASCIMENTO</div>
                <div className="text-sm text-purple-100">🏆 GEANDRO PINHEIRO PIRES</div>
                <div className="text-sm text-purple-100">🏆 MARCOS CORREIA DOS SANTOS</div>
                <div className="text-sm text-purple-100">🏆 NARA LUANA XAVIER DA SILVA FERREIRA</div>
                <div className="text-sm text-purple-100">🏆 VITOR EMANUEL REZENDE PEREIRA</div>
                <div className="text-sm text-purple-100">🏆 MARCO ANTONIO FREITAS DE ABREU</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                COM
              </h3>
              <div className="space-y-2">
                <div className="text-sm text-orange-100">🏆 DAVI NILSON MOREIRA CARDOSO</div>
                <div className="text-sm text-orange-100">🏆 GERSON FÁBIO DE PINHO GONÇALVES</div>
                <div className="text-sm text-orange-100">🏆 GILSOMAR DE OLIVEIRA THOMAZ</div>
                <div className="text-sm text-orange-100">🏆 WILLIAM DO NASCIMENTO FERREIRA</div>
                <div className="text-sm text-orange-100">🏆 FREDSON ALVES DE FARIA</div>
                <div className="text-sm text-orange-100">🏆 JORGE CARDOSO PALHETA</div>
                <div className="text-sm text-orange-100">🏆 FLÁVIA CARVALHO CALDAS</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-full font-semibold text-lg">
              <Trophy className="w-6 h-6 mr-3" />
              Total: 80+ Alunos Aprovados
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-gradient-to-b from-transparent to-[#0f172a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tudo que você precisa para
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> passar no CIAAR</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Nossa plataforma foi desenvolvida especificamente para o concurso da FAB, 
              com conteúdo 100% alinhado ao edital e metodologia comprovada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Flashcards Inteligentes</CardTitle>
                <CardDescription className="text-gray-300">
                  Sistema de repetição espaçada com 785+ flashcards de Português e Regulamentos Militares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Algoritmo SM-2 para memorização eficiente
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Progresso personalizado por tópico
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Estatísticas detalhadas de aprendizado
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Simulados Exclusivos</CardTitle>
                <CardDescription className="text-gray-300">
                  Questões inéditas baseadas no edital do CIAAR com explicações detalhadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    19 quizzes de Português e Regulamentos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Questões comentadas por especialistas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Simulados cronometrados
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Correção de Redações</CardTitle>
                <CardDescription className="text-gray-300">
                  Envie suas redações e receba feedback detalhado dos nossos professores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Correção em até 48 horas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Feedback personalizado
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Dicas de melhoria
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Comunidade Exclusiva</CardTitle>
                <CardDescription className="text-gray-300">
                  Conecte-se com outros candidatos e tire dúvidas com professores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Fórum de discussões
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Lives semanais
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Suporte direto
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Ranking e Progresso</CardTitle>
                <CardDescription className="text-gray-300">
                  Acompanhe sua evolução e dispute o ranking com outros alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Estatísticas detalhadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Ranking semanal
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Conquistas e badges
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Lives Especiais</CardTitle>
                <CardDescription className="text-gray-300">
                  Participe de lives exclusivas e tire dúvidas ao vivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Lives semanais
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Dúvidas ao vivo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Conteúdo exclusivo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* O que está incluído */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              O que está
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> incluído</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Um curso completo com tudo que você precisa para passar no CIAAR da primeira vez.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">120+ Aulas Gravadas</CardTitle>
                <CardDescription className="text-gray-300">
                  Aulas completas de Português e Regulamentos Militares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Gramática completa
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Interpretação de textos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Regulamentos militares
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Material de Apoio</CardTitle>
                <CardDescription className="text-gray-300">
                  PDFs, resumos e material complementar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Resumos em PDF
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Mapas mentais
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Listas de exercícios
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Simulados Exclusivos</CardTitle>
                <CardDescription className="text-gray-300">
                  20 simulados completos com questões inéditas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Simulados cronometrados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Questões comentadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Relatórios de desempenho
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Lives Semanais</CardTitle>
                <CardDescription className="text-gray-300">
                  Aulas ao vivo com professores especialistas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Toda quarta-feira
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Dúvidas ao vivo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Conteúdo exclusivo
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Grupo VIP</CardTitle>
                <CardDescription className="text-gray-300">
                  Comunidade exclusiva com suporte direto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    WhatsApp exclusivo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Suporte 24/7
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Networking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Correção de Redações</CardTitle>
                <CardDescription className="text-gray-300">
                  Envie até 20 redações com correção detalhada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Correção em 24h
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Feedback personalizado
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Dicas de melhoria
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professor Tiago Costa Section */}
      <section id="sobre" className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conheça o
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Professor Tiago Costa</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Especialista em concursos militares com mais de 10 anos de experiência
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="w-48 h-48 mx-auto md:mx-0 mb-8 rounded-full overflow-hidden border-4 border-orange-500/20">
                <img
                  src="/professor-tiago-costa.jpg"
                  alt="Professor Tiago Costa"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-orange-400">Tiago Costa de Oliveira</h3>
              <p className="text-lg text-gray-300 mb-6">
                Especialista dedicado exclusivamente aos concursos militares
              </p>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Metodologia comprovada com +80 aprovados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Aulas estruturadas entre teoria e prática</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Abordagem direta e objetiva</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte personalizado durante todo o curso</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-orange-500/20">
                <h4 className="text-xl font-bold mb-4 text-orange-400">Metodologia Comprovada</h4>
                <p className="text-gray-300 mb-4">
                  O professor Tiago Costa apresenta o curso com módulos organizados entre teoria e prática, 
                  garantindo uma abordagem estruturada e direta para sua aprovação no EAOF.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-orange-400 mr-2" />
                    <span>Foco no EAOF</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-orange-400 mr-2" />
                    <span>Material Atualizado</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-orange-400 mr-2" />
                    <span>+80 Aprovados</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 text-orange-400 mr-2" />
                    <span>Resultados Comprovados</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-orange-500/20">
                <h4 className="text-xl font-bold mb-4 text-orange-400">Por que escolher o Professor Tiago?</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Especialista dedicado exclusivamente aos concursos militares</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Metodologia testada e aprovada por centenas de alunos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Aulas práticas e diretas ao ponto</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Suporte personalizado durante todo o curso</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 bg-gradient-to-r from-orange-500/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Investimento
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> especial</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              De R$ 1.497 por apenas R$ 998,50. Economia de R$ 498,50 + bônus exclusivos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-gray-600">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">De</CardTitle>
                <div className="text-4xl font-bold text-gray-400 line-through">R$ 1.497</div>
                <CardDescription className="text-gray-300">
                  Preço original
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-gray-500 mr-3" />
                    <span>Curso básico</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-gray-500 mr-3" />
                    <span>Sem bônus</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-gray-500 mr-3" />
                    <span>Acesso limitado</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500 relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-4 py-1">
                  <Gift className="w-4 h-4 mr-2" />
                  Oferta Limitada
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Por</CardTitle>
                <div className="text-4xl font-bold text-orange-400">R$ 998,50</div>
                <CardDescription className="text-gray-300">
                  ou 12x de R$ 99,85
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Curso completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>+5 bônus exclusivos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Acesso vitalício</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Garantia de 30 dias</span>
                  </li>
                </ul>
                <a href="https://pay.kiwify.com.br/vNzKPkd" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Garantir Minha Vaga
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Bônus */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-8">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Bônus Exclusivos</span> (Valor: R$ 497)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg p-6 border border-orange-500/20">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-2">E-book "Dicas de Prova"</h4>
                <p className="text-sm text-gray-300">50 dicas exclusivas para maximizar sua pontuação</p>
              </div>
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg p-6 border border-orange-500/20">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-2">Workshop "Como Estudar"</h4>
                <p className="text-sm text-gray-300">Metodologia comprovada de estudo eficiente</p>
              </div>
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg p-6 border border-orange-500/20">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold mb-2">Cronograma Personalizado</h4>
                <p className="text-sm text-gray-300">Plano de estudos adaptado ao seu tempo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-8 border border-orange-500/20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Garantia de
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"> 30 dias</span>
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Se em até 30 dias você não estiver satisfeito, devolvemos 100% do seu dinheiro. 
              Sem perguntas, sem complicações.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Devolução integral</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Sem perguntas</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Processo simples</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-500/10 to-purple-500/10">
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
            <Link href="/login-simple">
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

      {/* Conheça Nossa Plataforma */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Conheça Nossa
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Plataforma</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Veja como é estudar na plataforma mais completa para o CIAAR.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Dashboard do Aluno */}
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  <CardTitle className="text-xl">Dashboard do Aluno</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300">Progresso Geral</span>
                    <span className="text-sm text-orange-400 font-semibold">78%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">156</p>
                      <p className="text-xs text-gray-400">Flashcards</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">12</p>
                      <p className="text-xs text-gray-400">Quizzes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sistema de Flashcards */}
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <CardTitle className="text-xl">Sistema de Flashcards</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-lg p-4 mb-4">
                  <div className="bg-white rounded-lg p-4 mb-3">
                    <p className="text-gray-800 font-semibold mb-2">O que é um substantivo?</p>
                    <p className="text-gray-600 text-sm">Clique para ver a resposta</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                      Fácil
                    </Button>
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      Médio
                    </Button>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      Difícil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Interativo */}
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <CheckSquare className="w-6 h-6 text-blue-500" />
                  <CardTitle className="text-xl">Quiz Interativo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-lg p-4 mb-4">
                  <p className="text-white font-semibold mb-3">Questão 1 de 10</p>
                  <p className="text-gray-300 text-sm mb-4">Qual é a função do artigo na língua portuguesa?</p>
                  <div className="space-y-2">
                    <div className="bg-gray-700 rounded p-2 text-sm text-gray-300">
                      A) Determinar o substantivo
                    </div>
                    <div className="bg-green-600 rounded p-2 text-sm text-white font-semibold">
                      ✓ B) Anteceder e determinar o substantivo
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-sm text-gray-300">
                      C) Substituir o substantivo
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-sm text-gray-300">
                      D) Qualificar o substantivo
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-sm text-green-400">+10 pontos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vídeo Promocional */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Veja o que nossos
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> alunos dizem</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Assista ao depoimento de alunos aprovados no EAOF 2025 e entenda como nossa metodologia funciona.
            </p>
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative aspect-video bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl overflow-hidden border border-orange-500/20">
              <iframe
                src="https://www.youtube.com/embed/VqvU4orX3qk"
                title="Depoimentos de Alunos Aprovados - Everest Preparatórios"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 text-white px-4 py-2">
                <Play className="w-4 h-4 mr-2" />
                Vídeo Promocional
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Cases de Sucesso - Vídeos */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Cases de
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Sucesso</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Assista aos depoimentos reais de alunos que passaram no EAOF usando nossa metodologia
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Vídeo 1 */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-orange-500/20">
              <div className="aspect-[9/16] bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden mb-4">
                <video
                  className="w-full h-full object-cover"
                  controls
                >
                  <source src="/case-sucesso-1.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
              </div>
              <h3 className="text-lg font-bold mb-2 text-orange-400">Depoimento 1</h3>
              <p className="text-sm text-gray-300">
                "Consegui minha aprovação graças à metodologia do Professor Tiago!"
              </p>
            </div>
            
            {/* Vídeo 2 */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-orange-500/20">
              <div className="aspect-[9/16] bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden mb-4">
                <video
                  className="w-full h-full object-cover"
                  controls
                >
                  <source src="/case-sucesso-2.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
              </div>
              <h3 className="text-lg font-bold mb-2 text-orange-400">Depoimento 2</h3>
              <p className="text-sm text-gray-300">
                "O curso transformou minha preparação e me deu confiança para a prova"
              </p>
            </div>
            
            {/* Vídeo 3 */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-orange-500/20">
              <div className="aspect-[9/16] bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden mb-4">
                <video
                  className="w-full h-full object-cover"
                  controls
                >
                  <source src="/case-sucesso-3.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeos.
                </video>
              </div>
              <h3 className="text-lg font-bold mb-2 text-orange-400">Depoimento 3</h3>
              <p className="text-sm text-gray-300">
                "Sonho realizado! Agora sou oficial da Aeronáutica!"
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              Estes são apenas alguns dos +80 alunos aprovados que usaram nossa metodologia
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="text-xl font-bold text-white">Everest Preparatórios</span>
              </div>
              <p className="text-gray-400">
                Sua plataforma completa de estudos para concursos militares.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/flashcards" className="hover:text-white">Flashcards</Link></li>
                <li><Link href="/quiz" className="hover:text-white">Quiz</Link></li>
                <li><Link href="/redacao" className="hover:text-white">Redação</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/suporte" className="hover:text-white">Central de Ajuda</Link></li>
                <li><Link href="/community" className="hover:text-white">Comunidade</Link></li>
                <li><Link href="/settings" className="hover:text-white">Configurações</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacidade</Link></li>
                <li><Link href="/terms" className="hover:text-white">Termos de Uso</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Everest Preparatórios. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
