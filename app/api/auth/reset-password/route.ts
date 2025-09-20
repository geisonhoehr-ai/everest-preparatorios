import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-custom'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    console.log('🔐 [API] Redefinição de senha com token:', token?.substring(0, 10) + '...')

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: 'Token e nova senha são obrigatórios' }, { status: 400 })
    }

    // Validar força da senha
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Usar o AuthService para redefinir senha
    const result = await authService.resetPassword(token, newPassword)

    if (!result.success) {
      console.log('❌ [API] Erro ao redefinir senha:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    console.log('✅ [API] Senha redefinida com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso. Você pode fazer login com sua nova senha.'
    })

  } catch (error) {
    console.error('❌ [API] Erro inesperado na redefinição de senha:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
