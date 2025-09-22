'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context-custom'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, AlertCircle } from 'lucide-react'

interface PagePermissionGuardProps {
  children: React.ReactNode
  pageName: string
  fallback?: React.ReactNode
}

export function PagePermissionGuard({ children, pageName, fallback }: PagePermissionGuardProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkPageAccess()
  }, [user, profile, pageName])

  const checkPageAccess = async () => {
    console.log('🔍 Verificando acesso à página:', pageName)
    console.log('👤 Usuário:', user?.email)
    console.log('👤 Perfil:', profile?.role)
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      setHasAccess(false)
      setIsLoading(false)
      return
    }

    // Usar user.role se profile não estiver disponível
    const userRole = (profile?.role || user.role) as 'administrator' | 'teacher' | 'student'
    console.log('👤 Role final:', userRole)

    // Professores e admins têm acesso total
    if (userRole === 'teacher' || userRole === 'administrator') {
      console.log('✅ Professor/Admin tem acesso total à página:', pageName)
      setHasAccess(true)
      setIsLoading(false)
      return
    }

    // Páginas permitidas para alunos
    const studentAllowedPages = ['dashboard', 'quiz', 'flashcards', 'redacao', 'evercast', 'ranking', 'calendario', 'suporte', 'configuracoes', 'conquistas']
    
    // Páginas de admin (apenas para professores e administradores)
    const adminPages = ['database-optimization', 'flashcards-setup', 'admin']
    if (adminPages.includes(pageName) && (userRole === 'teacher' || userRole === 'administrator')) {
      console.log('✅ Professor/Admin tem acesso à página de admin:', pageName)
      setHasAccess(true)
      setIsLoading(false)
      return
    }
    if (userRole === 'student' && studentAllowedPages.includes(pageName)) {
      console.log('✅ Aluno tem acesso à página:', pageName)
      setHasAccess(true)
      setIsLoading(false)
      return
    }

    // Se chegou até aqui, não tem acesso
    console.log('❌ Acesso negado à página:', pageName, 'para role:', userRole)
    setHasAccess(false)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Entre em contato com seu professor para solicitar acesso.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
