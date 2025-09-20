"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  Filter,
  ArrowLeft,
  BookOpen,
  Target,
  Clock,
  Users,
  BarChart3,
  Download,
  Upload,
  Copy,
  Share2,
  Play,
  Pause,
  Eye,
  Star,
  Zap,
  Trophy,
  Settings
} from "lucide-react"
import { TeacherAndAdminOnly } from "@/components/teacher-admin-guard"
import { useAuth } from "@/context/auth-context-custom"
import { useRouter } from "next/navigation"
import { getAllQuizzesByTopic, createQuiz, updateQuiz, deleteQuiz, getAllTopicsAndSubjects } from "@/actions"

interface Quiz {
  id: string
  title: string
  description: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit: number
  questions_count: number
  created_at: string
  updated_at: string
  author: string
  attempts: number
  average_score: number
  is_public: boolean
  is_active: boolean
}

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  points: number
}

interface Subject {
  id: string
  name: string
  color: string
  quiz_count: number
}

export default function EditQuizPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  // Dados mock
  const mockSubjects = [
    { id: "1", name: "Português", color: "bg-blue-500", quiz_count: 12 },
    { id: "2", name: "Matemática", color: "bg-green-500", quiz_count: 18 },
    { id: "3", name: "Física", color: "bg-purple-500", quiz_count: 15 },
    { id: "4", name: "Química", color: "bg-orange-500", quiz_count: 10 },
    { id: "5", name: "Biologia", color: "bg-pink-500", quiz_count: 14 },
    { id: "6", name: "História", color: "bg-red-500", quiz_count: 8 }
  ]

  const mockQuizzes: Quiz[] = [
    {
      id: "1",
      title: "Matemática Básica - Álgebra",
      description: "Quiz sobre conceitos básicos de álgebra",
      subject: "Matemática",
      topic: "Álgebra",
      difficulty: "easy",
      time_limit: 30,
      questions_count: 10,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      author: "Prof. João Silva",
      attempts: 156,
      average_score: 78.5,
      is_public: true,
      is_active: true
    },
    {
      id: "2",
      title: "Português - Gramática Avançada",
      description: "Quiz sobre regras gramaticais complexas",
      subject: "Português",
      topic: "Gramática",
      difficulty: "hard",
      time_limit: 45,
      questions_count: 15,
      created_at: "2024-01-14T14:20:00Z",
      updated_at: "2024-01-14T14:20:00Z",
      author: "Prof. Maria Santos",
      attempts: 89,
      average_score: 65.2,
      is_public: true,
      is_active: true
    },
    {
      id: "3",
      title: "Física - Mecânica",
      description: "Quiz sobre leis de Newton e movimento",
      subject: "Física",
      topic: "Mecânica",
      difficulty: "medium",
      time_limit: 60,
      questions_count: 20,
      created_at: "2024-01-13T09:15:00Z",
      updated_at: "2024-01-13T09:15:00Z",
      author: "Prof. Carlos Lima",
      attempts: 203,
      average_score: 72.8,
      is_public: true,
      is_active: true
    }
  ]

  useEffect(() => {
    loadData()
  }, [user?.id, profile?.id])

  const loadData = async () => {
    if (!user?.id || !profile?.id) return
    
    setIsLoading(true)
    try {
      // Carregar subjects e topics
      const topicsResult = await getAllTopicsAndSubjects(profile.id)
      if (topicsResult.success) {
        const subjectsData = topicsResult.data?.subjects.map((subject: any) => ({
          id: subject.id,
          name: subject.name,
          color: "bg-blue-500", // Cor padrão
          quiz_count: 0 // Será calculado depois
        }))
        setSubjects(subjectsData || [])
        
        // Carregar quizzes para cada tópico
        const allQuizzes = []
        for (const topic of topicsResult.data?.topics || []) {
          const quizzesResult = await getAllQuizzesByTopic(topic.id)
          if (quizzesResult && quizzesResult.length > 0) {
            allQuizzes.push(...quizzesResult)
          }
        }
        
        // Converter para o formato esperado
        const formattedQuizzes = allQuizzes.map(quiz => ({
          id: quiz.id.toString(),
          title: quiz.title || "Quiz sem título",
          description: quiz.description || "Sem descrição",
          subject: "Geral", // Será melhorado depois
          topic: "Geral",
          difficulty: "medium" as 'easy' | 'medium' | 'hard',
          time_limit: 30,
          questions_count: 10,
          created_at: quiz.created_at || new Date().toISOString(),
          updated_at: quiz.updated_at || new Date().toISOString(),
          author: "Professor",
          attempts: 0,
          average_score: 0,
          is_public: true,
          is_active: true
        }))
        
        setQuizzes(formattedQuizzes)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Fallback para dados mock em caso de erro
      setSubjects(mockSubjects)
      setQuizzes(mockQuizzes)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || quiz.subject === selectedSubject
    const matchesDifficulty = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty

    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    time_limit: 30,
    questions_count: 10,
    is_public: false,
    is_active: false
  })

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setEditForm({
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      time_limit: quiz.time_limit,
      questions_count: quiz.questions_count,
      is_public: quiz.is_public,
      is_active: quiz.is_active
    })
    setIsCreateDialogOpen(true)
  }

  const handleSaveQuiz = async () => {
    if (!profile?.id || !editingQuiz) return
    
    try {
      const result = await updateQuiz(profile.id, editingQuiz.id, {
        title: editForm.title,
        description: editForm.description,
        // Adicionar outros campos conforme necessário
      })
      
      if (result.success) {
        setQuizzes(prev => 
          prev.map(q => q.id === editingQuiz.id 
            ? { ...q, ...editForm, updated_at: new Date().toISOString() }
            : q
          )
        )
        setEditingQuiz(null)
        setIsCreateDialogOpen(false)
        setEditForm({
          title: '',
          description: '',
          subject: '',
          topic: '',
          difficulty: 'easy',
          time_limit: 30,
          questions_count: 10,
          is_public: false,
          is_active: false
        })
      }
    } catch (error) {
      console.error("Erro ao salvar quiz:", error)
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    if (!profile?.id) return
    
    if (confirm("Tem certeza que deseja excluir este quiz?")) {
      try {
        const result = await deleteQuiz(profile.id, id)
        if (result.success) {
          setQuizzes(prev => prev.filter(q => q.id !== id))
        }
      } catch (error) {
        console.error("Erro ao excluir quiz:", error)
      }
    }
  }

  const handleCreateQuiz = async () => {
    if (!profile?.id) return
    
    try {
      const result = await createQuiz(profile.id, {
        title: editForm.title,
        description: editForm.description,
        topic_id: "1", // Será melhorado depois
        // Adicionar outros campos conforme necessário
      })
      
      if (result.success && result.data) {
        const newQuiz: Quiz = {
          id: result.data.id.toString(),
          ...editForm,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attempts: 0,
          average_score: 0,
          author: profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "Usuário"
        }
        setQuizzes(prev => [...prev, newQuiz])
        setIsCreateDialogOpen(false)
        setEditForm({
          title: '',
          description: '',
          subject: '',
          topic: '',
          difficulty: 'easy',
          time_limit: 30,
          questions_count: 10,
          is_public: false,
          is_active: false
        })
      }
    } catch (error) {
      console.error("Erro ao criar quiz:", error)
    }
  }

  const handleToggleQuizStatus = (id: string) => {
    setQuizzes(prev => 
      prev.map(q => q.id === id ? { ...q, is_active: !q.is_active } : q)
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Médio'
      case 'hard': return 'Difícil'
      default: return 'N/A'
    }
  }

  return (
    <TeacherAndAdminOnly>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Quizzes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie e edite os quizzes da plataforma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button onClick={() => {
              setEditingQuiz(null)
              setEditForm({
                title: '',
                description: '',
                subject: '',
                topic: '',
                difficulty: 'easy',
                time_limit: 30,
                questions_count: 10,
                is_public: false,
                is_active: false
              })
              setIsCreateDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Quiz
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Lista de Quizzes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filtros e Busca */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros e Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Matéria</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as matérias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as matérias</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Dificuldade</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as dificuldades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as dificuldades</SelectItem>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Quizzes */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Carregando quizzes...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredQuizzes.length} quizzes encontrados
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicar Selecionados
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                  {filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getDifficultyColor(quiz.difficulty)}>
                                {getDifficultyLabel(quiz.difficulty)}
                              </Badge>
                              <Badge variant="outline">{quiz.subject}</Badge>
                              <Badge variant="outline">{quiz.topic}</Badge>
                              {quiz.is_public && (
                                <Badge variant="secondary">Público</Badge>
                              )}
                              {quiz.is_active ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                            <CardDescription className="text-sm mb-3">
                              {quiz.description}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.time_limit}min
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {quiz.questions_count} perguntas
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {quiz.attempts} tentativas
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {quiz.average_score}% média
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleQuizStatus(quiz.id)}
                            >
                              {quiz.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuiz(quiz)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}

                  {filteredQuizzes.length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Nenhum quiz encontrado
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Tente ajustar os filtros ou criar um novo quiz.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Total de Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{quizzes.length}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +8% este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Total de Tentativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {quizzes.reduce((sum, q) => sum + q.attempts, 0)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +12% este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Média Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {quizzes.length > 0 ? (quizzes.reduce((sum, q) => sum + q.average_score, 0) / quizzes.length).toFixed(1) : 0}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +3% este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quizzes Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {quizzes.filter(q => q.is_active).length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quizzes.length > 0 ? Math.round((quizzes.filter(q => q.is_active).length / quizzes.length) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estatísticas por Matéria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map(subject => {
                    const subjectQuizzes = quizzes.filter(q => q.subject === subject.name)
                    const totalAttempts = subjectQuizzes.reduce((sum, q) => sum + q.attempts, 0)
                    const averageScore = subjectQuizzes.length > 0 ? 
                      (subjectQuizzes.reduce((sum, q) => sum + q.average_score, 0) / subjectQuizzes.length).toFixed(1) : 0
                    
                    return (
                      <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
                          <div>
                            <p className="font-medium">{subject.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {subjectQuizzes.length} quizzes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {totalAttempts} tentativas
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {averageScore}% média
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Configurações em Desenvolvimento
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configurações avançadas estarão disponíveis em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Criação/Edição */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingQuiz(null)
            setEditForm({
              title: '',
              description: '',
              subject: '',
              topic: '',
              difficulty: 'easy',
              time_limit: 30,
              questions_count: 10,
              is_public: false,
              is_active: false
            })
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuiz ? 'Editar Quiz' : 'Criar Novo Quiz'}
              </DialogTitle>
              <DialogDescription>
                {editingQuiz ? 'Atualize as informações do quiz' : 'Preencha as informações para criar um novo quiz'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matéria</Label>
                  <Select 
                    value={editForm.subject} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select 
                    value={editForm.difficulty} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título do Quiz</Label>
                <Input
                  id="title"
                  placeholder="Digite o título do quiz..."
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Digite a descrição do quiz..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_limit">Tempo Limite (minutos)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    placeholder="30"
                    value={editForm.time_limit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="questions_count">Número de Perguntas</Label>
                  <Input
                    id="questions_count"
                    type="number"
                    placeholder="10"
                    value={editForm.questions_count}
                    onChange={(e) => setEditForm(prev => ({ ...prev, questions_count: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editForm.is_public}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_public">Tornar público</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_active">Ativar quiz</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  setEditingQuiz(null)
                  setEditForm({
                    title: '',
                    description: '',
                    subject: '',
                    topic: '',
                    difficulty: 'easy',
                    time_limit: 30,
                    questions_count: 10,
                    is_public: false,
                    is_active: false
                  })
                }}>
                  Cancelar
                </Button>
                <Button onClick={editingQuiz ? handleSaveQuiz : handleCreateQuiz}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuiz ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TeacherAndAdminOnly>
  )
}