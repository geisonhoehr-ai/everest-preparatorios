import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // DESABILITADO TEMPORARIAMENTE PARA TESTAR LOGIN
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
    console.log('🔍 [MIDDLEWARE] Verificando rota:', pathname, 'Usuário logado:', !!session)

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = [
      '/',
      '/login',
      '/forgot-password',
      '/access-denied'
    ]

    // Rotas que precisam de autenticação
    const protectedRoutes = [
      '/dashboard',
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
      '/profile',
      '/ranking'
    ]

    // Se está em uma rota pública, permitir acesso
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      console.log('✅ [MIDDLEWARE] Rota pública, permitindo acesso')
      return res
    }

    // Se não está logado e tenta acessar rota protegida, redirecionar para login
    if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
      console.log('🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando para login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Se está logado, verificar role e aplicar redirecionamentos específicos
    if (session) {
      try {
        // Buscar role do usuário na tabela user_roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_uuid', session.user.id)
          .single()

        let userRole: string = 'student' // Declarar fora do bloco if/else
        
        if (roleError) {
          console.warn('⚠️ [MIDDLEWARE] Erro ao buscar role:', roleError)
          // Se não conseguir buscar role, assume student
          userRole = 'student'
        } else {
          userRole = roleData?.role || 'student'
        }

        console.log('👤 [MIDDLEWARE] Role detectado:', userRole, 'para usuário:', session.user.email)

        // Se está logado e tenta acessar páginas de login, redirecionar para dashboard
        if (pathname.startsWith('/login')) {
          console.log('✅ [MIDDLEWARE] Usuário já logado, redirecionando para dashboard')
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Redirecionar professores de /teacher para /dashboard (se ainda existir)
        if (pathname.startsWith('/teacher')) {
          console.log('👨‍🏫 [MIDDLEWARE] Professor acessando /teacher, redirecionando para /dashboard')
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Verificar acesso a rotas específicas baseado no role
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
          console.log('🚫 [MIDDLEWARE] Acesso negado ao admin para role:', userRole)
          return NextResponse.redirect(new URL('/access-denied', req.url))
        }

        // Permitir acesso para todas as outras rotas protegidas
        console.log('✅ [MIDDLEWARE] Acesso permitido para role:', userRole)
        return res

      } catch (roleError) {
        console.error('❌ [MIDDLEWARE] Erro ao verificar role:', roleError)
        // Em caso de erro, permitir acesso para não bloquear o usuário
        return res
      }
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