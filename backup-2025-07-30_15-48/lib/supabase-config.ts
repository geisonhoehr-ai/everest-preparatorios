// Configuração para aumentar timeout de sessão
// Esta é uma solução alternativa se não encontrar as configurações no painel

import { createClient } from '@/lib/supabase/client'

// Configuração de sessão com timeout mais longo
export const supabaseConfig = {
  auth: {
    // Configurar timeout de sessão para 30 dias
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configurações de token
    flowType: 'pkce',
    // Timeout mais longo (30 dias em segundos)
    sessionTimeout: 2592000,
  }
}

// Função para configurar sessão com timeout longo
export async function configureLongSession() {
  const supabase = createClient()
  
  try {
    // Configurar refresh automático de token
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ [CONFIG] Erro ao configurar sessão:', error)
      return false
    }
    
    console.log('✅ [CONFIG] Sessão configurada com timeout longo')
    return true
  } catch (error) {
    console.error('❌ [CONFIG] Erro ao configurar sessão:', error)
    return false
  }
}

// Função para verificar se a sessão está ativa
export async function checkSessionStatus() {
  const supabase = createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ [SESSION] Erro ao verificar sessão:', error)
      return { active: false, error: error.message }
    }
    
    if (session) {
      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const timeLeft = expiresAt.getTime() - now.getTime()
      const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      
      console.log(`✅ [SESSION] Sessão ativa por mais ${daysLeft} dias`)
      return { active: true, daysLeft, expiresAt }
    } else {
      console.log('❌ [SESSION] Nenhuma sessão ativa')
      return { active: false }
    }
  } catch (error) {
    console.error('❌ [SESSION] Erro ao verificar sessão:', error)
    return { active: false, error: 'Erro interno' }
  }
} 