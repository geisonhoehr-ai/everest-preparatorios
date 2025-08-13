'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
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

// Hook SIMPLIFICADO e FUNCIONAL
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  const supabase = createClient()

  // Função para obter role do usuário
  const getUserRole = useCallback(async (userEmail: string): Promise<string> => {
    try {
      console.log('🔍 [AUTH] Buscando role para email:', userEmail)
      const userRole = await getUserRoleClient(userEmail)
      console.log('✅ [AUTH] Role encontrada:', userRole)
      return userRole
    } catch (error) {
      console.error('❌ [AUTH] Erro ao obter role:', error)
      return 'student' // fallback
    }
  }, [])

  // Função para criar objeto de usuário
  const createUserObject = useCallback(async (sessionUser: any): Promise<AuthUser> => {
    try {
      const userEmail = sessionUser.email || ''
      const userId = sessionUser.id
      
      console.log('🔍 [AUTH] Buscando role para usuário:', userEmail)
      const userRole = await getUserRole(userEmail)
      
      const userObject = {
        id: userId,
        email: userEmail,
        role: userRole as 'student' | 'teacher' | 'admin'
      }
      
      console.log('✅ [AUTH] Usuário criado:', userObject)
      return userObject
    } catch (error) {
      console.error('❌ [AUTH] Erro ao criar usuário:', error)
      // Retornar usuário com role padrão
      return {
        id: sessionUser.id,
        email: sessionUser.email || '',
        role: 'student'
      }
    }
  }, [getUserRole])

  // Função para fazer logout
  const signOut = useCallback(async () => {
    try {
      console.log('🔄 [AUTH] Fazendo logout...')
      await supabase.auth.signOut()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
      console.log('✅ [AUTH] Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ [AUTH] Erro no logout:', error)
    }
  }, [supabase.auth])

  // Verificar sessão inicial
  useEffect(() => {
    const checkSession = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }))
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('✅ [AUTH] Sessão encontrada:', session.user.email)
          const userObject = await createUserObject(session.user)
          
          setAuthState({
            user: userObject,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          console.log('❌ [AUTH] Nenhuma sessão encontrada')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro ao verificar sessão:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkSession()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 [AUTH] Mudança de estado:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [AUTH] Usuário logado:', session.user.email)
          const userObject = await createUserObject(session.user)
          
          setAuthState({
            user: userObject,
            isLoading: false,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 [AUTH] Usuário deslogado')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, createUserObject])

  return {
    ...authState,
    signOut
  }
} 