"use client"

import { PageAuthWrapper, useAuth } from '@/components/page-auth-wrapper'
import { DashboardShell } from '@/components/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Calendar, 
  BarChart3,
  Shield,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

function AdminDashboardContent() {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Loading state
  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Verificar se é realmente um admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Acesso Negado</h2>
            <p className="text-muted-foreground">Esta página é exclusiva para administradores</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard do Administrador</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-red-100 text-red-800">
              🛡️ Administrador
            </Badge>
          </div>
        </div>
        
        {/* Cards de Estatísticas Gerais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">
                +25% este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 novas turmas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">
                +2 novos professores
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-xs text-muted-foreground">
                Uptime do sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas por Perfil */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: 'Alunos', count: 1150, percentage: 92, color: 'bg-green-500' },
                  { role: 'Professores', count: 18, percentage: 1.4, color: 'bg-blue-500' },
                  { role: 'Administradores', count: 2, percentage: 0.2, color: 'bg-red-500' },
                  { role: 'Outros', count: 80, percentage: 6.4, color: 'bg-gray-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="font-medium">{item.role}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'warning', message: 'Backup automático em 2 horas', icon: '⚠️' },
                  { type: 'info', message: 'Atualização do sistema disponível', icon: 'ℹ️' },
                  { type: 'success', message: 'Todos os serviços funcionando', icon: '✅' },
                  { type: 'error', message: '1 usuário com login falhado', icon: '❌' }
                ].map((alert, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    alert.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                    alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <span className="text-lg">{alert.icon}</span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Administrativas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Administrativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Gerenciar Usuários</h4>
                    <p className="text-sm text-muted-foreground">Adicionar, editar e remover usuários</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium">Configurações</h4>
                    <p className="text-sm text-muted-foreground">Configurações do sistema</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Relatórios</h4>
                    <p className="text-sm text-muted-foreground">Relatórios e análises</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

export default function AdminDashboardPage() {
  return (
    <PageAuthWrapper>
      <AdminDashboardContent />
    </PageAuthWrapper>
  )
}
