"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ('admin' | 'teacher' | 'student')[]
  fallbackPath?: string
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/dashboard" }: RoleGuardProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (!isLoading && user && profile && !allowedRoles.includes(profile.role)) {
      router.push(fallbackPath)
      return
    }
  }, [user, profile, isLoading, allowedRoles, fallbackPath, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não está logado, não renderizar nada (será redirecionado)
  if (!user) {
    return null
  }

  // Se não tem permissão, não renderizar nada (será redirecionado)
  if (profile && !allowedRoles.includes(profile.role)) {
    return null
  }

  // Se ainda está carregando o perfil, mostrar loading
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Componentes específicos para cada role
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      {children}
    </RoleGuard>
  )
}

export function TeacherOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['teacher', 'admin']}>
      {children}
    </RoleGuard>
  )
}

export function StudentOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['student']}>
      {children}
    </RoleGuard>
  )
}
