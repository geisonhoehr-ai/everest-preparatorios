'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getUserRoleClient } from '@/lib/get-user-role'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DebugLoginPage() {
  const [email, setEmail] = useState('professor@teste.com')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setLogs([])

    try {
      addLog("🔐 [DEBUG] Iniciando teste de login...")
      addLog(`📧 [DEBUG] Email: ${email}`)
      addLog(`🔑 [DEBUG] Senha: ${password}`)
      
      // Teste 1: Verificar configuração do Supabase
      addLog("🔧 [DEBUG] Verificando configuração do Supabase...")
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Variáveis de ambiente do Supabase não configuradas")
      }
      addLog("✅ [DEBUG] Configuração do Supabase OK")
      
      // Teste 2: Tentar login
      addLog("🔐 [DEBUG] Tentando fazer login...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addLog(`❌ [DEBUG] Erro no login: ${error.message}`)
        setError(`Erro no login: ${error.message}`)
        return
      }

      if (data.user) {
        addLog(`✅ [DEBUG] Login bem-sucedido!`)
        addLog(`👤 [DEBUG] Usuário: ${data.user.email}`)
        addLog(`🆔 [DEBUG] ID: ${data.user.id}`)
        
        // Teste 3: Buscar role
        addLog("🔍 [DEBUG] Buscando role do usuário...")
        try {
          const userRole = await getUserRoleClient(data.user.email)
          addLog(`✅ [DEBUG] Role encontrado: ${userRole}`)
          
          // Teste 4: Redirecionamento
          addLog("🔄 [DEBUG] Testando redirecionamento...")
          if (userRole === 'admin') {
            addLog("🎯 [DEBUG] Redirecionando para /admin")
            router.push('/admin')
          } else if (userRole === 'teacher') {
            addLog("🎯 [DEBUG] Redirecionando para /teacher")
            router.push('/teacher')
          } else {
            addLog("🎯 [DEBUG] Redirecionando para /dashboard")
            router.push('/dashboard')
          }
        } catch (roleError) {
          addLog(`⚠️ [DEBUG] Erro ao buscar role: ${roleError}`)
          addLog("🎯 [DEBUG] Redirecionando para /dashboard (fallback)")
          router.push('/dashboard')
        }
      } else {
        addLog("❌ [DEBUG] Login falhou - nenhum usuário retornado")
        setError("Login falhou - nenhum usuário retornado")
      }
    } catch (error) {
      addLog(`❌ [DEBUG] Erro inesperado: ${error}`)
      setError(`Erro inesperado: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSession = async () => {
    setLogs([])
    addLog("🔍 [DEBUG] Verificando sessão atual...")
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        addLog(`✅ [DEBUG] Sessão ativa encontrada`)
        addLog(`👤 [DEBUG] Usuário: ${session.user.email}`)
        addLog(`🆔 [DEBUG] ID: ${session.user.id}`)
      } else {
        addLog("❌ [DEBUG] Nenhuma sessão ativa encontrada")
      }
    } catch (error) {
      addLog(`❌ [DEBUG] Erro ao verificar sessão: ${error}`)
    }
  }

  const clearSession = async () => {
    setLogs([])
    addLog("🧹 [DEBUG] Limpando sessão...")
    
    try {
      await supabase.auth.signOut()
      addLog("✅ [DEBUG] Sessão limpa com sucesso")
    } catch (error) {
      addLog(`❌ [DEBUG] Erro ao limpar sessão: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">🔧 Debug Login - Everest Preparatórios</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Formulário de teste */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Testando..." : "🔐 Testar Login"}
                </Button>
                <Button type="button" onClick={testSession} variant="outline">
                  🔍 Verificar Sessão
                </Button>
                <Button type="button" onClick={clearSession} variant="outline">
                  🧹 Limpar Sessão
                </Button>
              </div>
            </form>

            {/* Alert de erro */}
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Logs */}
            <div className="bg-black p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">📋 Logs de Debug:</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-green-400 text-sm font-mono">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500 text-sm">Nenhum log ainda...</div>
                )}
              </div>
            </div>

            {/* Informações do ambiente */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">⚙️ Configuração:</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <div>URL Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ Não configurada"}</div>
                <div>Key Supabase: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não configurada"}</div>
                <div>Ambiente: {process.env.NODE_ENV}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
