'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUserRoleClient } from '@/lib/get-user-role'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        setIsCheckingSession(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log("✅ [LOGIN] Usuário já logado, redirecionando...")
          try {
            const userRole = await getUserRoleClient(session.user.email)
            
            if (userRole === 'admin') {
              router.push('/admin')
            } else if (userRole === 'teacher') {
              router.push('/teacher')
            } else {
              router.push('/dashboard')
            }
          } catch (roleError) {
            console.warn('⚠️ [LOGIN] Erro ao buscar role, redirecionando para dashboard:', roleError)
            router.push('/dashboard')
          }
          return
        }
      } catch (error) {
        console.error("Erro ao verificar sessão existente:", error)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkExistingSession()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log("🔐 [LOGIN] Tentando fazer login...")
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ [LOGIN] Erro no login:", error)
        
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Tente novamente.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email não confirmado. Verifique sua caixa de entrada.")
        } else {
          setError(error.message)
        }
        return
      }

      if (data.user) {
        console.log("✅ [LOGIN] Login bem-sucedido, buscando role...")
        
        try {
          // Buscar role usando email (correto)
          const userRole = await getUserRoleClient(data.user.email)
          console.log("✅ [LOGIN] Role encontrado:", userRole)
          
          // Redirecionar baseado no role
          if (userRole === 'admin') {
            router.push('/admin')
          } else if (userRole === 'teacher') {
            router.push('/teacher')
          } else {
            router.push('/dashboard')
          }
        } catch (roleError) {
          console.warn('⚠️ [LOGIN] Erro ao buscar role, redirecionando para dashboard')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error("❌ [LOGIN] Erro inesperado:", error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading enquanto verifica sessão
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Círculos decorativos */}
        <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid pattern futurístico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
      
      {/* Conteúdo do login */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
        {/* Efeito LED neon ao redor do card */}
        <div className="relative">
          {/* LED neon animado */}
          <div className="absolute -inset-1 rounded-2xl blur-sm opacity-75 animate-neon-clockwise"></div>
          <div className="absolute -inset-1 rounded-2xl blur-sm opacity-75 animate-neon-clockwise" style={{animationDelay: '1.5s'}}></div>
          
          <Card className="relative bg-black/80 backdrop-blur-xl border border-gray-800 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-6 sm:pb-8">
              {/* Logo do Everest */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4 sm:mb-6">
                  {/* Círculo de fundo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  
                  {/* Logo container */}
                  <div className="relative bg-black rounded-full p-3 sm:p-4 shadow-xl w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center border-2 border-blue-500 animate-border-color">
                    <div className="text-center">
                      {/* Montanha estilizada */}
                      <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        E
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Everest Preparatórios
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Área VIP - Acesso Exclusivo
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Alert de erro */}
              {error && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo de email */}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                      required
                    />
                  </div>
                </div>

                {/* Campo de senha */}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 h-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Botão de login */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 text-lg relative overflow-hidden group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                      Acessar Área VIP
                    </div>
                  )}
                </Button>
              </form>

              {/* Informações adicionais */}
              <div className="text-center space-y-2">
                <p className="text-gray-400 text-xs">
                  Acesso exclusivo para alunos e professores
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Sistema seguro e criptografado
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes neon-clockwise {
          0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          25% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.5); }
          50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }
          75% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        }
        
        @keyframes border-color {
          0% { border-color: #3b82f6; }
          25% { border-color: #9333ea; }
          50% { border-color: #ec4899; }
          75% { border-color: #22c55e; }
          100% { border-color: #3b82f6; }
        }
        
        .animate-neon-clockwise {
          animation: neon-clockwise 3s linear infinite;
        }
        
        .animate-border-color {
          animation: border-color 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
