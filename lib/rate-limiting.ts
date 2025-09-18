'use client'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requisições por janela
  keyGenerator?: (request: any) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private config: RateLimitConfig
  private store = new Map<string, RateLimitEntry>()

  constructor(config: RateLimitConfig) {
    this.config = config
    this.cleanup()
  }

  private cleanup() {
    // Limpar entradas expiradas a cada minuto
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  private generateKey(request: any): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request)
    }
    
    // Chave padrão baseada no IP e user agent
    const ip = request.ip || 'unknown'
    const userAgent = request.userAgent || 'unknown'
    return `${ip}:${userAgent}`
  }

  isAllowed(request: any): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.generateKey(request)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let entry = this.store.get(key)

    // Se não existe entrada ou a janela expirou, criar nova
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      }
    }

    // Incrementar contador
    entry.count++
    this.store.set(key, entry)

    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const allowed = entry.count <= this.config.maxRequests

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    }
  }

  getRemaining(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return this.config.maxRequests
    
    const now = Date.now()
    if (now > entry.resetTime) return this.config.maxRequests
    
    return Math.max(0, this.config.maxRequests - entry.count)
  }

  getResetTime(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return Date.now() + this.config.windowMs
    
    return entry.resetTime
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  resetAll(): void {
    this.store.clear()
  }
}

// Instâncias de rate limiter para diferentes endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // 100 requisições por 15 minutos
  keyGenerator: (request) => {
    const ip = request.ip || 'unknown'
    const userId = request.userId || 'anonymous'
    return `${ip}:${userId}`
  }
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // 5 tentativas de login por 15 minutos
  keyGenerator: (request) => {
    const ip = request.ip || 'unknown'
    const email = request.email || 'unknown'
    return `${ip}:${email}`
  }
})

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 10, // 10 uploads por hora
  keyGenerator: (request) => {
    const ip = request.ip || 'unknown'
    const userId = request.userId || 'anonymous'
    return `${ip}:${userId}`
  }
})

export const analyticsRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 60, // 60 eventos por minuto
  keyGenerator: (request) => {
    const ip = request.ip || 'unknown'
    const sessionId = request.sessionId || 'unknown'
    return `${ip}:${sessionId}`
  }
})

// Hook para usar rate limiting
export function useRateLimit() {
  const checkRateLimit = (limiter: RateLimiter, request: any) => {
    return limiter.isAllowed(request)
  }

  const getRemaining = (limiter: RateLimiter, key: string) => {
    return limiter.getRemaining(key)
  }

  const getResetTime = (limiter: RateLimiter, key: string) => {
    return limiter.getResetTime(key)
  }

  const reset = (limiter: RateLimiter, key: string) => {
    limiter.reset(key)
  }

  return {
    checkRateLimit,
    getRemaining,
    getResetTime,
    reset,
    limiters: {
      api: apiRateLimiter,
      auth: authRateLimiter,
      upload: uploadRateLimiter,
      analytics: analyticsRateLimiter
    }
  }
}

// Middleware para rate limiting
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return (request: any) => {
    const result = limiter.isAllowed(request)
    
    if (!result.allowed) {
      throw new Error('Rate limit exceeded')
    }
    
    return result
  }
}

// Utilitários para rate limiting
export const rateLimitUtils = {
  // Calcular tempo até reset
  getTimeUntilReset(resetTime: number): number {
    return Math.max(0, resetTime - Date.now())
  },

  // Formatar tempo até reset
  formatTimeUntilReset(resetTime: number): string {
    const timeUntilReset = this.getTimeUntilReset(resetTime)
    const minutes = Math.floor(timeUntilReset / 60000)
    const seconds = Math.floor((timeUntilReset % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  },

  // Verificar se deve mostrar aviso de rate limit
  shouldShowWarning(remaining: number, maxRequests: number): boolean {
    const threshold = Math.floor(maxRequests * 0.1) // 10% do limite
    return remaining <= threshold
  },

  // Gerar mensagem de rate limit
  getRateLimitMessage(remaining: number, resetTime: number): string {
    if (remaining === 0) {
      const timeUntilReset = this.formatTimeUntilReset(resetTime)
      return `Rate limit exceeded. Try again in ${timeUntilReset}.`
    }
    
    if (this.shouldShowWarning(remaining, 100)) {
      return `Warning: Only ${remaining} requests remaining.`
    }
    
    return ''
  }
}
