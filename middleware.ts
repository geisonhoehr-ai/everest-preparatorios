import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log('🔍 [MIDDLEWARE] Rota:', req.nextUrl.pathname, 'Sessão:', !!session)

  // Rotas públicas
  const publicRoutes = ['/login-simple', '/signup-simple', '/', '/test-session']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Se não está logado e não é rota pública, redirecionar para login
  if (!session && !isPublicRoute) {
    console.log('🚫 [MIDDLEWARE] Não logado, redirecionando para login')
    return NextResponse.redirect(new URL('/login-simple', req.url))
  }

  // Se está logado e está em rota de login/signup, redirecionar para dashboard
  if (session && (req.nextUrl.pathname === '/login-simple' || req.nextUrl.pathname === '/signup-simple')) {
    console.log('✅ [MIDDLEWARE] Logado, redirecionando para dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  console.log('✅ [MIDDLEWARE] Acesso permitido')
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 