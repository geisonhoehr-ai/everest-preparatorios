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
  const userCache = useRef<Map<string, AuthUser>>(new Map())

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
      const userEmail = sessionUser.email || ''
      
      // Verificar cache primeiro
      const cachedUser = userCache.current.get(userEmail)
      if (cachedUser) {
        console.log('✅ [AUTH] Usando cache para usuário:', userEmail)
        return cachedUser
      }
      
      console.log('🔍 [AUTH] Buscando role para usuário:', userEmail)
      const userRole = await getUserRole(userEmail)
      
      const userObject = {
        id: sessionUser.id,
        email: userEmail,
        role: userRole as 'student' | 'teacher' | 'admin'
      }
      
      // Salvar no cache
      userCache.current.set(userEmail, userObject)
      console.log('💾 [AUTH] Usuário salvo no cache:', userEmail)
      
      return userObject
    } catch (error) {
      console.error('❌ [AUTH] Erro ao criar objeto de usuário:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        type: typeof error,
        error: error
      })
      // Retornar usuário com role padrão em caso de erro
      const fallbackUser = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        role: 'student'
      }
      
      // Salvar fallback no cache
      userCache.current.set(sessionUser.email || '', fallbackUser)
      
      return fallbackUser
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
        // Primeiro, tentar obter a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AUTH] Erro ao obter sessão:', error)
          
          // Se o erro for relacionado ao refresh token, limpar a sessão
          if (error.message?.includes('Refresh Token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('🔄 [AUTH] Token expirado, limpando sessão...')
            try {
              await supabase.auth.signOut()
              console.log('✅ [AUTH] Sessão limpa com sucesso')
            } catch (signOutError) {
              console.error('❌ [AUTH] Erro ao limpar sessão:', signOutError)
            }
          }
          
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
        console.error('❌ [AUTH] Erro geral:', error)
        
        // Em caso de erro, tentar limpar a sessão
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('❌ [AUTH] Erro ao fazer logout:', signOutError)
        }
        
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
        } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Limpar cache ao fazer logout
          userCache.current.clear()
          console.log('🧹 [AUTH] Cache limpo após logout')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        } else if (event === 'USER_UPDATED' && session?.user) {
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
    signOut
  }
} 