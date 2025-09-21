"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, Database, BarChart3, Trash2, Settings, AlertTriangle } from "lucide-react"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { optimizeDatabaseIndexes, analyzeDatabaseStats, cleanupOldData } from "../../../server-actions"

interface OptimizationStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  action: () => Promise<any>
  status: 'pending' | 'loading' | 'completed' | 'error'
  result?: any
  warning?: string
}

export default function DatabaseOptimizationPage() {
  const [steps, setSteps] = useState<OptimizationStep[]>([
    {
      id: 'analyze',
      name: 'Análise de Estatísticas',
      description: 'Analisa o estado atual do banco de dados e gera relatórios',
      icon: <BarChart3 className="h-5 w-5" />,
      action: analyzeDatabaseStats,
      status: 'pending'
    },
    {
      id: 'optimize',
      name: 'Otimizar Índices',
      description: 'Cria índices para melhorar a performance das consultas',
      icon: <Database className="h-5 w-5" />,
      action: optimizeDatabaseIndexes,
      status: 'pending',
      warning: 'Esta operação pode demorar alguns minutos'
    },
    {
      id: 'cleanup',
      name: 'Limpeza de Dados',
      description: 'Remove dados antigos e desnecessários do banco',
      icon: <Trash2 className="h-5 w-5" />,
      action: cleanupOldData,
      status: 'pending',
      warning: 'Esta operação remove dados permanentemente'
    }
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const updateStepStatus = (stepId: string, status: OptimizationStep['status'], result?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result }
        : step
    ))
  }

  const runStep = async (step: OptimizationStep) => {
    updateStepStatus(step.id, 'loading')
    
    try {
      const result = await step.action()
      
      // Se for análise, salvar as estatísticas
      if (step.id === 'analyze' && result.success) {
        setStats(result.stats)
      }
      
      updateStepStatus(step.id, result.success ? 'completed' : 'error', result)
    } catch (error) {
      console.error(`Erro ao executar ${step.name}:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      updateStepStatus(step.id, 'error', { error: errorMessage })
    }
  }

  const runAllSteps = async () => {
    setIsRunningAll(true)
    
    for (const step of steps) {
      if (step.status === 'pending') {
        await runStep(step)
        // Pausa entre as execuções
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    setIsRunningAll(false)
  }

  const resetSteps = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined })))
    setStats(null)
  }

  const getStatusIcon = (status: OptimizationStep['status']) => {
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

  const getStatusBadge = (status: OptimizationStep['status']) => {
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
    <PagePermissionGuard pageName="database-optimization">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Otimização do Banco de Dados
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Otimize a performance do banco de dados, analise estatísticas e mantenha o sistema 
              funcionando de forma eficiente.
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Progresso da Otimização
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
                    <Settings className="h-4 w-4" />
                  )}
                  {isRunningAll ? 'Otimizando...' : 'Executar Otimização Completa'}
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
          <div className="grid gap-6 lg:grid-cols-3">
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
                  {step.warning && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          {step.warning}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {step.result && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Resultado:</strong> {
                          step.id === 'analyze' ? 'Análise concluída' :
                          step.id === 'optimize' ? `${step.result.results?.length || 0} índices processados` :
                          step.id === 'cleanup' ? `${step.result.results?.length || 0} operações de limpeza` :
                          'Operação concluída'
                        }
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
                        {step.icon}
                        <span className="ml-2">Executar</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics Display */}
          {stats && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estatísticas do Banco de Dados
                </CardTitle>
                <CardDescription>
                  Análise detalhada do estado atual do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {/* Flashcards Stats */}
                  {stats.flashcards && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Flashcards</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                          <span className="font-medium">{stats.flashcards.total}</span>
                        </div>
                        {Object.entries(stats.flashcards.byDifficulty).map(([difficulty, count]) => (
                          <div key={difficulty} className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Dificuldade {difficulty}:
                            </span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Stats */}
                  {stats.progress && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Progresso</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Registros:</span>
                          <span className="font-medium">{stats.progress.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Facilidade média:</span>
                          <span className="font-medium">{stats.progress.avgEaseFactor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Repetições médias:</span>
                          <span className="font-medium">{stats.progress.avgRepetitions}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scores Stats */}
                  {stats.scores && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Pontuações</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                          <span className="font-medium">{stats.scores.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pontuação total:</span>
                          <span className="font-medium">{stats.scores.totalScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Média:</span>
                          <span className="font-medium">{stats.scores.avgScore}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Users Stats */}
                  {stats.users && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Usuários</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                          <span className="font-medium">{stats.users.total}</span>
                        </div>
                        {Object.entries(stats.users.byRole).map(([role, count]) => (
                          <div key={role} className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {role === 'student' ? 'Estudantes' : 
                               role === 'teacher' ? 'Professores' : 
                               role === 'administrator' ? 'Admins' : role}:
                            </span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informações sobre Otimização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Análise de Estatísticas</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Conta registros por tabela</li>
                    <li>• Analisa distribuição de dados</li>
                    <li>• Calcula métricas de performance</li>
                    <li>• Gera relatórios detalhados</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Otimização de Índices</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Cria índices para consultas frequentes</li>
                    <li>• Melhora performance de buscas</li>
                    <li>• Otimiza joins entre tabelas</li>
                    <li>• Reduz tempo de resposta</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Limpeza de Dados</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Remove dados antigos</li>
                    <li>• Limpa registros órfãos</li>
                    <li>• Libera espaço em disco</li>
                    <li>• Mantém performance</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Recomendações de Uso
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Execute a otimização regularmente (semanalmente ou mensalmente) para manter 
                  a performance do sistema. A análise de estatísticas pode ser executada 
                  frequentemente para monitoramento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PagePermissionGuard>
  )
}
