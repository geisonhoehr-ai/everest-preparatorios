"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VideoPlayer } from "@/components/video-player"
import { CourseManager } from "@/components/course-manager"
import { PandavideoIntegration } from "@/components/pandavideo-integration"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings, 
  Maximize, 
  Cast,
  Users,
  MessageSquare,
  Clock,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Star,
  Heart,
  Download,
  Share2,
  Bookmark,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Award,
  Target,
  Zap,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react"
import { gradients } from "@/lib/gradients"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar: string
  duration: string
  modules: number
  lessons: number
  progress: number
  thumbnail: string
  category: string
  rating: number
  students: number
  isFavorite: boolean
  isNew?: boolean
  pandavideoId?: string
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  isExpanded: boolean
}

interface Lesson {
  id: string
  title: string
  duration: string
  type: 'video' | 'document' | 'quiz'
  isCompleted: boolean
  isWatched: boolean
  videoUrl?: string
  pandavideoId?: string
}

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "Extensivo EAOF 2026 - Português e Redação",
      description: "Preparatório completo para o concurso CIAAR da FAB, focado em Gramática, Interpretação de Textos e Produção Textual.",
      instructor: "Prof. Tiago Costa",
      instructorAvatar: "/api/avatar?email=tiago@everest.com",
      duration: "68h 50m",
      modules: 12,
      lessons: 119,
      progress: 15,
      thumbnail: "/api/avatar?email=eaof@everest.com",
      category: "Concurso Militar",
      rating: 4.8,
      students: 75,
      isFavorite: true,
      isNew: true,
      pandavideoId: "sample-video-id-1"
    },
    {
      id: "2",
      title: "Preparatório Completo EEAR",
      description: "15 anos aprovando candidatos para a Escola de Especialistas de Aeronáutica.",
      instructor: "Prof. Ana Silva",
      instructorAvatar: "/api/avatar?email=ana@everest.com",
      duration: "45h 30m",
      modules: 8,
      lessons: 85,
      progress: 22,
      thumbnail: "/api/avatar?email=eear@everest.com",
      category: "Concurso Militar",
      rating: 4.9,
      students: 112,
      isFavorite: false,
      pandavideoId: "sample-video-id-2"
    },
    {
      id: "3",
      title: "Redação - Clube de Redação",
      description: "Um dos melhores professores de redação do país. Venha fazer parte do clube.",
      instructor: "Prof. Carlos Mendes",
      instructorAvatar: "/api/avatar?email=carlos@everest.com",
      duration: "32h 15m",
      modules: 6,
      lessons: 67,
      progress: 8,
      thumbnail: "/api/avatar?email=redacao@everest.com",
      category: "Redação",
      rating: 4.7,
      students: 234,
      isFavorite: true,
      pandavideoId: "sample-video-id-3"
    },
    {
      id: "4",
      title: "Brigada Militar Completo",
      description: "Preparatório específico para concursos da Brigada Militar.",
      instructor: "Prof. Maria Santos",
      instructorAvatar: "/api/avatar?email=maria@everest.com",
      duration: "28h 45m",
      modules: 5,
      lessons: 52,
      progress: 0,
      thumbnail: "/api/avatar?email=brigada@everest.com",
      category: "Concurso Militar",
      rating: 4.6,
      students: 89,
      isFavorite: false,
      pandavideoId: "sample-video-id-4"
    }
  ])

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [activeTab, setActiveTab] = useState("cursos")

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: userRoleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', user.email)
            .single()
          
          setUserRole(userRoleData?.role || 'student')
        }
      } catch (error) {
        console.error('Erro ao carregar role:', error)
        setUserRole('student')
      }
    }

    loadUserRole()
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["Todos", "Concurso Militar", "Redação", "Matemática", "Português"]

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    // Simular carregamento da primeira aula
    setCurrentLesson({
      id: "1",
      title: "Boas-vindas",
      duration: "00:34",
      type: 'video',
      isCompleted: false,
      isWatched: false,
      videoUrl: course.pandavideoId ? `https://app.pandavideo.com/embed/${course.pandavideoId}` : undefined,
      pandavideoId: course.pandavideoId
    })
  }

  const handleFavorite = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, isFavorite: !course.isFavorite }
        : course
    ))
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const isTeacher = userRole === 'teacher' || userRole === 'admin'

  return (
    <DashboardShell>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cursos</h1>
            <p className="text-muted-foreground">
              {isTeacher ? "Gerencie seus cursos e integre com Pandavideo" : "Continue de onde parou ou descubra novos cursos"}
            </p>
          </div>
          {isTeacher && (
            <Button 
              className={gradients.buttonOrange}
              onClick={() => setActiveTab("gerenciar")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Gerenciar Cursos
            </Button>
          )}
        </div>

        {/* Tabs para Professores */}
        {isTeacher && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cursos">Meus Cursos</TabsTrigger>
              <TabsTrigger value="gerenciar">Gerenciar</TabsTrigger>
              <TabsTrigger value="configurar">Configurar</TabsTrigger>
            </TabsList>

            <TabsContent value="cursos" className="space-y-6">
              {/* Conteúdo dos Cursos */}
              <div className="space-y-6">
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Pesquisar cursos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md bg-background"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid de Cursos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <Card 
                      key={course.id} 
                      className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => handleCourseClick(course)}
                    >
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-black/20 hover:bg-black/40"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFavorite(course.id)
                              }}
                            >
                              <Heart 
                                className={`h-4 w-4 ${course.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                              />
                            </Button>
                          </div>
                          {course.isNew && (
                            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                              Novo
                            </Badge>
                          )}
                          {course.pandavideoId && (
                            <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                              Pandavideo
                            </Badge>
                          )}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center gap-2 text-white text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-2">
                              {course.description}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={course.instructorAvatar} />
                            <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{course.instructor}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{course.modules} módulos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              <span>{course.lessons} aulas</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{course.students} alunos</span>
                          </div>
                          <Button size="sm" className={gradients.buttonOrange}>
                            Continuar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gerenciar">
              <CourseManager />
            </TabsContent>

            <TabsContent value="configurar">
              <PandavideoIntegration />
            </TabsContent>
          </Tabs>
        )}

        {/* Interface para Estudantes */}
        {!isTeacher && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid de Cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <Card 
                  key={course.id} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-black/20 hover:bg-black/40"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFavorite(course.id)
                          }}
                        >
                          <Heart 
                            className={`h-4 w-4 ${course.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                          />
                        </Button>
                      </div>
                      {course.isNew && (
                        <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                          Novo
                        </Badge>
                      )}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Clock className="h-3 w-3" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={course.instructorAvatar} />
                        <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{course.instructor}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{course.modules} módulos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>{course.lessons} aulas</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{course.students} alunos</span>
                      </div>
                      <Button size="sm" className={gradients.buttonOrange}>
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Player de Vídeo Modal */}
        {selectedCourse && currentLesson && (
          <VideoPlayer
            videoId={currentLesson.pandavideoId || "sample-video-id"}
            title={currentLesson.title}
            onClose={() => setSelectedCourse(null)}
            onComplete={() => {
              console.log('Aula concluída!')
              // Aqui você pode implementar a lógica para marcar como concluída
            }}
          />
        )}
      </div>
    </DashboardShell>
  )
} 