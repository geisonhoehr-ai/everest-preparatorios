'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserRoleClient, getAuthAndRole } from './get-user-role'

// Tipos simples
export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher' | 'admin'
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Função para criar objeto de usuário a partir dos dados do Supabase
const createUserObject = async (supabaseUser: any): Promise<AuthUser> => {
  try {
    // Buscar role do usuário usando UUID (não email)
    const userRole = await getUserRoleClient(supabaseUser.id)
    
    return {
      id: supabaseUser.id || supabaseUser.user?.id || '',
      email: supabaseUser.email || supabaseUser.user?.email || '',
      role: userRole as 'student' | 'teacher' | 'admin'
    }
  } catch (error) {
    console.error('❌ [AUTH] Erro ao criar objeto do usuário:', error)
    // Retornar usuário com role padrão em caso de erro
    return {
      id: supabaseUser.id || supabaseUser.user?.id || '',
      email: supabaseUser.email || supabaseUser.user?.email || '',
      role: 'student'
    }
  }
}

// Hook CORRIGIDO para perfil persistente
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })
  
  const [role, setRole] = useState<string>('student')
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Instância do Supabase
  const supabase = createClient()
  
  // Cache de roles otimizado
  const roleCache = new Map<string, { role: string; timestamp: number }>()
  const ROLE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
  
  // Controle de verificações duplicadas
  const lastUpdateTime = useRef(0)
  const updateThrottle = 200 // Aumentado para 200ms para reduzir verificações
  const isCheckingSession = useRef(false)
  const sessionCheckPromise = useRef<Promise<any> | null>(null)

  const getUserRole = useCallback(async (userId: string): Promise<string> => {
    // Verificar cache primeiro
    const cached = roleCache.get(userId)
    if (cached && Date.now() - cached.timestamp < ROLE_CACHE_DURATION) {
      console.log('✅ [AUTH] Usando cache para role:', cached.role)
      return cached.role
    }
    
    console.log('🔍 [AUTH] Buscando role para:', userId)
    const role = await getUserRoleClient(userId)
    roleCache.set(userId, { role, timestamp: Date.now() })
    return role
  }, [])

  const clearRoleCache = useCallback(() => {
    roleCache.clear()
    console.log('🧹 [AUTH] Cache de roles limpo')
  }, [])

  // Verificação de sessão otimizada com redirecionamento automático
  const checkSession = useCallback(async () => {
    if (isCheckingSession.current && sessionCheckPromise.current) {
      console.log('⏭️ [AUTH] Verificação de sessão já em andamento, aguardando...')
      return sessionCheckPromise.current
    }

    isCheckingSession.current = true
    sessionCheckPromise.current = getAuthAndRole()
    
    try {
      const result = await sessionCheckPromise.current
      
      // Se autenticado e com role definido, redirecionar automaticamente
      if (result.isAuthenticated && result.role) {
        console.log('✅ [AUTH] Usuário autenticado com role:', result.role)
        
        // Salvar role na sessão para uso posterior
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('userRole', result.role)
          sessionStorage.setItem('userId', result.user?.id || '')
        }
      }
      
      return result
    } finally {
      isCheckingSession.current = false
      sessionCheckPromise.current = null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      if (!mounted) return
      
      try {
        console.log('🔧 [AUTH] Iniciando verificação de sessão...')
        const { user, role: userRole, isAuthenticated } = await checkSession()
        
        if (!mounted) return
        
        if (isAuthenticated && user) {
          setRole(userRole)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
        if (mounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [checkSession])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        // Throttling mais agressivo para evitar eventos duplicados
        const now = Date.now()
        if (now - lastUpdateTime.current < updateThrottle) {
          console.log('⏭️ [AUTH] Evento ignorado (throttle):', event)
          return
        }
        lastUpdateTime.current = now

        console.log('🔄 [AUTH] Auth event:', event, session?.user?.email)

        if (event === 'SIGNED_IN' && session?.user) {
          clearRoleCache() // Limpar cache ao fazer login
          const user = await createUserObject(session.user)
          const userRole = await getUserRole(session.user.id)
          
          setRole(userRole)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          clearRoleCache() // Limpar cache ao fazer logout
          setRole('student')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Atualizar usuário sem limpar cache
          const user = await createUserObject(session.user)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [createUserObject, getUserRole, clearRoleCache])

  // Funções simples
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Login:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro login:', error)
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, role: 'student' | 'teacher' = 'student') => {
    try {
      console.log('📝 [AUTH] Signup:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        await supabase
          .from('user_roles')
          .insert({
            user_uuid: data.user.id,
            role
          })
      }

      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro signup:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 [AUTH] Logout')
      clearRoleCache() // Limpar cache ao fazer logout
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro logout:', error)
      return { success: false, error: error.message }
    }
  }

  const refresh = async () => {
    try {
      console.log('🔄 [AUTH] Refresh')
      clearRoleCache() // Limpar cache ao fazer refresh
      if (authState.user) {
        const user = await createUserObject(authState.user)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
      }
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro refresh:', error)
      return { success: false, error: error.message }
    }
  }

  // Função para verificar permissões de forma simples
  const canManageMembers = role === 'teacher' || role === 'admin'
  const canAccessAdmin = role === 'admin'
  const canManageClasses = role === 'teacher' || role === 'admin'

  return {
    ...authState,
    role,
    isInitialized,
    isTeacher: role === 'teacher',
    isAdmin: role === 'admin',
    isStudent: role === 'student',
    canManageMembers,
    canAccessAdmin,
    canManageClasses,
    signIn,
    signUp,
    signOut,
    refresh
  }
} 