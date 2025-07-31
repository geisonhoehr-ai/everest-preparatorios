'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
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
          
          // Buscar role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', session.user.id)
            .single()

          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: (roleData?.role as any) || 'student'
          }

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
      async (event, session) => {
        console.log('🔄 [AUTH] Evento:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', session.user.id)
            .single()

          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: (roleData?.role as any) || 'student'
          }

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

    return () => subscription.unsubscribe()
  }, [])

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