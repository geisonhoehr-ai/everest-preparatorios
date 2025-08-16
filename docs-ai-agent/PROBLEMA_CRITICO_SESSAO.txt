# 🚨 PROBLEMA CRÍTICO: SESSÃO NÃO PERSISTENTE - EVEREST PREPARATÓRIOS

## 📋 **RESUMO DO PROBLEMA:**

O middleware está mostrando "Sessão: false" em todas as rotas, mesmo quando o usuário está logado. Isso está causando:
- Menu admin não aparecendo para professores
- Perfil não persistente entre navegações
- Erro de cookie: "Failed to parse cookie string"

## 🔍 **EVIDÊNCIAS DOS LOGS:**

```
🔍 [MIDDLEWARE] Rota: /membros Sessão: false
Failed to parse cookie string: SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON
```

## ✅ **TESTE PROGRAMÁTICO FUNCIONA:**

```
🧪 [TEST_PERSISTENT] Testando perfil persistente...
🔐 [TEST_PERSISTENT] Fazendo login...
✅ [TEST_PERSISTENT] Login bem-sucedido!
👤 [TEST_PERSISTENT] Usuário: professor@teste.com
🔑 [TEST_PERSISTENT] Sessão ativa: true
✅ [TEST_PERSISTENT] Role: teacher
🔄 [TEST_PERSISTENT] Simulando persistência...
🔑 [TEST_PERSISTENT] Sessão persistente: true
✅ [TEST_PERSISTENT] Sessão mantida!
```

## 🚨 **PROBLEMA NO FRONTEND:**

- Sessão sempre false no middleware
- Menu admin não aparece para professores
- Perfil mostra "Estudante" para professores

## 📁 **ARQUIVOS AFETADOS:**

### **1. middleware.ts (ATUAL - COM PROBLEMA):**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log('🔍 [MIDDLEWARE] Rota:', req.nextUrl.pathname, 'Sessão:', !!session)

  // Rotas públicas (permitir acesso sem login)
  const publicRoutes = [
    '/login-simple', 
    '/signup-simple', 
    '/', 
    '/test-session',
    '/dashboard',
    '/cursos',
    '/flashcards',
    '/quiz',
    '/provas',
    '/livros',
    '/redacao',
    '/membros',
    '/turmas',
    '/community',
    '/calendario',
    '/suporte'
  ]
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Permitir acesso a todas as rotas (não forçar login)
  console.log('✅ [MIDDLEWARE] Acesso permitido')
  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### **2. lib/auth-simple.ts (ATUAL):**

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

// Tipos simples
export interface AuthUser {
  id: string
  email: string
  role: 'student' | 'teacher' | 'admin'
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Hook MUITO SIMPLES
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  const supabase = createClient()

  useEffect(() => {
    console.log('🔧 [AUTH] Iniciando verificação de sessão...')
    
    // Verificar sessão uma única vez
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AUTH] Erro:', error)
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
          return
        }
        
        if (session?.user) {
          console.log('✅ [AUTH] Sessão encontrada:', session.user.email)
          
          // Buscar role usando email (agora que corrigimos as tabelas)
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', session.user.email)
            .single()

          if (roleError) {
            console.warn('⚠️ [AUTH] Erro ao buscar role:', roleError)
          }

          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: (roleData?.role as any) || 'student'
          }

          console.log('👤 [AUTH] Usuário carregado:', user)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          console.log('❌ [AUTH] Nenhuma sessão')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkSession()

    // Escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AUTH] Evento:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', session.user.email)
            .single()

          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: (roleData?.role as any) || 'student'
          }

          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Funções simples
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Login:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro login:', error)
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, role: 'student' | 'teacher' = 'student') => {
    try {
      console.log('📝 [AUTH] Signup:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        await supabase
          .from('user_roles')
          .insert({
            user_uuid: data.user.email,
            role
          })
      }

      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro signup:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 [AUTH] Logout')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro logout:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  }
}
```

## 🎯 **SOLUÇÃO PROPOSTA:**

### **Etapa 1: Corrigir .env.local**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
SUPABASE_JWT_SECRET=sua_chave_secreta_jwt_copiada_do_supabase # <--- Adicione/Corrija esta linha
```

### **Etapa 2: Corrigir middleware.ts**

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Tenta obter a sessão do Supabase
    const { data: { session }, error } = await supabase.auth.getSession()

    console.log('🔍 [MIDDLEWARE] Rota:', req.nextUrl.pathname, 'Sessão:', !!session)

    // Define as rotas públicas que não exigem autenticação
    const publicRoutes = [
      '/login-simple',
      '/signup-simple',
      '/', // A rota raiz pode ser pública
      '/test-session'
    ]

    // Verifica se a rota atual é uma rota pública
    const isPublicRoute = publicRoutes.some(route =>
      // Garante que a rota seja exata ou um prefixo direto (ex: /login-simple/...)
      req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
    )

    // Lógica de Redirecionamento:

    // 1. Se NÃO houver sessão E a rota NÃO for pública, redireciona para o login.
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login-simple', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // 2. Se HOUVER sessão E a rota for uma página de login/cadastro, redireciona para o dashboard.
    // Isso impede que usuários logados acessem novamente as páginas de autenticação.
    if (session && (req.nextUrl.pathname === '/login-simple' || req.nextUrl.pathname === '/signup-simple')) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Se nenhuma das condições acima for atendida, permite o acesso à rota.
    return res

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro ao processar sessão ou cookie:', error)
    // Em caso de erro (ex: cookie malformado), tratamos como se não houvesse sessão válida.
    // Redireciona para o login se a rota for protegida.
    const publicRoutes = [
      '/login-simple',
      '/signup-simple',
      '/',
      '/test-session'
    ]
    const isPublicRoute = publicRoutes.some(route =>
      req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
    )

    if (!isPublicRoute) {
      const redirectUrl = new URL('/login-simple', req.url)
      return NextResponse.redirect(redirectUrl)
    }
    return res // Permite acesso a rotas públicas mesmo com erro
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## 🧪 **TESTE DA CORREÇÃO:**

Após implementar as duas etapas da solução:

1. **Verifique o erro de cookie**: O erro `Failed to parse cookie string` deve desaparecer dos logs
2. **Monitore o log de sessão**: O log `🔍 [MIDDLEWARE] Rota: /membros Sessão: false` deve mudar para `🔍 [MIDDLEWARE] Rota: /membros Sessão: true` quando um usuário estiver logado
3. **Teste o comportamento do frontend**:
   - Menu Admin: Para usuários com role de teacher ou admin, o menu administrativo deve agora aparecer corretamente
   - Perfil: O UserProfile deve exibir o role correto (ex: "Professor" ou "Administrador") em vez de "Estudante"
   - Persistência da Sessão: A sessão deve persistir entre as navegações

## 🎯 **RESULTADO ESPERADO:**

- ✅ Middleware detectando sessão corretamente
- ✅ Menu admin aparecendo para professores
- ✅ Perfil persistente entre navegações
- ✅ Logs confirmando autenticação

---

**🚨 ESTE É O PROBLEMA MAIS CRÍTICO QUE AFETA TODA A PLATAFORMA EVEREST PREPARATÓRIOS!** 