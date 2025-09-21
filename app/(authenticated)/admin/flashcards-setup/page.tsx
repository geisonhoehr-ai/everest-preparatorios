"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, Tag, BarChart3, Users, BookOpen } from "lucide-react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { createBasicFlashcardCategories, createBasicFlashcardTags, createSampleFlashcardProgress, addSampleScores, createBasicAchievements } from "../../../server-actions"
import { useAuth } from "@/context/auth-context-custom"

interface SetupStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  action: () => Promise<{ success: boolean; count?: number }>
  status: 'pending' | 'loading' | 'completed' | 'error'
  result?: string
}

export default function FlashcardsSetupPage() {
  const { user } = useAuth()
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'categories',
      name: 'Criar Categorias',
      description: 'Cria categorias básicas para organizar os flashcards',
      icon: <Tag className="h-5 w-5" />,
      action: createBasicFlashcardCategories,
      status: 'pending'
    },
    {
      id: 'tags',
      name: 'Criar Tags',
      description: 'Cria tags básicas para classificar os flashcards',
      icon: <Tag className="h-5 w-5" />,
      action: createBasicFlashcardTags,
      status: 'pending'
    },
    {
      id: 'progress',
      name: 'Dados de Progresso',
      description: 'Cria dados de exemplo para o sistema de repetição espaçada',
      icon: <BarChart3 className="h-5 w-5" />,
      action: createSampleFlashcardProgress,
      status: 'pending'
    },
    {
      id: 'scores',
      name: 'Pontuações de Exemplo',
      description: 'Cria pontuações de exemplo para o sistema de gamificação',
      icon: <Users className="h-5 w-5" />,
      action: addSampleScores,
      status: 'pending'
    },
    {
      id: 'achievements',
      name: 'Conquistas Básicas',
      description: 'Cria conquistas e badges para o sistema de gamificação',
      icon: <BookOpen className="h-5 w-5" />,
      action: createBasicAchievements,
      status: 'pending'
    }
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)

  const updateStepStatus = (stepId: string, status: SetupStep['status'], result?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result }
        : step
    ))
  }

  const runStep = async (step: SetupStep) => {
    updateStepStatus(step.id, 'loading')
    
    try {
      const result = await step.action()
      updateStepStatus(step.id, result.success ? 'completed' : 'error', result.count ? `${result.count} registros criados` : undefined)
    } catch (error) {
      console.error(`Erro ao executar ${step.name}:`, error)
      updateStepStatus(step.id, 'error', 'Erro na execução')
    }
  }

  const runAllSteps = async () => {
    setIsRunningAll(true)
    
    for (const step of steps) {
      if (step.status === 'pending') {
        await runStep(step)
        // Pequena pausa entre as execuções
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    setIsRunningAll(false)
  }

  const resetSteps = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined })))
  }

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800">Executando...</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length

  return (
    <PagePermissionGuard allowedRoles={['administrator', 'teacher']}>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Database className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Configuração do Sistema de Flashcards
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Configure o sistema de flashcards com dados básicos, categorias, tags e dados de exemplo 
              para testar o sistema de repetição espaçada e gamificação.
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Progresso Geral
              </CardTitle>
              <CardDescription>
                {completedSteps} de {totalSteps} etapas concluídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={runAllSteps}
                  disabled={isRunningAll || completedSteps === totalSteps}
                  className="flex items-center gap-2"
                >
                  {isRunningAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {isRunningAll ? 'Executando...' : 'Executar Tudo'}
                </Button>
                
                {completedSteps > 0 && (
                  <Button
                    onClick={resetSteps}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Resetar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {step.icon}
                      <div>
                        <CardTitle className="text-lg">{step.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      {getStatusBadge(step.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {step.result && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Resultado:</strong> {step.result}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => runStep(step)}
                    disabled={step.status === 'loading' || step.status === 'completed'}
                    variant={step.status === 'completed' ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {step.status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executando...
                      </>
                    ) : step.status === 'completed' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Executar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Categorias</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Definições</li>
                    <li>• Fórmulas</li>
                    <li>• Exemplos</li>
                    <li>• Conceitos</li>
                    <li>• Vocabulário</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Importante</li>
                    <li>• Revisar</li>
                    <li>• Fácil/Difícil</li>
                    <li>• ENEM/Concurso</li>
                    <li>• Fundamental/Avançado</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Sistema de Repetição Espaçada
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  O sistema criará dados de exemplo para testar o algoritmo SM-2, incluindo 
                  progresso de usuários, intervalos de revisão e fatores de facilidade.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Sistema de Conquistas
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Criará 8 conquistas básicas incluindo Primeiro Passo, Estudioso, Maratonista, 
                  Perfeccionista, Consistente, Revisor Expert, Conquistador e Mestre dos Flashcards.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PagePermissionGuard>
  )
}
