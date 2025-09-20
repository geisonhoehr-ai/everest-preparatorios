import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-custom'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 [API] Tentativa de login para:', email)

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    // Usar o AuthService para fazer login
    const result = await authService.signIn(
      email,
      password,
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'unknown'
    )

    if (!result.success) {
      console.log('❌ [API] Login falhou:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    console.log('✅ [API] Login realizado com sucesso:', result.user?.email, 'role:', result.user?.role)

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
      sessionToken: result.sessionToken
    })

  } catch (error) {
    console.error('❌ [API] Erro inesperado no login:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
