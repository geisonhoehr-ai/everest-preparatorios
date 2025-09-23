"use client"

import { CourseCard, CourseGrid } from "@/components/ui/course-card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/breadcrumb-nav"
import { ArrowLeft, BookOpen } from "lucide-react"

export default function CursosPage() {
  const courses = [
    {
      title: "Português - Acentuação Gráfica",
      description: "Aprenda as regras de acentuação gráfica em português de forma prática e eficiente.",
      category: "Português",
      status: "completed" as const,
      progress: 100,
      totalLessons: 15,
      completedLessons: 15,
      author: "Prof. Maria Silva",
      duration: "2 horas"
    },
    {
      title: "Regulamentos - Normas Técnicas",
      description: "Compreenda as principais normas técnicas e regulamentos aplicáveis em concursos públicos.",
      category: "Regulamentos",
      status: "in-progress" as const,
      progress: 65,
      totalLessons: 20,
      completedLessons: 13,
      author: "Prof. João Santos",
      duration: "3 horas"
    },
    {
      title: "Matemática - Álgebra Básica",
      description: "Fundamentos de álgebra para concursos públicos com exercícios práticos.",
      category: "Matemática",
      status: "not-started" as const,
      progress: 0,
      totalLessons: 25,
      completedLessons: 0,
      author: "Prof. Ana Costa",
      duration: "4 horas"
    },
    {
      title: "História do Brasil - República",
      description: "Período republicano brasileiro com foco em questões de concursos.",
      category: "História",
      status: "not-started" as const,
      progress: 0,
      totalLessons: 18,
      completedLessons: 0,
      author: "Prof. Carlos Lima",
      duration: "2.5 horas"
    },
    {
      title: "Geografia - Geopolítica Mundial",
      description: "Atualidades geopolíticas e suas implicações para concursos públicos.",
      category: "Geografia",
      status: "coming-soon" as const,
      progress: 0,
      totalLessons: 12,
      completedLessons: 0,
      author: "Prof. Lucia Oliveira",
      duration: "1.5 horas"
    },
    {
      title: "Direito Constitucional - Fundamentos",
      description: "Princípios fundamentais da Constituição Federal com análise jurisprudencial.",
      category: "Direito",
      status: "not-started" as const,
      progress: 0,
      totalLessons: 30,
      completedLessons: 0,
      author: "Prof. Roberto Alves",
      duration: "5 horas"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Meus Cursos"
        description="Acompanhe seu progresso e continue aprendendo"
        breadcrumbItems={[
          { label: "Cursos", current: true }
        ]}
        className="mb-8"
      />

      {/* Navigation */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar às Categorias
          </Button>
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Todos os Cursos
              </h2>
              <p className="text-sm text-muted-foreground">
                {courses.length} cursos disponíveis
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="flex justify-start">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <BookOpen className="h-4 w-4" />
            Entrou agora? Aqui o seu guia.
          </Button>
        </div>

        {/* Courses Grid */}
        <CourseGrid>
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              title={course.title}
              description={course.description}
              category={course.category}
              status={course.status}
              progress={course.progress}
              totalLessons={course.totalLessons}
              completedLessons={course.completedLessons}
              author={course.author}
              duration={course.duration}
              onClick={() => {
                console.log('Curso clicado:', course.title)
                // Aqui você pode navegar para a página do curso
              }}
            />
          ))}
        </CourseGrid>
      </div>
    </div>
  )
}
