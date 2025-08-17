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
  // Removido: const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Criar cliente Supabase dentro da função
    const supabase = createClient()
    console.log('🔍 [LOGIN] Cliente Supabase criado:', !!supabase)
    
    try {
      console.log('🔐 [LOGIN] Iniciando processo de login para:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ [LOGIN] Erro no login:', error)
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (!data.user) {
        console.error('❌ [LOGIN] Nenhum usuário retornado')
        setError('Erro inesperado no login')
        setIsLoading(false)
        return
      }

      console.log('✅ [LOGIN] Login bem-sucedido para:', data.user.email)
      console.log('🔍 [LOGIN] UUID do usuário:', data.user.id)

      // REABILITANDO: Buscar role com logs detalhados
      try {
        console.log('🔍 [LOGIN] Iniciando busca do role...')
        console.log('🔍 [LOGIN] Cliente Supabase:', !!supabase)
        console.log('🔍 [LOGIN] UUID para busca:', data.user.id)
        
        // TEMPORARIAMENTE: Pular todas as queries problemáticas
        console.log('⚠️ [LOGIN] TEMPORARIAMENTE: Pulando queries problemáticas...')
        console.log('🔄 [LOGIN] Testando redirecionamento...')
        
        // DEBUG: Reabilitar apenas RPC para testar rede
        console.log('🔍 [LOGIN] DEBUG: Testando RPC para debug de rede...')
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('version')
          
          console.log('🔍 [LOGIN] DEBUG RPC version:', { rpcData, rpcError })
        } catch (rpcError) {
          console.log('🔍 [LOGIN] DEBUG RPC falhou:', rpcError)
        }
        
        // DEBUG: Testar redirecionamento para página mais simples
        console.log('🔄 [LOGIN] DEBUG: Testando redirecionamento para página raiz...')
        
        try {
          // Teste 1: Redirecionar para página raiz
          console.log('🔄 [LOGIN] Executando router.push("/")...')
          await router.push('/')
          console.log('✅ [LOGIN] router.push("/") executado com sucesso')
        } catch (redirectError) {
          console.error('❌ [LOGIN] Erro no redirecionamento:', redirectError)
          
          // Teste 2: Tentar dashboard se raiz falhar
          console.log('🔄 [LOGIN] Tentando dashboard como fallback...')
          try {
            await router.push('/dashboard')
            console.log('✅ [LOGIN] router.push("/dashboard") executado com sucesso')
          } catch (dashboardError) {
            console.error('❌ [LOGIN] Erro no dashboard também:', dashboardError)
            // Último recurso: window.location
            console.log('🔄 [LOGIN] Usando window.location como último recurso...')
            window.location.href = '/dashboard'
          }
        }
        
        return
        
        // CÓDIGO ORIGINAL COMENTADO - REABILITAR DEPOIS QUE SUPABASE ESTIVER ESTÁVEL
        /*
        // TESTE: Query mais simples para identificar o problema
        console.log('🔍 [LOGIN] Testando query simples primeiro...')
        
        try {
          // PULANDO TESTE DE CONEXÃO - Vamos direto para query...
          console.log('🔍 [LOGIN] PULANDO teste de conexão - indo direto para query...')
          
          // Teste -1: Query que não envolve tabelas
          console.log('🔍 [LOGIN] Teste -1: Query sem tabela (rpc)...')
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('version')
            
            console.log('🔍 [LOGIN] Teste RPC version:', { rpcData, rpcError })
          } catch (rpcError) {
            console.log('🔍 [LOGIN] Teste RPC falhou:', rpcError)
          }
          
          // Teste 0: Query em tabela diferente (auth.users)
          console.log('🔍 [LOGIN] Teste 0: Query em tabela auth.users...')
          try {
            const { data: authTestData, error: authTestError } = await supabase
              .from('auth.users')
              .select('*')
              .limit(1)
            
            console.log('🔍 [LOGIN] Teste auth.users:', { authTestData, authTestError })
          } catch (authTestError) {
            console.log('🔍 [LOGIN] Teste auth.users falhou (esperado):', authTestError)
          }
          
          // Teste 1: Query simples sem WHERE
          console.log('🔍 [LOGIN] Teste 1: Query simples sem WHERE...')
          const { data: testData, error: testError } = await supabase
            .from('user_roles')
            .select('*')
            .limit(1)
          
          console.log('🔍 [LOGIN] Teste query simples:', { testData, testError })
          
          if (testError) {
            console.error('❌ [LOGIN] Erro na query simples:', testError)
            throw new Error('Query simples falhou: ' + testError.message)
          }
          
          // Teste 2: Query com WHERE simples
          console.log('🔍 [LOGIN] Teste 2: Query com WHERE simples...')
          const { data: testWhereData, error: testWhereError } = await supabase
            .from('user_roles')
            .select('role')
            .limit(1)
          
          console.log('🔍 [LOGIN] Teste query com WHERE:', { testWhereData, testWhereError })
          
          if (testWhereError) {
            console.error('❌ [LOGIN] Erro na query com WHERE:', testWhereError)
            throw new Error('Query com WHERE falhou: ' + testWhereError.message)
          }
          
        } catch (testError) {
          console.error('❌ [LOGIN] Erro nos testes:', testError)
          // Se os testes falharem, redirecionar para dashboard
          console.log('🔄 [LOGIN] Redirecionando para dashboard (testes falharam)')
          router.push('/dashboard')
          return
        }
        
        // Se os testes passarem, tentar a query real
        console.log('🔍 [LOGIN] Testes passaram, executando query real...')
        
        // Adicionar timeout para evitar travamento
        const queryPromise = supabase
          .from('user_roles')
          .select('role')
          .eq('user_uuid', data.user.id)
          .single()

        // Timeout de 10 segundos
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout na query SQL')), 10000)
        })

        let { data: roleData, error: roleError } = await Promise.race([queryPromise, timeoutPromise]) as any

        console.log('🔍 [LOGIN] Resultado da busca por UUID:', { roleData, roleError })

        if (roleError) {
          console.log('🔄 [LOGIN] Erro na busca por UUID, tentando por email...')
          
          // Adicionar timeout para query por email também
          const queryEmailPromise = supabase
            .from('user_roles')
            .select('role')
            .eq('email', data.user.email)
            .single()

          const timeoutEmailPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout na query SQL por email')), 10000)
          })

          const { data: roleDataByEmail, error: roleErrorByEmail } = await Promise.race([queryEmailPromise, timeoutEmailPromise]) as any

          console.log('🔍 [LOGIN] Resultado da busca por email:', { roleDataByEmail, roleErrorByEmail })

          if (roleErrorByEmail) {
            console.warn('⚠️ [LOGIN] Erro ao buscar role por email também:', roleErrorByEmail)
            console.log('🔄 [LOGIN] Redirecionando para dashboard (role não encontrado)')
            router.push('/dashboard')
            return
          }

          roleData = roleDataByEmail
          roleError = null
        }

        const userRole = roleData?.role || 'student'
        console.log('✅ [LOGIN] Role encontrado:', userRole)

        // Redirecionar baseado no role
        let redirectPath = '/dashboard'
        
        if (userRole === 'admin') {
          redirectPath = '/admin'
        } else if (userRole === 'teacher') {
          redirectPath = '/dashboard'
        } else {
          redirectPath = '/dashboard'
        }

        console.log('🔄 [LOGIN] Redirecionando para:', redirectPath)
        router.push(redirectPath)
        */

      } catch (roleError) {
        console.error('❌ [LOGIN] Erro inesperado ao buscar role:', roleError)
        console.log('🔄 [LOGIN] Redirecionando para dashboard (erro no role)')
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('❌ [LOGIN] Erro geral no login:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      console.log('🏁 [LOGIN] Finalizando processo de login')
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