'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/auth-context-supabase'
import { logger } from '@/lib/logger'

interface CSRFToken {
  token: string
  expiresAt: number
}

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Gerar novo token CSRF
  const generateToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/csrf/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao gerar token CSRF')
      }

      const data = await response.json()
      
      if (data.success) {
        setCsrfToken(data.token)
        logger.debug('Token CSRF gerado com sucesso', 'CSRF', { 
          userId: user?.id?.substring(0, 8) + '...' 
        })
      } else {
        throw new Error(data.error || 'Erro ao gerar token')
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      setError(errorMessage)
      logger.error('Erro ao gerar token CSRF', 'CSRF', { 
        error: errorMessage,
        userId: user?.id?.substring(0, 8) + '...'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Validar token CSRF
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/csrf/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token
        },
        body: JSON.stringify({
          token,
          userId: user?.id
        })
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.success && data.valid
    } catch (error) {
      logger.error('Erro ao validar token CSRF', 'CSRF', { 
        error: (error as Error).message,
        userId: user?.id?.substring(0, 8) + '...'
      })
      return false
    }
  }, [user?.id])

  // Fazer requisição protegida por CSRF
  const protectedRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!csrfToken) {
      throw new Error('Token CSRF não disponível')
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    // Se receber 403, tentar gerar novo token
    if (response.status === 403) {
      logger.warn('Token CSRF inválido, gerando novo', 'CSRF', { 
        userId: user?.id?.substring(0, 8) + '...' 
      })
      await generateToken()
      throw new Error('Token CSRF inválido, tente novamente')
    }

    return response
  }, [csrfToken, generateToken, user?.id])

  // Gerar token automaticamente quando o usuário fizer login
  useEffect(() => {
    if (user && !csrfToken) {
      generateToken()
    }
  }, [user, csrfToken, generateToken])

  // Limpar token quando o usuário fizer logout
  useEffect(() => {
    if (!user && csrfToken) {
      setCsrfToken(null)
      setError(null)
    }
  }, [user, csrfToken])

  return {
    csrfToken,
    isLoading,
    error,
    generateToken,
    validateToken,
    protectedRequest,
    isReady: !!csrfToken
  }
}
