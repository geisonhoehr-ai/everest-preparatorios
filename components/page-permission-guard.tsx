'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, AlertCircle } from 'lucide-react'

interface PagePermissionGuardProps {
  children: React.ReactNode
  pageName: string
  fallback?: React.ReactNode
}

export function PagePermissionGuard({ children, pageName, fallback }: PagePermissionGuardProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkPageAccess()
  }, [user, profile, pageName])

  const checkPageAccess = async () => {
    if (!user || !profile) {
      setHasAccess(false)
      setIsLoading(false)
      return
    }

    // Professores e admins têm acesso total
    if (profile.role === 'teacher' || profile.role === 'admin') {
      setHasAccess(true)
      setIsLoading(false)
      return
    }

    // Verificar se o acesso não expirou
    if (profile.access_expires_at && new Date(profile.access_expires_at) < new Date()) {
      setHasAccess(false)
      setIsLoading(false)
      return
    }

    // Para estudantes, verificar permissão específica da página
    try {
      const response = await fetch('/api/check-page-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          pageName: pageName
        })
      })

      if (response.ok) {
        const data = await response.json()
        setHasAccess(data.hasAccess)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      setHasAccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Entre em contato com seu professor para solicitar acesso.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
