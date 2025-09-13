'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  FileText, 
  Trophy,
  CheckCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: string
  participants: number
  duration_minutes?: number
  instructor?: string
  is_mandatory?: boolean
}

interface CronogramaViewerProps {
  events: Event[]
}

export function CronogramaViewer({ events }: CronogramaViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || event.type === selectedType
    return matchesSearch && matchesType
  })

  // Agrupar eventos por tipo
  const eventsByType = {
    mentoria: filteredEvents.filter(e => e.type === 'mentoria'),
    simulado: filteredEvents.filter(e => e.type === 'simulado'),
    resolucao: filteredEvents.filter(e => e.type === 'resolucao'),
    entrega: filteredEvents.filter(e => e.type === 'entrega'),
    recebimento: filteredEvents.filter(e => e.type === 'recebimento')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mentoria': return <BookOpen className="w-4 h-4" />
      case 'simulado': return <Trophy className="w-4 h-4" />
      case 'resolucao': return <FileText className="w-4 h-4" />
      case 'entrega': return <CheckCircle className="w-4 h-4" />
      case 'recebimento': return <AlertCircle className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mentoria': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'simulado': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'resolucao': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'entrega': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'recebimento': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // Remove segundos
  }

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(event.type)}
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              {event.is_mandatory && (
                <Badge variant="destructive" className="text-xs">
                  Obrigatório
                </Badge>
              )}
            </div>
            
            {event.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {event.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(event.time)}</span>
              </div>
              
              {event.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{event.duration_minutes} min</span>
                </div>
              )}
              
              {event.instructor && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="truncate">{event.instructor}</span>
                </div>
              )}
            </div>
          </div>
          
          <Badge className={getTypeColor(event.type)}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cronograma EAOF 2026
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredEvents.length} eventos encontrados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                Todos
              </Button>
              <Button
                variant={selectedType === 'mentoria' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('mentoria')}
              >
                Mentorias
              </Button>
              <Button
                variant={selectedType === 'simulado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('simulado')}
              >
                Simulados
              </Button>
              <Button
                variant={selectedType === 'resolucao' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('resolucao')}
              >
                Resoluções
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por tipo */}
      <Tabs defaultValue="mentoria" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mentoria" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Mentorias ({eventsByType.mentoria.length})
          </TabsTrigger>
          <TabsTrigger value="simulado" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Simulados ({eventsByType.simulado.length})
          </TabsTrigger>
          <TabsTrigger value="resolucao" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resoluções ({eventsByType.resolucao.length})
          </TabsTrigger>
          <TabsTrigger value="entrega" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Entregas ({eventsByType.entrega.length})
          </TabsTrigger>
          <TabsTrigger value="recebimento" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Recebimentos ({eventsByType.recebimento.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentoria" className="space-y-4">
          {eventsByType.mentoria.length > 0 ? (
            <div className="grid gap-4">
              {eventsByType.mentoria.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma mentoria encontrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="simulado" className="space-y-4">
          {eventsByType.simulado.length > 0 ? (
            <div className="grid gap-4">
              {eventsByType.simulado.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum simulado encontrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolucao" className="space-y-4">
          {eventsByType.resolucao.length > 0 ? (
            <div className="grid gap-4">
              {eventsByType.resolucao.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma resolução encontrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="entrega" className="space-y-4">
          {eventsByType.entrega.length > 0 ? (
            <div className="grid gap-4">
              {eventsByType.entrega.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma entrega encontrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recebimento" className="space-y-4">
          {eventsByType.recebimento.length > 0 ? (
            <div className="grid gap-4">
              {eventsByType.recebimento.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum recebimento encontrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
