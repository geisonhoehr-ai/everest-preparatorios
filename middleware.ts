import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // DESABILITADO TEMPORARIAMENTE PARA PERMITIR LOGIN
  console.log('⚠️ [MIDDLEWARE] Desabilitado temporariamente - permitindo acesso livre')
  return NextResponse.next()

  // CÓDIGO ORIGINAL COMENTADO - REABILITAR DEPOIS QUE LOGIN ESTIVER ESTÁVEL
  /*
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Verificar sessão
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('⚠️ [MIDDLEWARE] Erro ao verificar sessão:', error)
    }

    const { pathname } = req.nextUrl

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = [
      '/login',
      '/login-simple',
      '/signup',
      '/signup-simple',
      '/test-login',
      '/access-denied'
    ]

    // Rotas que precisam de autenticação
    const protectedRoutes = [
      '/dashboard',
      '/teacher',
      '/admin',
      '/flashcards',
      '/my-flashcards',
      '/quiz',
      '/provas',
      '/redacao',
      '/livros',
      '/membros',
      '/turmas',
      '/community',
      '/calendario',
      '/suporte',
      '/settings',
      '/profile'
    ]

    // Se está em uma rota pública, permitir acesso
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return res
    }

    // Se não está logado e tenta acessar rota protegida, redirecionar para login
    if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
      console.log('🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando para login')
      return NextResponse.redirect(new URL('/login-simple', req.url))
    }

    // Se está logado e tenta acessar páginas de login/signup, redirecionar para dashboard
    if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      console.log('✅ [MIDDLEWARE] Usuário já logado, redirecionando para dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Para todas as outras rotas, permitir acesso
    return res

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro inesperado:', error)
    // Em caso de erro, permitir acesso para não bloquear o usuário
    return res
  }
  */
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 