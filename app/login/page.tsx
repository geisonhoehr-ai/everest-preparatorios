'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function LoginSimplePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_uuid', data.user.email)
            .single()

          if (roleError) {
            console.warn('⚠️ [LOGIN] Erro ao buscar role, redirecionando para dashboard')
            router.push('/dashboard')
          } else {
            if (roleData.role === 'teacher') {
              router.push('/dashboard')
            } else if (roleData.role === 'admin') {
              router.push('/admin')
            } else {
              router.push('/dashboard')
            }
          }
        } catch (roleError) {
          console.warn('⚠️ [LOGIN] Erro inesperado ao buscar role, redirecionando para dashboard')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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
                      <div className="relative mb-1">
                        <svg width="32" height="16" viewBox="0 0 32 16" className="mx-auto sm:w-10 sm:h-5">
                          <defs>
                            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                              <stop offset="100%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M2 12 L8 5 L11 8 L16 3 L21 8 L24 5 L30 12 Z" 
                            fill="none" 
                            stroke="url(#mountainGradient)" 
                            strokeWidth="1"
                            strokeLinecap="round"
                          />
                          <path 
                            d="M11 8 L16 3 L21 8 L16 12 Z" 
                            fill="url(#mountainGradient)"
                          />
                        </svg>
                      </div>
                      {/* Texto */}
                      <div className="text-blue-400 font-bold text-[10px] sm:text-xs tracking-wide">everest</div>
                      <div className="text-purple-400 text-[8px] sm:text-[10px] tracking-wide leading-tight">cursos preparatórios</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-gradient-shift">
                    Bem-vindo de volta
                  </h1>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Faça login para acessar sua conta
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-200">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-900/60 backdrop-blur-sm border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-400 transition-all duration-200 h-10 sm:h-12 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-200">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-12 bg-gray-900/60 backdrop-blur-sm border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-400 transition-all duration-200 h-10 sm:h-12 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
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
                  <Alert className="border-red-500/50 bg-red-900/20 backdrop-blur-sm">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 text-xs sm:text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 hover:from-blue-600 hover:via-green-600 hover:to-purple-600 text-white font-medium h-10 sm:h-12 shadow-lg hover:shadow-xl transition-all duration-200 animate-gradient-shift text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
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