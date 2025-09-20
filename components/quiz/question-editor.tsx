"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
  quiz_id: string
}

interface QuestionEditorProps {
  question: Question | null
  onSave: (question: Omit<Question, 'id'>) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function QuestionEditor({ question, onSave, onCancel, isEditing = false }: QuestionEditorProps) {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    options: question?.options || ['', '', '', ''],
    correct_answer: question?.correct_answer || 0,
    explanation: question?.explanation || '',
    quiz_id: question?.quiz_id || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        quiz_id: question.quiz_id
      })
    }
  }, [question])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erro ao salvar questão:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      const newCorrectAnswer = formData.correct_answer >= index ? 
        Math.max(0, formData.correct_answer - 1) : formData.correct_answer
      setFormData(prev => ({ 
        ...prev, 
        options: newOptions, 
        correct_answer: newCorrectAnswer 
      }))
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          {isEditing ? 'Editar Questão' : 'Criar Nova Questão'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pergunta</label>
            <Textarea
              value={formData.question_text}
              onChange={(e) => handleInputChange('question_text', e.target.value)}
              placeholder="Digite a pergunta"
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Opções de Resposta</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            <RadioGroup
              value={formData.correct_answer.toString()}
              onValueChange={(value) => handleInputChange('correct_answer', parseInt(value))}
            >
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                    />
                    {formData.correct_answer === index && (
                      <Badge variant="default" className="text-xs">
                        Resposta Correta
                      </Badge>
                    )}
                  </div>
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Explicação (Opcional)</label>
            <Textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Explique por que esta é a resposta correta"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.question_text || formData.options.some(opt => !opt.trim())}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
