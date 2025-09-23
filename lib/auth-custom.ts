import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key para acesso direto às tabelas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('🔧 [AUTH_SERVICE] Configuração Supabase:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseKey,
  usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
})

// Interfaces para o sistema de autenticação customizado
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'administrator' | 'teacher' | 'student'
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  login_at: string
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PasswordResetToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

// Resultado do login
export interface LoginResult {
  success: boolean
  user?: User
  session?: UserSession
  sessionToken?: string
  error?: string
}

// Resultado da verificação de sessão
export interface SessionVerificationResult {
  success: boolean
  user?: User
  error?: string
}

export class AuthService {
  private supabase = createClient(supabaseUrl, supabaseKey)
  
  private static _instance: AuthService
  
  constructor() {
    // Usar singleton para evitar múltiplas instâncias
    if (AuthService._instance) {
      return AuthService._instance
    }
    AuthService._instance = this
  }

      // Autenticar usuário com email e senha
      async signIn(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
        try {
          console.log('🔐 [AUTH_SERVICE] Tentativa de login iniciada para:', email)

          // Buscar usuário por email na tabela users
          console.log('🔍 [AUTH_SERVICE] Buscando usuário no banco...')
          const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle()

          console.log('🔍 [AUTH_SERVICE] Resultado da busca:', { hasUser: !!user, error: userError?.message })

          if (userError || !user) {
            console.log('❌ [AUTH_SERVICE] Erro ao buscar usuário:', userError?.message)
            return { success: false, error: 'Credenciais inválidas' }
          }

          // Verificar se conta está ativa
          console.log('🔍 [AUTH_SERVICE] Verificando se conta está ativa:', user.is_active)
          if (!user.is_active) {
            console.log('❌ [AUTH_SERVICE] Conta inativa')
            return { success: false, error: 'Conta desativada. Entre em contato com o administrador.' }
          }

          // Verificar senha
          console.log('🔑 [AUTH_SERVICE] Verificando senha para:', user.email)
          const isValidPassword = await bcrypt.compare(password, user.password_hash)
          console.log('🔑 [AUTH_SERVICE] Senha válida:', isValidPassword)
          if (!isValidPassword) {
            console.log('❌ [AUTH_SERVICE] Senha incorreta')
            return { success: false, error: 'Credenciais inválidas' }
          }

          // Atualizar last_login_at
          await this.supabase
            .from('users')
            .update({ 
              last_login_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          // Criar sessão na tabela user_sessions
          console.log('🔄 [AUTH_CUSTOM] Criando sessão para:', user.email)
          const session = await this.createSession(user.id, ipAddress, userAgent)
          console.log('✅ [AUTH_CUSTOM] Sessão criada:', session.id)

          // Remover password_hash do objeto user antes de retornar
          const { password_hash, ...userWithoutPassword } = user

          console.log('✅ [AUTH_SERVICE] Login realizado com sucesso para:', user.email, 'role:', user.role)
          return { 
            success: true, 
            user: userWithoutPassword as User, 
            session,
            sessionToken: session.session_token
          }
        } catch (error) {
          console.error('❌ [AUTH_SERVICE] Erro inesperado no login:', error)
          return { success: false, error: 'Erro interno do servidor' }
        }
      }

      // Criar sessão para usuário na tabela user_sessions
      private async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<UserSession> {
        console.log('🔧 [AUTH_CUSTOM] Criando sessão para userId:', userId)
        
        // Gerar token único de sessão
        const sessionToken = this.generateSessionToken()
        
        // Definir expiração (7 dias)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        console.log('🔧 [AUTH_CUSTOM] Token gerado:', sessionToken.substring(0, 10) + '...')
        console.log('🔧 [AUTH_CUSTOM] Sessão expira em:', expiresAt.toISOString())

        // Inserir sessão na tabela user_sessions
        const { data: session, error } = await this.supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            session_token: sessionToken,
            ip_address: ipAddress || '127.0.0.1',
            user_agent: userAgent || 'unknown',
            login_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            is_active: true
          })
          .select()
          .single()

        if (error) {
          console.log('❌ [AUTH_CUSTOM] Erro ao criar sessão:', error.message)
          throw new Error('Erro ao criar sessão: ' + error.message)
        }

        console.log('✅ [AUTH_CUSTOM] Sessão criada com sucesso:', session.id)
        return session as UserSession
      }

      // Verificar sessão válida na tabela user_sessions
      async verifySession(sessionToken: string): Promise<SessionVerificationResult> {
        try {
          console.log('🔍 [AUTH_SERVICE] Verificando sessão com token:', sessionToken.substring(0, 10) + '...')
          
          // Buscar sessão com dados do usuário
          const { data: session, error: sessionError } = await this.supabase
            .from('user_sessions')
            .select(`
              *,
              users (*)
            `)
            .eq('session_token', sessionToken)
            .eq('is_active', true)
            .maybeSingle()
          
          console.log('🔍 [AUTH_SERVICE] Resultado da query:', { hasSession: !!session, error: sessionError?.message })

          if (sessionError || !session) {
            console.log('❌ [AUTH_SERVICE] Sessão não encontrada ou inativa')
            return { success: false, error: 'Sessão inválida' }
          }

          // Verificar se sessão não expirou
          const now = new Date()
          const expiresAt = new Date(session.expires_at)
          
          if (now > expiresAt) {
            console.log('❌ [AUTH_SERVICE] Sessão expirada:', { now: now.toISOString(), expiresAt: expiresAt.toISOString() })
            
            // Marcar sessão como inativa
            await this.supabase
              .from('user_sessions')
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', session.id)
            
            return { success: false, error: 'Sessão expirada' }
          }

          // Verificar se usuário ainda está ativo
          const user = session.users
          if (!user || !user.is_active) {
            console.log('❌ [AUTH_SERVICE] Usuário inativo')
            return { success: false, error: 'Usuário inativo' }
          }

          console.log('✅ [AUTH_SERVICE] Sessão válida para usuário:', user.email, 'role:', user.role)
          
          // Remover password_hash do usuário
          const { password_hash, ...userWithoutPassword } = user
          
          return { 
            success: true, 
            user: userWithoutPassword as User
          }
        } catch (error) {
          console.error('❌ [AUTH_SERVICE] Erro ao verificar sessão:', error)
          return { success: false, error: 'Erro interno do servidor' }
        }
      }

