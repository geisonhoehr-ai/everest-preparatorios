"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Shield, Clock, Users, Award, CheckCircle, Play, ArrowRight, Plane, GraduationCap, Zap, Target, Rocket, Globe, MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, BookOpen, Trophy, Video, FileText, Headphones, MessageCircle, PenTool } from "lucide-react"
import { motion } from "framer-motion"

// Componente MagicCard simplificado para evitar problemas de SSR
const MagicCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white/5 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:scale-105 ${className}`}>
      {children}
    </div>
  )
}

export default function CIAARPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950"></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
      
      {/* Floating Orbs */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-blue-500/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-orange-500/35 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="fixed top-1/2 left-1/3 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Plane className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl blur opacity-60 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-orange-200 bg-clip-text text-transparent">
                  CIAAR
                </h1>
                <p className="text-sm text-gray-400">Centro de Instrução e Adaptação da Aeronáutica</p>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white border-0 shadow-2xl px-6 py-3">
                <Zap className="w-4 h-4 mr-2" />
                Inscreva-se Agora
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-6xl mx-auto"
          >
            <Badge className="mb-8 bg-gradient-to-r from-blue-500/40 to-orange-500/40 text-blue-100 border-blue-400 px-8 py-4 text-lg">
              <Shield className="w-5 h-5 mr-2" />
              Concursos Militares da Aeronáutica
            </Badge>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white via-blue-200 to-orange-200 bg-clip-text text-transparent">
                Voe mais alto
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-orange-400 to-blue-400 bg-clip-text text-transparent">
                com o CIAAR
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Transforme sua carreira militar com os cursos de excelência para concursos da aeronáutica. 
              <span className="text-blue-300">Sua jornada para o sucesso começa aqui.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white border-0 shadow-2xl px-12 py-6 text-xl"
                >
                  <GraduationCap className="w-6 h-6 mr-3" />
                  Explorar Cursos
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-blue-400/50 text-blue-200 hover:bg-blue-500/20 backdrop-blur-sm px-12 py-6 text-xl"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Assista o Vídeo
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Professor Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Conheça o </span>
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">Professor Tiago</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Especialista em concursos militares com metodologia comprovada e +80 aprovados
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="relative mx-auto lg:mx-0 mb-8 w-40 h-40">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-36 h-36 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">TC</span>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full blur opacity-40 animate-pulse"></div>
              </div>
              
              <h3 className="text-3xl font-bold text-blue-300 mb-4">Tiago Costa</h3>
              <p className="text-xl text-white mb-8">Especialista em concursos militares da aeronáutica</p>
              
              <div className="space-y-4">
                {[
                  "Metodologia comprovada com +80 aprovados",
                  "Aulas estruturadas entre teoria e prática",
                  "Abordagem direta e objetiva",
                  "Suporte personalizado durante todo o curso"
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <MagicCard className="h-full">
                <Card className="h-full bg-gradient-to-br from-slate-800/80 to-blue-800/60 border-blue-400 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-3xl text-blue-300 mb-4">Metodologia Comprovada</CardTitle>
                    <CardDescription className="text-gray-300 leading-relaxed text-lg">
                      Curso estruturado com módulos organizados entre teoria e prática, 
                      garantindo uma abordagem eficiente para sua aprovação no CIAAR.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-500/60 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white font-medium">Foco no Resultado</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-orange-500/60 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white font-medium">+80 Aprovados</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600/60 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white font-medium">Material Atualizado</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-green-500/60 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white font-medium">Resultados Comprovados</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <MagicCard>
              <Card className="bg-gradient-to-br from-green-800/80 to-emerald-800/70 border-green-400 backdrop-blur-sm p-12">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-4xl font-bold text-white mb-6">
                  Garantia de <span className="text-green-400">7 dias</span>
                </h3>
                
                <p className="text-gray-300 text-xl mb-10 leading-relaxed">
                  Se em até 7 dias você não estiver satisfeito, devolvemos 100% do seu dinheiro. 
                  Sem perguntas, sem complicações.
                </p>
                
                <div className="flex flex-wrap justify-center gap-8">
                  {[
                    "Devolução integral",
                    "Sem perguntas",
                    "Processo simples"
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-white text-lg">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </MagicCard>
          </motion.div>
        </div>
      </section>

      {/* Course Modules */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">O que está </span>
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">incluído</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Um curso completo com tudo que você precisa para conquistar sua vaga na FAB
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Video,
                title: "120+ Aulas Gravadas",
                description: "Aulas completas de Português e Regulamentos Militares",
                features: ["Gramática completa", "Interpretação de textos", "Regulamentos militares"],
                color: "from-orange-500 to-red-500"
              },
              {
                icon: FileText,
                title: "Material de Apoio",
                description: "PDFs, resumos e material complementar",
                features: ["Resumos em PDF", "Mapas mentais", "Listas de exercícios"],
                color: "from-blue-600 to-indigo-600"
              },
              {
                icon: Target,
                title: "Simulados Exclusivos",
                description: "20 simulados completos com questões inéditas",
                features: ["Simulados cronometrados", "Questões comentadas", "Ranking nacional"],
                color: "from-cyan-500 to-blue-600"
              },
              {
                icon: Users,
                title: "Lives Semanais",
                description: "Encontros ao vivo para tirar dúvidas",
                features: ["Lives toda semana", "Dúvidas em tempo real", "Conteúdo exclusivo"],
                color: "from-emerald-500 to-teal-600"
              },
              {
                icon: MessageCircle,
                title: "Grupo VIP",
                description: "Acesso exclusivo ao grupo de estudos",
                features: ["Grupo no Telegram", "Dicas diárias", "Networking"],
                color: "from-amber-500 to-orange-600"
              },
              {
                icon: PenTool,
                title: "Correção de Redações",
                description: "Envie suas redações e receba feedback",
                features: ["Correção em 48h", "Feedback detalhado", "Dicas personalizadas"],
                color: "from-red-500 to-orange-600"
              }
            ].map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <MagicCard className="h-full">
                  <Card className="h-full bg-gradient-to-br from-slate-800/80 to-slate-700/70 border-white/20 backdrop-blur-sm hover:border-blue-400 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <module.icon className="w-7 h-7 text-white" />
                        </div>
                        <Badge className={`bg-gradient-to-r ${module.color} text-white border-0`}>
                          Incluído
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-white mb-2">{module.title}</CardTitle>
                      <CardDescription className="text-gray-300 leading-relaxed">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {module.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-400 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <motion.div 
                        className="mt-6"
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className={`w-full bg-gradient-to-r ${module.color} hover:opacity-90 text-white border-0`}>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Comprar Curso
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-blue-200 to-orange-200 bg-clip-text text-transparent">
                Pronto para decolar?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Junte-se a centenas de candidatos que já estão se preparando para conquistar sua vaga nos concursos militares da aeronáutica
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white border-0 shadow-2xl px-12 py-6 text-xl"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Começar Agora
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CIAAR</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Plataforma educacional especializada em preparação para concursos militares da aeronáutica.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">contato@ciaar.com.br</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-400">(11) 99999-9999</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                {[Facebook, Instagram, Linkedin, Youtube].map((Icon, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-gray-400 hover:text-white" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Everest Preparatórios. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
