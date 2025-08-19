"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, BookOpen, Target, Trophy, Zap, Shield, ArrowRight, Play, Clock, Award, Medal, TrendingUp, BarChart3, Brain, CheckSquare, Moon, Video, FileText, Headphones, MessageCircle, Gift, Bookmark, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Conteúdo principal */}
      <div className="relative z-10">
        {/* Header/Navigation */}
        <header className="relative z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-orange-500 font-bold text-xl">Everest Preparatórios</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                    Área do Aluno
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Área VIP
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge com animação sutil */}
              <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
                <Star className="w-4 h-4 mr-2" />
                Plataforma #1 para CIAAR
              </Badge>
              
              {/* Título principal sem efeito LED */}
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent leading-tight">
                Conquiste sua
                <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent leading-tight">
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

        {/* Casos de Sucesso */}
        <section className="py-20 bg-black relative overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Casos de Sucesso
              </h2>
              <p className="text-xl text-gray-300">
                Mais de 80 alunos aprovados no EAOF com nossa metodologia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Card SVE com efeito LED */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-led-rotate opacity-75"></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-blue-500/20 hover:border-blue-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    SVE
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 ADRIANO PONTES NEPOMUCENO</div>
                    <div className="text-sm text-gray-300">🏆 ALISSON ALVES OLIVEIRA LEITE</div>
                    <div className="text-sm text-gray-300">🏆 VICTOR SALUSTRINO BEZERRA</div>
                    <div className="text-sm text-gray-300">🏆 DENIS MOURA DE MELO</div>
                    <div className="text-sm text-gray-300">🏆 ANTONIO DE PÁDUA AGUIAR FILHO</div>
                    <div className="text-sm text-gray-300">🏆 REGINALDO CESAR DUARTE</div>
                  </div>
                </div>
              </div>

              {/* Card GDS com efeito LED */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-led-rotate opacity-75" style={{animationDelay: '1s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-green-500/20 hover:border-green-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-green-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    GDS
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 ALEXANDRE ALEX LUDOVINO DA FONSECA</div>
                    <div className="text-sm text-gray-300">🏆 ANDERSON BARBOSA MARTINS</div>
                    <div className="text-sm text-gray-300">🏆 DANIEL ELIAS VELASCO</div>
                    <div className="text-sm text-gray-300">🏆 MANUEL COSTA SOARES</div>
                    <div className="text-sm text-gray-300">🏆 MARCELO SANTOS PACHECO</div>
                    <div className="text-sm text-gray-300">🏆 ROBSON MARTINS REIS</div>
                    <div className="text-sm text-gray-300">🏆 THENÓRIO ALMEIDA LOPES DE ARAÚJO</div>
                    <div className="text-sm text-gray-300">🏆 THIAGO SOARES DE BARROS</div>
                    <div className="text-sm text-gray-300">🏆 WAGNER DA SILVA DE FARIAS</div>
                    <div className="text-sm text-gray-300">🏆 ROBERTO MÁRCIO DE MELO JUNIOR</div>
                    <div className="text-sm text-gray-300">🏆 GILSON CONCEIÇÃO DE ARAÚJO</div>
                  </div>
                </div>
              </div>

              {/* Card CTA com efeito LED */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-led-rotate opacity-75" style={{animationDelay: '2s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-purple-500/20 hover:border-purple-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    CTA
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">💎 ALINE VEIGA DO NASCIMENTO</div>
                    <div className="text-sm text-gray-300">🏆 GEANDRO PINHEIRO PIRES</div>
                    <div className="text-sm text-gray-300">🏆 MARCOS CORREIA DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 NARA LUANA XAVIER DA SILVA FERREIRA</div>
                    <div className="text-sm text-gray-300">🏆 VITOR EMANUEL REZENDE PEREIRA</div>
                    <div className="text-sm text-gray-300">🏆 MARCO ANTONIO FREITAS DE ABREU</div>
                  </div>
                </div>
              </div>

              {/* Card COM com efeito LED */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-led-rotate opacity-75" style={{animationDelay: '3s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-orange-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    COM
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 DAVI NILSON MOREIRA CARDOSO</div>
                    <div className="text-sm text-gray-300">🏆 GERSON FÁBIO DE PINHO GONÇALVES</div>
                    <div className="text-sm text-gray-300">🏆 GILSOMAR DE OLIVEIRA THOMAZ</div>
                    <div className="text-sm text-gray-300">🏆 WILLIAM DO NASCIMENTO FERREIRA</div>
                    <div className="text-sm text-gray-300">🏆 FREDSON ALVES DE FARIA</div>
                    <div className="text-sm text-gray-300">🏆 JORGE CARDOSO PALHETA</div>
                    <div className="text-sm text-gray-300">🏆 FLÁVIA CARVALHO CALDAS</div>
                  </div>
                </div>
              </div>

              {/* ANV - Análise */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-500 via-pink-500 to-red-500 animate-led-rotate opacity-75" style={{animationDelay: '4s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-red-500/20 hover:border-red-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-red-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    ANV
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 DAVID RODRIGO GONCALVES RIBEIRO</div>
                    <div className="text-sm text-gray-300">🏆 FÁBIO HENRIQUE PEREIRA DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 ROBERVAL CORRÊA ESPADIM</div>
                    <div className="text-sm text-gray-300">🏆 ELIAS AMARO DOS SANTOS JUNIOR</div>
                  </div>
                </div>
              </div>

              {/* SVA - Serviços Administrativos */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-led-rotate opacity-75" style={{animationDelay: '5s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-indigo-500/20 hover:border-indigo-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-indigo-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    SVA
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 ANDERSON EVANGELISTA DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 ANTONIO CARLOS MENDONÇA</div>
                    <div className="text-sm text-gray-300">🏆 CLÁUDIO JOSÉ DA SILVA</div>
                    <div className="text-sm text-gray-300">🏆 EDILSON LINDEMBERG DIAS BARBOSA</div>
                    <div className="text-sm text-gray-300">🏆 ELVAIR DOS SANTOS LIBORIO</div>
                    <div className="text-sm text-gray-300">🏆 FABIO BATISTA DE MELO NETO</div>
                    <div className="text-sm text-gray-300">🏆 FABIO MARTINS</div>
                    <div className="text-sm text-gray-300">🏆 IRAÍ DIAS DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 JUSSIÊ BARBOSA DE SOUSA</div>
                    <div className="text-sm text-gray-300">🏆 LUIZ GUILHERME DOS SANTOS MORAES</div>
                    <div className="text-sm text-gray-300">🏆 PRISCILA PONTES DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 RAQUEL MACIAS DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 SHIRLEY DOS SANTOS</div>
                    <div className="text-sm text-gray-300">🏆 ANDRÉ LUIZ MOREIRA TEIXEIRA</div>
                    <div className="text-sm text-gray-300">🏆 TELIEDER FANDLEY DE MOURA</div>
                    <div className="text-sm text-gray-300">🏆 ROGÉRIO PINTO DE AZEVEDO</div>
                  </div>
                </div>
              </div>

              {/* SVH - Serviços Hospitalares */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 animate-led-rotate opacity-75" style={{animationDelay: '6s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-pink-500/20 hover:border-pink-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-pink-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    SVH
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 RAQUEL WEISHEIMER DE SOUZA</div>
                    <div className="text-sm text-gray-300">🏆 THIAGO RODRIGUES EVANGELISTA</div>
                    <div className="text-sm text-gray-300">🏆 VIVIANE MANHAES XAVIER</div>
                    <div className="text-sm text-gray-300">🏆 PRISCILA BORDUAM DA SILVA</div>
                  </div>
                </div>
              </div>

              {/* SVI - Serviços de Informática */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 animate-led-rotate opacity-75" style={{animationDelay: '7s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-teal-500/20 hover:border-teal-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-teal-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    SVI
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 RENATO MAIA RAEL</div>
                    <div className="text-sm text-gray-300">🏆 WAGNER DOS SANTOS DA SILVA</div>
                  </div>
                </div>
              </div>

              {/* SVM - Serviços de Manutenção */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 animate-led-rotate opacity-75" style={{animationDelay: '8s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-amber-500/20 hover:border-amber-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-amber-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    SVM
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 ALAN TEIXEIRA REIS</div>
                    <div className="text-sm text-gray-300">🏆 ARMANDO HENRIQUE LOPES CORRÊA</div>
                    <div className="text-sm text-gray-300">🏆 CARLOS EDUARDO BEZERRA DE SOUZA</div>
                    <div className="text-sm text-gray-300">🏆 DOUGLAS LEÃO</div>
                    <div className="text-sm text-gray-300">🏆 REGINALDO VIEIRA DE PINHO</div>
                    <div className="text-sm text-gray-300">🏆 WESLEY BARLATTI DE MACEDO</div>
                  </div>
                </div>
              </div>

              {/* Outras Especialidades */}
              <div className="relative group h-full">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-gray-500 via-slate-500 to-gray-500 animate-led-rotate opacity-75" style={{animationDelay: '9s'}}></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-gray-500/20 hover:border-gray-500/40 rounded-lg p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-gray-500/25 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center flex-shrink-0">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                    Outras
                  </h3>
                  <div className="space-y-2 flex-grow">
                    <div className="text-sm text-gray-300">🏆 EMERSON MAXWELL MARCIANO PEDRONI SILVA - MET</div>
                    <div className="text-sm text-gray-300">🏆 RENATO MAIA RAEL - FOT</div>
                    <div className="text-sm text-gray-300">🏆 BERGSON TOMAZ E SILVA - BBA</div>
                  </div>
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

        {/* CTA Principal */}
        <section className="py-20 bg-black">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para conquistar sua
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> vaga no EAOF 2026?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se aos mais de 80 alunos aprovados que já passaram no EAOF com nossa metodologia comprovada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Botão principal com efeito LED */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-led-rotate opacity-75 blur-sm"></div>
                <a href="https://pay.kiwify.com.br/vNzKPkd" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-4">
                    <Zap className="w-5 h-5 mr-2" />
                    Garantir Minha Vaga - R$ 998,50
                  </Button>
                </a>
              </div>
              
              {/* Botão secundário com efeito LED */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '1s'}}></div>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="relative border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-lg px-8 py-4">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              ⚡ Oferta por tempo limitado - Vagas restritas
            </p>
          </div>
        </section>



        {/* Vídeo Promocional */}
        <section className="py-20 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Conheça o 
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Professor Tiago Costa</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Assista ao vídeo e entenda como nossa metodologia funciona.
              </p>
            </div>
            
            <div className="relative w-full max-w-4xl mx-auto">
              {/* Container do vídeo com efeito LED */}
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-led-rotate opacity-75 blur-sm"></div>
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
        <section className="py-20 bg-black">
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
                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4">
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
                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4">
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
                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4">
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
        <section id="recursos" className="py-20 bg-black relative overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              {/* Card Flashcards com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-led-rotate opacity-75 blur-sm"></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Flashcards Inteligentes</CardTitle>
                    <CardDescription className="text-gray-300">
                      Sistema de repetição espaçada com 785+ flashcards de Português e Regulamentos Militares
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Simulados com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '1s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Simulados Exclusivos</CardTitle>
                    <CardDescription className="text-gray-300">
                      Questões inéditas baseadas no edital do CIAAR com explicações detalhadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Correção com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '2s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Correção de Redações</CardTitle>
                    <CardDescription className="text-gray-300">
                      Envie suas redações e receba feedback detalhado dos nossos professores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Comunidade Exclusiva com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '3s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Comunidade Exclusiva</CardTitle>
                    <CardDescription className="text-gray-300">
                      Conecte-se com outros candidatos e tire dúvidas com professores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Ranking e Progresso com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '4s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Ranking e Progresso</CardTitle>
                    <CardDescription className="text-gray-300">
                      Acompanhe sua evolução e dispute o ranking com outros alunos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Lives Especiais com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-red-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '5s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Lives Especiais</CardTitle>
                    <CardDescription className="text-gray-300">
                      Participe de lives exclusivas e tire dúvidas ao vivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
          </div>
        </section>

        {/* O que está incluído */}
        <section className="py-20 bg-black relative overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              {/* Card Aulas Gravadas com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-led-rotate opacity-75 blur-sm"></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">120+ Aulas Gravadas</CardTitle>
                    <CardDescription className="text-gray-300">
                      Aulas completas de Português e Regulamentos Militares
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Material de Apoio com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '1s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Material de Apoio</CardTitle>
                    <CardDescription className="text-gray-300">
                      PDFs, resumos e material complementar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Simulados com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '2s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Simulados Exclusivos</CardTitle>
                    <CardDescription className="text-gray-300">
                      20 simulados completos com questões inéditas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Lives Semanais com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '3s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Lives Semanais</CardTitle>
                    <CardDescription className="text-gray-300">
                      Aulas ao vivo com professores especialistas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Todo sábado
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

              {/* Card Grupo VIP com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '4s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Grupo VIP</CardTitle>
                    <CardDescription className="text-gray-300">
                      Comunidade exclusiva com suporte direto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
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
              </div>

              {/* Card Correção de Redações com efeito LED */}
              <div className="relative h-full">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-red-500 animate-led-rotate opacity-75 blur-sm" style={{animationDelay: '5s'}}></div>
                <Card className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-orange-400">Correção de Redações</CardTitle>
                    <CardDescription className="text-gray-300">
                      Envie até 10 redações com correção detalhada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Correção em 48h
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
          </div>
        </section>

        {/* Professor Tiago Costa Section */}
        <section id="sobre" className="py-20 bg-black relative overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
        <section id="precos" className="py-20 bg-black relative overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Bônus Exclusivos</span> (Valor: R$ 497)
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg p-6 border border-orange-500/20">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Bookmark className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-2 text-orange-400">E-book "Dicas de Prova"</h4>
                  <p className="text-sm text-gray-300">50 dicas exclusivas para maximizar sua pontuação</p>
                </div>
                <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg p-6 border border-orange-500/20">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-2 text-orange-400">Workshop "Como Estudar"</h4>
                  <p className="text-sm text-gray-300">Metodologia comprovada de estudo eficiente</p>
                </div>
                <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg p-6 border border-orange-500/20">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-2 text-orange-400">Cronograma Personalizado</h4>
                  <p className="text-sm text-gray-300">Plano de estudos adaptado ao seu tempo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Garantia */}
        <section className="py-20 bg-black">
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
        <section className="py-20 bg-black relative overflow-hidden">
          {/* Background animado com efeitos LED */}
          <div className="absolute inset-0 bg-black">
            {/* Círculos decorativos com efeito LED */}
            <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Grid pattern futurístico */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
          
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
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
    </div>
  );
}
