import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()

  console.log('🔍 [MIDDLEWARE] Verificando rota:', req.nextUrl.pathname)
  console.log('🔍 [MIDDLEWARE] Sessão encontrada:', !!session)
  if (session) {
    console.log('👤 [MIDDLEWARE] Usuário:', session.user.email)
  }

  // Rotas públicas
  const publicRoutes = ['/login', '/login-simple', '/signup', '/signup-simple', '/', '/test-session']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Se não está logado e não é rota pública, redirecionar para login
  if (!session && !isPublicRoute) {
    console.log('🚫 [MIDDLEWARE] Não logado, redirecionando para login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se está logado e está em rota de login/signup, redirecionar para dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/login-simple' || req.nextUrl.pathname === '/signup' || req.nextUrl.pathname === '/signup-simple')) {
    console.log('✅ [MIDDLEWARE] Logado, redirecionando para dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Proteger rotas de admin/teacher (apenas se logado)
  const protectedRoutes = ['/membros', '/turmas']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (session && isProtectedRoute) {
    console.log('🔒 [MIDDLEWARE] Verificando acesso a rota protegida')
    
    // Verificar role do usuário
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', session.user.email)
      .single()

    const userRole = roleData?.role || 'student'
    console.log('👤 [MIDDLEWARE] Role do usuário:', userRole)

    // Apenas teachers e admins podem acessar
    if (userRole !== 'teacher' && userRole !== 'admin') {
      console.log('❌ [MIDDLEWARE] Acesso negado, redirecionando')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 