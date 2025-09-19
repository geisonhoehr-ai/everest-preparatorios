"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { logger, logError, logLoginAttempt } from '@/lib/logger'

interface UserProfile {
  id: string
  user_id: string
  role: 'administrator' | 'teacher' | 'student'
  display_name: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
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
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          logger.error('Erro ao obter sessão do usuário', 'AUTH', { error: error.message })
          return
        }
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        logger.error('Erro ao verificar sessão do usuário', 'AUTH', { error: (error as Error).message })
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        // Se não existe perfil, criar um padrão
        await createDefaultProfile(userId)
        return
      }

      setProfile(profileData)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    }
  }

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const email = userData.user.email || ''
      let role: 'administrator' | 'teacher' | 'student' = 'student'
      let displayName = 'Usuário'

      // Determinar role baseado no email
      if (email.includes('admin@teste.com')) {
        role = 'administrator'
        displayName = 'Admin Teste'
      } else if (email.includes('professor@teste.com')) {
        role = 'teacher'
        displayName = 'Professor Teste'
      } else if (email.includes('aluno@teste.com')) {
        role = 'student'
        displayName = 'Aluno Teste'
      }

      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: role,
          display_name: displayName
        })
        .select()
        .single()

      if (error) {
        logger.error('Erro ao criar perfil padrão do usuário', 'AUTH', { error: error.message }, userId)
        return
      }

      setProfile(newProfile)
    } catch (error) {
      logger.error('Erro ao criar perfil padrão do usuário', 'AUTH', { error: (error as Error).message }, userId)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      logger.debug('Tentativa de login iniciada', 'AUTH', { email: email.substring(0, 3) + '***@***' })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logLoginAttempt(email, false, 'AUTH')
        logger.warn('Tentativa de login falhou', 'AUTH', { error: error.message, email: email.substring(0, 3) + '***@***' })
        return { success: false, error: error.message }
      }

      if (data.user) {
        logLoginAttempt(email, true, 'AUTH')
        logger.info('Login realizado com sucesso', 'AUTH', { userId: data.user.id, email: email.substring(0, 3) + '***@***' })
        setUser(data.user)
        setSession(data.session)
        await fetchUserProfile(data.user.id)
        return { success: true }
      }

      logger.error('Login falhou - usuário não retornado', 'AUTH', { email: email.substring(0, 3) + '***@***' })
      return { success: false, error: 'Erro desconhecido' }
    } catch (error) {
      logLoginAttempt(email, false, 'AUTH')
      logger.error('Erro inesperado durante login', 'AUTH', { error: (error as Error).message, email: email.substring(0, 3) + '***@***' })
      return { success: false, error: 'Erro inesperado' }
    }
  }

  const signOut = async () => {
    try {
      logger.info('Logout iniciado', 'AUTH', { userId: user?.id })
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      logger.info('Logout realizado com sucesso', 'AUTH', { userId: user?.id })
      router.push('/login')
    } catch (error) {
      logger.error('Erro ao fazer logout', 'AUTH', { error: (error as Error).message, userId: user?.id })
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      signIn,
      signOut,
      refreshProfile
    }}>
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
