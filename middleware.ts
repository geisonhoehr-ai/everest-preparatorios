import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Por enquanto, vamos permitir acesso a todas as rotas
  // Isso evita o loop de redirecionamento
  
  console.log('Middleware - Path:', request.nextUrl.pathname);
  
  // Lista de rotas que definitivamente são públicas
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/clear-cookies',
    '/api',
    '/_next',
    '/public',
    '/favicon.ico',
    '/.well-known'
  ];
  
  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Por enquanto, permite acesso a todas as rotas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 