import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-custom'

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    console.log('🚪 [API] Logout para token:', sessionToken?.substring(0, 10) + '...')

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Token de sessão é obrigatório' }, { status: 400 })
    }

    // Usar o AuthService para fazer logout
    const result = await authService.signOut(sessionToken)

    if (!result.success) {
      console.log('❌ [API] Erro ao fazer logout:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    console.log('✅ [API] Logout realizado com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })

  } catch (error) {
    console.error('❌ [API] Erro inesperado no logout:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
