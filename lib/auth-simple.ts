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
  const roleFetchInProgress = useRef<Map<string, Promise<string>>>(new Map())

  // Função para obter role do usuário com cache e debounce
  const getUserRole = useCallback(async (userUuid: string): Promise<string> => {
    try {
      // Verificar se já existe uma busca em andamento para este UUID
      if (roleFetchInProgress.current.has(userUuid)) {
        console.log('⏳ [AUTH] Busca de role já em andamento para UUID:', userUuid)
        return await roleFetchInProgress.current.get(userUuid)!
      }

      // Verificar cache primeiro
      const cachedUser = userCache.current.get(userUuid)
      if (cachedUser) {
        console.log('✅ [AUTH] Usando cache para usuário UUID:', userUuid)
        return cachedUser.role
      }

      console.log('🔍 [AUTH] Buscando role para usuário UUID:', userUuid)
      
      // Criar uma nova busca e armazenar a promise
      const rolePromise = getUserRoleClient(userUuid)
      roleFetchInProgress.current.set(userUuid, rolePromise)
      
      const userRole = await rolePromise
      
      // Remover da lista de buscas em andamento
      roleFetchInProgress.current.delete(userUuid)
      
      console.log('✅ [AUTH] Role encontrada:', userRole)
      return userRole
    } catch (error) {
      // Remover da lista de buscas em andamento em caso de erro
      roleFetchInProgress.current.delete(userUuid)
      
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
      const userId = sessionUser.id
      
      // Verificar cache primeiro (usando UUID como chave)
      const cachedUser = userCache.current.get(userId)
      if (cachedUser) {
        console.log('✅ [AUTH] Usando cache para usuário UUID:', userId)
        return cachedUser
      }
      
      console.log('🔍 [AUTH] Buscando role para usuário UUID:', userId)
      const userRole = await getUserRole(userId)
      
      const userObject = {
        id: userId,
        email: userEmail,
        role: userRole as 'student' | 'teacher' | 'admin'
      }
      
      // Salvar no cache (usando UUID como chave)
      userCache.current.set(userId, userObject)
      console.log('💾 [AUTH] Usuário salvo no cache com UUID:', userId)
      
      return userObject
    } catch (error) {
      console.error('❌ [AUTH] Erro ao criar objeto de usuário:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        type: typeof error,
        error: error
      })
      // Retornar usuário com role padrão em caso de erro
      const fallbackUser: AuthUser = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        role: 'student'
      }
      
      // Salvar fallback no cache (usando UUID como chave)
      userCache.current.set(sessionUser.id, fallbackUser)
      
      return fallbackUser
    }
  }, [getUserRole])

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (isInitialized.current) return
    isInitialized.current = true

    console.log('🔧 [AUTH] Iniciando verificação de sessão...')
    
    // Usar debounce para evitar múltiplas execuções
    let debounceTimer: NodeJS.Timeout | undefined
    
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

    // Debounce para evitar múltiplas execuções
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      checkSession()
    }, 100)

    // Escutar mudanças com debounce
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 [AUTH] Evento:', event, session?.user?.email)
        
        // Debounce para eventos de mudança de estado
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(async () => {
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
            roleFetchInProgress.current.clear()
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
        }, 150) // Debounce de 150ms para eventos de mudança
      }
    )

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      subscription.unsubscribe()
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