import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken } from '@/lib/csrf-protection'
import { getCSRFTokenFromRequest } from '@/lib/csrf-middleware'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body

    // Obter token da requisição se não fornecido no body
    const csrfToken = token || getCSRFTokenFromRequest(request)

    if (!csrfToken) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Token CSRF não fornecido'
      }, { status: 400 })
    }

    // Validar token
    const isValid = validateCSRFToken(csrfToken, userId)

    logger.debug('Validação de token CSRF', 'CSRF', {
      valid: isValid,
      userId: userId?.substring(0, 8) + '...'
    })

    return NextResponse.json({
      success: true,
      valid: isValid
    })

  } catch (error) {
    logger.error('Erro ao validar token CSRF', 'CSRF', { 
      error: (error as Error).message 
    })
    
    return NextResponse.json(
      { success: false, valid: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
