import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { csrfMiddleware } from '@/lib/csrf-middleware'

export async function middleware(request: NextRequest) {
  try {
    // Aplicar proteção CSRF primeiro
    const csrfResponse = await csrfMiddleware(request)
    if (csrfResponse) {
      return csrfResponse
    }

    // Rotas que não precisam de autenticação
    const publicRoutes = ['/login', '/', '/api', '/reset-password']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
    
    // Se é rota pública, permitir acesso
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // Verificar token de sessão nos cookies
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verificar se a sessão é válida
    const supabase = await createClient()
    
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (*)
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !session || !session.users?.is_active) {
      // Sessão inválida, redirecionar para login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session_token')
      return response
    }
    
    // Se está logado e está na página de login, redirecionar para dashboard
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Erro no middleware:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
