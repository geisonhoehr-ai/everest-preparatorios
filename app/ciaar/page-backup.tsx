"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Shield, Clock, Users, Award, CheckCircle, Play, ArrowRight, Plane, GraduationCap, Zap, Target, Rocket, Globe, MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, BookOpen as BookOpenIcon, Trophy as TrophyIcon, Video as VideoIcon, FileText as FileTextIcon, Headphones as HeadphonesIcon, MessageCircle as MessageCircleIcon, PenTool as PenToolIcon } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Dynamic imports para evitar problemas de SSR
const Sparkles = dynamic(() => import("@/components/aceternity/sparkles").then(mod => ({ default: mod.Sparkles })), { ssr: false })
const MagicCard = dynamic(() => import("@/components/magicui/magic-card").then(mod => ({ default: mod.MagicCard })), { ssr: false })

export default function CIAARPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Aplicar background gradiente apenas no cliente para evitar problemas de hidratação
    const rootElement = document.documentElement
    if (rootElement) {
      rootElement.style.background = 'linear-gradient(to bottom right, rgb(15 23 42), rgb(30 58 138), rgb(15 23 42))'
    }
  }, [])

  const courses = [
    {
      id: "cfoe",
      title: "Curso de Formação de Oficiais Especialistas (CFOE)",
      description: "Formação completa para cidadãos brasileiros interessados em ingressar nos Quadros de Oficiais Especialistas da Aeronáutica.",
      specialties: ["BMA", "BEV", "BEP", "BCO", "BET", "BEI", "BMB", "BCT", "BFT", "BSP", "MET"],
      duration: "12 meses",
      level: "Formação",
      price: "Gratuito*",
      highlight: true,
      icon: Shield,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "eaof",
      title: "Estágio de Adaptação ao Oficialato (EAOF)",
      description: "Destinado a Suboficiais e Primeiros-Sargentos interessados em ingressar no Quadro de Oficiais Especialistas.",
      specialties: ["BMA", "BMB", "BCO", "BEI", "BET", "BCT", "BFT", "SGS", "SBO", "BMT", "SMU", "SAD", "SAI", "SIN"],
      duration: "6 meses",
      level: "Adaptação",
      price: "Gratuito*",
      icon: Target,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "camar",
      title: "Curso de Adaptação de Médicos da Aeronáutica (CAMAR)",
      description: "Para médicos habilitados interessados em ingressar no Quadro de Oficiais Médicos da Aeronáutica.",
      specialties: ["Medicina Aeroespacial", "Clínica Geral", "Especialidades Médicas"],
      duration: "4 meses",
      level: "Especialização",
      price: "Gratuito*",
      icon: Zap,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "cadar",
      title: "Curso de Adaptação de Dentistas da Aeronáutica (CADAR)",
      description: "Para dentistas habilitados interessados em ingressar no Quadro de Oficiais Dentistas.",
      specialties: ["Odontologia Geral", "Especialidades Odontológicas"],
      duration: "4 meses",
      level: "Especialização",
      price: "Gratuito*",
      icon: Award,
      color: "from-orange-500 to-red-500"
    },
    {
      id: "eaoear",
      title: "Estágio de Adaptação de Oficiais Engenheiros (EAOEAR)",
      description: "Para engenheiros habilitados interessados em ingressar no Quadro de Oficiais Engenheiros.",
      specialties: ["Engenharia Aeronáutica", "Engenharia Civil", "Engenharia Elétrica", "Engenharia Mecânica"],
      duration: "6 meses",
      level: "Especialização",
      price: "Gratuito*",
      icon: Rocket,
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: "cpgmae",
      title: "Curso de Pós-Graduação em Medicina Aeroespacial (CPGMAE)",
      description: "Especialização avançada em medicina aeroespacial para oficiais médicos.",
      specialties: ["Medicina Aeroespacial", "Fisiologia de Voo", "Medicina de Aviação"],
      duration: "18 meses",
      level: "Pós-Graduação",
      price: "Gratuito*",
      icon: Star,
      color: "from-yellow-500 to-orange-500"
    },
  ]

  const testimonials = [
    {
      name: "Major João Silva",
      course: "CFOE - Especialidade BMA",
      text: "O CIAAR transformou minha carreira. A qualidade do ensino e a estrutura são excepcionais.",
      rating: 5,
      avatar: "JS"
    },
    {
      name: "Capitão Maria Santos",
      course: "CAMAR",
      text: "Experiência única que combina medicina civil com conhecimentos aeroespaciais.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "Tenente Carlos Oliveira",
      course: "EAOEAR",
      text: "Formação técnica de alto nível com aplicação prática imediata na Aeronáutica.",
      rating: 5,
      avatar: "CO"
    },
  ]

  const faqs = [
    {
      question: "Quais são os requisitos para ingressar nos cursos do CIAAR?",
      answer: "Os requisitos variam por curso, mas geralmente incluem: ser cidadão brasileiro nato, ter idade compatível com o curso escolhido, possuir formação específica (quando aplicável) e passar no processo seletivo."
    },
    {
      question: "Os cursos são realmente gratuitos?",
      answer: "Sim! Todos os cursos do CIAAR são gratuitos, incluindo material didático, uniformes e alimentação durante o período de formação."
    },
    {
      question: "Qual a duração média dos cursos?",
      answer: "A duração varia de 4 a 18 meses, dependendo do curso escolhido. O CFOE tem duração de 12 meses, enquanto especializações podem durar de 4 a 6 meses."
    },
    {
      question: "Há possibilidade de carreira internacional?",
      answer: "Sim! A Força Aérea Brasileira mantém acordos de cooperação com forças aéreas de diversos países, oferecendo oportunidades de intercâmbio e missões internacionais."
    },
    {
      question: "Onde fica localizado o CIAAR?",
      answer: "O CIAAR está localizado em Belo Horizonte, Minas Gerais, oferecendo toda a infraestrutura necessária para uma formação de excelência."
    },
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        </div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-2xl">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur opacity-75 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
                  CIAAR
                </h1>
                <p className="text-sm text-gray-300">Centro de Instrução e Adaptação da Aeronáutica</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-2xl">
                <Zap className="w-4 h-4 mr-2" />
                Inscreva-se Agora
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-32 px-4">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-slate-900" />
        </div>
        
        <div className="relative z-10 container mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <Badge className="mb-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30 px-6 py-3 text-lg">
              <Shield className="w-5 h-5 mr-2" />
              Força Aérea Brasileira
            </Badge>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-white via-orange-300 to-red-400 bg-clip-text text-transparent">
                Transforme sua carreira
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                com os cursos do CIAAR
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Formação de excelência em aviação militar, medicina aeroespacial e engenharia. 
              Junte-se à elite da Força Aérea Brasileira.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-2xl px-8 py-6 text-lg"
                >
                  <GraduationCap className="w-6 h-6 mr-3" />
                  Ver Cursos Disponíveis
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Assista ao Vídeo
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Sparkles
            id="tsparticles"
            background="transparent"
            minSize={1}
            maxSize={5}
            speed={6}
            particleCount={80}
            particleDensity={800}
          />
        </div>
      </section>

      {/* Professor Profile Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Conheça o </span>
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Professor Tiago Costa</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Especialista em concursos militares com mais de 10 anos de experiência
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Professor Profile */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="relative mx-auto lg:mx-0 mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 shadow-2xl">
                  <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">TC</span>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur opacity-30 animate-pulse"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Tiago Costa de Oliveira</h3>
              <p className="text-lg text-white mb-6">Especialista dedicado exclusivamente aos concursos militares</p>
              
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
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Methodology Card */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <MagicCard className="h-full">
                <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-orange-400 mb-4">Metodologia Comprovada</CardTitle>
                    <CardDescription className="text-gray-300 leading-relaxed">
                      O professor Tiago Costa apresenta o curso com módulos organizados entre teoria e prática, 
                      garantindo uma abordagem estruturada e direta para sua aprovação no EAOF.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-white">Foco no EAOF</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-400" />
                          </div>
                          <span className="text-white">+80 Aprovados</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="text-white">Material Atualizado</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <TrophyIcon className="w-5 h-5 text-yellow-400" />
                          </div>
                          <span className="text-white">Resultados Comprovados</span>
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

      {/* 7-Day Guarantee Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <MagicCard>
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm p-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  Garantia de <span className="text-green-400">7 dias</span>
                </h3>
                
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Se em até 7 dias você não estiver satisfeito, devolvemos 100% do seu dinheiro. 
                  Sem perguntas, sem complicações.
                </p>
                
                <div className="flex flex-wrap justify-center gap-6">
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
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </MagicCard>
          </motion.div>
        </div>
      </section>

      {/* Course Modules Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">O que está incluído</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Um curso completo com tudo que você precisa para passar no CIAAR da primeira vez.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: VideoIcon,
                title: "120+ Aulas Gravadas",
                description: "Aulas completas de Português e Regulamentos Militares",
                features: ["Gramática completa", "Interpretação de textos", "Regulamentos militares"],
                color: "from-orange-500 to-red-500"
              },
              {
                icon: FileTextIcon,
                title: "Material de Apoio",
                description: "PDFs, resumos e material complementar",
                features: ["Resumos em PDF", "Mapas mentais", "Listas de exercícios"],
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Target,
                title: "Simulados Exclusivos",
                description: "20 simulados completos com questões inéditas",
                features: ["Simulados cronometrados", "Questões comentadas", "Relatórios de desempenho"],
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: HeadphonesIcon,
                title: "Lives Semanais",
                description: "Aulas ao vivo com professores especialistas",
                features: ["Todo sábado", "Dúvidas ao vivo", "Conteúdo exclusivo"],
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: MessageCircleIcon,
                title: "Grupo VIP",
                description: "Comunidade exclusiva com suporte direto",
                features: ["WhatsApp exclusivo", "Suporte 24/7", "Networking"],
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: PenToolIcon,
                title: "Correção de Redações",
                description: "Envie até 10 redações com correção detalhada",
                features: ["Correção em 48h", "Feedback personalizado", "Dicas de melhoria"],
                color: "from-red-500 to-pink-500"
              }
            ].map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <MagicCard className="h-full">
                  <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                        <module.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-center text-white group-hover:text-orange-300 transition-colors duration-300">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-center leading-relaxed">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {module.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Tudo que você precisa para </span>
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">passar no CIAAR</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Nossa plataforma foi desenvolvida especificamente para o concurso da FAB, com conteúdo 100% alinhado ao edital e metodologia comprovada.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpenIcon,
                title: "Flashcards Inteligentes",
                description: "Sistema de repetição espaçada com 785+ flashcards de Português e Regulamentos Militares",
                features: [
                  "Algoritmo SM-2 para memorização eficiente",
                  "Progresso personalizado por tópico",
                  "Estatísticas detalhadas de aprendizado"
                ],
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Target,
                title: "Simulados Exclusivos",
                description: "Questões inéditas baseadas no edital do CIAAR com explicações detalhadas",
                features: [
                  "19 quizzes de Português e Regulamentos",
                  "Questões comentadas por especialistas",
                  "Simulados cronometrados"
                ],
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Shield,
                title: "Correção de Redações",
                description: "Envie suas redações e receba feedback detalhado dos nossos professores",
                features: [
                  "Correção em até 48 horas",
                  "Feedback personalizado",
                  "Dicas de melhoria"
                ],
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Comunidade Exclusiva",
                description: "Conecte-se com outros candidatos e tire dúvidas com professores",
                features: [
                  "Fórum de discussões",
                  "Lives semanais",
                  "Suporte direto"
                ],
                color: "from-green-500 to-teal-500"
              },
              {
                icon: TrophyIcon,
                title: "Ranking e Progresso",
                description: "Acompanhe sua evolução e dispute o ranking com outros alunos",
                features: [
                  "Estatísticas detalhadas",
                  "Ranking semanal",
                  "Conquistas e badges"
                ],
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Clock,
                title: "Lives Especiais",
                description: "Participe de lives exclusivas e tire dúvidas ao vivo",
                features: [
                  "Lives semanais",
                  "Dúvidas ao vivo",
                  "Conteúdo exclusivo"
                ],
                color: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <MagicCard className="h-full">
                  <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-center text-white group-hover:text-orange-300 transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-center leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {feature.features.map((feat, featIndex) => (
                          <div key={featIndex} className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
              Por que escolher o CIAAR?
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Formação Segura",
                description: "Ambiente seguro e estruturado para seu desenvolvimento profissional militar.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Clock,
                title: "Acesso Imediato",
                description: "Processo seletivo transparente com início das atividades logo após aprovação.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Award,
                title: "Certificação Reconhecida",
                description: "Certificados e formação reconhecidos nacionalmente pela excelência.",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center group"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="relative mx-auto mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className={`absolute -inset-2 bg-gradient-to-br ${feature.color} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
              Nossos Cursos
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra o curso perfeito para sua carreira na Força Aérea Brasileira
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <MagicCard className="h-full">
                  <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center`}>
                          <course.icon className="w-6 h-6 text-white" />
                        </div>
                        {course.highlight && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                            Destaque
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-orange-300 transition-colors duration-300">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 leading-relaxed">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duração:</span>
                        <span className="text-white font-medium">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Nível:</span>
                        <span className="text-white font-medium">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Preço:</span>
                        <span className="text-green-400 font-bold">{course.price}</span>
                      </div>
                      
                      <div className="pt-4">
                        <div className="text-sm text-gray-400 mb-2">Especialidades:</div>
                        <div className="flex flex-wrap gap-2">
                          {course.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">
                              {specialty}
                            </Badge>
                          ))}
                          {course.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">
                              +{course.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                                             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                         <Button 
                           className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                         >
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

      {/* Testimonials Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
              O que nossos alunos dizem
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-orange-400">{testimonial.course}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
              Perguntas Frequentes
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                  <AccordionTrigger className="text-left text-white hover:text-orange-300 transition-colors duration-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
              Pronto para voar alto?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Junte-se à elite da Força Aérea Brasileira e transforme sua carreira com os melhores cursos do país.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-2xl px-12 py-6 text-xl"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Inscreva-se Agora
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">CIAAR</h3>
                  <p className="text-sm text-gray-400">Centro de Instrução e Adaptação da Aeronáutica</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Formação de excelência em aviação militar, medicina aeroespacial e engenharia para a Força Aérea Brasileira.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contato</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span>Belém Horizonte, MG</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-3" />
                  <span>(31) 9999-9999</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>contato@ciaar.mil.br</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 CIAAR - Centro de Instrução e Adaptação da Aeronáutica. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
