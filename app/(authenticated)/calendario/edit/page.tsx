"use client"

import { TeacherAndAdminOnly } from "@/components/teacher-admin-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Save, X, Calendar as CalendarIcon, Clock, MapPin, Users, BookOpen } from "lucide-react"
import { useState } from "react"

export default function CalendarEditPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Aula de Matemática - Álgebra",
      description: "Revisão dos conceitos básicos de álgebra",
      date: "2024-09-10",
      time: "14:00",
      duration: 90,
      type: "Aula",
      subject: "Matemática",
      location: "Sala 101",
      maxStudents: 30,
      instructor: "Prof. João Silva"
    },
    {
      id: 2,
      title: "Simulado de Português",
      description: "Simulado completo de português para o concurso",
      date: "2024-09-15",
      time: "09:00",
      duration: 180,
      type: "Simulado",
      subject: "Português",
      location: "Laboratório de Informática",
      maxStudents: 25,
      instructor: "Prof. Maria Santos"
    },
    {
      id: 3,
      title: "Reunião de Pais",
      description: "Reunião para apresentar o progresso dos alunos",
      date: "2024-09-20",
      time: "19:00",
      duration: 120,
      type: "Reunião",
      subject: "Geral",
      location: "Auditório Principal",
      maxStudents: 100,
      instructor: "Coordenação"
    }
  ])

  const [editingEvent, setEditingEvent] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'Aula',
    subject: 'Geral',
    location: '',
    maxStudents: 30,
    instructor: ''
  })

  const handleEditEvent = (eventId: number) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setEditingEvent(eventId)
      setEditForm({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        duration: event.duration,
        type: event.type,
        subject: event.subject,
        location: event.location,
        maxStudents: event.maxStudents,
        instructor: event.instructor
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEvent = () => {
    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent 
          ? { ...event, ...editForm }
          : event
      ))
      setIsEditDialogOpen(false)
      setEditingEvent(null)
      setEditForm({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        type: 'Aula',
        subject: 'Geral',
        location: '',
        maxStudents: 30,
        instructor: ''
      })
    }
  }

  const handleDeleteEvent = (eventId: number) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      setEvents(events.filter(event => event.id !== eventId))
    }
  }

  const handleAddEvent = () => {
    setEditForm({
      title: '',
      description: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '14:00',
      duration: 60,
      type: 'Aula',
      subject: 'Geral',
      location: '',
      maxStudents: 30,
      instructor: ''
    })
    setEditingEvent(null)
    setIsCreateDialogOpen(true)
  }

  const handleCreateEvent = () => {
    const newEvent = {
      id: Date.now(),
      ...editForm
    }
    setEvents([...events, newEvent])
    setIsCreateDialogOpen(false)
    setEditForm({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      type: 'Aula',
      subject: 'Geral',
      location: '',
      maxStudents: 30,
      instructor: ''
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Aula': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'Simulado': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'Reunião': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Matemática': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'Português': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'Geral': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <TeacherAndAdminOnly>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Editar Calendário
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie eventos, aulas e atividades do calendário.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                <Button 
                  onClick={handleAddEvent}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Evento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Eventos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Eventos do Calendário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                          <Badge variant="outline" className={getSubjectColor(event.subject)}>
                            {event.subject}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {new Date(event.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {event.time} ({event.duration}min)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {event.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {event.maxStudents} vagas
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <BookOpen className="h-4 w-4 inline mr-1" />
                          {event.instructor}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum evento encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Adicione eventos ao calendário para começar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Edição de Evento */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Atualize as informações do evento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    placeholder="Título do evento..."
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Tipo</Label>
                  <Select 
                    value={editForm.type} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aula">Aula</SelectItem>
                      <SelectItem value="Simulado">Simulado</SelectItem>
                      <SelectItem value="Reunião">Reunião</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Palestra">Palestra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Descrição do evento..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Horário</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duração (min)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-subject">Matéria</Label>
                  <Select 
                    value={editForm.subject} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="Português">Português</SelectItem>
                      <SelectItem value="Física">Física</SelectItem>
                      <SelectItem value="Química">Química</SelectItem>
                      <SelectItem value="Biologia">Biologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Local</Label>
                  <Input
                    id="edit-location"
                    placeholder="Local do evento..."
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-max-students">Máx. Participantes</Label>
                  <Input
                    id="edit-max-students"
                    type="number"
                    value={editForm.maxStudents}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-instructor">Instrutor</Label>
                  <Input
                    id="edit-instructor"
                    placeholder="Nome do instrutor..."
                    value={editForm.instructor}
                    onChange={(e) => setEditForm(prev => ({ ...prev, instructor: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingEvent(null)
                    setEditForm({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      duration: 60,
                      type: 'Aula',
                      subject: 'Geral',
                      location: '',
                      maxStudents: 30,
                      instructor: ''
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEvent}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Criação de Evento */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar um novo evento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Título</Label>
                  <Input
                    id="create-title"
                    placeholder="Título do evento..."
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-type">Tipo</Label>
                  <Select 
                    value={editForm.type} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aula">Aula</SelectItem>
                      <SelectItem value="Simulado">Simulado</SelectItem>
                      <SelectItem value="Reunião">Reunião</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Palestra">Palestra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-description">Descrição</Label>
                <Textarea
                  id="create-description"
                  placeholder="Descrição do evento..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-date">Data</Label>
                  <Input
                    id="create-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-time">Horário</Label>
                  <Input
                    id="create-time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-duration">Duração (min)</Label>
                  <Input
                    id="create-duration"
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-subject">Matéria</Label>
                  <Select 
                    value={editForm.subject} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="Português">Português</SelectItem>
                      <SelectItem value="Física">Física</SelectItem>
                      <SelectItem value="Química">Química</SelectItem>
                      <SelectItem value="Biologia">Biologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-location">Local</Label>
                  <Input
                    id="create-location"
                    placeholder="Local do evento..."
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-max-students">Máx. Participantes</Label>
                  <Input
                    id="create-max-students"
                    type="number"
                    value={editForm.maxStudents}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-instructor">Instrutor</Label>
                  <Input
                    id="create-instructor"
                    placeholder="Nome do instrutor..."
                    value={editForm.instructor}
                    onChange={(e) => setEditForm(prev => ({ ...prev, instructor: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditForm({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      duration: 60,
                      type: 'Aula',
                      subject: 'Geral',
                      location: '',
                      maxStudents: 30,
                      instructor: ''
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateEvent}>
                  <Save className="h-4 w-4 mr-2" />
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TeacherAndAdminOnly>
  )
}
