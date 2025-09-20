import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-custom'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log('🔐 [API] Solicitação de redefinição de senha para:', email)

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email é obrigatório' }, { status: 400 })
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Formato de email inválido' }, { status: 400 })
    }

    // Usar o AuthService para solicitar redefinição
    const result = await authService.requestPasswordReset(email)

    if (!result.success) {
      console.log('❌ [API] Erro ao solicitar redefinição:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    console.log('✅ [API] Solicitação de redefinição processada com sucesso')

    // Por segurança, sempre retornar sucesso, mesmo se o email não existir
    return NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
    })

  } catch (error) {
    console.error('❌ [API] Erro inesperado na solicitação de redefinição:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
