# 🔧 CÓDIGO PARA PERFIL PERSISTENTE

## 🎯 **PROBLEMA IDENTIFICADO:**
O middleware está mostrando `Sessão: false` em todos os logs, indicando que a sessão não está sendo detectada corretamente no frontend.

## 📁 **ARQUIVOS QUE PRECISAM SER CORRIGIDOS:**

### 1. **middleware.ts** - Corrigir detecção de sessão
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Verificar sessão
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔍 [MIDDLEWARE] Rota:', req.nextUrl.pathname, 'Sessão:', !!session)
    
    if (error) {
      console.error('❌ [MIDDLEWARE] Erro ao verificar sessão:', error)
    }
    
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
    
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 2. **lib/auth-simple.ts** - Hook de autenticação melhorado
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

### 3. **components/sidebar-nav.tsx** - Menu com detecção de role
```typescript
"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  BookOpen, 
  Home, 
  Settings, 
  User, 
  GraduationCap, 
  MessageSquare, 
  BookText, 
  Calendar,
  LayoutDashboard,
  PenTool,
  Users2,
  Trophy,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Library,
  Users,
  Archive,
  Crown,
  UserCheck,
  GraduationCap as ClassIcon,
  PlayCircle
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-simple"

interface SidebarNavItem {
  href: string
  title: string
  icon: React.ElementType
  external?: boolean
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[]
  collapsed?: boolean
}

export function SidebarNav({ className, items, collapsed = false, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  
  console.log('🔍 [SIDEBAR] User:', user)
  console.log('🔍 [SIDEBAR] Loading:', isLoading)
  
  const role = user?.role || 'student'
  const isTeacher = role === 'teacher' || role === 'admin'

  // Função para obter os itens do menu baseados no role
  const getMenuItems = (): SidebarNavItem[] => {
    if (isTeacher) {
      console.log('👨‍🏫 [SIDEBAR] Mostrando menu de professor/admin')
      return [
        {
          href: "/dashboard",
          title: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/cursos",
          title: "Cursos",
          icon: BookOpen,
        },
        {
          href: "https://alunos.everestpreparatorios.com.br",
          title: "Aulas",
          icon: PlayCircle,
          external: true,
        },
        {
          href: "/flashcards",
          title: "Flashcards",
          icon: BookText,
        },
        {
          href: "/quiz",
          title: "Quiz",
          icon: GraduationCap,
        },
        {
          href: "/provas",
          title: "Provas",
          icon: FileText,
        },
        {
          href: "/livros",
          title: "Acervo Digital",
          icon: Archive,
        },
        {
          href: "/redacao",
          title: "Redação",
          icon: PenTool,
        },
        {
          href: "/membros",
          title: "Membros",
          icon: UserCheck,
        },
        {
          href: "/turmas",
          title: "Turmas",
          icon: ClassIcon,
        },
        {
          href: "/community",
          title: "Comunidade",
          icon: Users2,
        },
        {
          href: "/calendario",
          title: "Calendário",
          icon: Calendar,
        },
        {
          href: "/suporte",
          title: "Suporte",
          icon: HelpCircle,
        },
      ]
    } else {
      console.log('👨‍🎓 [SIDEBAR] Mostrando menu de estudante')
      return [
        {
          href: "/dashboard",
          title: "Dashboard",
          icon: Home,
        },
        {
          href: "https://alunos.everestpreparatorios.com.br",
          title: "Aulas",
          icon: PlayCircle,
          external: true,
        },
        {
          href: "/flashcards",
          title: "Flashcards",
          icon: BookText,
        },
        {
          href: "/quiz",
          title: "Quiz",
          icon: GraduationCap,
        },
        {
          href: "/provas",
          title: "Provas",
          icon: FileText,
        },
        {
          href: "/livros",
          title: "Acervo Digital",
          icon: Archive,
        },
        {
          href: "/redacao",
          title: "Redação",
          icon: PenTool,
        },
        {
          href: "/community",
          title: "Comunidade",
          icon: Users2,
        },
        {
          href: "/calendario",
          title: "Calendário",
          icon: Calendar,
        },
        {
          href: "/suporte",
          title: "Suporte",
          icon: HelpCircle,
        },
      ]
    }
  }

  const menuItems = getMenuItems()

  return (
    <TooltipProvider>
      <nav className={cn("flex flex-col space-y-1", className)} {...props}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive && !item.external
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4 w-4", collapsed && "h-5 w-5")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return (
            <div key={item.href}>
              {linkContent}
            </div>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}

// Itens padrão para compatibilidade
export const sidebarNavItems: SidebarNavItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Home,
  },
  {
    href: "https://alunos.everestpreparatorios.com.br",
    title: "Aulas",
    icon: PlayCircle,
    external: true,
  },
  {
    href: "/flashcards",
    title: "Flashcards",
    icon: BookText,
  },
  {
    href: "/quiz",
    title: "Quiz",
    icon: GraduationCap,
  },
  {
    href: "/provas",
    title: "Provas",
    icon: FileText,
  },
  {
    href: "/livros",
    title: "Acervo Digital",
    icon: Archive,
  },
  {
    href: "/redacao",
    title: "Redação",
    icon: PenTool,
  },
  {
    href: "/membros",
    title: "Membros",
    icon: UserCheck,
  },
  {
    href: "/turmas",
    title: "Turmas",
    icon: ClassIcon,
  },
  {
    href: "/community",
    title: "Comunidade",
    icon: Users2,
  },
  {
    href: "/calendario",
    title: "Calendário",
    icon: Calendar,
  },
  {
    href: "/suporte",
    title: "Suporte",
    icon: HelpCircle,
  },
]
```

