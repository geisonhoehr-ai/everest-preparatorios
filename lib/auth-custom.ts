import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

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
}

export interface PasswordResetToken {
  id: string
  user_id: string
  token: string
  expires_at: string
}

export class AuthService {
  private supabase = createClient()

  // Autenticar usuário com email e senha
  async signIn(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; user?: User; session?: UserSession; error?: string }> {
    try {
      logger.debug('Tentativa de login iniciada', 'AUTH_CUSTOM', { email: email.substring(0, 3) + '***@***' })

      // Buscar usuário por email
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !user) {
        console.log('❌ [AUTH_CUSTOM] Erro ao buscar usuário:', userError?.message)
        logger.warn('Usuário não encontrado', 'AUTH_CUSTOM', { email: email.substring(0, 3) + '***@***' })
        return { success: false, error: 'Credenciais inválidas' }
      }

      // Verificar se conta está ativa
      if (!user.is_active) {
        logger.warn('Tentativa de login com conta inativa', 'AUTH_CUSTOM', { email: email.substring(0, 3) + '***@***' })
        return { success: false, error: 'Conta desativada. Entre em contato com o administrador.' }
      }

      // Verificar senha
      console.log('🔑 [AUTH_CUSTOM] Verificando senha para:', user.email)
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      console.log('🔑 [AUTH_CUSTOM] Senha válida:', isValidPassword)
      if (!isValidPassword) {
        console.log('❌ [AUTH_CUSTOM] Senha incorreta')
        logger.warn('Senha incorreta', 'AUTH_CUSTOM', { email: email.substring(0, 3) + '***@***' })
        return { success: false, error: 'Credenciais inválidas' }
      }

      // Atualizar last_login_at
      await this.supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

      // Criar sessão
      console.log('🔄 [AUTH_CUSTOM] Criando sessão para:', user.email)
      const session = await this.createSession(user.id, ipAddress, userAgent)
      console.log('✅ [AUTH_CUSTOM] Sessão criada:', session.id)

      logger.info('Login realizado com sucesso', 'AUTH_CUSTOM', { userId: user.id, email: email.substring(0, 3) + '***@***' })
      return { success: true, user, session }
    } catch (error) {
      logger.error('Erro inesperado no login', 'AUTH_CUSTOM', { error: (error as Error).message })
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Criar sessão para usuário
  private async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<UserSession> {
    console.log('🔧 [AUTH_CUSTOM] Criando sessão para userId:', userId)
    const sessionToken = this.generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

    console.log('🔧 [AUTH_CUSTOM] Token gerado:', sessionToken.substring(0, 10) + '...')

    const { data: session, error } = await this.supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        login_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.log('❌ [AUTH_CUSTOM] Erro ao criar sessão:', error.message)
      throw new Error('Erro ao criar sessão: ' + error.message)
    }

    console.log('✅ [AUTH_CUSTOM] Sessão criada com sucesso:', session.id)
    return session
  }

  // Verificar sessão válida
  async verifySession(sessionToken: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data: session, error: sessionError } = await this.supabase
        .from('user_sessions')
        .select(`
          *,
          users (*)
        `)
        .eq('session_token', sessionToken)
        .single()

      if (sessionError || !session) {
        return { success: false, error: 'Sessão inválida' }
      }

      // Verificar se sessão não expirou
      if (new Date() > new Date(session.expires_at)) {
        // Deletar sessão expirada
        await this.supabase
          .from('user_sessions')
          .delete()
          .eq('id', session.id)
        
        return { success: false, error: 'Sessão expirada' }
      }

      return { success: true, user: session.users }
    } catch (error) {
      logger.error('Erro ao verificar sessão', 'AUTH_CUSTOM', { error: (error as Error).message })
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Fazer logout (deletar sessão)
  async signOut(sessionToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) {
        logger.error('Erro ao fazer logout', 'AUTH_CUSTOM', { error: error.message })
        return { success: false, error: 'Erro ao fazer logout' }
      }

      logger.info('Logout realizado com sucesso', 'AUTH_CUSTOM')
      return { success: true }
    } catch (error) {
      logger.error('Erro inesperado no logout', 'AUTH_CUSTOM', { error: (error as Error).message })
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Solicitar redefinição de senha
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Buscar usuário
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !user) {
        // Por segurança, não revelar se email existe ou não
        return { success: true }
      }

      // Gerar token de redefinição
      const token = this.generateResetToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // 1 hora

      // Salvar token
      await this.supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token: token,
          expires_at: expiresAt.toISOString()
        })

      // TODO: Enviar email com token
      console.log(`Token de redefinição para ${email}: ${token}`)

      return { success: true }
    } catch (error) {
      logger.error('Erro ao solicitar redefinição de senha', 'AUTH_CUSTOM', { error: (error as Error).message })
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Redefinir senha com token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Buscar token válido
      const { data: resetToken, error: tokenError } = await this.supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .single()

      if (tokenError || !resetToken) {
        return { success: false, error: 'Token inválido' }
      }

      // Verificar se token não expirou
      if (new Date() > new Date(resetToken.expires_at)) {
        return { success: false, error: 'Token expirado' }
      }

      // Criptografar nova senha
      const passwordHash = await bcrypt.hash(newPassword, 10)

      // Atualizar senha
      const { error: updateError } = await this.supabase
        .from('users')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', resetToken.user_id)

      if (updateError) {
        return { success: false, error: 'Erro ao atualizar senha' }
      }

      // Deletar token usado
      await this.supabase
        .from('password_reset_tokens')
        .delete()
        .eq('id', resetToken.id)

      return { success: true }
    } catch (error) {
      logger.error('Erro ao redefinir senha', 'AUTH_CUSTOM', { error: (error as Error).message })
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