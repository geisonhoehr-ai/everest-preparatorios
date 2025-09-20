import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/role-permissions'

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

    // Buscar o role do usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !user) {
      console.error('Erro ao buscar usuário:', error)
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissão baseada no role
    const hasAccess = hasPermission(user.role as any, pageName)

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
