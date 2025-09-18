"use client"

import { createClient } from '@/lib/supabase/client'

// Tipos para a nova estrutura de autenticação
export interface CustomUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'administrator' | 'teacher' | 'student'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address: string
  user_agent: string
  login_at: string
  expires_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: CustomUser
  session?: UserSession
  error?: string
}

// Função para fazer hash da senha (simulada - em produção usar bcrypt)
function hashPassword(password: string): string {
  // Em produção, usar uma biblioteca como bcrypt
  // Por enquanto, retornar uma versão simples
  return btoa(password + '_salt')
}

// Função para verificar senha
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Função de login customizada
export async function customLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const supabase = createClient()
    
    console.log('🔐 [AUTH] Iniciando login customizado para:', credentials.email)
    
    // Buscar usuário na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .eq('is_active', true)
      .single()
    
    if (userError || !user) {
      console.error('❌ [AUTH] Usuário não encontrado:', userError)
      return { success: false, error: 'Credenciais inválidas' }
    }
    
    // Verificar senha
    if (!verifyPassword(credentials.password, user.password_hash)) {
      console.error('❌ [AUTH] Senha incorreta')
      return { success: false, error: 'Credenciais inválidas' }
    }
    
    // Gerar token de sessão
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    
    // Criar sessão na tabela user_sessions
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        login_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()
    
    if (sessionError) {
      console.error('❌ [AUTH] Erro ao criar sessão:', sessionError)
      return { success: false, error: 'Erro interno do servidor' }
    }
    
    // Atualizar último login do usuário
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)
    
    // Armazenar token no localStorage e cookies
    localStorage.setItem('session_token', sessionToken)
    localStorage.setItem('user_id', user.id)
    
    // Definir cookie para o middleware
    document.cookie = `session_token=${sessionToken}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`
    
    console.log('✅ [AUTH] Login realizado com sucesso')
    
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
      },
      session
    }
    
  } catch (error) {
    console.error('❌ [AUTH] Erro inesperado no login:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para verificar sessão
export async function verifySession(sessionToken?: string): Promise<{ success: boolean; user?: CustomUser; error?: string }> {
  try {
    const supabase = createClient()
    const token = sessionToken || localStorage.getItem('session_token')
    
    if (!token) {
      return { success: false, error: 'Token não encontrado' }
    }
    
    console.log('🔍 [AUTH] Verificando sessão...')
    
    // Buscar sessão na tabela user_sessions
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (*)
      `)
      .eq('session_token', token)
      .eq('expires_at', '>', new Date().toISOString())
      .single()
    
    if (sessionError || !session) {
      console.error('❌ [AUTH] Sessão inválida ou expirada:', sessionError)
      // Limpar tokens inválidos
      localStorage.removeItem('session_token')
      localStorage.removeItem('user_id')
      return { success: false, error: 'Sessão inválida' }
    }
    
    const user = session.users
    
    if (!user || !user.is_active) {
      console.error('❌ [AUTH] Usuário inativo')
      return { success: false, error: 'Usuário inativo' }
    }
    
    console.log('✅ [AUTH] Sessão válida para:', user.email)
    
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
    console.error('❌ [AUTH] Erro ao verificar sessão:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para logout
export async function customLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const sessionToken = localStorage.getItem('session_token')
    
    if (sessionToken) {
      // Invalidar sessão no banco
      await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('session_token', sessionToken)
    }
    
    // Limpar localStorage e cookies
    localStorage.removeItem('session_token')
    localStorage.removeItem('user_id')
    
    // Remover cookie
    document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    console.log('✅ [AUTH] Logout realizado com sucesso')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ [AUTH] Erro no logout:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para solicitar recuperação de senha
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    console.log('🔐 [AUTH] Solicitando recuperação de senha para:', email)
    
    // Verificar se usuário existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (userError || !user) {
      // Por segurança, não revelar se o email existe ou não
      return { success: true }
    }
    
    // Gerar token de recuperação
    const resetToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    
    // Salvar token na tabela password_reset_tokens
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      })
    
    if (tokenError) {
      console.error('❌ [AUTH] Erro ao criar token de recuperação:', tokenError)
      return { success: false, error: 'Erro interno do servidor' }
    }
    
    // TODO: Enviar email com link de recuperação
    // Por enquanto, apenas logar o token (em produção, enviar por email)
    console.log('📧 [AUTH] Token de recuperação gerado:', resetToken)
    console.log('📧 [AUTH] Link de recuperação: /reset-password?token=' + resetToken)
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ [AUTH] Erro na recuperação de senha:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Função para redefinir senha
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    console.log('🔐 [AUTH] Redefinindo senha com token:', token.substring(0, 10) + '...')
    
    // Verificar token válido
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select(`
        *,
        users (*)
      `)
      .eq('token', token)
      .eq('expires_at', '>', new Date().toISOString())
      .single()
    
    if (tokenError || !resetToken) {
      console.error('❌ [AUTH] Token inválido ou expirado:', tokenError)
      return { success: false, error: 'Token inválido ou expirado' }
    }
    
    // Atualizar senha do usuário
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: hashPassword(newPassword),
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.user_id)
    
    if (updateError) {
      console.error('❌ [AUTH] Erro ao atualizar senha:', updateError)
      return { success: false, error: 'Erro ao atualizar senha' }
    }
    
    // Invalidar token usado
    await supabase
      .from('password_reset_tokens')
      .update({ expires_at: new Date().toISOString() })
      .eq('token', token)
    
    // Invalidar todas as sessões do usuário
    await supabase
      .from('user_sessions')
      .update({ expires_at: new Date().toISOString() })
      .eq('user_id', resetToken.user_id)
    
    console.log('✅ [AUTH] Senha redefinida com sucesso')
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ [AUTH] Erro ao redefinir senha:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Funções auxiliares
function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

// Nota: Funções server-side devem ser implementadas separadamente
// para evitar conflitos entre client e server components
