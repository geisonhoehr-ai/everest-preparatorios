"use client"

import { useState, useEffect } from "react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Edit, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { getCalendarEvents } from "@/actions"
import { CronogramaViewer } from "@/components/calendar/cronograma-viewer"
import { CronogramaImporter } from "@/components/calendar/cronograma-importer"

export default function CalendarioPage() {
  const { user, profile } = useAuth()
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Debug: verificar dados do usuário
  console.log('🔍 Debug Calendário - User:', user)
  console.log('🔍 Debug Calendário - Profile:', profile)
  console.log('🔍 Debug Calendário - Profile Role:', profile?.role)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const eventsData = await getCalendarEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      setError('Erro ao carregar eventos do calendário')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Simulado":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "Aula":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "Workshop":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "Prova":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200";
      case "Palestra":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PagePermissionGuard pageName="calendario">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendário
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe os eventos e atividades programadas
            </p>
          </div>
        </div>
        {(profile?.role === 'teacher' || profile?.role === 'admin') && (
          <Link href="/calendario/edit">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Calendário
            </Button>
          </Link>
        )}
      </div>

      {/* Importador de Cronograma (apenas para professores e admins) */}
      {(profile?.role === 'teacher' || profile?.role === 'admin') && (
        <CronogramaImporter 
          onImportComplete={loadEvents}
          userRole={profile.role}
          userId={user?.id || ''}
        />
      )}

      {/* Visualizador de Cronograma EAOF 2026 */}
      <CronogramaViewer events={events} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Próximos Eventos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Carregando eventos...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <Button onClick={loadEvents} variant="outline">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Nenhum evento encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Não há eventos programados no momento.
                    </p>
                    {(profile?.role === 'teacher' || profile?.role === 'admin') && (
                      <Button className="mt-4" asChild>
                        <Link href="/calendario/edit">
                          <Edit className="h-4 w-4 mr-2" />
                          Criar Primeiro Evento
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{event.participants} participantes</span>
                        </div>
                        {event.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.duration_minutes} min</span>
                          </div>
                        )}
                        {event.instructor && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.instructor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Mês */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Resumo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-gray-600 dark:text-gray-400">Eventos Programados</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Simulados</span>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aulas</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Workshops</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Provas</span>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Palestras</span>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PagePermissionGuard>
  )
}
