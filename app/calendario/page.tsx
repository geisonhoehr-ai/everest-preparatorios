"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getUserRoleClient } from "@/lib/get-user-role";
import { 
  getAllCalendarEvents,
  getCalendarEventsByMonth,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent
} from "@/actions";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  BookOpen, 
  Video, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
  Target,
  UserCheck,
  AlertCircle
} from "lucide-react";

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [activeView, setActiveView] = useState("month");

  // Estados do formulário
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    event_type: "aula",
    event_date: "",
    event_time: "",
    duration_minutes: undefined,
    instructor: "",
    location: "",
    is_mandatory: false,
    max_participants: undefined,
    registration_required: false,
    event_url: ""
  });

  // Color palettes baseadas no tipo de evento
  const getEventColorPalette = (type: CalendarEvent["event_type"]) => {
    switch (type) {
      case "live":
        return {
          card: "bg-gradient-to-br from-orange-500/10 to-orange-600/20 dark:from-orange-900/20 dark:to-orange-600/30",
          border: "border-orange-500/20",
          text: "text-orange-600 dark:text-orange-400",
          badge: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
          icon: "text-orange-500"
        };
      case "simulado":
        return {
          card: "bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-900/20 dark:to-green-600/30",
          border: "border-green-500/20",
          text: "text-green-600 dark:text-green-400",
          badge: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
          icon: "text-green-500"
        };
      case "prova":
        return {
          card: "bg-gradient-to-br from-red-500/10 to-red-600/20 dark:from-red-900/20 dark:to-red-600/30",
          border: "border-red-500/20",
          text: "text-red-600 dark:text-red-400",
          badge: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
          icon: "text-red-500"
        };
      case "redacao":
        return {
          card: "bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-900/20 dark:to-purple-600/30",
          border: "border-purple-500/20",
          text: "text-purple-600 dark:text-purple-400",
          badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
          icon: "text-purple-500"
        };
      case "aula":
        return {
          card: "bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-900/20 dark:to-blue-600/30",
          border: "border-blue-500/20",
          text: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
          icon: "text-blue-500"
        };
    }
  };

  const getEventIcon = (type: CalendarEvent["event_type"], className: string = "h-4 w-4") => {
    const iconClass = `${className} ${getEventColorPalette(type).icon}`;
    switch (type) {
      case "aula": return <BookOpen className={iconClass} />;
      case "simulado": return <Target className={iconClass} />;
      case "prova": return <FileText className={iconClass} />;
      case "redacao": return <Edit2 className={iconClass} />;
      case "live": return <Video className={iconClass} />;
    }
  };

  const formatEventType = (type: CalendarEvent["event_type"]) => {
    switch (type) {
      case "live": return "Live";
      case "simulado": return "Simulado";
      case "prova": return "Prova";
      case "redacao": return "Redação";
      case "aula": return "Aula";
    }
  };

  // Função para carregar eventos
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await getAllCalendarEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar eventos do calendário");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar role do usuário
  const checkUserRole = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = await getUserRoleClient(user.email);
        setUserRole(role);
      }
    } catch (error) {
      console.error("Erro ao verificar role do usuário:", error);
    }
  };

  useEffect(() => {
    checkUserRole();
    loadEvents();
  }, []);

  // Função para salvar evento
  const handleSaveEvent = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (!formData.title || !formData.event_date || !formData.event_type) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      if (editingEvent) {
        await updateCalendarEvent(user.id, editingEvent.id!, formData);
        toast.success("Evento atualizado com sucesso!");
      } else {
        await createCalendarEvent(user.id, formData as CalendarEvent);
        toast.success("Evento criado com sucesso!");
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        event_type: "aula",
        event_date: "",
        event_time: "",
        duration_minutes: undefined,
        instructor: "",
        location: "",
        is_mandatory: false,
        max_participants: undefined,
        registration_required: false,
        event_url: ""
      });
      loadEvents();
    } catch (error: any) {
      console.error("Erro ao salvar evento:", error);
      toast.error(error.message || "Erro ao salvar evento");
    }
  };

  // Função para deletar evento
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (confirm("Tem certeza que deseja deletar este evento?")) {
        await deleteCalendarEvent(user.id, eventId);
        toast.success("Evento deletado com sucesso!");
        loadEvents();
      }
    } catch (error: any) {
      console.error("Erro ao deletar evento:", error);
      toast.error(error.message || "Erro ao deletar evento");
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const hasEventsOnDay = (day: number) => {
    return events.some(event => {
      const eventDate = new Date(event.event_date + 'T00:00:00');
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date + 'T00:00:00');
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const canManageEvents = userRole === "teacher" || userRole === "admin";

  // Separar eventos futuros e passados
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset para início do dia

  const futureEvents = events
    .filter(event => {
      const eventDate = new Date(event.event_date + 'T00:00:00')
      return eventDate >= today
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date + 'T00:00:00')
      const dateB = new Date(b.event_date + 'T00:00:00')
      return dateA.getTime() - dateB.getTime()
    })

  const pastEvents = events
    .filter(event => {
      const eventDate = new Date(event.event_date + 'T00:00:00')
      return eventDate < today
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date + 'T00:00:00')
      const dateB = new Date(b.event_date + 'T00:00:00')
      return dateB.getTime() - dateA.getTime() // Ordem decrescente (mais recente primeiro)
    })

  // Próximos eventos (limitado a 5)
  const upcomingEvents = futureEvents.slice(0, 5);

  return (
    <DashboardShell>
              <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calendário Acadêmico
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe todas as suas atividades, aulas ao vivo e prazos importantes
            </p>
          </div>
          
          {canManageEvents && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                  onClick={() => {
                    setEditingEvent(null);
                    setFormData({
                      title: "",
                      description: "",
                      event_type: "aula",
                      event_date: "",
                      event_time: "",
                      duration_minutes: undefined,
                      instructor: "",
                      location: "",
                      is_mandatory: false,
                      max_participants: undefined,
                      registration_required: false,
                      event_url: ""
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? "Editar Evento" : "Novo Evento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEvent ? "Edite as informações do evento" : "Adicione um novo evento ao calendário"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: Live: Análise Sintática"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_type">Tipo de Evento *</Label>
                      <Select 
                        value={formData.event_type} 
                        onValueChange={(value) => setFormData({...formData, event_type: value as CalendarEvent["event_type"]})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="live">📺 Live</SelectItem>
                          <SelectItem value="simulado">🎯 Simulado</SelectItem>
                          <SelectItem value="prova">📝 Prova</SelectItem>
                          <SelectItem value="redacao">✍️ Redação</SelectItem>
                          <SelectItem value="aula">📚 Aula</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição detalhada do evento..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Data *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_time">Horário</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_minutes">Duração (min)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={formData.duration_minutes || ""}
                        onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || undefined})}
                        placeholder="120"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instrutor</Label>
                      <Input
                        id="instructor"
                        value={formData.instructor}
                        onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                        placeholder="Prof. João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Sala Virtual / Presencial"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_url">Link do Evento</Label>
                    <Input
                      id="event_url"
                      type="url"
                      value={formData.event_url}
                      onChange={(e) => setFormData({...formData, event_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_participants">Máx. Participantes</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        value={formData.max_participants || ""}
                        onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value) || undefined})}
                        placeholder="100"
                      />
                    </div>
                    <div className="flex items-center space-x-4 pt-8">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_mandatory"
                          checked={formData.is_mandatory}
                          onChange={(e) => setFormData({...formData, is_mandatory: e.target.checked})}
                        />
                        <Label htmlFor="is_mandatory">Obrigatório</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="registration_required"
                          checked={formData.registration_required}
                          onChange={(e) => setFormData({...formData, registration_required: e.target.checked})}
                        />
                        <Label htmlFor="registration_required">Inscrição</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveEvent}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  >
                    {editingEvent ? "Atualizar" : "Criar"} Evento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800">
            <TabsTrigger 
              value="month" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📅 Calendário
            </TabsTrigger>
            <TabsTrigger 
              value="list"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📋 Próximos Eventos
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📚 Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendário */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigateMonth(-1)}
                          className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigateMonth(1)}
                          className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                        <div key={day} className="text-sm font-medium text-muted-foreground py-2 border-b border-muted">
                          {day}
                        </div>
                      ))}
                      {getDaysInMonth(currentDate).map((day, index) => {
                        const dayEvents = day ? getEventsForDay(day) : [];
                        return (
                          <div
                            key={index}
                            className={`
                              relative aspect-square flex flex-col items-center justify-start p-1 rounded-lg transition-all duration-200
                              ${day && hasEventsOnDay(day) ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800" : ""}
                              ${day ? "text-foreground hover:bg-muted/50" : ""}
                            `}
                          >
                            {day && (
                              <>
                                <span className="text-sm font-medium">{day}</span>
                                {dayEvents.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                                      <div
                                        key={eventIndex}
                                        className={`w-2 h-2 rounded-full ${getEventColorPalette(event.event_type).icon.replace('text-', 'bg-')}`}
                                        title={event.title}
                                      />
                                    ))}
                                    {dayEvents.length > 2 && (
                                      <div className="text-xs font-bold text-muted-foreground">
                                        +{dayEvents.length - 2}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Próximos Eventos */}
              <div className="space-y-4">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">Próximos Eventos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="space-y-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-muted rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum evento próximo</p>
                        </div>
                      ) : (
                        upcomingEvents.map(event => {
                          const palette = getEventColorPalette(event.event_type);
                          return (
                            <Card 
                              key={event.id} 
                              className={`${palette.card} ${palette.border} border transition-all duration-200 hover:shadow-lg`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${palette.badge} border`}>
                                    {getEventIcon(event.event_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                                      {canManageEvents && (
                                        <div className="flex gap-1 ml-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                            onClick={() => {
                                              setEditingEvent(event);
                                              setFormData({
                                                title: event.title,
                                                description: event.description || "",
                                                event_type: event.event_type,
                                                event_date: event.event_date,
                                                event_time: event.event_time || "",
                                                duration_minutes: event.duration_minutes,
                                                instructor: event.instructor || "",
                                                location: event.location || "",
                                                is_mandatory: event.is_mandatory,
                                                max_participants: event.max_participants,
                                                registration_required: event.registration_required,
                                                event_url: event.event_url || ""
                                              });
                                              setIsModalOpen(true);
                                            }}
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:text-red-500"
                                            onClick={() => handleDeleteEvent(event.id!)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(event.event_date + 'T00:00:00').toLocaleDateString("pt-BR")}
                                        {event.event_time && ` às ${event.event_time}`}
                                      </span>
                                    </div>
                                    
                                    {event.instructor && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {event.instructor}
                                        </span>
                                      </div>
                                    )}

                                    {event.location && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {event.location}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex gap-1 mt-2">
                                      <Badge variant="secondary" className={`text-xs ${palette.badge}`}>
                                        {formatEventType(event.event_type)}
                                      </Badge>
                                      {event.is_mandatory && (
                                        <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-700 dark:text-red-300">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Obrigatório
                                        </Badge>
                                      )}
                                      {event.registration_required && (
                                        <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                          <UserCheck className="h-3 w-3 mr-1" />
                                          Inscrição
                                        </Badge>
                                      )}
                                    </div>

                                    {event.event_url && (
                                      <div className="mt-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => window.open(event.event_url, '_blank')}
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          Acessar
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas do Mês */}
                                 <Card className="border-0 shadow-lg">
                   <CardHeader>
                     <CardTitle className="text-lg">Próximos Eventos do Mês</CardTitle>
                   </CardHeader>
                  <CardContent>
                                         <div className="space-y-3">
                       {['live', 'simulado', 'prova', 'redacao', 'aula'].map(type => {
                         const count = futureEvents.filter(e => {
                           const eventDate = new Date(e.event_date + 'T00:00:00');
                           return e.event_type === type &&
                                  eventDate.getMonth() === currentDate.getMonth() &&
                                  eventDate.getFullYear() === currentDate.getFullYear();
                         }).length;
                        
                        const palette = getEventColorPalette(type as CalendarEvent["event_type"]);
                        
                        return (
                          <div key={type} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getEventIcon(type as CalendarEvent["event_type"], "h-4 w-4")}
                              <span className="text-sm text-muted-foreground">{formatEventType(type as CalendarEvent["event_type"])}</span>
                            </div>
                            <Badge className={palette.badge}>{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div className="grid gap-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : futureEvents.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">Nenhum evento próximo</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {canManageEvents ? "Clique em 'Novo Evento' para começar" : "Eventos futuros serão exibidos aqui"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                futureEvents.map(event => {
                  const palette = getEventColorPalette(event.event_type);
                  
                  return (
                    <Card 
                      key={event.id} 
                      className={`${palette.card} ${palette.border} border transition-all duration-200 hover:shadow-lg`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${palette.badge} border`}>
                              {getEventIcon(event.event_type, "h-5 w-5")}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <Badge className={palette.badge}>
                                  {formatEventType(event.event_type)}
                                </Badge>
                                {event.is_mandatory && (
                                  <Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-300">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Obrigatório
                                  </Badge>
                                )}
                                {event.registration_required && (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Inscrição
                                  </Badge>
                                )}
                              </div>
                              
                              {event.description && (
                                <p className="text-muted-foreground mb-4">{event.description}</p>
                              )}
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">
                                      {new Date(event.event_date + 'T00:00:00').toLocaleDateString("pt-BR")}
                                    </div>
                                    {event.event_time && (
                                      <div className="text-muted-foreground">
                                        {event.event_time}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {event.instructor && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium">Instrutor</div>
                                      <div className="text-muted-foreground">{event.instructor}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium">Local</div>
                                      <div className="text-muted-foreground">{event.location}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {event.duration_minutes && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium">Duração</div>
                                      <div className="text-muted-foreground">
                                        {Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}min
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {event.event_url && (
                                <div className="mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(event.event_url, '_blank')}
                                    className="hover:bg-primary/10"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Acessar Evento
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {canManageEvents && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingEvent(event);
                                  setFormData({
                                    title: event.title,
                                    description: event.description || "",
                                    event_type: event.event_type,
                                    event_date: event.event_date,
                                    event_time: event.event_time || "",
                                    duration_minutes: event.duration_minutes,
                                    instructor: event.instructor || "",
                                    location: event.location || "",
                                    is_mandatory: event.is_mandatory,
                                    max_participants: event.max_participants,
                                    registration_required: event.registration_required,
                                    event_url: event.event_url || ""
                                  });
                                  setIsModalOpen(true);
                                }}
                                className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id!)}
                                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
                         </div>
           </TabsContent>

           <TabsContent value="history" className="space-y-6">
             <div className="grid gap-4">
               {isLoading ? (
                 <div className="space-y-4">
                   {[1,2,3,4,5].map(i => (
                     <Card key={i} className="animate-pulse">
                       <CardContent className="p-4">
                         <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                         <div className="h-4 bg-muted rounded w-1/2"></div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               ) : pastEvents.length === 0 ? (
                 <Card className="border-dashed border-2">
                   <CardContent className="flex flex-col items-center justify-center py-12">
                     <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                     <h3 className="text-lg font-semibold text-muted-foreground">Nenhum evento no histórico</h3>
                     <p className="text-sm text-muted-foreground mt-1">
                       Eventos passados aparecerão aqui para consulta
                     </p>
                   </CardContent>
                 </Card>
               ) : (
                 pastEvents.map(event => {
                   const palette = getEventColorPalette(event.event_type);
                   
                   return (
                     <Card 
                       key={event.id} 
                       className={`${palette.card} ${palette.border} border transition-all duration-200 hover:shadow-lg opacity-75`}
                     >
                       <CardContent className="p-6">
                         <div className="flex items-start justify-between">
                           <div className="flex items-start gap-4">
                             <div className={`p-3 rounded-lg ${palette.badge} border`}>
                               {getEventIcon(event.event_type, "h-5 w-5")}
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center gap-2 mb-2">
                                 <h3 className="font-semibold text-lg">{event.title}</h3>
                                 <Badge className={palette.badge}>
                                   {formatEventType(event.event_type)}
                                 </Badge>
                                 <Badge variant="secondary" className="bg-gray-500/20 text-gray-700 dark:text-gray-300">
                                   <Clock className="h-3 w-3 mr-1" />
                                   Concluído
                                 </Badge>
                                 {event.is_mandatory && (
                                   <Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-300">
                                     <AlertCircle className="h-3 w-3 mr-1" />
                                     Obrigatório
                                   </Badge>
                                 )}
                                 {event.registration_required && (
                                   <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                     <UserCheck className="h-3 w-3 mr-1" />
                                     Inscrição
                                   </Badge>
                                 )}
                               </div>
                               
                               {event.description && (
                                 <p className="text-muted-foreground mb-4">{event.description}</p>
                               )}
                               
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                 <div className="flex items-center gap-2">
                                   <Clock className="h-4 w-4 text-muted-foreground" />
                                   <div>
                                     <div className="font-medium">
                                       {new Date(event.event_date + 'T00:00:00').toLocaleDateString("pt-BR")}
                                     </div>
                                     {event.event_time && (
                                       <div className="text-muted-foreground">
                                         {event.event_time}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                                 
                                 {event.instructor && (
                                   <div className="flex items-center gap-2">
                                     <Users className="h-4 w-4 text-muted-foreground" />
                                     <div>
                                       <div className="font-medium">Instrutor</div>
                                       <div className="text-muted-foreground">{event.instructor}</div>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {event.location && (
                                   <div className="flex items-center gap-2">
                                     <MapPin className="h-4 w-4 text-muted-foreground" />
                                     <div>
                                       <div className="font-medium">Local</div>
                                       <div className="text-muted-foreground">{event.location}</div>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {event.duration_minutes && (
                                   <div className="flex items-center gap-2">
                                     <Clock className="h-4 w-4 text-muted-foreground" />
                                     <div>
                                       <div className="font-medium">Duração</div>
                                       <div className="text-muted-foreground">
                                         {Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}min
                                       </div>
                                     </div>
                                   </div>
                                 )}
                               </div>
                               
                               {event.event_url && (
                                 <div className="mt-4">
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => window.open(event.event_url, '_blank')}
                                     className="hover:bg-primary/10"
                                   >
                                     <ExternalLink className="h-4 w-4 mr-2" />
                                     Acessar Evento
                                   </Button>
                                 </div>
                               )}
                             </div>
                           </div>
                           
                           {canManageEvents && (
                             <div className="flex gap-2">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => {
                                   setEditingEvent(event);
                                   setFormData({
                                     title: event.title,
                                     description: event.description || "",
                                     event_type: event.event_type,
                                     event_date: event.event_date,
                                     event_time: event.event_time || "",
                                     duration_minutes: event.duration_minutes,
                                     instructor: event.instructor || "",
                                     location: event.location || "",
                                     is_mandatory: event.is_mandatory,
                                     max_participants: event.max_participants,
                                     registration_required: event.registration_required,
                                     event_url: event.event_url || ""
                                   });
                                   setIsModalOpen(true);
                                 }}
                                 className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                               >
                                 <Edit2 className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleDeleteEvent(event.id!)}
                                 className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   );
                 })
               )}
             </div>
           </TabsContent>
         </Tabs>
      </div>
    </DashboardShell>
  );
} 
