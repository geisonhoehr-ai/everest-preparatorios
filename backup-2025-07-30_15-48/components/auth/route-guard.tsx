"use client"

import { useRequireAuth } from '@/hooks/use-auth'
import { Loader2, AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  fallback,
  redirectTo = '/login'
}: RouteGuardProps) {
  const { canRender, reason, isLoading, signOut } = useRequireAuth(requiredRole)

  // Loading state
  if (reason === 'loading') {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Unauthenticated
  if (reason === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      window.location.replace(loginUrl)
    }

    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Redirecionando para login...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Insufficient permissions
  if (reason === 'insufficient_permissions') {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
          <Button onClick={() => signOut()}>
            Fazer logout e tentar com outra conta
          </Button>
        </div>
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
} 