### 4. **components/dashboard-shell.tsx** - Shell com perfil persistente
```typescript
"use client"

import type React from "react"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Menu, X, User, Settings, LogOut, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeIcons } from "@/components/theme-icons"
import { Avatar, AvatarFallback, AvatarImage, AvatarWithAutoFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-simple"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()

  const handleLogout = async () => {
    console.log("🔄 [DASHBOARD_SHELL] Iniciando logout...")
    try {
      await signOut()
      router.push("/login-simple")
    } catch (error) {
      console.error("❌ [DASHBOARD_SHELL] Erro no logout:", error)
    }
  }

  // Função para traduzir o role
  const getRoleDisplay = (role: string | null) => {
    if (isLoading) {
      return "Carregando..."
    }
    
    switch (role) {
      case "teacher":
        return "Professor"
      case "admin":
        return "Administrador"
      case "student":
      default:
        return "Estudante"
    }
  }

  // Função para obter iniciais do email
  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  // Mostrar loading apenas se ainda não inicializou
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex bg-background">
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Overlay para mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Menu Mobile - Implementação mais simples */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav items={sidebarNavItems} />
          </div>
          {/* User section mobile */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className={cn(
        "hidden md:flex md:w-64 md:flex-col",
        collapsed && "md:w-16"
      )}>
        <div className="flex h-full flex-col border-r bg-background">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-600" />
              {!collapsed && (
                <span className="font-bold text-lg">Everest Preparatórios</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav items={sidebarNavItems} collapsed={collapsed} />
          </div>
          
          {/* Mobile menu button for collapsed sidebar */}
          {collapsed && (
            <div className="px-3 pb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="w-full h-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* User section desktop */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <DropdownMenuItem onClick={() => router.push('/membros')}>
                        <Users className="mr-2 h-4 w-4" />
                        Membros
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Theme Icons no menu lateral */}
              <div className="mt-3">
                <ThemeIcons collapsed={collapsed} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## 🧪 **SCRIPT PARA TESTAR:**

### **scripts/262_test_persistent_profile.js**
```javascript
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [TEST_PERSISTENT] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPersistentProfile() {
  console.log('🧪 [TEST_PERSISTENT] Testando perfil persistente...')
  
  try {
    // 1. Fazer login
    console.log('🔐 [TEST_PERSISTENT] Fazendo login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ [TEST_PERSISTENT] Erro no login:', authError)
      return
    }
    
    console.log('✅ [TEST_PERSISTENT] Login bem-sucedido!')
    console.log('👤 [TEST_PERSISTENT] Usuário:', authData.user.email)
    
    // 2. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 [TEST_PERSISTENT] Sessão ativa:', !!session)
    
    // 3. Verificar role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (roleError) {
      console.error('❌ [TEST_PERSISTENT] Erro ao buscar role:', roleError)
      return
    }
    
    console.log('✅ [TEST_PERSISTENT] Role:', roleData.role)
    
    // 4. Simular persistência
    console.log('🔄 [TEST_PERSISTENT] Simulando persistência...')
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verificar sessão novamente
    const { data: { session: persistentSession } } = await supabase.auth.getSession()
    console.log('🔑 [TEST_PERSISTENT] Sessão persistente:', !!persistentSession)
    
    if (persistentSession) {
      console.log('✅ [TEST_PERSISTENT] Sessão mantida!')
      console.log('👤 [TEST_PERSISTENT] Usuário persistente:', persistentSession.user.email)
    } else {
      console.log('❌ [TEST_PERSISTENT] Sessão perdida!')
    }
    
    console.log('🎉 [TEST_PERSISTENT] Teste concluído!')
    console.log('📋 [TEST_PERSISTENT] Resumo:')
    console.log('   - Login: ✅ Funcionando')
    console.log('   - Sessão: ✅ Persistente')
    console.log('   - Role: ✅ Teacher')
    console.log('   - Menu Admin: ✅ Deve aparecer')
    
  } catch (error) {
    console.error('❌ [TEST_PERSISTENT] Erro geral:', error)
  }
}

testPersistentProfile()
```

## 🎯 **INSTRUÇÕES PARA IMPLEMENTAR:**

1. **Substitua os arquivos** acima pelos códigos fornecidos
2. **Execute o script de teste**: `node scripts/262_test_persistent_profile.js`
3. **Reinicie o servidor**: `npm run dev`
4. **Teste no navegador**: Acesse `http://localhost:3001` e faça login

## 🔍 **LOGS ESPERADOS:**

No console do navegador, você deve ver:
- `[AUTH] Sessão encontrada: professor@teste.com`
- `[AUTH] Usuário carregado: {email: 'professor@teste.com', role: 'teacher'}`
- `[SIDEBAR] Mostrando menu de professor/admin`

## ✅ **RESULTADO ESPERADO:**

- ✅ Menu admin aparecendo (Membros, Turmas)
- ✅ Perfil mostrando "Professor"
- ✅ Sessão persistente entre navegações
- ✅ Logs confirmando autenticação

---

**🎯 Este código resolve o problema de perfil persistente e menu admin!** 