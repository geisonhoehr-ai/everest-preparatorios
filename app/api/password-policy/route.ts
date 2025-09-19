import { NextRequest, NextResponse } from 'next/server'
import { passwordPolicy } from '@/lib/password-policy'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const password = searchParams.get('password')
    const userId = searchParams.get('userId')

    logger.info('Requisição de política de senha recebida', 'API', { action, userId: userId?.substring(0, 8) + '...' })

    switch (action) {
      case 'validate':
        if (!password) {
          return NextResponse.json({ success: false, error: 'Senha é obrigatória' }, { status: 400 })
        }
        const validation = passwordPolicy.validatePassword(password, userId || undefined)
        return NextResponse.json({ success: true, validation })

      case 'policy':
        const policy = passwordPolicy.getPolicy()
        return NextResponse.json({ success: true, policy })

      case 'suggestions':
        const suggestions = passwordPolicy.generatePasswordSuggestions()
        return NextResponse.json({ success: true, suggestions })

      default:
        return NextResponse.json({ success: false, error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Erro na API de política de senha', 'API', { error: (error as Error).message })
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, password, userId, newPolicy } = body

    logger.info('Requisição POST de política de senha recebida', 'API', { action, userId: userId?.substring(0, 8) + '...' })

    switch (action) {
      case 'validate':
        if (!password) {
          return NextResponse.json({ success: false, error: 'Senha é obrigatória' }, { status: 400 })
        }
        const validation = passwordPolicy.validatePassword(password, userId)
        return NextResponse.json({ success: true, validation })

      case 'update-policy':
        if (!newPolicy) {
          return NextResponse.json({ success: false, error: 'Nova política é obrigatória' }, { status: 400 })
        }
        passwordPolicy.updatePolicy(newPolicy)
        return NextResponse.json({ success: true, message: 'Política atualizada com sucesso' })

      default:
        return NextResponse.json({ success: false, error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Erro na API de política de senha', 'API', { error: (error as Error).message })
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
