"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { initializeUserProgress } from "@/actions"
import { 
  CustomUser, 
  UserSession, 
  LoginCredentials, 
  LoginResponse,
  customLogin, 
  verifySession, 
  customLogout,
  requestPasswordReset,
  resetPassword
} from "@/lib/auth-custom"

interface UserProfile {
  id: string
  user_id: string
  role: 'administrator' | 'teacher' | 'student'
  display_name: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  profile_type: 'administrator' | 'teacher' | 'student' | 'user'
  specific_data?: {
    // Dados específicos do professor
    employee_id_number?: string
    hire_date?: string
    department?: string
    // Dados específicos do aluno
    student_id_number?: string
    enrollment_date?: string
  }
}

interface AuthContextType {
  user: CustomUser | null
  session: UserSession | null
  profile: UserProfile | null
  isLoading: boolean
  signIn: (credentials: LoginCredentials) => Promise<LoginResponse>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [session, setSession] = useState<UserSession | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let safetyTimeout: NodeJS.Timeout | null = null
    let isInitialized = false

    // Timeout de segurança
    safetyTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('⚠️ Timeout de segurança ativado - forçando fim do loading')
        setIsLoading(false)
        isInitialized = true
      }
    }, 8000)

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        console.log('🔐 Verificando sessão atual...')
        
        const result = await verifySession()
        
        if (result.success && result.user) {
          console.log('✅ Usuário autenticado:', result.user.email)
          setUser(result.user)
          await fetchUserProfile(result.user.id)
        } else {
          console.log('👤 Nenhum usuário autenticado')
          setUser(null)
          setProfile(null)
        }
        
        setIsLoading(false)
        isInitialized = true
        if (safetyTimeout) clearTimeout(safetyTimeout)
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error)
        setUser(null)
        setProfile(null)
        setIsLoading(false)
        isInitialized = true
        if (safetyTimeout) clearTimeout(safetyTimeout)
      }
    }

    checkSession()

    return () => {
      if (safetyTimeout) clearTimeout(safetyTimeout)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil para usuário:', userId)
      
      // Verificar cache local primeiro
      const cachedProfile = localStorage.getItem(`profile_${userId}`)
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile)
          console.log('📦 Perfil encontrado no cache:', parsedProfile)
          setProfile(parsedProfile)
          
          // Buscar atualização em background
          fetchProfileFromServer(userId)
          return
        } catch (e) {
          console.warn('⚠️ Erro ao parsear cache, buscando do servidor')
        }
      }
      
      await fetchProfileFromServer(userId)
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar perfil:', error)
    }
  }

  const fetchProfileFromServer = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil completo para usuário:', userId)
      
      // Usar a função verifySession para obter dados atualizados do usuário
      const result = await verifySession()
      
      if (!result.success || !result.user) {
        console.error('❌ Erro ao verificar sessão do usuário')
        return
      }
      
      const userData = result.user
      console.log('✅ Dados do usuário encontrados:', userData)
      
      // Criar perfil unificado baseado na nova estrutura
      const profile = {
        id: userId,
        user_id: userId,
        role: userData.role,
        display_name: `${userData.first_name} ${userData.last_name}`,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        is_active: userData.is_active,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        profile_type: userData.role,
        specific_data: undefined // Pode ser expandido no futuro se necessário
      }
      
      console.log('✅ Perfil unificado criado:', profile)
      setProfile(profile)
      localStorage.setItem(`profile_${userId}`, JSON.stringify(profile))
      
    } catch (error) {
      console.error('❌ Erro ao buscar perfil do servidor:', error)
    }
  }

  // Função de login
  const signIn = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('🔐 Iniciando login...')
      const result = await customLogin(credentials)
      
      if (result.success && result.user) {
        setUser(result.user)
        setSession(result.session || null)
        await fetchUserProfile(result.user.id)
        
        // Inicializar progresso do usuário se necessário
        try {
          await initializeUserProgress(result.user.id)
          console.log('✅ Progresso inicializado com sucesso')
        } catch (error) {
          console.error('❌ Erro ao inicializar progresso:', error)
        }
      }
      
      return result
    } catch (error) {
      console.error('❌ Erro no login:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      // Limpar cache antes de buscar novamente
      localStorage.removeItem(`profile_${user.id}`)
      await fetchUserProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...')
      
      // Limpar cache local
      if (user?.id) {
        localStorage.removeItem(`profile_${user.id}`)
      }
      
      // Limpar estado local primeiro
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Fazer logout customizado
      const result = await customLogout()
      
      if (!result.success) {
        console.error('❌ Erro no logout customizado:', result.error)
      }
      
      console.log('✅ Logout realizado com sucesso')
      
      // Redirecionar para a home pública
      window.location.href = '/'
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      // Mesmo com erro, tentar redirecionar para home pública
      window.location.href = '/'
    }
  }

  const value = {
    user,
    session,
    profile,
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
    console.warn('useAuth está sendo usado fora de um AuthProvider')
    // Retornar um contexto padrão em vez de lançar erro
    return {
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      signIn: async () => ({ success: false, error: 'Contexto não disponível' }),
      signOut: async () => {},
      refreshProfile: async () => {},
      requestPasswordReset: async () => ({ success: false, error: 'Contexto não disponível' }),
      resetPassword: async () => ({ success: false, error: 'Contexto não disponível' })
    }
  }
  return context
}

// Hook para verificar se o usuário tem acesso a uma página
export function useRequireAuth(requiredRole?: 'administrator' | 'teacher' | 'student') {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      // Redirecionar para dashboard se não tiver permissão
      router.push('/dashboard')
    }
  }, [user, profile, isLoading, requiredRole, router])

  return { user, profile, isLoading }
}
