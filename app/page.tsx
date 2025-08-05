"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Star, Users, BookOpen, Target, Trophy, Zap, Shield, ArrowRight, Play, Clock, Award, Medal, TrendingUp, BarChart3, Brain, CheckSquare, Moon, Video, FileText, Headphones, MessageCircle, Gift, Bookmark, Calendar, XCircle } from "lucide-react";

export default function LandingPage() {
  console.log('🏠 [HOME] Página principal carregada')

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
            <div className="flex items-center space-x-4">
              <a href="https://alunos.everestpreparatorios.com.br" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100 hover:text-black font-semibold border-white">
                  Área do Aluno
                </Button>
              </a>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold">
                  Área VIP
                </Button>
              </Link>
            </div>
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
              <span className="text-orange-400 font-semibold"> + de 1000 Flashcards e Quizzes</span>. Simulados exclusivos e correção de redações.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Acesso Restrito</span>
              </div>
              <p className="text-gray-300 text-sm">
                Apenas usuários com acesso autorizado podem acessar a plataforma. Entre em contato com o suporte para obter suas credenciais.
              </p>
            </div>
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

      {/* Casos de Sucesso */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Lista de alunos do Curso Everest aprovados
            </h2>
            <p className="text-xl text-gray-300">
              Mais de 80 alunos aprovados no EAOF 2025 com nossa metodologia
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

              {/* CTA - Controle de Tráfego Aéreo */}
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

              {/* COM - Comunicações */}
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

              {/* ANV - Análise */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                  ANV
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-red-100">🏆 DAVID RODRIGO GONCALVES RIBEIRO</div>
                  <div className="text-sm text-red-100">🏆 FÁBIO HENRIQUE PEREIRA DOS SANTOS</div>
                  <div className="text-sm text-red-100">🏆 ROBERVAL CORRÊA ESPADIM</div>
                  <div className="text-sm text-red-100">🏆 ELIAS AMARO DOS SANTOS JUNIOR</div>
                </div>
              </div>

              {/* SVA - Serviços Administrativos */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                  SVA
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-indigo-100">🏆 ANDERSON EVANGELISTA DOS SANTOS</div>
                  <div className="text-sm text-indigo-100">🏆 ANTONIO CARLOS MENDONÇA</div>
                  <div className="text-sm text-indigo-100">🏆 CLÁUDIO JOSÉ DA SILVA</div>
                  <div className="text-sm text-indigo-100">🏆 EDILSON LINDEMBERG DIAS BARBOSA</div>
                  <div className="text-sm text-indigo-100">🏆 ELVAIR DOS SANTOS LIBORIO</div>
                  <div className="text-sm text-indigo-100">🏆 FABIO BATISTA DE MELO NETO</div>
                  <div className="text-sm text-indigo-100">🏆 FABIO MARTINS</div>
                  <div className="text-sm text-indigo-100">🏆 IRAÍ DIAS DOS SANTOS</div>
                  <div className="text-sm text-indigo-100">🏆 JUSSIÊ BARBOSA DE SOUSA</div>
                  <div className="text-sm text-indigo-100">🏆 LUIZ GUILHERME DOS SANTOS MORAES</div>
                  <div className="text-sm text-indigo-100">🏆 PRISCILA PONTES DOS SANTOS</div>
                  <div className="text-sm text-indigo-100">🏆 RAQUEL MACIAS DOS SANTOS</div>
                  <div className="text-sm text-indigo-100">🏆 SHIRLEY DOS SANTOS</div>
                  <div className="text-sm text-indigo-100">🏆 ANDRÉ LUIZ MOREIRA TEIXEIRA</div>
                  <div className="text-sm text-indigo-100">🏆 TELIEDER FANDLEY DE MOURA</div>
                  <div className="text-sm text-indigo-100">🏆 ROGÉRIO PINTO DE AZEVEDO</div>
                </div>
              </div>

              {/* SVH - Serviços Hospitalares */}
              <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                  SVH
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-pink-100">🏆 RAQUEL WEISHEIMER DE SOUZA</div>
                  <div className="text-sm text-pink-100">🏆 THIAGO RODRIGUES EVANGELISTA</div>
                  <div className="text-sm text-pink-100">🏆 VIVIANE MANHAES XAVIER</div>
                  <div className="text-sm text-pink-100">🏆 PRISCILA BORDUAM DA SILVA</div>
                </div>
              </div>

              {/* SVI - Serviços de Informática */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                  SVI
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-teal-100">🏆 RENATO MAIA RAEL</div>
                  <div className="text-sm text-teal-100">🏆 WAGNER DOS SANTOS DA SILVA</div>
                </div>
              </div>

              {/* SVM - Serviços de Manutenção */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                  SVM
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-amber-100">🏆 ALAN TEIXEIRA REIS</div>
                  <div className="text-sm text-amber-100">🏆 ARMANDO HENRIQUE LOPES CORRÊA</div>
                  <div className="text-sm text-amber-100">🏆 CARLOS EDUARDO BEZERRA DE SOUZA</div>
                  <div className="text-sm text-amber-100">🏆 DOUGLAS LEÃO</div>
                  <div className="text-sm text-amber-100">🏆 REGINALDO VIEIRA DE PINHO</div>
                  <div className="text-sm text-amber-100">🏆 WESLEY BARLATTI DE MACEDO</div>
                </div>
              </div>

              {/* Outras Especialidades */}
              <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                  Outras
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-100">🏆 EMERSON MAXWELL MARCIANO PEDRONI SILVA - MET</div>
                  <div className="text-sm text-gray-100">🏆 RENATO MAIA RAEL - FOT</div>
                  <div className="text-sm text-gray-100">🏆 BERGSON TOMAZ E SILVA - BBA</div>
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

            {/* Teste Interativo - Flashcards e Quiz */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Teste Nossa
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Plataforma</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experimente gratuitamente nosso sistema de flashcards e quiz. Veja como é fácil e eficiente estudar com o Everest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Flashcard Real da Plataforma */}
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <CardTitle className="text-xl">Flashcard Real</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Sistema de repetição espaçada da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-lg p-6 mb-4">
                  {/* Card principal estilo real da plataforma */}
                  <div className="bg-white rounded-lg p-8 mb-6 cursor-pointer hover:shadow-lg transition-all duration-300 text-center" 
                       onClick={() => {
                         const card = document.getElementById('flashcard-content');
                         const isFlipped = card?.getAttribute('data-flipped') === 'true';
                         
                         if (card) {
                           if (!isFlipped) {
                             card.innerHTML = `
                               <div class="space-y-6 max-w-2xl">
                                 <div class="flex items-center justify-center mb-4">
                                   <div class="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-2xl animate-bounce">
                                     <BookOpen class="h-10 w-10 text-white" />
                                   </div>
                                 </div>
                                 <div class="space-y-6">
                                   <div class="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-2xl border border-blue-200">
                                     <h3 class="text-lg font-bold text-blue-700">💡 Resposta</h3>
                                   </div>
                                   <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-3xl border border-gray-200 shadow-inner">
                                     <p class="text-2xl leading-relaxed font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                       Palavra que nomeia seres, objetos, lugares, sentimentos, etc.
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             `;
                             card.setAttribute('data-flipped', 'true');
                           } else {
                             card.innerHTML = `
                               <div class="space-y-6 max-w-2xl">
                                 <div class="flex items-center justify-center mb-4">
                                   <div class="p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-2xl animate-pulse">
                                     <Brain class="h-10 w-10 text-white" />
                                   </div>
                                 </div>
                                 <div class="space-y-4">
                                   <h2 class="text-3xl font-black leading-tight bg-gradient-to-r from-gray-800 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                     O que é um substantivo?
                                   </h2>
                                 </div>
                               </div>
                             `;
                             card.setAttribute('data-flipped', 'false');
                           }
                         }
                       }}>
                    <div id="flashcard-content" data-flipped="false">
                      <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-center mb-4">
                          <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-2xl animate-pulse">
                            <Brain className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-3xl font-black leading-tight bg-gradient-to-r from-gray-800 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                            O que é um substantivo?
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de dificuldade estilo real */}
                  <div className="flex gap-4 justify-center">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="group px-8 py-4 text-lg font-bold border-3 border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 rounded-2xl bg-red-50"
                      onClick={() => {
                        const score = parseInt(localStorage.getItem('everest-demo-score') || '0') + 1;
                        localStorage.setItem('everest-demo-score', score.toString());
                        alert('Resposta registrada! Pontuação: ' + score);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500 group-hover:bg-red-600 rounded-full transition-colors duration-300">
                          <XCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div>Errei</div>
                          <div className="text-sm opacity-75">(Fácil)</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      size="lg"
                      className="group px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 rounded-2xl shadow-xl"
                      onClick={() => {
                        const score = parseInt(localStorage.getItem('everest-demo-score') || '0') + 3;
                        localStorage.setItem('everest-demo-score', score.toString());
                        alert('Resposta registrada! Pontuação: ' + score);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-600 group-hover:bg-green-700 rounded-full transition-colors duration-300">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div>Acertei</div>
                          <div className="text-sm opacity-75">(Difícil)</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Clique no card para ver a resposta
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Real da Plataforma */}
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <CheckSquare className="w-6 h-6 text-blue-500" />
                  <CardTitle className="text-xl">Quiz Real</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Sistema de quiz da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-lg p-6 mb-4">
                  {/* Header do quiz estilo real */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                        Quiz Básico de Fonética
                      </h1>
                      <p className="text-muted-foreground">
                        Questão 1 de 3
                      </p>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mb-6">
                    <Progress value={33} className="h-3 bg-emerald-100 dark:bg-emerald-900">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500" style={{width: '33%'}} />
                    </Progress>
                  </div>

                  {/* Card da questão */}
                  <Card className="max-w-3xl mx-auto border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                      <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">
                        Qual o nome da menor unidade sonora da fala que distingue significados?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="quiz-option flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer"
                             onClick={(e) => {
                               const options = document.querySelectorAll('.quiz-option');
                               options.forEach(opt => opt.className = 'flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer');
                               (e.currentTarget as HTMLElement).className = 'flex items-center space-x-3 p-4 rounded-lg bg-emerald-500 text-white border border-emerald-500 transition-all duration-200 cursor-pointer';
                               
                               // Salvar resposta no localStorage
                               const quizAnswers = JSON.parse(localStorage.getItem('everest-demo-quiz') || '{}');
                               quizAnswers['q1'] = 'Fonema';
                               localStorage.setItem('everest-demo-quiz', JSON.stringify(quizAnswers));
                               
                               // Adicionar pontos
                               const score = parseInt(localStorage.getItem('everest-demo-score') || '0') + 10;
                               localStorage.setItem('everest-demo-score', score.toString());
                               
                               setTimeout(() => {
                                 alert('Correto! +10 pontos. Pontuação total: ' + score);
                               }, 100);
                             }}>
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-300 bg-emerald-500"></div>
                          <span className="flex-1 cursor-pointer font-medium">Fonema</span>
                        </div>
                        
                        <div className="quiz-option flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer"
                             onClick={(e) => {
                               const options = document.querySelectorAll('.quiz-option');
                               options.forEach(opt => opt.className = 'flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer');
                               (e.currentTarget as HTMLElement).className = 'flex items-center space-x-3 p-4 rounded-lg bg-red-500 text-white border border-red-500 transition-all duration-200 cursor-pointer';
                               
                               setTimeout(() => {
                                 alert('Incorreto! A resposta correta é: Fonema');
                               }, 100);
                             }}>
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-300"></div>
                          <span className="flex-1 cursor-pointer font-medium">Letra</span>
                        </div>
                        
                        <div className="quiz-option flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer"
                             onClick={(e) => {
                               const options = document.querySelectorAll('.quiz-option');
                               options.forEach(opt => opt.className = 'flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer');
                               (e.currentTarget as HTMLElement).className = 'flex items-center space-x-3 p-4 rounded-lg bg-red-500 text-white border border-red-500 transition-all duration-200 cursor-pointer';
                               
                               setTimeout(() => {
                                 alert('Incorreto! A resposta correta é: Fonema');
                               }, 100);
                             }}>
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-300"></div>
                          <span className="flex-1 cursor-pointer font-medium">Sílaba</span>
                        </div>
                        
                        <div className="quiz-option flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer"
                             onClick={(e) => {
                               const options = document.querySelectorAll('.quiz-option');
                               options.forEach(opt => opt.className = 'flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer');
                               (e.currentTarget as HTMLElement).className = 'flex items-center space-x-3 p-4 rounded-lg bg-red-500 text-white border border-red-500 transition-all duration-200 cursor-pointer';
                               
                               setTimeout(() => {
                                 alert('Incorreto! A resposta correta é: Fonema');
                               }, 100);
                             }}>
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-300"></div>
                          <span className="flex-1 cursor-pointer font-medium">Morfema</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Clique em uma opção para responder
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm mb-4">
              Esta é apenas uma demonstração. Na plataforma completa você terá acesso a:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>785+ flashcards</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>19 quizzes completos</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Sistema de progresso</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Correção de redações</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="flex justify-center space-x-4">
              <a href="https://alunos.everestpreparatorios.com.br" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="bg-white text-black hover:bg-gray-100 hover:text-black font-semibold px-8 py-4 text-lg border-white">
                  Área do Aluno
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 text-lg">
                  <ArrowRight className="ml-2 h-5 w-5" />
                  Área VIP
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Entre em contato com o suporte para obter suas credenciais de acesso
            </p>
          </div>
        </div>
      </section>

      {/* Vídeo Promocional */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              GIT com o
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Professor Tiago Costa</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Assista ao vídeo e entenda como nossa metodologia funciona. 
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
                    <span>+5 bônus inclusos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Acesso por um ano</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Garantia de 7 dias</span>
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
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Bônus inclusos gratuitamente que custariam</span> (Valor: R$ 497)
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
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"> 7 dias</span>
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Se em até 7 dias você não estiver satisfeito, devolvemos 100% do seu dinheiro. 
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
            Pronto para acessar a
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> plataforma?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Se você já possui credenciais de acesso, faça login para começar seus estudos.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="https://alunos.everestpreparatorios.com.br" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="bg-white text-black hover:bg-gray-100 hover:text-black font-semibold text-lg px-8 py-4 border-white">
                Área do Aluno
              </Button>
            </a>
                          <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Área VIP
                </Button>
              </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Acesso restrito - Entre em contato com o suporte para obter suas credenciais
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
              Plataforma, sem vínculo com a Força Aérea Brasileira.
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
