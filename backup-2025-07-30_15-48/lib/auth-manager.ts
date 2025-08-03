"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserRoleClient, clearUserRoleCache } from '@/lib/get-user-role'

interface AuthState {
  user: any | null
  role: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

class AuthManager {
  private static instance: AuthManager
  private authListeners: Set<(authState: AuthState) => void> = new Set()
  private currentAuthState: AuthState = {
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null
  }
  private supabase: any = null
  private authSubscription: any = null
  private isInitializing = false
  private initializationTimeout: NodeJS.Timeout | null = null

  private constructor() {
    console.log('👑 [AUTH_MANAGER] Instância única criada')
    
    // Verificar se estamos no browser
    if (typeof window === 'undefined') {
      console.log('👑 [AUTH_MANAGER] Executando no servidor, criando cliente básico')
      // No servidor, usar cliente básico sem funcionalidades de browser
      this.supabase = createClient()
      return
    }
    
    this.supabase = createClient()
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  async initialize() {
    if (this.isInitializing) {
      console.log('⏳ [AUTH_MANAGER] Já inicializando...')
      return
    }

    if (this.currentAuthState.isInitialized) {
      console.log('✅ [AUTH_MANAGER] Já inicializado')
      return
    }

    this.isInitializing = true
    console.log('🚀 [AUTH_MANAGER] Inicializando...')

    // Timeout de segurança para evitar loading infinito
    this.initializationTimeout = setTimeout(() => {
      console.warn('⚠️ [AUTH_MANAGER] Timeout de inicialização - forçando finalização')
      this.forceInitializationComplete()
    }, 10000) // 10 segundos

    try {
      await this.loadInitialSession()
      this.setupAuthListener()

      this.completeInitialization()

    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Erro na inicialização:', error)
      this.forceInitializationComplete('Erro na inicialização')
    }
  }

  private completeInitialization() {
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout)
      this.initializationTimeout = null
    }

    this.currentAuthState.isInitialized = true
    this.isInitializing = false
    this.notifyListeners()
    
    console.log('✅ [AUTH_MANAGER] Inicialização concluída')
  }

