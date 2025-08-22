"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getAuthAndRole } from "@/lib/get-user-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      setLoading(true)
      console.log("🔍 [DEBUG] Verificando autenticação...")
      
      const supabase = createClient()
      
      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log("📊 [DEBUG] Sessão:", session)
      console.log("❌ [DEBUG] Erro de sessão:", sessionError)
      
      // Verificar usuário
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("👤 [DEBUG] Usuário:", user)
      console.log("❌ [DEBUG] Erro de usuário:", userError)
      
      // Verificar role
      const authResult = await getAuthAndRole()
      console.log("🎭 [DEBUG] Resultado getAuthAndRole:", authResult)
      
      setAuthStatus({
        session,
        sessionError,
        user,
        userError,
        authResult
      })
    } catch (error) {
      console.error("❌ [DEBUG] Erro geral:", error)
      setAuthStatus({ error: error })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug de Autenticação</h1>
      
      <div className="space-y-4">
        <Button onClick={checkAuth} disabled={loading}>
          {loading ? "Verificando..." : "Verificar Autenticação"}
        </Button>
        
        {authStatus && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(authStatus.session, null, 2)}
                </pre>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(authStatus.user, null, 2)}
                </pre>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resultado getAuthAndRole</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(authStatus.authResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
            
            {authStatus.error && (
              <Card>
                <CardHeader>
                  <CardTitle>Erro</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(authStatus.error, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
