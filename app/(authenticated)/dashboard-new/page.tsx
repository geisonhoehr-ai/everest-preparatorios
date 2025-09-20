"use client"

import { StandardLayout } from "@/components/layout/standard-layout"
import { CourseCard, MetricCard } from "@/components/ui/standard-card"
import { Button } from "@/components/ui/button"
import { BookOpen, Trophy, Target, BarChart3 } from "lucide-react"

export default function DashboardNewPage() {
  // Dados de exemplo baseados na plataforma de referência
  const courses = [
    {
      title: "Do Zero ao SaaS",
      subtitle: "6 cursos • 20 aulas",
      metrics: {
        completed: 3,
        averageProgress: 50,
        lessonsDone: 20
      },
      courses: [
        { name: "Do Zero ao SaaS 01: Primeiros Passos", progress: 100 },
        { name: "Do Zero ao SaaS 02: Como criar um bom design?", progress: 100 },
        { name: "Do Zero ao SaaS 03: Autenticação, Banco de Dados e MCP", progress: 100 },
        { name: "Do Zero ao SaaS 04: Deploy e Produção", progress: 0 },
        { name: "Do Zero ao SaaS 05: Marketing e Vendas", progress: 0 },
        { name: "Do Zero ao SaaS 06: Escalabilidade", progress: 0 }
      ],
      overallProgress: 50
    },
    {
      title: "Fundamentos 2.0 (Atualizado)",
      subtitle: "2 cursos • 30 aulas",
      metrics: {
        completed: 0,
        averageProgress: 7,
        lessonsDone: 3
      },
      courses: [
        { name: "Validando seu produto: aulas rápidas", progress: 0 },
        { name: "Do ZERO ao APP (Atualizado)", progress: 13 }
      ],
      overallProgress: 7
    },
    {
      title: "Extras (Aulas Avulsas ou YouTube)",
      subtitle: "2 cursos • 16 aulas",
      metrics: {
        completed: 0,
        averageProgress: 13,
        lessonsDone: 4
      },
      courses: [
        { name: "Análise Ferramentas", progress: 0 },
        { name: "Aulas Extras", progress: 25 }
      ],
      overallProgress: 13
    },
    {
      title: "Cursor (além dos Fundamentos)",
      subtitle: "1 curso • 6 aulas",
      metrics: {
        completed: 0,
        averageProgress: 0,
        lessonsDone: 0
      },
      courses: [
        { name: "Cursor + MCP (Model Context Protocol)", progress: 0 }
      ],
      overallProgress: 0
    },
    {
      title: "Simplificando o Técnico",
      subtitle: "1 curso • 5 aulas",
      metrics: {
        completed: 0,
        averageProgress: 0,
        lessonsDone: 0
      },
      courses: [
        { name: "O básico do técnico para pessoas não técnicas", progress: 0 }
      ],
      overallProgress: 0
    },
    {
      title: "Claude Code",
      subtitle: "1 curso • 4 aulas",
      metrics: {
        completed: 0,
        averageProgress: 0,
        lessonsDone: 0
      },
      courses: [
        { name: "Claude Code", progress: 0 }
      ],
      overallProgress: 0
    }
  ]

  const metrics = [
    {
      title: "Horas Estudadas",
      value: "0.0h",
      subtitle: "Tempo total de estudo",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "Cursos Concluídos",
      value: "0",
      subtitle: "Total de cursos finalizados",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      title: "Aulas Assistidas",
      value: "27",
      subtitle: "Total de aulas visualizadas",
      icon: <Target className="h-5 w-5" />
    }
  ]

  return (
    <StandardLayout 
      title="Meus Cursos" 
      subtitle="Acompanhe seu progresso e continue aprendendo"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cursos por Trilha
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Clique em uma trilha para ver os cursos
          </p>
        </div>
        <Button variant="outline" size="sm">
          Ver Todos os Cursos
        </Button>
      </div>

      {/* CTA Button */}
      <div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Entrou agora? Aqui o seu guia.
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Courses Grid */}
      <div className="pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              title={course.title}
              subtitle={course.subtitle}
              metrics={course.metrics}
              courses={course.courses}
              overallProgress={course.overallProgress}
              onClick={() => console.log(`Clicked on ${course.title}`)}
            />
          ))}
        </div>
      </div>
    </StandardLayout>
  )
}
