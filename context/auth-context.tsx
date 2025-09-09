"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { initializeUserProgress } from "@/actions"
import { debugSupabaseConfig } from "@/lib/supabase/debug"

interface UserProfile {
  id: string
  user_id: string
  role: 'admin' | 'teacher' | 'student'
  display_name?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let safetyTimeout: NodeJS.Timeout | null = null
    let isInitialized = false
    let retryCount = 0
    const maxRetries = 3

    // Timeout de segurança reduzido para evitar travamento
    safetyTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('⚠️ Timeout de segurança ativado - forçando fim do loading')
        setIsLoading(false)
        isInitialized = true
      }
    }, 8000) // Reduzido para 8 segundos

    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log('🔐 Verificando sessão atual... (tentativa:', retryCount + 1, ')')
        
        // Debug da configuração do Supabase
        if (retryCount === 0) {
          debugSupabaseConfig()
        }
        
        // Verificar se as variáveis de ambiente estão disponíveis
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('❌ Variáveis de ambiente do Supabase não encontradas')
          setIsLoading(false)
          isInitialized = true
          if (safetyTimeout) clearTimeout(safetyTimeout)
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao buscar sessão:', error)
          
          // Se for erro de rede, tentar novamente
          if (retryCount < maxRetries && (error.message.includes('network') || error.message.includes('fetch'))) {
            retryCount++
            console.log('🔄 Tentando novamente em 2 segundos...')
            setTimeout(getSession, 2000)
            return
          }
          
          setIsLoading(false)
          isInitialized = true
          if (safetyTimeout) clearTimeout(safetyTimeout)
          return
        }

        console.log('✅ Sessão encontrada:', session ? 'Sim' : 'Não')
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 Usuário autenticado:', session.user.email)
          await fetchUserProfile(session.user.id)
        } else {
          console.log('👤 Nenhum usuário autenticado')
        }
        
        setIsLoading(false)
        isInitialized = true
        if (safetyTimeout) clearTimeout(safetyTimeout)
      } catch (error) {
        console.error('❌ Erro inesperado ao verificar sessão:', error)
        
        // Se for erro de rede, tentar novamente
        if (retryCount < maxRetries) {
          retryCount++
          console.log('🔄 Tentando novamente em 2 segundos...')
          setTimeout(getSession, 2000)
          return
        }
        
        setIsLoading(false)
        isInitialized = true
        if (safetyTimeout) clearTimeout(safetyTimeout)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('🔄 Evento de autenticação:', event, session?.user?.email)
        
        // Evitar loops em eventos de refresh
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('🔄 Token refresh sem sessão - ignorando')
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
        isInitialized = true
        if (safetyTimeout) clearTimeout(safetyTimeout)
      }
    )

    return () => {
      subscription.unsubscribe()
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        console.error('📋 Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Se não existir perfil, criar um padrão
        console.log('🔄 Tentando criar perfil padrão...')
        await createDefaultProfile(userId)
      } else {
        console.log('✅ Perfil encontrado no servidor:', data)
        setProfile(data)
        
        // Salvar no cache local
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data))
      }
    } catch (error) {
      console.error('❌ Erro ao buscar perfil do servidor:', error)
    }
  }

  const createDefaultProfile = async (userId: string) => {
    try {
      console.log('🆕 Criando perfil padrão para usuário:', userId)
      
      // Determinar role baseado no email
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Erro ao buscar usuário:', userError)
        return
      }

      if (!user) {
        console.error('❌ Usuário não encontrado')
        return
      }

      // Determinar role baseado no email para Everest Preparatórios
      let role: 'admin' | 'teacher' | 'student' = 'student'
      if (user.email === 'admin@teste.com') {
        role = 'admin'
      } else if (user.email === 'professor@teste.com') {
        role = 'teacher'
      } else if (user.email === 'aluno@teste.com') {
        role = 'student'
      }
      
      console.log('👑 Role determinado:', role)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: role,
          display_name: user?.email?.split('@')[0] || 'Usuário'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar perfil:', error)
        console.error('📋 Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Se a tabela não existir, mostrar instruções
        if (error.code === '42P01') { // undefined_table
          console.error('🚨 TABELA user_profiles NÃO EXISTE!')
          console.error('📋 Execute o script SQL: scripts/create_user_profiles_table.sql')
        }
      } else {
        console.log('✅ Perfil criado com sucesso:', data)
        setProfile(data)
        
        // Inicializar progresso do usuário
        console.log('🎯 Inicializando progresso do usuário...')
        try {
          await initializeUserProgress(userId)
          console.log('✅ Progresso inicializado com sucesso')
        } catch (error) {
          console.error('❌ Erro ao inicializar progresso:', error)
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao criar perfil:', error)
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
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Erro no Supabase logout:', error)
        throw error
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
    signOut,
    refreshProfile
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

// Hook para verificar se o usuário tem acesso a uma página
export function useRequireAuth(requiredRole?: 'admin' | 'teacher' | 'student') {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (!isLoading && user && requiredRole && profile?.role !== requiredRole) {
      if (requiredRole === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, profile, isLoading, requiredRole, router])

  return { user, profile, isLoading }
}
