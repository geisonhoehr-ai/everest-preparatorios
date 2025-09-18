'use client'

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Target, Zap, Star } from 'lucide-react'
import { Topic } from '@/hooks/use-flashcards'

interface TopicSelectorProps {
  topics: Topic[]
  selectedTopic: string | null
  onSelectTopic: (topicId: string) => void
  onBack: () => void
  isLoading: boolean
}

const topicIcons = {
  regencia: BookOpen,
  concordancia: Target,
  'sintaxe-termos-acessorios': Zap,
  'semantica-estilistica': Star,
  'sintaxe-termos-essenciais': BookOpen,
  ortografia: Target,
  'acentuacao-grafica': Zap,
  default: BookOpen
}

const topicColors = {
  regencia: 'bg-blue-500',
  concordancia: 'bg-green-500',
  'sintaxe-termos-acessorios': 'bg-purple-500',
  'semantica-estilistica': 'bg-yellow-500',
  'sintaxe-termos-essenciais': 'bg-red-500',
  ortografia: 'bg-indigo-500',
  'acentuacao-grafica': 'bg-pink-500',
  default: 'bg-gray-500'
}

export const TopicSelector = memo(function TopicSelector({
  topics,
  selectedTopic,
  onSelectTopic,
  onBack,
  isLoading
}: TopicSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Escolha um Tópico
          </h2>
          <p className="text-gray-600">
            Selecione o tópico que você deseja estudar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const Icon = topicIcons[topic.id as keyof typeof topicIcons] || topicIcons.default
          const colorClass = topicColors[topic.id as keyof typeof topicColors] || topicColors.default
          const isSelected = selectedTopic === topic.id

          return (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectTopic(topic.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    {topic.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
