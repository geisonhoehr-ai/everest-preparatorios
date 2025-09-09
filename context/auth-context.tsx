"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { initializeUserProgress } from "@/actions"

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
    // Timeout de segurança para evitar travamento
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança ativado - forçando fim do loading')
      setIsLoading(false)
    }, 30000) // 30 segundos

    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log('🔐 Verificando sessão atual...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao buscar sessão:', error)
          setIsLoading(false)
          clearTimeout(safetyTimeout)
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
        clearTimeout(safetyTimeout)
      } catch (error) {
        console.error('❌ Erro inesperado ao verificar sessão:', error)
        setIsLoading(false)
        clearTimeout(safetyTimeout)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('🔄 Evento de autenticação:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
        clearTimeout(safetyTimeout)
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil para usuário:', userId)
      
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
        console.log('✅ Perfil encontrado:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar perfil:', error)
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
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...')
      
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
