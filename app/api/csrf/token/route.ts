import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/csrf-protection'
import { addCSRFTokenToResponse } from '@/lib/csrf-middleware'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    logger.info('Solicitação de token CSRF', 'CSRF', { 
      userId: userId?.substring(0, 8) + '...' 
    })

    // Gerar novo token CSRF
    const token = generateCSRFToken(userId)

    // Criar resposta
    const response = NextResponse.json({
      success: true,
      token,
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutos
    })

    // Adicionar token ao cookie
    return addCSRFTokenToResponse(response, token)

  } catch (error) {
    logger.error('Erro ao gerar token CSRF', 'CSRF', { 
      error: (error as Error).message 
    })
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
