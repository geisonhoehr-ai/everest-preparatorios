'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-simple'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Eye, EyeOff, Database, Cookie, Clock } from 'lucide-react'

export function SessionDebug() {
  const { user, isLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [cookieInfo, setCookieInfo] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkSession = async () => {
    setIsChecking(true)
    try {
      const supabase = createClient()
      
      // Verificar sessão
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // Verificar cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

      // Verificar localStorage
      const localStorage = window.localStorage.getItem('supabase.auth.token')

      setSessionInfo({
        session: session ? {
          user: session.user.email,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null,
          accessToken: session.access_token ? session.access_token.substring(0, 20) + '...' : null,
          refreshToken: session.refresh_token ? session.refresh_token.substring(0, 20) + '...' : null
        } : null,
        error: error?.message
      })

      setCookieInfo({
        cookies: Object.keys(cookies).filter(key => key.includes('supabase') || key.includes('sb-')),
        localStorage: localStorage ? 'Presente' : 'Ausente',
        cookieCount: Object.keys(cookies).length
      })

      console.log('🔍 [DEBUG] Sessão:', session)
      console.log('🍪 [DEBUG] Cookies:', cookies)
      console.log('💾 [DEBUG] LocalStorage:', localStorage)
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao verificar sessão:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Debug de Sessão
          </CardTitle>
          <CardDescription>
            Informações detalhadas sobre a sessão e persistência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do usuário */}
          <div className="space-y-2">
            <h3 className="font-semibold">Status do Usuário</h3>
            {isLoading ? (
              <Badge variant="secondary">Carregando...</Badge>
            ) : user ? (
              <div className="space-y-1">
                <Badge variant="default">Logado</Badge>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Role: {user.role}</p>
              </div>
            ) : (
              <Badge variant="destructive">Não logado</Badge>
            )}
          </div>

          {/* Informações da sessão */}
          <div className="space-y-2">
            <h3 className="font-semibold">Informações da Sessão</h3>
            {sessionInfo ? (
              <div className="space-y-2">
                {sessionInfo.session ? (
                  <div className="space-y-1">
                    <p className="text-sm"><strong>Usuário:</strong> {sessionInfo.session.user}</p>
                    <p className="text-sm"><strong>Expira em:</strong> {sessionInfo.session.expiresAt?.toLocaleString()}</p>
                    <p className="text-sm"><strong>Access Token:</strong> {sessionInfo.session.accessToken}</p>
                    <p className="text-sm"><strong>Refresh Token:</strong> {sessionInfo.session.refreshToken}</p>
                  </div>
                ) : (
                  <Badge variant="destructive">Nenhuma sessão ativa</Badge>
                )}
                {sessionInfo.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{sessionInfo.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Verificando...</p>
            )}
          </div>

          {/* Informações de cookies */}
          <div className="space-y-2">
            <h3 className="font-semibold">Cookies e LocalStorage</h3>
            {cookieInfo ? (
              <div className="space-y-1">
                <p className="text-sm"><strong>Cookies Supabase:</strong> {cookieInfo.cookies.length}</p>
                <p className="text-sm"><strong>Total de Cookies:</strong> {cookieInfo.cookieCount}</p>
                <p className="text-sm"><strong>LocalStorage:</strong> {cookieInfo.localStorage}</p>
                {cookieInfo.cookies.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p>Cookies encontrados:</p>
                    <ul className="list-disc list-inside">
                      {cookieInfo.cookies.map((cookie: string, index: number) => (
                        <li key={index}>{cookie}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Verificando...</p>
            )}
          </div>

          {/* Botão de refresh */}
          <Button 
            onClick={checkSession} 
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar Sessão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Instruções de debug */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Instruções de Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p><strong>1.</strong> Abra o console do navegador (F12)</p>
            <p><strong>2.</strong> Procure por logs: 🔍 [AUTH], 🍪 [DEBUG], 🔍 [MIDDLEWARE]</p>
            <p><strong>3.</strong> Verifique se há erros de CORS ou cookies</p>
            <p><strong>4.</strong> Teste em modo incógnito</p>
            <p><strong>5.</strong> Verifique se os cookies estão sendo salvos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 