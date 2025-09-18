'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, GraduationCap, Library } from 'lucide-react'
import { Subject } from '@/hooks/use-flashcards'

interface SubjectSelectorProps {
  subjects: Subject[]
  selectedSubject: string | null
  onSelectSubject: (subjectId: string) => void
  isLoading: boolean
}

const subjectIcons = {
  portugues: BookOpen,
  matematica: GraduationCap,
  historia: Library,
  default: BookOpen
}

const subjectColors = {
  portugues: 'bg-blue-500',
  matematica: 'bg-green-500',
  historia: 'bg-purple-500',
  default: 'bg-gray-500'
}

export const SubjectSelector = memo(function SubjectSelector({
  subjects,
  selectedSubject,
  onSelectSubject,
  isLoading
}: SubjectSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Escolha uma Matéria
        </h2>
        <p className="text-gray-600">
          Selecione a matéria que você deseja estudar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const Icon = subjectIcons[subject.id as keyof typeof subjectIcons] || subjectIcons.default
          const colorClass = subjectColors[subject.id as keyof typeof subjectColors] || subjectColors.default
          const isSelected = selectedSubject === subject.id

          return (
            <Card
              key={subject.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectSubject(subject.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full ${colorClass} flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {subject.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {subject.description}
                  </p>
                )}
                <Badge 
                  variant={isSelected ? "default" : "secondary"}
                  className={isSelected ? "bg-blue-500" : ""}
                >
                  {isSelected ? "Selecionado" : "Selecionar"}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
})
