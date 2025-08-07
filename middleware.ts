import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // DESABILITADO - APENAS LOG BÁSICO PARA MONITORAMENTO
  console.log('🔍 [MIDDLEWARE] Rota acessada:', req.nextUrl.pathname)
  
  // Permitir acesso a todas as rotas - verificação será feita no lado do cliente
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 