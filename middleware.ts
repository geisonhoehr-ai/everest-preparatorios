import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function middleware(request: NextRequest) {
  try {
    // Rotas que não precisam de autenticação
    const publicRoutes = ['/login', '/', '/api', '/reset-password', '/_next', '/favicon.ico']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
    
    // Se é rota pública, permitir acesso
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // Verificar se há sessão do Supabase
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ [MIDDLEWARE] Erro ao verificar sessão:', error.message)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (!session?.user) {
      console.log('👤 [MIDDLEWARE] Nenhuma sessão encontrada, redirecionando para login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Se está logado e está na página de login, redirecionar para dashboard
    if (request.nextUrl.pathname === '/login') {
      console.log('✅ [MIDDLEWARE] Usuário logado, redirecionando para dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    console.log('✅ [MIDDLEWARE] Sessão válida, permitindo acesso')
    return NextResponse.next()
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro no middleware:', error)
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