      // Fazer logout (marcar sessão como inativa)
      async signOut(sessionToken: string): Promise<{ success: boolean; error?: string }> {
        try {
          console.log('🚪 [AUTH_SERVICE] Fazendo logout para token:', sessionToken.substring(0, 10) + '...')
          
          // Marcar sessão como inativa ao invés de deletar
          const { error } = await this.supabase
            .from('user_sessions')
            .update({ 
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('session_token', sessionToken)

          if (error) {
            console.error('❌ [AUTH_SERVICE] Erro ao fazer logout:', error.message)
            return { success: false, error: 'Erro ao fazer logout' }
          }

          console.log('✅ [AUTH_SERVICE] Logout realizado com sucesso')
          return { success: true }
        } catch (error) {
          console.error('❌ [AUTH_SERVICE] Erro inesperado no logout:', error)
          return { success: false, error: 'Erro interno do servidor' }
        }
      }

      // Solicitar redefinição de senha
      async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
        try {
          console.log('🔐 [AUTH_SERVICE] Solicitação de redefinição de senha para:', email)
          
          // Buscar usuário na tabela users
          const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('id, email, is_active')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle()

          if (userError || !user) {
            // Por segurança, não revelar se email existe ou não
            console.log('🔐 [AUTH_SERVICE] Email não encontrado (por segurança)')
            return { success: true }
          }

          // Verificar se usuário está ativo
          if (!user.is_active) {
            console.log('🔐 [AUTH_SERVICE] Usuário inativo')
            return { success: true } // Por segurança, não revelar status
          }

          // Gerar token de redefinição
          const token = this.generateResetToken()
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 1) // 1 hora

          console.log('🔐 [AUTH_SERVICE] Token gerado:', token.substring(0, 10) + '...')

          // Salvar token na tabela password_reset_tokens
          const { error: tokenError } = await this.supabase
            .from('password_reset_tokens')
            .insert({
              user_id: user.id,
              token: token,
              expires_at: expiresAt.toISOString()
            })

          if (tokenError) {
            console.log('❌ [AUTH_SERVICE] Erro ao salvar token:', tokenError.message)
            return { success: false, error: 'Erro ao gerar token de redefinição' }
          }

          // TODO: Enviar email com token
          console.log(`🔐 [AUTH_SERVICE] Token de redefinição para ${email}: ${token}`)

          return { success: true }
        } catch (error) {
          console.error('❌ [AUTH_SERVICE] Erro ao solicitar redefinição de senha:', error)
          return { success: false, error: 'Erro interno do servidor' }
        }
      }

      // Redefinir senha com token
      async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
        try {
          console.log('🔐 [AUTH_SERVICE] Redefinição de senha com token:', token.substring(0, 10) + '...')
          
          // Buscar token válido na tabela password_reset_tokens
          const { data: resetToken, error: tokenError } = await this.supabase
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .maybeSingle()

          if (tokenError || !resetToken) {
            console.log('❌ [AUTH_SERVICE] Token não encontrado')
            return { success: false, error: 'Token inválido' }
          }

          // Verificar se token não expirou
          const now = new Date()
          const expiresAt = new Date(resetToken.expires_at)
          
          if (now > expiresAt) {
            console.log('❌ [AUTH_SERVICE] Token expirado:', { now: now.toISOString(), expiresAt: expiresAt.toISOString() })
            return { success: false, error: 'Token expirado' }
          }

          console.log('✅ [AUTH_SERVICE] Token válido, criptografando nova senha')

          // Criptografar nova senha
          const passwordHash = await bcrypt.hash(newPassword, 10)

          // Atualizar senha na tabela users
          const { error: updateError } = await this.supabase
            .from('users')
            .update({ 
              password_hash: passwordHash,
              updated_at: new Date().toISOString()
            })
            .eq('id', resetToken.user_id)

          if (updateError) {
            console.log('❌ [AUTH_SERVICE] Erro ao atualizar senha:', updateError.message)
            return { success: false, error: 'Erro ao atualizar senha' }
          }

          // Deletar token usado
          await this.supabase
            .from('password_reset_tokens')
            .delete()
            .eq('id', resetToken.id)

          console.log('✅ [AUTH_SERVICE] Senha redefinida com sucesso')
          return { success: true }
        } catch (error) {
          console.error('❌ [AUTH_SERVICE] Erro ao redefinir senha:', error)
          return { success: false, error: 'Erro interno do servidor' }
        }
      }

  // Gerar token de sessão
  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Gerar token de redefinição
  private generateResetToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

export const authService = new AuthService()