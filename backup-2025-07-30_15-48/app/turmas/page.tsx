"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreVertical, Edit, Trash2, Users, Calendar, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getAllClasses, createClass, updateClass, deleteClass, getAllSubjects } from "@/app/actions-members"

interface Class {
  id: number
  nome: string
  descricao?: string
  curso_id: string
  codigo_acesso?: string
  max_alunos: number
  periodo?: string
  ano_letivo: number
  data_inicio?: string
  data_fim?: string
  status: string
  created_at: string
  member_classes?: Array<{
    member_id: number
    status: string
  }>
}

interface Subject {
  id: string
  name: string
}

export default function TurmasPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("todas")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadClasses()
    loadSubjects()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await getAllClasses()
      setClasses(data)
    } catch (error) {
      console.error("Erro ao carregar turmas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    try {
      const data = await getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error("Erro ao carregar matérias:", error)
    }
  }

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === "todas" || 
                         (selectedFilter === "ativas" && classItem.status === "ativa") ||
                         (selectedFilter === "inativas" && classItem.status === "inativa") ||
                         (selectedFilter === "encerradas" && classItem.status === "encerrada")

    return matchesSearch && matchesFilter
  })

  const handleCreateClass = async (formData: FormData) => {
    try {
      const classData = {
        nome: formData.get("nome") as string,
        descricao: formData.get("descricao") as string,
        curso_id: formData.get("curso_id") as string,
        codigo_acesso: formData.get("codigo_acesso") as string,
        max_alunos: parseInt(formData.get("max_alunos") as string) || 50,
        periodo: formData.get("periodo") as string,
        ano_letivo: parseInt(formData.get("ano_letivo") as string) || new Date().getFullYear(),
        data_inicio: formData.get("data_inicio") as string,
        data_fim: formData.get("data_fim") as string
      }

      const result = await createClass(classData)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        })
        setIsCreateDialogOpen(false)
        loadClasses()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao criar turma",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  const handleUpdateClass = async (id: number, updates: Partial<Class>) => {
    try {
      const result = await updateClass(id, updates)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso!",
        })
        setEditingClass(null)
        loadClasses()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao atualizar turma",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClass = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta turma?")) return

    try {
      const result = await deleteClass(id)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Turma excluída com sucesso!",
        })
        loadClasses()
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao excluir turma",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não definida"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ativa: "default",
      inativa: "secondary",
      encerrada: "outline"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    )
  }

  const getPeriodoLabel = (periodo?: string) => {
    const labels = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
      integral: "Integral"
    }
    return labels[periodo as keyof typeof labels] || "Não definido"
  }

  const getSubjectName = (cursoId: string) => {
    const subject = subjects.find(s => s.id === cursoId)
    return subject?.name || cursoId
  }

  const getMemberCount = (classItem: Class) => {
    return classItem.member_classes?.filter(mc => mc.status === "ativo").length || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">Organize seus alunos com turmas e entregas programadas</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar nova turma</DialogTitle>
              <DialogDescription>
                Crie uma nova turma para organizar seus alunos
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateClass}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da turma</Label>
                    <Input id="nome" name="nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curso_id">Matéria</Label>
                    <select id="curso_id" name="curso_id" className="w-full p-2 border rounded-md" required>
                      <option value="">Selecione uma matéria</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" name="descricao" placeholder="Descreva a turma..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_acesso">Código de acesso</Label>
                    <Input id="codigo_acesso" name="codigo_acesso" placeholder="Ex: TURMA2024" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_alunos">Máximo de alunos</Label>
                    <Input id="max_alunos" name="max_alunos" type="number" defaultValue="50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <select id="periodo" name="periodo" className="w-full p-2 border rounded-md">
                      <option value="">Selecione o período</option>
                      <option value="manha">Manhã</option>
                      <option value="tarde">Tarde</option>
                      <option value="noite">Noite</option>
                      <option value="integral">Integral</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ano_letivo">Ano letivo</Label>
                    <Input id="ano_letivo" name="ano_letivo" type="number" defaultValue={new Date().getFullYear()} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data de início</Label>
                    <Input id="data_inicio" name="data_inicio" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data de fim</Label>
                    <Input id="data_fim" name="data_fim" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Criar turma</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de turmas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {classes.filter(c => c.status === "ativa").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas inativas</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {classes.filter(c => c.status === "inativa").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((total, classItem) => total + getMemberCount(classItem), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Busque por nome da turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "todas", label: "Todas", count: classes.length },
            { key: "ativas", label: "Ativas", count: classes.filter(c => c.status === "ativa").length },
            { key: "inativas", label: "Inativas", count: classes.filter(c => c.status === "inativa").length },
            { key: "encerradas", label: "Encerradas", count: classes.filter(c => c.status === "encerrada").length }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key)}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{classItem.nome}</CardTitle>
                  <CardDescription>
                    {getSubjectName(classItem.curso_id)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditingClass(classItem)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClass(classItem.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {classItem.descricao && (
                <p className="text-sm text-muted-foreground">{classItem.descricao}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {getMemberCount(classItem)} / {classItem.max_alunos} alunos
                  </span>
                </div>
                {getStatusBadge(classItem.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Período</p>
                  <p className="font-medium">{getPeriodoLabel(classItem.periodo)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ano letivo</p>
                  <p className="font-medium">{classItem.ano_letivo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Início</p>
                  <p className="font-medium">{formatDate(classItem.data_inicio)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fim</p>
                  <p className="font-medium">{formatDate(classItem.data_fim)}</p>
                </div>
              </div>

              {classItem.codigo_acesso && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Código: {classItem.codigo_acesso}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Class Dialog */}
      {editingClass && (
        <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar turma</DialogTitle>
              <DialogDescription>
                Atualize as informações da turma
              </DialogDescription>
            </DialogHeader>
            <form action={(formData) => {
              handleUpdateClass(editingClass.id, {
                nome: formData.get("edit_nome") as string,
                descricao: formData.get("edit_descricao") as string,
                curso_id: formData.get("edit_curso_id") as string,
                codigo_acesso: formData.get("edit_codigo_acesso") as string,
                max_alunos: parseInt(formData.get("edit_max_alunos") as string) || 50,
                periodo: formData.get("edit_periodo") as string,
                ano_letivo: parseInt(formData.get("edit_ano_letivo") as string) || new Date().getFullYear(),
                data_inicio: formData.get("edit_data_inicio") as string,
                data_fim: formData.get("edit_data_fim") as string,
                status: formData.get("edit_status") as string
              })
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_nome">Nome da turma</Label>
                    <Input 
                      id="edit_nome" 
                      name="edit_nome" 
                      defaultValue={editingClass.nome}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_curso_id">Matéria</Label>
                    <select 
                      id="edit_curso_id" 
                      name="edit_curso_id" 
                      className="w-full p-2 border rounded-md" 
                      defaultValue={editingClass.curso_id}
                      required
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_descricao">Descrição</Label>
                  <Textarea 
                    id="edit_descricao" 
                    name="edit_descricao" 
                    defaultValue={editingClass.descricao || ""}
                    placeholder="Descreva a turma..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_codigo_acesso">Código de acesso</Label>
                    <Input 
                      id="edit_codigo_acesso" 
                      name="edit_codigo_acesso" 
                      defaultValue={editingClass.codigo_acesso || ""}
                      placeholder="Ex: TURMA2024" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_max_alunos">Máximo de alunos</Label>
                    <Input 
                      id="edit_max_alunos" 
                      name="edit_max_alunos" 
                      type="number" 
                      defaultValue={editingClass.max_alunos} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_periodo">Período</Label>
                    <select 
                      id="edit_periodo" 
                      name="edit_periodo" 
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingClass.periodo || ""}
                    >
                      <option value="">Selecione o período</option>
                      <option value="manha">Manhã</option>
                      <option value="tarde">Tarde</option>
                      <option value="noite">Noite</option>
                      <option value="integral">Integral</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_ano_letivo">Ano letivo</Label>
                    <Input 
                      id="edit_ano_letivo" 
                      name="edit_ano_letivo" 
                      type="number" 
                      defaultValue={editingClass.ano_letivo} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_data_inicio">Data de início</Label>
                    <Input 
                      id="edit_data_inicio" 
                      name="edit_data_inicio" 
                      type="date" 
                      defaultValue={editingClass.data_inicio || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_data_fim">Data de fim</Label>
                    <Input 
                      id="edit_data_fim" 
                      name="edit_data_fim" 
                      type="date" 
                      defaultValue={editingClass.data_fim || ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_status">Status</Label>
                  <select 
                    id="edit_status" 
                    name="edit_status" 
                    className="w-full p-2 border rounded-md"
                    defaultValue={editingClass.status}
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                    <option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar alterações</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 