"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserRoleClient } from '@/lib/get-user-role'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'teacher' | 'admin'
  allowedRoles?: ('student' | 'teacher' | 'admin')[]
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  allowedRoles 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🛡️ [AUTH_GUARD] Verificando autorização para:', pathname)
        
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Se não há sessão e está tentando acessar rota protegida
        if (!session?.user) {
          console.log('❌ [AUTH_GUARD] Nenhuma sessão encontrada')
          
          // Rotas públicas que não precisam de autenticação
          const publicRoutes = ['/', '/login', '/login-simple', '/forgot-password']
          
          if (!publicRoutes.includes(pathname)) {
            console.log('🔄 [AUTH_GUARD] Redirecionando para login')
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
            return
          }
          
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        console.log('✅ [AUTH_GUARD] Sessão encontrada:', session.user.email)

        // Se tem sessão, verificar role
        const role = await getUserRoleClient(session.user.email)
        setUserRole(role)
        
        console.log('🔍 [AUTH_GUARD] Role do usuário:', role)

        // Verificar se usuário logado está tentando acessar login
        if (pathname === '/login' || pathname === '/login-simple') {
          console.log('🔄 [AUTH_GUARD] Usuário logado tentando acessar login')
          
          const redirectTo = '/dashboard'
          router.replace(redirectTo)
          return
        }

        // Verificar autorização baseada no role
        let authorized = true

        if (requiredRole) {
          authorized = role === requiredRole
          console.log('🔍 [AUTH_GUARD] Verificação role específico:', { requiredRole, userRole: role, authorized })
        }

        if (allowedRoles && allowedRoles.length > 0) {
          authorized = allowedRoles.includes(role as any)
          console.log('🔍 [AUTH_GUARD] Verificação roles permitidos:', { allowedRoles, userRole: role, authorized })
        }

        if (!authorized) {
          console.log('❌ [AUTH_GUARD] Usuário não autorizado')
          
          // Redirecionar para dashboard principal
          const redirectTo = '/dashboard'
          router.replace(redirectTo)
          return
        }

        console.log('✅ [AUTH_GUARD] Usuário autorizado')
        setIsAuthorized(true)

      } catch (error) {
        console.error('❌ [AUTH_GUARD] Erro na verificação:', error)
        
        // Em caso de erro, redirecionar para login
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, requiredRole, allowedRoles, router])

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Se não autorizado, não renderizar nada (já redirecionou)
  if (!isAuthorized) {
    return null
  }

  // Renderizar conteúdo se tudo ok
  return <>{children}</>
}

// Hook para usar informações de autenticação
export function useAuthGuard() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null as any,
    role: null as string | null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            role: null
          })
          return
        }

        const role = await getUserRoleClient(session.user.email)

        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: session.user,
          role
        })

      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          role: null
        })
      }
    }

    checkAuth()

    // Listener para mudanças de autenticação
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 [USE_AUTH_GUARD] Auth change:', event)
      checkAuth()
    })

    return () => subscription.unsubscribe()
  }, [])

  return authState
} 