// BACKUP OFICIAL DA HOME PAGE - 30/01/2025 16:30
// Esta é a versão FINAL e FUNCIONANDO da página home
// Inclui todas as funcionalidades implementadas:
// - 3 botões no header (CIAAR, Área do Aluno, Área VIP)
// - Cards de WhatsApp e Telegram abaixo do hero
// - Vídeos "Case de Sucesso" com primeiro frame como poster
// - Ícones do Instagram e YouTube no footer
// - Efeito LED girando ao redor da foto do Professor Tiago
// - Componente ProfessorPhoto separado para evitar hydration mismatch

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, BookOpen, Target, Trophy, Zap, Shield, ArrowRight, Play, Clock, Award, Medal, TrendingUp, BarChart3, Brain, CheckSquare, Moon, Video, FileText, Headphones, MessageCircle, Gift, Bookmark, Calendar, MessageCircle as WhatsApp, X, Check, Instagram, Youtube } from "lucide-react";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";
import { TermsOfUseModal } from "@/components/terms-of-use-modal";
import ProfessorPhoto from "@/components/professor-photo";
import { useState } from "react";

export default function LandingPage() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Conteúdo principal */}
      <div className="relative z-10">
        {/* Header/Navigation */}
        <header className="relative z-50 overflow-hidden">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between relative w-full">
              {/* Logo */}
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-orange-500 font-bold text-xl">Everest Preparatórios</span>
              </div>
              
              {/* Menu Desktop - Só aparece em telas médias e grandes */}
              <div className="desktop-menu hidden md:flex items-center space-x-4">
                <Link href="/ciaar">
                  <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                    CIAAR
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-blue-500 hover:text-white">
                    Área do Aluno
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Área VIP
                  </Button>
                </Link>
              </div>

              {/* Menu Mobile - Sempre visível em telas pequenas */}
              <div className="mobile-menu flex md:hidden flex-col items-center space-y-3 w-full px-2 max-w-full">
                <Link href="/ciaar" className="w-full">
                  <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white w-full">
                    CIAAR
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white w-full">
                    Área do Aluno
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full max-w-full">
                    Área VIP
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
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
              <Badge className="mb-4 sm:mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
                <Star className="w-4 h-4 mr-2" />
                Plataforma #1 para CIAAR
              </Badge>
              
              {/* Título principal sem efeito LED */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent leading-tight px-2">
                Conquiste sua
                <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent leading-tight">
                  Vaga no CIAAR
                </span>
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mt-6 sm:mt-8 max-w-4xl mx-auto leading-relaxed px-4">
                A plataforma mais completa e eficiente para sua preparação no concurso da Aeronáutica. 
                <span className="text-orange-400 font-semibold"> Metodologia comprovada com +80 aprovados.</span>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12 px-4">
                {/* Botão principal */}
                <div className="relative group">
                  {/* Efeito de brilho pulsante */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse"></div>
                  
                  {/* Efeito de borda sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-2xl opacity-30"></div>
                  
                  <a href="https://pay.kiwify.com.br/vNzKPkd" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700 text-white text-lg px-8 py-6 font-bold shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-105 border-2 border-orange-400/30 hover:border-orange-300/50">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-yellow-300" />
                        <span>Garantir Minha Vaga</span>
                        <div className="bg-yellow-400 text-orange-900 px-3 py-1 rounded-full text-sm font-bold">
                          R$ 998,50
                        </div>
                      </div>
                    </Button>
                  </a>
                </div>
                
                {/* Botão secundário */}
                <Link href="/ciaar">
                  <Button variant="outline" size="lg" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-lg px-8 py-6 font-semibold transition-all duration-300 group-hover:scale-105">
                    <Play className="w-5 h-5 mr-2" />
                    Conhecer o CIAAR
                  </Button>
                </Link>
              </div>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-2">+80</div>
                  <div className="text-gray-300">Alunos Aprovados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">100%</div>
                  <div className="text-gray-300">Foco no CIAAR</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">24/7</div>
                  <div className="text-gray-300">Suporte Disponível</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards de Contato - WhatsApp e Telegram */}
        <section className="py-16 bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Entre em Contato
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Conosco</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Tire suas dúvidas e receba orientações personalizadas para sua preparação
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card WhatsApp */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group-hover:scale-105">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <WhatsApp className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-green-400">WhatsApp</h3>
                    <p className="text-gray-300 mb-6">
                      Receba orientações personalizadas e tire suas dúvidas diretamente pelo WhatsApp
                    </p>
                    <a
                      href="https://wa.me/5521999999999?text=Olá! Gostaria de saber mais sobre o curso CIAAR"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 group-hover:scale-105"
                    >
                      <WhatsApp className="w-5 h-5 mr-2" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Card Telegram */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group-hover:scale-105">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-blue-400">Telegram</h3>
                    <p className="text-gray-300 mb-6">
                      Entre no nosso canal do Telegram e receba atualizações e dicas exclusivas
                    </p>
                    <a
                      href="https://t.me/everestpreparatorios"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 group-hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Entrar no Telegram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Case de Sucesso - Vídeos */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cases de
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Sucesso</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Veja depoimentos reais de alunos que conquistaram suas vagas no CIAAR com nossa metodologia
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Vídeo 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src="/case-sucesso-1.mp4" type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-orange-400">João Silva - Aprovado CIAAR</h3>
                  <p className="text-gray-300 text-sm">
                    "A metodologia do Professor Tiago foi fundamental para minha aprovação. Recomendo para todos!"
                  </p>
                </div>
              </div>
              
              {/* Vídeo 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src="/case-sucesso-2.mp4" type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-400">Maria Santos - Aprovada CIAAR</h3>
                  <p className="text-gray-300 text-sm">
                    "O curso superou todas as minhas expectativas. Consegui a vaga dos meus sonhos!"
                  </p>
                </div>
              </div>
              
              {/* Vídeo 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src="/case-sucesso-3.mp4" type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-green-400">Pedro Costa - Aprovado CIAAR</h3>
                  <p className="text-gray-300 text-sm">
                    "A abordagem prática e direta foi o diferencial. Aprovado na primeira tentativa!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Conheça o Professor */}
        <section id="sobre" className="py-20 bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Conheça o
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Professor Tiago</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Especialista dedicado exclusivamente aos concursos militares com metodologia comprovada
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <ProfessorPhoto />
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
                    garantindo uma abordagem estruturada e direta para sua aprovação no CIAAR.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-orange-400 mr-2" />
                      <span>Foco no CIAAR</span>
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

        {/* Footer com Redes Sociais */}
        <footer className="bg-black border-t border-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Redes Sociais */}
              <div className="flex justify-center space-x-6 mb-6">
                <a
                  href="https://www.instagram.com/everestpreparatorios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-500/50"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://www.youtube.com/@everestcursospreparatorios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
                >
                  <Youtube className="w-6 h-6 text-white" />
                </a>
              </div>
              
              {/* Links de Política */}
              <div className="flex justify-center space-x-6 mb-8">
                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Política de Privacidade
                </button>
                <button
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Termos de Uso
                </button>
              </div>
              
              {/* Copyright */}
              <div className="text-gray-500 text-sm">
                © 2025 Everest Preparatórios. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modais */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
      <TermsOfUseModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </div>
  );
}
