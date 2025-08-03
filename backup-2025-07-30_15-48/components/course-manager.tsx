"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Upload, 
  Settings,
  Users,
  Clock,
  BookOpen,
  GraduationCap,
  Eye,
  Download,
  Share2
} from "lucide-react"
import { gradients } from "@/lib/gradients"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  modules: number
  lessons: number
  progress: number
  thumbnail: string
  category: string
  rating: number
  students: number
  isPublished: boolean
  pandavideoId?: string
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  duration: string
  type: 'video' | 'document' | 'quiz'
  pandavideoId?: string
  isPublished: boolean
}

export function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    pandavideoId: ""
  })

  const categories = [
    "Concurso Militar",
    "Redação", 
    "Matemática",
    "Português",
    "História",
    "Geografia",
    "Física",
    "Química",
    "Biologia"
  ]

  const handleCreateCourse = () => {
    const course: Course = {
      id: Date.now().toString(),
      title: newCourse.title,
      description: newCourse.description,
      instructor: "Prof. Tiago Costa",
      duration: "0h 0m",
      modules: 0,
      lessons: 0,
      progress: 0,
      thumbnail: "/api/avatar?email=course@everest.com",
      category: newCourse.category,
      rating: 0,
      students: 0,
      isPublished: false,
      pandavideoId: newCourse.pandavideoId
    }

    setCourses([...courses, course])
    setNewCourse({ title: "", description: "", category: "", pandavideoId: "" })
    setIsCreateDialogOpen(false)
  }

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId))
  }

  const handlePublishCourse = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, isPublished: !course.isPublished }
        : course
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Cursos</h2>
          <p className="text-muted-foreground">
            Crie e gerencie seus cursos com integração ao Pandavideo
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className={gradients.buttonOrange}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Curso</DialogTitle>
              <DialogDescription>
                Preencha as informações do curso e integre com o Pandavideo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título do Curso</label>
                <Input
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="Ex: Extensivo EAOF 2026 - Português e Redação"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Descreva o conteúdo e objetivos do curso..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={newCourse.category} onValueChange={(value) => setNewCourse({...newCourse, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">ID do Vídeo Pandavideo (Opcional)</label>
                  <Input
                    value={newCourse.pandavideoId}
                    onChange={(e) => setNewCourse({...newCourse, pandavideoId: e.target.value})}
                    placeholder="ID do vídeo no Pandavideo"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCourse} className={gradients.buttonOrange}>
                  Criar Curso
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/20 hover:bg-black/40"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="h-4 w-4 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/20 hover:bg-black/40"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
                {!course.isPublished && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                    Rascunho
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
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.category}
                </Badge>
                {course.pandavideoId && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Pandavideo
                  </Badge>
                )}
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
                  <Users className="h-3 w-3" />
                  <span className="text-sm">{course.students} alunos</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePublishCourse(course.id)}
                  >
                    {course.isPublished ? "Despublicar" : "Publicar"}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Modifique as informações do curso
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título do Curso</label>
                <Input
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={selectedCourse.description}
                  onChange={(e) => setSelectedCourse({...selectedCourse, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={selectedCourse.category} onValueChange={(value) => setSelectedCourse({...selectedCourse, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">ID do Vídeo Pandavideo</label>
                  <Input
                    value={selectedCourse.pandavideoId || ""}
                    onChange={(e) => setSelectedCourse({...selectedCourse, pandavideoId: e.target.value})}
                    placeholder="ID do vídeo no Pandavideo"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setCourses(courses.map(course => 
                    course.id === selectedCourse.id ? selectedCourse : course
                  ))
                  setIsEditDialogOpen(false)
                }} className={gradients.buttonOrange}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 