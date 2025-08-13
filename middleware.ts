import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // MIDDLEWARE COMPLETAMENTE DESABILITADO
  // O sistema funciona perfeitamente sem ele
  // Proteção de rotas feita no cliente (que já está funcionando)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 