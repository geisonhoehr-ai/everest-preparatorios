"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService, User, UserSession, LoginResult, SessionVerificationResult } from '@/lib/auth-custom'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  profile: User | null  // Alias para user para compatibilidade
  session: UserSession | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Remover log desnecessário que está causando spam

  useEffect(() => {
    let isInitialized = false
    let safetyTimeout: NodeJS.Timeout | null = null

    // Timeout de segurança para evitar carregamento infinito
    safetyTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('⚠️ [AUTH] Timeout de segurança ativado - forçando fim do loading')
        setIsLoading(false)
        isInitialized = true
      }
    }, 3000) // Reduzido para 3 segundos

    const initializeAuth = async () => {
      try {
        console.log('🔄 [AUTH] Inicializando autenticação customizada...')
        console.log('🔄 [AUTH] Estado atual do usuário:', user ? `${user.email} (${user.role})` : 'null')
        
        // Verificar se há sessão salva no localStorage (apenas no cliente)
        let savedSessionToken = null
        if (typeof window !== 'undefined') {
          savedSessionToken = localStorage.getItem('session_token')
        }
        console.log('🔍 [AUTH] Token encontrado no localStorage:', !!savedSessionToken)
        
        if (savedSessionToken) {
          console.log('🔍 [AUTH] Verificando sessão salva com token:', savedSessionToken.substring(0, 10) + '...')
          
          try {
            const result: SessionVerificationResult = await authService.verifySession(savedSessionToken)
            console.log('🔍 [AUTH] Resultado da verificação:', { success: result.success, hasUser: !!result.user })
            
            if (result.success && result.user) {
              console.log('✅ [AUTH] Sessão válida encontrada:', result.user.email)
              console.log('✅ [AUTH] Dados completos do usuário:', result.user)
              
              setUser(result.user)
              setSession({ 
                id: 'current',
                user_id: result.user.id,
                session_token: savedSessionToken,
                login_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            } else {
              console.log('❌ [AUTH] Sessão inválida, removendo...')
              if (typeof window !== 'undefined') {
                localStorage.removeItem('session_token')
              }
            }
          } catch (verifyError) {
            console.error('❌ [AUTH] Erro ao verificar sessão:', verifyError)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('session_token')
            }
          }
        } else {
          console.log('ℹ️ [AUTH] Nenhuma sessão salva encontrada')
        }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao inicializar autenticação:', error)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('session_token')
          }
      } finally {
        if (!isInitialized) {
          setIsLoading(false)
          isInitialized = true
          if (safetyTimeout) clearTimeout(safetyTimeout)
        }
      }
    }

    initializeAuth()

    return () => {
      if (safetyTimeout) clearTimeout(safetyTimeout)
    }
  }, [])

      const signIn = async (email: string, password: string) => {
        try {
          console.log('🚀 [AUTH_CONTEXT] Iniciando login para:', email)
          logger.debug('Tentativa de login iniciada', 'AUTH_CUSTOM', { email: email.substring(0, 3) + '***@***' })
          
          console.log('🔧 [AUTH_CONTEXT] Chamando API /api/auth/signin...')
          console.log('🔧 [AUTH_CONTEXT] URL completa:', window.location.origin + '/api/auth/signin')
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })
          
          console.log('📋 [AUTH_CONTEXT] Status da resposta:', response.status)
          console.log('📋 [AUTH_CONTEXT] Headers da resposta:', Object.fromEntries(response.headers.entries()))

          const result: LoginResult = await response.json()
          console.log('📋 [AUTH_CONTEXT] Resultado completo da API:', JSON.stringify(result, null, 2))

          if (result.success && result.user && result.session) {
            logger.info('Login realizado com sucesso', 'AUTH_CUSTOM', { userId: result.user.id, email: email.substring(0, 3) + '***@***' })
            
            console.log('✅ [AUTH] Login - Dados completos recebidos:', result.user)
            console.log('✅ [AUTH] Login - Usuário:', { 
              name: `${result.user.first_name} ${result.user.last_name}`.trim(), 
              email: result.user.email, 
              role: result.user.role,
              fullUser: result.user
            })
            
            console.log('🔧 [AUTH] Definindo usuário no estado:', result.user)
            setUser(result.user)
            setSession(result.session)
            
            // Salvar token no localStorage
            console.log('💾 [AUTH] Salvando token no localStorage:', result.sessionToken?.substring(0, 10) + '...')
            if (typeof window !== 'undefined' && result.sessionToken) {
              localStorage.setItem('session_token', result.sessionToken)
            }
            
            console.log('✅ [AUTH] Login finalizado com sucesso!')
            
            return { success: true }
          } else {
            logger.warn('Tentativa de login falhou', 'AUTH_CUSTOM', { error: result.error, email: email.substring(0, 3) + '***@***' })
            return { success: false, error: result.error || 'Erro desconhecido' }
          }
    } catch (error) {
      logger.error('Erro inesperado durante login', 'AUTH_CUSTOM', { error: (error as Error).message, email: email.substring(0, 3) + '***@***' })
      return { success: false, error: 'Erro inesperado' }
    }
  }

  const signOut = async () => {
    try {
      logger.info('Logout iniciado', 'AUTH_CUSTOM', { userId: user?.id })
      
      if (session?.session_token) {
        await authService.signOut(session.session_token)
      }
      
      // Limpar estado local
      setUser(null)
      setSession(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('session_token')
      }
      
      logger.info('Logout realizado com sucesso', 'AUTH_CUSTOM', { userId: user?.id })
      router.push('/login')
    } catch (error) {
      logger.error('Erro ao fazer logout', 'AUTH_CUSTOM', { error: (error as Error).message, userId: user?.id })
    }
  }

      const refreshProfile = async () => {
        if (session?.session_token) {
          try {
            const result: SessionVerificationResult = await authService.verifySession(session.session_token)
            if (result.success && result.user) {
              setUser(result.user)
            } else {
              // Sessão inválida, fazer logout
              await signOut()
            }
          } catch (error) {
            console.error('❌ [AUTH] Erro ao atualizar perfil:', error)
          }
        }
      }

  const requestPasswordReset = async (email: string) => {
    try {
      logger.debug('Solicitação de redefinição de senha', 'AUTH_CUSTOM', { email: email.substring(0, 3) + '***@***' })
      return await authService.requestPasswordReset(email)
    } catch (error) {
      logger.error('Erro ao solicitar redefinição de senha', 'AUTH_CUSTOM', { error: (error as Error).message })
      return { success: false, error: 'Erro inesperado' }
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      logger.debug('Redefinição de senha', 'AUTH_CUSTOM')
      return await authService.resetPassword(token, newPassword)
    } catch (error) {
      logger.error('Erro ao redefinir senha', 'AUTH_CUSTOM', { error: (error as Error).message })
      return { success: false, error: 'Erro inesperado' }
    }
  }

  const value: AuthContextType = {
    user,
    profile: user,  // Alias para compatibilidade
    session,
    isLoading,
    signIn,
    signOut,
    refreshProfile,
    requestPasswordReset,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
