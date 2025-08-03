import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas públicas
  const publicRoutes = ['/login-simple', '/signup', '/']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Se não está logado e não é rota pública, redirecionar para login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login-simple', req.url))
  }

  // Se está logado e está em rota de login, redirecionar para dashboard
  if (session && req.nextUrl.pathname === '/login-simple') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Proteger rotas de admin/teacher
  const protectedRoutes = ['/membros', '/turmas']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (session && isProtectedRoute) {
    // Verificar role do usuário
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', session.user.id)
      .single()

    const userRole = roleData?.role || 'student'

    // Apenas teachers e admins podem acessar
    if (userRole !== 'teacher' && userRole !== 'admin') {
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