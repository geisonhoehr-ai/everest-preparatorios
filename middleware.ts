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
    
    // Para rotas protegidas, apenas permitir acesso
    // A autenticação será verificada pelo AuthContext no frontend
    console.log('✅ [MIDDLEWARE] Permitindo acesso à rota protegida:', request.nextUrl.pathname)
    return NextResponse.next()
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro no middleware:', error)
    return NextResponse.next() // Não redirecionar, deixar o AuthContext lidar
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
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
