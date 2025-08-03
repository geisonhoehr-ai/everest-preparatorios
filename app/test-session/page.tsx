'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-simple'
import { checkSessionStatus } from '@/lib/supabase-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, User, Shield, RefreshCw } from 'lucide-react'
import { SessionDebug } from '@/components/session-debug'

export default function TestSessionPage() {
  const { user, isLoading } = useAuth()
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const status = await checkSessionStatus()
      setSessionStatus(status)
      console.log('📊 [TEST] Status da sessão:', status)
    } catch (error) {
      console.error('❌ [TEST] Erro ao verificar status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Teste de Sessão
          </CardTitle>
          <CardDescription>
            Verifique o status da sua sessão e configurações de timeout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do usuário */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Status do Usuário
            </h3>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Logado</Badge>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.role}</Badge>
                  <span className="text-sm text-muted-foreground">Role: {user.role}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Não logado</Badge>
                <span className="text-sm text-muted-foreground">Nenhum usuário ativo</span>
              </div>
            )}
          </div>

          {/* Status da sessão */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status da Sessão
            </h3>
            {sessionStatus ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={sessionStatus.active ? "default" : "destructive"}>
                    {sessionStatus.active ? "Ativa" : "Inativa"}
                  </Badge>
                  {sessionStatus.active && sessionStatus.daysLeft && (
                    <span className="text-sm text-muted-foreground">
                      Expira em {sessionStatus.daysLeft} dias
                    </span>
                  )}
                </div>
                {sessionStatus.expiresAt && (
                  <div className="text-sm text-muted-foreground">
                    Expira em: {new Date(sessionStatus.expiresAt).toLocaleString('pt-BR')}
                  </div>
                )}
                {sessionStatus.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{sessionStatus.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Verificando status da sessão...
              </div>
            )}
          </div>

          {/* Botão de refresh */}
          <div className="pt-4">
            <Button 
              onClick={checkStatus} 
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
                  Verificar Status
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Debug */}
      <SessionDebug />

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Configurações de Timeout</CardTitle>
          <CardDescription>
            Se a sessão está expirando rapidamente, configure no Supabase:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p><strong>1.</strong> Vá no painel do Supabase</p>
            <p><strong>2.</strong> Authentication > Settings</p>
            <p><strong>3.</strong> Procure por "JWT Settings" ou "Token Settings"</p>
            <p><strong>4.</strong> Configure "JWT Expiry" para 30 dias</p>
            <p><strong>5.</strong> Configure "Refresh Token Rotation" para 30 dias</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 