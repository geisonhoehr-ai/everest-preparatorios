"use client"

import { ReactElement, useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/page-auth-wrapper'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  allowedRoles,
  fallback
}: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Usar o novo hook useAuth otimizado
  const auth = useAuth()

  // Memoizar flags para evitar recálculos
  const flags = useMemo(() => ({
    isTeacher: auth.user?.role === 'teacher',
    isAdmin: auth.user?.role === 'admin',
    isStudent: auth.user?.role === 'student',
    effectiveRole: auth.user?.role,
    forcedRole: null
  }), [auth.user?.role])

  // DEBUG: Mostrar informações do usuário
  console.log('🔍 [DASHBOARD DEBUG] User:', auth.user)
  console.log('🔍 [DASHBOARD DEBUG] User role:', auth.user?.role)
  console.log('🔍 [DASHBOARD DEBUG] User ID:', auth.user?.id)
  console.log('🔍 [DASHBOARD DEBUG] Flags:', flags)

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        console.log('🛡️ [AUTH_GUARD] Verificando autorização para:', pathname)
        console.log('👤 [AUTH_GUARD] Estado atual:', { 
          isAuthenticated: auth.isAuthenticated, 
          role: auth.user?.role, 
          isLoading: auth.isLoading 
        })

        // Aguardar inicialização
        if (auth.isLoading) {
          console.log('⏳ [AUTH_GUARD] Aguardando inicialização...')
          return
        }

        // Se não está autenticado e está tentando acessar rota protegida
        if (!auth.isAuthenticated) {
          console.log('❌ [AUTH_GUARD] Usuário não autenticado')
          
          // Rotas públicas que não precisam de autenticação
          const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/access-denied']
          
          if (!publicRoutes.includes(pathname)) {
            console.log('🔄 [AUTH_GUARD] Redirecionando para login')
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
            return
          }
          
          setIsChecking(false)
          return
        }

        console.log('✅ [AUTH_GUARD] Usuário autenticado:', auth.user?.email, 'Role:', auth.user?.role)

        // Se tem sessão, verificar role
        if (!auth.user?.role) {
          console.log('⚠️ [AUTH_GUARD] Usuário sem role definido, redirecionando para dashboard')
          router.replace('/dashboard')
          return
        }

        // Se está logado e tenta acessar páginas de login, redirecionar para dashboard
        const authPages = ['/login', '/signup', '/forgot-password']
        if (authPages.includes(pathname)) {
          console.log('🔄 [AUTH_GUARD] Usuário logado tentando acessar página de auth, redirecionando')
          router.replace(getDefaultRedirectPath(auth.user?.role || 'student'))
          return
        }

        // Verificar permissões específicas se necessário
        if (requiredRole && auth.user?.role !== requiredRole) {
          console.log('❌ [AUTH_GUARD] Permissão insuficiente. Necessário:', requiredRole, 'Atual:', auth.user?.role)
          router.replace('/access-denied')
          return
        }

        if (allowedRoles && !allowedRoles.includes(auth.user?.role || '')) {
          console.log('❌ [AUTH_GUARD] Role não permitido. Permitidos:', allowedRoles, 'Atual:', auth.user?.role)
          router.replace('/access-denied')
          return
        }

        // Se chegou até aqui, está autorizado
        console.log('✅ [AUTH_GUARD] Usuário autorizado para:', pathname)
        setIsChecking(false)

      } catch (error) {
        console.error('❌ [AUTH_GUARD] Erro na verificação:', error)
        setIsChecking(false)
      }
    }

    checkAuthorization()
  }, [auth.isAuthenticated, auth.user?.role, auth.isLoading, pathname, requiredRole, allowedRoles, router, auth.user?.email])

  // Função para determinar redirecionamento baseado no role
  const getDefaultRedirectPath = (userRole: string): string => {
    switch (userRole) {
      case 'admin':
        return '/admin'
      case 'teacher':
        return '/dashboard' // Professores vão para dashboard (não mais para /teacher)
      case 'student':
      default:
        return '/dashboard'
    }
  }

  // Mostrar loading enquanto verifica
  if (auth.isLoading || isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Renderizar conteúdo se tudo ok
  return <>{children}</>
}

// Hook para usar informações de autenticação (versão simplificada)
export function useAuthGuard() {
          const auth = useAuth()
  
  return {
    ...auth,
    canAccess: (requiredRole?: string) => {
      if (!auth.isAuthenticated || !auth.user?.role) return false
      if (!requiredRole) return true
      return auth.user?.role === requiredRole
    }
  }
}

// Componente de proteção específica para admin
export function AdminGuard({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// Componente de proteção específica para professor
export function TeacherGuard({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['teacher', 'admin']} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

// Componente de proteção específica para aluno
export function StudentGuard({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['student', 'teacher', 'admin']} fallback={fallback}>
      {children}
    </AuthGuard>
  )
} 