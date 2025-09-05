"use client"

import { useRequireAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, BookOpen, Trophy } from "lucide-react"
import ProgressWidget from "@/components/progress-widget"

export default function DashboardPage() {
  const { user, profile } = useRequireAuth()

  const getWelcomeMessage = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Bem-vindo, Administrador!'
      case 'teacher':
        return 'Bem-vindo, Professor!'
      case 'student':
        return 'Bem-vindo, Estudante!'
      default:
        return 'Bem-vindo ao Everest Preparatórios!'
    }
  }

  const getRoleDescription = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Gerencie toda a plataforma e usuários'
      case 'teacher':
        return 'Gerencie suas turmas e conteúdos'
      case 'student':
        return 'Estude e pratique para seus objetivos'
      default:
        return 'Acesse todas as funcionalidades da plataforma'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
        <p className="text-muted-foreground">{getRoleDescription()}</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conteúdos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              +12.5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provas Realizadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,890</div>
            <p className="text-xs text-muted-foreground">
              +8.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Top 10%</div>
            <p className="text-xs text-muted-foreground">
              Sua posição atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widget de Progresso para Estudantes */}
      {profile?.role === 'student' && (
        <ProgressWidget />
      )}

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Detalhes da sua conta no Everest Preparatórios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-sm">{profile?.display_name || 'Não definido'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Conta</label>
              <p className="text-sm capitalize">{profile?.role || 'Não definido'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
              <p className="text-sm">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                  : 'Não disponível'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
