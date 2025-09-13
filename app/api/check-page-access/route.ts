import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId, pageName } = await request.json()

    if (!userId || !pageName) {
      return NextResponse.json(
        { error: 'userId e pageName são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar se o usuário tem permissão específica para a página
    const { data: permission, error } = await supabase
      .from('page_permissions')
      .select('has_access, expires_at')
      .eq('user_id', userId)
      .eq('page_name', pageName)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao verificar permissão:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Se não há permissão específica, negar acesso
    if (!permission) {
      return NextResponse.json({ hasAccess: false })
    }

    // Verificar se a permissão não expirou
    if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
      return NextResponse.json({ hasAccess: false })
    }

    return NextResponse.json({ hasAccess: permission.has_access })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
