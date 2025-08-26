import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    
    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/', '/login', '/api'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    // Redirecionar a raiz do dashboard para a página específica do role
    if (pathname === '/dashboard') {
      console.log('🔄 [MIDDLEWARE] Redirecionando /dashboard para página específica do role');
      
      // Criar cliente Supabase para middleware
      const supabase = createClient(req);
      
      // Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando para login');
        return NextResponse.redirect(new URL('/login', req.url));
      }
      
      // Verificar se o usuário tem role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', session.user.id)
        .single();

      if (!roleData?.role) {
        console.log('⚠️ [MIDDLEWARE] Usuário sem role, redirecionando para login');
        return NextResponse.redirect(new URL('/login', req.url));
      }

      let redirectUrl = '/dashboard/admin'; // padrão
      
      if (roleData.role === 'student') {
        redirectUrl = '/dashboard/aluno';
      } else if (roleData.role === 'teacher') {
        redirectUrl = '/dashboard/professor';
      }
      
      console.log('🔄 [MIDDLEWARE] Redirecionando para:', redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Criar cliente Supabase para middleware
    const supabase = createClient(req);
    
    // Verificar sessão
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando para login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Verificar se o usuário tem role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', session.user.id)
      .single();

    if (!roleData?.role) {
      console.log('⚠️ [MIDDLEWARE] Usuário sem role, redirecionando para login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Permitir acesso baseado no role
    console.log('✅ [MIDDLEWARE] Usuário autenticado com role:', roleData.role);
    return NextResponse.next();

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro:', error);
    // Em caso de erro, permitir acesso (fail-safe)
    return NextResponse.next();
  }
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
}; 