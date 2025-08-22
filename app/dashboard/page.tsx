"use client"

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-simple'
import AuthGuard from '@/components/auth/AuthGuard'
import { DashboardShell } from '@/components/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Award,
  Clock,
  Target,
  BarChart3,
  Lightbulb
} from 'lucide-react'
import { usePageCache } from '@/lib/page-cache'
import { usePathname } from 'next/navigation'

export default function DashboardPage() {
  const pathname = usePathname()
  const { user, role, isAuthenticated, isLoading } = useAuth()
  
  // Usar cache para dados do dashboard
  const { data: dashboardData, loading: dataLoading, error: dataError } = usePageCache(
    'dashboard-data',
    async () => {
      // Simular dados do dashboard (substituir por API real)
      return {
        totalStudents: 150,
        totalClasses: 8,
        totalAssignments: 45,
        upcomingEvents: 3,
        recentProgress: [
          { subject: 'Matemática', progress: 85 },
          { subject: 'Português', progress: 78 },
          { subject: 'História', progress: 92 }
        ]
      }
    },
    pathname,
    3 * 60 * 1000 // 3 minutos
  )
  
  // Log para debug
  useEffect(() => {
    if (dataError) {
      console.error('❌ [DASHBOARD] Erro ao carregar dados:', dataError)
    }
    if (dashboardData) {
      console.log('✅ [DASHBOARD] Dados carregados:', dashboardData)
    }
  }, [dashboardData, dataError])

  // Memoizar flags para evitar re-renderizações
  const flags = useMemo(() => ({
    isTeacher: role === 'teacher',
    isAdmin: role === 'admin',
    isStudent: role === 'student',
    effectiveRole: role,
    forcedRole: null
  }), [role])

  // Log otimizado - apenas quando necessário
  useEffect(() => {
    if (user && role) {
      console.log('🔍 [DASHBOARD DEBUG] User:', user?.email || 'N/A')
      console.log('🔍 [DASHBOARD DEBUG] User role:', role)
      console.log('🔍 [DASHBOARD DEBUG] User metadata:', (user as any).user_metadata || 'N/A')
    }
  }, [user, role])

  useEffect(() => {
    if (flags.isTeacher) {
      console.log('👨‍🏫 [DASHBOARD] Renderizando dashboard do professor')
    } else if (flags.isStudent) {
      console.log('👨‍🎓 [DASHBOARD] Renderizando dashboard do estudante')
    }
  }, [flags.isTeacher, flags.isStudent])

  // Renderizar conteúdo baseado no role
  const renderDashboardContent = () => {
    // Verificação de segurança para dashboardData
    if (!dashboardData) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dados do dashboard...</p>
        </div>
      )
    }
    
    if (flags.isTeacher || flags.isAdmin) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalClasses || 0}</div>
              <p className="text-xs text-muted-foreground">
                +2 novas turmas este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalAssignments || 0}</div>
              <p className="text-xs text-muted-foreground">
                15 pendentes de correção
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.upcomingEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Próximos 7 dias
              </p>
            </CardContent>
          </Card>
        </div>
      )
    } else {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                +5% esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo de Estudo</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12h</div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Badges desbloqueados
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  if (isLoading || dataLoading || !dashboardData) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {flags?.isTeacher ? 'Professor' : flags?.isAdmin ? 'Administrador' : 'Estudante'}
              </Badge>
            </div>
          </div>
          
          {renderDashboardContent()}
          
          {/* Seção de progresso recente para professores */}
          {(flags.isTeacher || flags.isAdmin) && dashboardData?.recentProgress && Array.isArray(dashboardData.recentProgress) && (
            <Card>
              <CardHeader>
                <CardTitle>Progresso Recente dos Alunos</CardTitle>
                <CardDescription>
                  Visão geral do desempenho nas principais matérias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(dashboardData.recentProgress) && dashboardData.recentProgress.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  )
} 