  private forceInitializationComplete(error?: string) {
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout)
      this.initializationTimeout = null
    }

    this.currentAuthState = {
      ...this.currentAuthState,
      isLoading: false,
      isInitialized: true,
      error: error || null
    }
    
    this.isInitializing = false
    this.notifyListeners()
    
    console.log('⚠️ [AUTH_MANAGER] Inicialização forçada:', error || 'timeout')
  }

  private async loadInitialSession() {
    try {
      console.log('🔍 [AUTH_MANAGER] Carregando sessão inicial...')
      
      const { data: { session }, error } = await this.supabase.auth.getSession()

      if (error) {
        console.error('❌ [AUTH_MANAGER] Erro ao carregar sessão:', error)
        this.currentAuthState.isLoading = false
        return
      }

      if (session?.user) {
        console.log('✅ [AUTH_MANAGER] Sessão encontrada:', session.user.email)
        await this.updateAuthState(session.user)
      } else {
        console.log('ℹ️ [AUTH_MANAGER] Nenhuma sessão encontrada')
        this.currentAuthState.isLoading = false
      }

    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Erro ao carregar sessão:', error)
      this.currentAuthState.isLoading = false
    }
  }

  private setupAuthListener() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe()
    }

    console.log('👂 [AUTH_MANAGER] Configurando listener...')

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 [AUTH_MANAGER] Auth event:', event, session?.user?.email)

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              clearUserRoleCache(session.user.id)
              await this.updateAuthState(session.user)
              this.handlePostLogin()
            }
            break

          case 'SIGNED_OUT':
            await this.handleSignOut()
            break

          case 'TOKEN_REFRESHED':
            if (session?.user) {
              await this.updateAuthState(session.user)
            }
            break

          case 'USER_UPDATED':
            if (session?.user) {
              await this.updateAuthState(session.user)
            }
            break

          default:
            console.log('ℹ️ [AUTH_MANAGER] Evento ignorado:', event)
        }
      }
    )

    this.authSubscription = subscription
  }

  private async updateAuthState(user: any) {
    try {
      console.log('🔄 [AUTH_MANAGER] Atualizando estado:', user.email)

      const role = await getUserRoleClient(user.email)
      
      this.currentAuthState = {
        user,
        role,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null
      }

      console.log('✅ [AUTH_MANAGER] Estado atualizado:', { email: user.email, role })
      this.notifyListeners()

    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Erro ao atualizar estado:', error)
      
      this.currentAuthState = {
        user,
        role: 'student',
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: 'Erro ao carregar role'
      }
      
      this.notifyListeners()
    }
  }

  private handlePostLogin() {
    // Redirecionar após login se estiver na página de login
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirect') || this.getDefaultRedirectUrl()
      
      console.log('🔄 [AUTH_MANAGER] Redirecionando após login:', redirectTo)
      window.location.replace(redirectTo)
    }
  }

  private getDefaultRedirectUrl(): string {
    const role = this.currentAuthState.role
    switch (role) {
      case 'admin':
        return '/admin'
      case 'teacher':
        return '/teacher'
      case 'student':
      default:
        return '/dashboard'
    }
  }

  private async handleSignOut() {
    console.log('🚪 [AUTH_MANAGER] Processando logout...')
    
    clearUserRoleCache()
    
    this.currentAuthState = {
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null
    }
    
    this.notifyListeners()

    // Redirecionar se não estiver em página pública
    if (typeof window !== 'undefined') {
      const publicPages = ['/', '/login', '/signup', '/forgot-password']
      if (!publicPages.includes(window.location.pathname)) {
        window.location.replace('/login')
      }
    }
  }

  // Métodos públicos
  subscribe(callback: (authState: AuthState) => void) {
    this.authListeners.add(callback)
    callback(this.currentAuthState)

    return () => {
      this.authListeners.delete(callback)
    }
  }

  private notifyListeners() {
    console.log(`📢 [AUTH_MANAGER] Notificando ${this.authListeners.size} listeners`)
    this.authListeners.forEach(callback => {
      try {
        callback(this.currentAuthState)
      } catch (error) {
        console.error('❌ [AUTH_MANAGER] Erro no listener:', error)
      }
    })
  }

  getCurrentState(): AuthState {
    return { ...this.currentAuthState }
  }

  async signOut() {
    try {
      console.log('🚪 [AUTH_MANAGER] Iniciando logout...')
      
      if (this.supabase) {
        await this.supabase.auth.signOut()
      }
      
    } catch (error) {
      console.error('❌ [AUTH_MANAGER] Erro no logout:', error)
    }
  }

  async refresh() {
    if (this.currentAuthState.user) {
      clearUserRoleCache(this.currentAuthState.user.id)
      await this.updateAuthState(this.currentAuthState.user)
    }
  }

  destroy() {
    console.log('🧹 [AUTH_MANAGER] Limpando recursos...')
    
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout)
      this.initializationTimeout = null
    }
    
    if (this.authSubscription) {
      this.authSubscription.unsubscribe()
      this.authSubscription = null
    }
    
    this.authListeners.clear()
    AuthManager.instance = null as any
  }
}

// Exportar instância única
export const authManager = AuthManager.getInstance()

// Hook para usar o AuthManager
export function useAuthManager() {
  const [authState, setAuthState] = useState(authManager.getCurrentState())

  useEffect(() => {
    console.log('🔗 [USE_AUTH_MANAGER] Conectando...')

    authManager.initialize()
    const unsubscribe = authManager.subscribe(setAuthState)

    return () => {
      console.log('🔗 [USE_AUTH_MANAGER] Desconectando...')
      unsubscribe()
    }
  }, [])

  return {
    ...authState,
    signOut: () => authManager.signOut(),
    refresh: () => authManager.refresh()
  }
}

export default AuthManager 