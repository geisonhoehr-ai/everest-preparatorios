'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { configureLongSession, checkSessionStatus } from './supabase-config'

// Tipos para autenticação
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

// Hook simples para autenticação
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  const supabase = createClient()

  useEffect(() => {
    // Configurar sessão com timeout longo
    configureLongSession()
    
    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        console.log('🔍 [AUTH] Verificando sessão inicial...')
        
        // Verificar status da sessão
        const sessionStatus = await checkSessionStatus()
        console.log('📊 [AUTH] Status da sessão:', sessionStatus)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AUTH] Erro ao verificar sessão:', error)
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
          return
        }
        
        if (session?.user) {
          console.log('✅ [AUTH] Sessão encontrada:', session.user.email)
          // Buscar role do usuário
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', session.user.id)
            .single()

          if (roleError) {
            console.warn('⚠️ [AUTH] Erro ao buscar role:', roleError)
          }

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

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AUTH] Evento de auth:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [AUTH] Usuário logado:', session.user.email)
          // Buscar role do usuário
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

          console.log('👤 [AUTH] Usuário atualizado:', user)
          setAuthState({
            user,
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
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 [AUTH] Token atualizado')
          // Re-verificar sessão após refresh
          checkSession()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Tentando login:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ [AUTH] Erro no login:', error)
        throw error
      }

      console.log('✅ [AUTH] Login bem-sucedido')
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, role: 'student' | 'teacher' = 'student') => {
    try {
      console.log('📝 [AUTH] Tentando criar conta:', email, role)
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        console.error('❌ [AUTH] Erro no signup:', error)
        throw error
      }

      // Criar role do usuário
      if (data.user) {
        console.log('👤 [AUTH] Criando role para usuário:', data.user.id)
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_uuid: data.user.id,
            role
          })

        if (roleError) {
          console.error('❌ [AUTH] Erro ao criar role:', roleError)
        }
      }

      console.log('✅ [AUTH] Conta criada com sucesso')
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no signup:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 [AUTH] Tentando logout')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ [AUTH] Erro no logout:', error)
        throw error
      }

      console.log('✅ [AUTH] Logout bem-sucedido')
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no logout:', error)
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