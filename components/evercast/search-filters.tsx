'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Calendar,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { type AudioCourse, type AudioModule, type AudioLesson } from '@/actions-evercast-client'

interface SearchFiltersProps {
  courses: AudioCourse[]
  onFilteredCourses: (courses: AudioCourse[]) => void
  searchPlaceholder?: string
}

type SortField = 'name' | 'created_at' | 'total_duration'
type SortOrder = 'asc' | 'desc'
type FilterType = 'all' | 'recent' | 'long' | 'short'

export function SearchFilters({ 
  courses, 
  onFilteredCourses, 
  searchPlaceholder = "Buscar cursos, módulos ou aulas..." 
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Função para filtrar e ordenar cursos
  const applyFilters = () => {
    let filtered = [...courses]

    // Aplicar busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(course => {
        const courseMatch = course.name.toLowerCase().includes(term) ||
                           course.description?.toLowerCase().includes(term)
        
        const moduleMatch = course.audio_modules?.some(module => 
          module.name.toLowerCase().includes(term) ||
          module.description?.toLowerCase().includes(term)
        )
        
        const lessonMatch = course.audio_modules?.some(module =>
          module.audio_lessons?.some(lesson =>
            lesson.title.toLowerCase().includes(term) ||
            lesson.description?.toLowerCase().includes(term)
          )
        )

        return courseMatch || moduleMatch || lessonMatch
      })
    }

    // Aplicar filtros de duração
    switch (activeFilter) {
      case 'recent':
        filtered = filtered.filter(course => {
          const courseDate = new Date(course.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return courseDate > weekAgo
        })
        break
      case 'long':
        filtered = filtered.filter(course => {
          const totalLessons = course.audio_modules?.reduce((total, module) => 
            total + (module.audio_lessons?.length || 0), 0) || 0
          return totalLessons > 10
        })
        break
      case 'short':
        filtered = filtered.filter(course => {
          const totalLessons = course.audio_modules?.reduce((total, module) => 
            total + (module.audio_lessons?.length || 0), 0) || 0
          return totalLessons <= 5
        })
        break
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'total_duration':
          aValue = a.audio_modules?.reduce((total, module) => 
            total + (module.audio_lessons?.length || 0), 0) || 0
          bValue = b.audio_modules?.reduce((total, module) => 
            total + (module.audio_lessons?.length || 0), 0) || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    onFilteredCourses(filtered)
  }

  // Aplicar filtros quando os valores mudarem
  React.useEffect(() => {
    applyFilters()
  }, [searchTerm, sortField, sortOrder, activeFilter, courses])

  const clearFilters = () => {
    setSearchTerm('')
    setSortField('created_at')
    setSortOrder('desc')
    setActiveFilter('all')
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? 
      <SortAsc className="w-4 h-4" /> : 
      <SortDesc className="w-4 h-4" />
  }

  const hasActiveFilters = searchTerm || activeFilter !== 'all' || sortField !== 'created_at' || sortOrder !== 'desc'

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Barra de busca */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {[searchTerm, activeFilter !== 'all' ? 1 : 0, sortField !== 'created_at' || sortOrder !== 'desc' ? 1 : 0].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} size="sm">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* Filtros rápidos */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtros Rápidos</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Todos', icon: null },
                    { key: 'recent', label: 'Recentes', icon: <Calendar className="w-3 h-3" /> },
                    { key: 'long', label: 'Longos', icon: <Clock className="w-3 h-3" /> },
                    { key: 'short', label: 'Curto', icon: <Clock className="w-3 h-3" /> }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={activeFilter === filter.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.key as FilterType)}
                      className="flex items-center gap-1"
                    >
                      {filter.icon}
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'name', label: 'Nome' },
                    { key: 'created_at', label: 'Data' },
                    { key: 'total_duration', label: 'Duração' }
                  ].map((sort) => (
                    <Button
                      key={sort.key}
                      variant={sortField === sort.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSort(sort.key as SortField)}
                      className="flex items-center gap-1"
                    >
                      {sort.label}
                      {getSortIcon(sort.key as SortField)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resumo dos filtros ativos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: "{searchTerm}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              {activeFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeFilter === 'recent' ? 'Recentes' : 
                   activeFilter === 'long' ? 'Longos' : 'Curto'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setActiveFilter('all')}
                  />
                </Badge>
              )}
              {(sortField !== 'created_at' || sortOrder !== 'desc') && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Ordenar: {sortField === 'name' ? 'Nome' : 
                           sortField === 'created_at' ? 'Data' : 'Duração'} 
                  ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => {
                      setSortField('created_at')
                      setSortOrder('desc')
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
