"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
  allowedRoles?: ('student' | 'teacher' | 'admin')[]
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
  const { 
    user, 
    role, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    isAdmin,
    isTeacher,
    isStudent
  } = useAuth()

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        console.log('🛡️ [AUTH_GUARD] Verificando autorização para:', pathname)
        console.log('👤 [AUTH_GUARD] Estado atual:', { 
          isAuthenticated, 
          role, 
          isInitialized, 
          isLoading 
        })

        // Aguardar inicialização
        if (!isInitialized || isLoading) {
          console.log('⏳ [AUTH_GUARD] Aguardando inicialização...')
          return
        }

        // Se não está autenticado e está tentando acessar rota protegida
        if (!isAuthenticated) {
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

        console.log('✅ [AUTH_GUARD] Usuário autenticado:', user?.email, 'Role:', role)

        // Se tem sessão, verificar role
        if (!role) {
          console.log('⚠️ [AUTH_GUARD] Usuário sem role definido, redirecionando para dashboard')
          router.replace('/dashboard')
          return
        }

        // Se está logado e tenta acessar páginas de login, redirecionar para dashboard
        if (pathname === '/login') {
          console.log('🔄 [AUTH_GUARD] Usuário logado tentando acessar login')
          
          // Redirecionar para dashboard baseado no role
          const redirectTo = getDefaultRedirectPath(role)
          router.replace(redirectTo)
          return
        }

        // Verificar autorização baseada no role
        let authorized = true

        if (requiredRole) {
          authorized = role === requiredRole
          console.log('🔍 [AUTH_GUARD] Verificação role específico:', { 
            requiredRole, 
            userRole: role, 
            authorized 
          })
        }

        if (allowedRoles && allowedRoles.length > 0) {
          authorized = allowedRoles.includes(role as any)
          console.log('🔍 [AUTH_GUARD] Verificação roles permitidos:', { 
            allowedRoles, 
            userRole: role, 
            authorized 
          })
        }

        if (!authorized) {
          console.log('❌ [AUTH_GUARD] Usuário não autorizado')
          
          // Redirecionar para página apropriada baseada no role
          const redirectTo = getDefaultRedirectPath(role)
          router.replace(redirectTo)
          return
        }

        console.log('✅ [AUTH_GUARD] Usuário autorizado')
        setIsChecking(false)

      } catch (error) {
        console.error('❌ [AUTH_GUARD] Erro na verificação:', error)
        
        // Em caso de erro, redirecionar para login
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
    }

    checkAuthorization()
  }, [pathname, requiredRole, allowedRoles, router, isAuthenticated, role, isInitialized, isLoading, user?.email])

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
  if (isLoading || isChecking || !isInitialized) {
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
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    role: auth.role,
    isAdmin: auth.isAdmin,
    isTeacher: auth.isTeacher,
    isStudent: auth.isStudent
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