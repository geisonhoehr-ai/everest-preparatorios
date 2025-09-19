/**
 * Middleware CSRF para Next.js
 * 
 * Este middleware protege rotas contra ataques CSRF
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken, generateCSRFToken } from './csrf-protection'
import { logger } from './logger'

interface CSRFMiddlewareOptions {
  protectedPaths: string[]
  excludedPaths: string[]
  methods: string[]
}

const defaultOptions: CSRFMiddlewareOptions = {
  protectedPaths: ['/api'],
  excludedPaths: ['/api/auth', '/api/health'],
  methods: ['POST', 'PUT', 'PATCH', 'DELETE']
}

export function createCSRFMiddleware(options: Partial<CSRFMiddlewareOptions> = {}) {
  const config = { ...defaultOptions, ...options }

  return async function csrfMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Verificar se a rota precisa de proteção CSRF
    if (!shouldProtectRoute(pathname, method, config)) {
      return NextResponse.next()
    }

    try {
      // Obter token CSRF do header ou cookie
      const csrfToken = request.headers.get('x-csrf-token') || 
                       request.cookies.get('csrf-token')?.value

      // Obter ID do usuário (se disponível)
      const userId = request.headers.get('x-user-id')

      // Validar token CSRF
      if (!csrfToken || !validateCSRFToken(csrfToken, userId || undefined)) {
        logger.warn('Tentativa de requisição sem token CSRF válido', 'CSRF', {
          path: pathname,
          method,
          userId: userId?.substring(0, 8) + '...'
        })

        return NextResponse.json(
          { error: 'Token CSRF inválido ou ausente' },
          { status: 403 }
        )
      }

      logger.debug('Requisição CSRF validada com sucesso', 'CSRF', {
        path: pathname,
        method,
        userId: userId?.substring(0, 8) + '...'
      })

      return NextResponse.next()

    } catch (error) {
      logger.error('Erro no middleware CSRF', 'CSRF', {
        error: (error as Error).message,
        path: pathname,
        method
      })

      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

function shouldProtectRoute(
  pathname: string, 
  method: string, 
  config: CSRFMiddlewareOptions
): boolean {
  // Verificar se o método precisa de proteção
  if (!config.methods.includes(method)) {
    return false
  }

  // Verificar se a rota está na lista de exclusões
  for (const excludedPath of config.excludedPaths) {
    if (pathname.startsWith(excludedPath)) {
      return false
    }
  }

  // Verificar se a rota está na lista de proteção
  for (const protectedPath of config.protectedPaths) {
    if (pathname.startsWith(protectedPath)) {
      return true
    }
  }

  return false
}

// Middleware CSRF padrão
export const csrfMiddleware = createCSRFMiddleware()

// Função para adicionar token CSRF à resposta
export function addCSRFTokenToResponse(
  response: NextResponse, 
  token: string, 
  options: { secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' } = {}
): NextResponse {
  const { secure = process.env.NODE_ENV === 'production', sameSite = 'strict' } = options

  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Permitir acesso via JavaScript
    secure,
    sameSite,
    maxAge: 30 * 60, // 30 minutos
    path: '/'
  })

  return response
}

// Função para obter token CSRF da requisição
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-csrf-token') || 
         request.cookies.get('csrf-token')?.value || 
         null
}
