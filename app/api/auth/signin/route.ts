import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 [API] Tentativa de login para:', email)

    // 1. Buscar usuário por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.log('❌ [API] Usuário não encontrado:', userError?.message)
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
    }

    console.log('✅ [API] Usuário encontrado:', user.email)

    // 2. Verificar se conta está ativa
    if (!user.is_active) {
      console.log('❌ [API] Conta inativa')
      return NextResponse.json({ success: false, error: 'Conta desativada. Entre em contato com o administrador.' }, { status: 401 })
    }

    // 3. Verificar senha
    console.log('🔑 [API] Verificando senha...')
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log('🔑 [API] Senha válida:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ [API] Senha incorreta')
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
    }

    // 4. Atualizar last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    // 5. Criar sessão
    console.log('🔄 [API] Criando sessão...')
    const sessionToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || 'unknown',
        login_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      console.log('❌ [API] Erro ao criar sessão:', sessionError.message)
      return NextResponse.json({ success: false, error: 'Erro ao criar sessão' }, { status: 500 })
    }

    console.log('✅ [API] Login realizado com sucesso:', user.email)

    // Remover password_hash antes de retornar
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      session,
      sessionToken
    })

  } catch (error) {
    console.error('❌ [API] Erro inesperado no login:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
