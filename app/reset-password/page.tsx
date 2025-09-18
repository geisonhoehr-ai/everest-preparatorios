"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"

// Forçar tema dark para esta página
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('light')
  document.documentElement.classList.add('dark')
  localStorage.setItem('theme', 'dark')
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()

  useEffect(() => {
    // Forçar tema dark
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
    
    // Obter token da URL
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setError('Token de recuperação não encontrado')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validações
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (!token) {
      setError("Token de recuperação inválido")
      setIsLoading(false)
      return
    }

    try {
      const result = await resetPassword(token, password)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(result.error || "Erro ao redefinir senha")
      }
    } catch (error) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4 dark">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/30 to-green-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
          <Card className="relative bg-black border border-gray-800 shadow-2xl rounded-2xl">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Senha Redefinida!</h2>
              <p className="text-gray-300 mb-4">
                Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4 dark">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute top-20 left-20 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-orange-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Grid pattern futurístico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.1)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:50px_50px]"></div>
      
      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 via-blue-500 via-orange-500 via-blue-500 to-orange-500 opacity-75 blur-sm"></div>
          
          <Card className="relative bg-black border border-gray-800 shadow-2xl rounded-2xl">
            <CardHeader className="text-center pb-6 sm:pb-8">
              <div className="flex flex-col items-center">
                <div className="text-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent mb-2">
                    Redefinir Senha
                  </h1>
                  <p className="text-gray-300 text-sm">
                    Digite sua nova senha
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-200">
                    Nova Senha
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-200">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pr-12 bg-gray-900/60 backdrop-blur-sm border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200 h-10 sm:h-12 text-sm"
                      style={{ color: 'white' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert className="bg-red-900/20 border-red-500/50">
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 hover:from-orange-600 hover:via-blue-600 hover:to-orange-600 text-white font-medium h-10 sm:h-12 shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Redefinindo...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                      Redefinir Senha
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Footer */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400">
                  © 2025 Everest Preparatórios. Todos os direitos reservados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
