'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserRoleClient } from './get-user-role'

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

// Hook MUITO SIMPLES
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  const supabase = createClient()
  const isInitialized = useRef(false)

  // Função para obter role do usuário
  const getUserRole = useCallback(async (userEmail: string): Promise<string> => {
    try {
      console.log('🔍 [AUTH] Buscando role para:', userEmail)
      const role = await getUserRoleClient(userEmail)
      console.log('✅ [AUTH] Role encontrada:', role)
      return role
    } catch (error) {
      console.error('❌ [AUTH] Erro ao obter role:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        type: typeof error,
        error: error
      })
      return 'student' // fallback
    }
  }, [])

  // Função para criar objeto de usuário
  const createUserObject = useCallback(async (sessionUser: any): Promise<AuthUser> => {
    try {
      const userRole = await getUserRole(sessionUser.email || '')
      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        role: userRole as 'student' | 'teacher' | 'admin'
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao criar objeto de usuário:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        type: typeof error,
        error: error
      })
      // Retornar usuário com role padrão em caso de erro
      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        role: 'student'
      }
    }
  }, [getUserRole])

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (isInitialized.current) return
    isInitialized.current = true

    console.log('🔧 [AUTH] Iniciando verificação de sessão...')
    
    // Verificar sessão uma única vez
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AUTH] Erro:', error)
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
          return
        }
        
        if (session?.user) {
          console.log('✅ [AUTH] Sessão encontrada:', session.user.email)
          
          const user = await createUserObject(session.user)
          console.log('👤 [AUTH] Usuário carregado:', user)
          
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          console.log('❌ [AUTH] Nenhuma sessão')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkSession()

    // Escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 [AUTH] Evento:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await createUserObject(session.user)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      isInitialized.current = false
    }
  }, [createUserObject])

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
            user_uuid: data.user.email,
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro logout:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  }
} 