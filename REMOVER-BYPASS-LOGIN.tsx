// REMOVER BYPASS TEMPORÁRIO DO LOGIN
// Substitua o conteúdo do arquivo app/login/page.tsx por este código

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Eye, EyeOff, Lock } from "lucide-react"

// Forçar tema dark para esta página
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('light')
  document.documentElement.classList.add('dark')
  localStorage.setItem('theme', 'dark')
}

export default function LoginPage() {
  // Forçar cache busting
  useEffect(() => {
    const timestamp = Date.now()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `/globals.css?v=${timestamp}`
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [])
  
  const [email, setEmail] = useState("aluno@teste.com")
  const [password, setPassword] = useState("123456")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Forçar tema dark e limpar cache
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
    
    // Verificar se já está logado
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push("/dashboard")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // LOGIN REAL APENAS COM SUPABASE (SEM BYPASS)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError("Credenciais inválidas. Use: aluno@teste.com, admin@teste.com ou professor@teste.com com senha 123456")
        return
      }

      if (data.user) {
        // Redirecionar baseado no role do usuário
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push("/dashboard")
        } else {
          router.push("/dashboard") // Usuário comum também vai para dashboard
        }
      }
    } catch (error) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4 dark">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Círculos decorativos */}
        <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-orange-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid pattern futurístico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
      
      {/* Conteúdo do login */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
        {/* Efeito LED colorido girando na borda */}
        <div className="relative">
          {/* LED colorido girando no sentido horário */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 via-blue-500 via-orange-500 via-blue-500 to-orange-500 opacity-75 blur-sm"></div>
          
          <Card className="relative bg-black border border-gray-800 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-6 sm:pb-8">
              {/* Título Everest Preparatórios */}
              <div className="flex flex-col items-center">
                <div className="text-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent mb-2">
                    Everest Preparatórios
                  </h1>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent mb-2">
                    Bem-vindo de volta
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Faça login para acessar sua conta
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-900/60 backdrop-blur-sm border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200 h-10 sm:h-12 text-sm"
                    style={{ color: 'white' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-200">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-12 bg-gray-900/60 backdrop-blur-sm border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200 h-10 sm:h-12 text-sm"
                      style={{ color: 'white' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                    <Lock className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 hover:from-orange-600 hover:via-blue-600 hover:to-orange-600 text-white font-medium h-10 sm:h-12 shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      Entrar
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Footer */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400">
                  © 2025 Everest Preparatórios. Todos os direitos reservados.
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Desenvolvido por Geison Höehr & Tiago Costa.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
