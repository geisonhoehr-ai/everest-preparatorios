# 📄 CÓDIGOS COMPLETOS - EVEREST PREPARATÓRIOS

---

## 🔐 **1. MIDDLEWARE (middleware.ts)**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não há sessão e está tentando acessar rota protegida
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Se há sessão e está na página de login, redirecionar
  if (session && req.nextUrl.pathname === '/login') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
}
```

---

## 🔐 **2. AUTH MANAGER (lib/auth-manager.ts)**

```typescript
import { createClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export async function getUserRoleClient(userId: string): Promise<string> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Erro ao obter role:', error)
      return 'student' // default
    }

    return data?.role || 'student'
  } catch (error) {
    console.error('Erro ao obter role:', error)
    return 'student' // default
  }
}

export function getRedirectUrlByRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'teacher':
      return '/teacher'
    case 'student':
    default:
      return '/dashboard'
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/dashboard")
}
```

---

## 🔐 **3. LOGIN PAGE (app/login/page.tsx)**

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRoleClient } from "@/lib/auth-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("✅ [LOGIN] Usuário autenticado:", data.user.email);
        
        // Obter role do usuário
        const role = await getUserRoleClient(data.user.id);
        console.log("✅ [LOGIN] Role obtido:", role);
        
        // Redirecionar baseado no role
        let redirectTo = searchParams.get('redirect');
        
        if (!redirectTo) {
          switch (role) {
            case 'admin':
              redirectTo = '/admin';
              break;
            case 'teacher':
              redirectTo = '/teacher';
              break;
            default:
              redirectTo = '/dashboard';
          }
        }
        
        console.log("🔄 [LOGIN] Redirecionando para:", redirectTo);
        
        // Usar router.push para melhor performance
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setError("Erro interno do servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Login Everest
          </CardTitle>
          <CardDescription className="text-gray-300">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Não tem uma conta?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                Entre em contato
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔐 **4. TEACHER PAGE (app/teacher/page.tsx)**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Target, 
  PenTool, 
  BarChart3, 
  Calendar,
  Trophy,
  TrendingUp,
  Award,
  FileText,
  Settings,
  Plus,
  LogOut
} from "lucide-react";
import Link from "next/link";

interface TeacherStats {
  totalStudents: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalRedacoes: number;
  averageStudentScore: number;
  activeStudents: number;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    totalStudents: 85,
    totalFlashcards: 785,
    totalQuizzes: 19,
    totalRedacoes: 12,
    averageStudentScore: 78,
    activeStudents: 67
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        router.push('/login');
      }
    };

    getUser();
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Everest Preparatórios</h1>
                <p className="text-gray-300 text-sm">Painel do Professor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                {user.email?.split('@')[0] || 'Professor'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Painel do Professor
              </h1>
              <p className="text-gray-300 mt-1">
                Bem-vindo, {user.email?.split('@')[0] || 'Professor'}!
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Professor
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {teacherStats.totalStudents} Alunos
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Total de Alunos
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{teacherStats.totalStudents}</div>
                <p className="text-xs text-gray-400">
                  {teacherStats.activeStudents} ativos este mês
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Flashcards
                </CardTitle>
                <BookOpen className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{teacherStats.totalFlashcards}</div>
                <p className="text-xs text-gray-400">
                  Disponíveis para estudo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Quizzes
                </CardTitle>
                <Target className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{teacherStats.totalQuizzes}</div>
                <p className="text-xs text-gray-400">
                  Avaliações criadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Média Geral
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{teacherStats.averageStudentScore}%</div>
                <p className="text-xs text-gray-400">
                  Performance dos alunos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/membros">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Alunos
              </Link>
            </Button>
            
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/flashcards">
                <BookOpen className="w-4 h-4 mr-2" />
                Flashcards
              </Link>
            </Button>
            
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/quiz">
                <Target className="w-4 h-4 mr-2" />
                Quizzes
              </Link>
            </Button>
            
            <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
              <Link href="/redacao">
                <PenTool className="w-4 h-4 mr-2" />
                Redações
              </Link>
            </Button>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Atividades Recentes</CardTitle>
              <CardDescription className="text-gray-300">
                Últimas atividades dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">João Silva completou 50 flashcards</p>
                    <p className="text-gray-400 text-xs">Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Maria Santos melhorou 15% no quiz</p>
                    <p className="text-gray-400 text-xs">Há 4 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Pedro Costa enviou redação</p>
                    <p className="text-gray-400 text-xs">Há 6 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔐 **5. HOOK USE AUTH (hooks/use-auth.tsx)**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const getUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        setUser(null)
        setRole(null)
        setLoading(false)
        return
      }

      setUser(user)
      
      // Obter role do usuário
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      setRole(roleData?.role || null)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao obter usuário:', error)
      setUser(null)
      setRole(null)
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await getUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setRole(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [getUser, supabase])

  return { user, loading, role, getUser }
}
```

---

## 🔐 **6. SUPABASE CLIENT (lib/supabase/client.ts)**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
```

---

## 🔐 **7. PACKAGE.JSON**

```json
{
  "name": "everest-preparatorios",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/supabase-js": "^2.38.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.3",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.3",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

**Status:** Códigos completos prontos para análise
**Arquivos incluídos:** Middleware, Auth Manager, Login, Teacher Page, Hook useAuth, Supabase Client, Package.json
