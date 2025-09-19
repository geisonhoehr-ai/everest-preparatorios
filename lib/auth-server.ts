"use server"

import { createClient } from '@/lib/supabase-server'
import { CustomUser } from './auth-custom'

// Função para verificar se usuário está autenticado (server-side)
export async function getServerUser(): Promise<CustomUser | null> {
  try {
    const supabase = await createClient()
    
    // Em uma implementação real, você extrairia o token dos cookies
    // Por enquanto, retornar null para indicar que precisa ser implementado
    return null
    
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar usuário no servidor:', error)
    return null
  }
}

// Função para verificar sessão no servidor
export async function verifyServerSession(sessionToken: string): Promise<{ success: boolean; user?: CustomUser; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (*)
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !session || !session.users?.is_active) {
      return { success: false, error: 'Sessão inválida' }
    }
    
    const user = session.users
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
    
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar sessão no servidor:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}
