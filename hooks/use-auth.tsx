"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAuthAndRole, clearUserRoleCache } from '@/lib/get-user-role'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  role: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false
  })

  useEffect(() => {
    console.log('🔄 [USE_AUTH] Iniciando hook de autenticação...')
    
    const supabase = createClient()
    
    // Função para carregar dados do usuário
    const loadUserData = async (user: User | null) => {
      try {
        if (user) {
          console.log('✅ [USE_AUTH] Usuário encontrado:', user.email)
          
          // Limpar cache para garantir dados frescos
          clearUserRoleCache(user.id)
          
          // Buscar role do usuário
          const { role, isAuthenticated } = await getAuthAndRole()
          console.log('✅ [USE_AUTH] Role encontrado:', role)
          
          setAuthState({
            user,
            role,
            isAuthenticated,
            isLoading: false,
            isInitialized: true
          })
        } else {
          console.log('❌ [USE_AUTH] Nenhum usuário encontrado')
          setAuthState({
            user: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true
          })
        }
      } catch (error) {
        console.error('❌ [USE_AUTH] Erro ao carregar dados do usuário:', error)
        setAuthState({
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        })
      }
    }

    // Carregar sessão inicial
    const loadInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔄 [USE_AUTH] Sessão inicial:', session?.user?.email)
        
        if (session?.user) {
          await loadUserData(session.user)
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            isInitialized: true
          }))
        }
      } catch (error) {
        console.error('❌ [USE_AUTH] Erro ao carregar sessão inicial:', error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isInitialized: true
        }))
      }
    }

    loadInitialSession()

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [USE_AUTH] Auth state change:', event, session?.user?.email)
      
      if (session?.user) {
        await loadUserData(session.user)
      } else {
        console.log('🔄 [USE_AUTH] Usuário desconectado')
        
        // Limpar cache
        clearUserRoleCache()
        
        setAuthState({
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Função para forçar atualização dos dados
  const refreshAuth = async () => {
    if (authState.user) {
      clearUserRoleCache(authState.user.id)
      await loadUserData(authState.user)
    }
  }

  return {
    ...authState,
    refreshAuth
  }
} 