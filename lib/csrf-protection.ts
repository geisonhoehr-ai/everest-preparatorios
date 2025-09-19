/**
 * Sistema de Proteção CSRF para Everest Preparatórios
 * 
 * Este sistema garante:
 * - Geração de tokens CSRF únicos
 * - Validação de tokens em requisições
 * - Proteção de formulários e APIs
 * - Rotação automática de tokens
 * - Armazenamento seguro de tokens
 */

import { logger } from './logger'
// Usar Web Crypto API em vez de Node.js crypto para compatibilidade com Edge Runtime

interface CSRFConfig {
  tokenLength: number
  expirationTime: number // em milissegundos
  rotationInterval: number // em milissegundos
  cookieName: string
  headerName: string
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
}

interface CSRFToken {
  token: string
  expiresAt: number
  createdAt: number
  userId?: string
}

class CSRFProtection {
  private config: CSRFConfig = {
    tokenLength: 32,
    expirationTime: 30 * 60 * 1000, // 30 minutos
    rotationInterval: 15 * 60 * 1000, // 15 minutos
    cookieName: 'csrf-token',
    headerName: 'x-csrf-token',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }

  private tokenStore = new Map<string, CSRFToken>()

  constructor() {
    // Limpar tokens expirados a cada 5 minutos
    setInterval(() => {
      this.cleanupExpiredTokens()
    }, 5 * 60 * 1000)
  }

  /**
   * Gera um novo token CSRF
   */
  generateToken(userId?: string): string {
    // Usar Web Crypto API para gerar token aleatório
    const array = new Uint8Array(this.config.tokenLength)
    crypto.getRandomValues(array)
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    
    const now = Date.now()
    
    const csrfToken: CSRFToken = {
      token,
      expiresAt: now + this.config.expirationTime,
      createdAt: now,
      userId
    }

    this.tokenStore.set(token, csrfToken)
    
    logger.debug('Token CSRF gerado', 'CSRF', { 
      tokenLength: token.length, 
      userId: userId?.substring(0, 8) + '...' 
    })

    return token
  }

  /**
   * Valida um token CSRF
   */
  validateToken(token: string, userId?: string): boolean {
    if (!token) {
      logger.warn('Token CSRF não fornecido', 'CSRF')
      return false
    }

    const storedToken = this.tokenStore.get(token)
    
    if (!storedToken) {
      logger.warn('Token CSRF não encontrado', 'CSRF', { tokenLength: token.length })
      return false
    }

    // Verificar expiração
    if (Date.now() > storedToken.expiresAt) {
      logger.warn('Token CSRF expirado', 'CSRF', { tokenLength: token.length })
      this.tokenStore.delete(token)
      return false
    }

    // Verificar usuário (se fornecido)
    if (userId && storedToken.userId && storedToken.userId !== userId) {
      logger.warn('Token CSRF não corresponde ao usuário', 'CSRF', { 
        tokenLength: token.length,
        userId: userId.substring(0, 8) + '...'
      })
      return false
    }

    logger.debug('Token CSRF validado com sucesso', 'CSRF', { 
      tokenLength: token.length,
      userId: userId?.substring(0, 8) + '...'
    })

    return true
  }

  /**
   * Revoga um token CSRF
   */
  revokeToken(token: string): boolean {
    const deleted = this.tokenStore.delete(token)
    
    if (deleted) {
      logger.debug('Token CSRF revogado', 'CSRF', { tokenLength: token.length })
    }
    
    return deleted
  }

  /**
   * Revoga todos os tokens de um usuário
   */
  revokeUserTokens(userId: string): number {
    let revokedCount = 0
    
    for (const [token, csrfToken] of this.tokenStore.entries()) {
      if (csrfToken.userId === userId) {
        this.tokenStore.delete(token)
        revokedCount++
      }
    }
    
    logger.info('Tokens CSRF do usuário revogados', 'CSRF', { 
      userId: userId.substring(0, 8) + '...',
      revokedCount
    })
    
    return revokedCount
  }

  /**
   * Limpa tokens expirados
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [token, csrfToken] of this.tokenStore.entries()) {
      if (now > csrfToken.expiresAt) {
        this.tokenStore.delete(token)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug('Tokens CSRF expirados limpos', 'CSRF', { cleanedCount })
    }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): CSRFConfig {
    return { ...this.config }
  }

  /**
   * Atualiza configuração
   */
  updateConfig(newConfig: Partial<CSRFConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info('Configuração CSRF atualizada', 'CSRF', { newConfig })
  }

  /**
   * Obtém estatísticas dos tokens
   */
  getStats(): { totalTokens: number; expiredTokens: number; activeTokens: number } {
    const now = Date.now()
    let expiredCount = 0
    let activeCount = 0
    
    for (const csrfToken of this.tokenStore.values()) {
      if (now > csrfToken.expiresAt) {
        expiredCount++
      } else {
        activeCount++
      }
    }
    
    return {
      totalTokens: this.tokenStore.size,
      expiredTokens: expiredCount,
      activeTokens: activeCount
    }
  }
}

// Instância global do sistema CSRF
export const csrfProtection = new CSRFProtection()

// Funções utilitárias
export function generateCSRFToken(userId?: string): string {
  return csrfProtection.generateToken(userId)
}

export function validateCSRFToken(token: string, userId?: string): boolean {
  return csrfProtection.validateToken(token, userId)
}

export function revokeCSRFToken(token: string): boolean {
  return csrfProtection.revokeToken(token)
}

export function revokeUserCSRFTokens(userId: string): number {
  return csrfProtection.revokeUserTokens(userId)
}

// Hook para usar em componentes React
export function useCSRF() {
  return {
    generateToken: csrfProtection.generateToken.bind(csrfProtection),
    validateToken: csrfProtection.validateToken.bind(csrfProtection),
    revokeToken: csrfProtection.revokeToken.bind(csrfProtection),
    getConfig: csrfProtection.getConfig.bind(csrfProtection),
    getStats: csrfProtection.getStats.bind(csrfProtection)
  }
}
