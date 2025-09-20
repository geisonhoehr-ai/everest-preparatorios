"use client"

import { useAuth } from "@/context/auth-context-custom"
import { usePermissions, Permission } from "@/lib/rbac-system"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface RBACGuardProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  redirectTo?: string
}

export function RBACGuard({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback,
  redirectTo = "/dashboard"
}: RBACGuardProps) {
  const { user, isLoading } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(user)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Se não há usuário, não renderizar nada (será redirecionado)
  if (!user) {
    return null
  }

  // Verificar permissões
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  } else {
    // Se não há permissões especificadas, permitir acesso
    hasAccess = true
  }

  // Se não tem acesso, mostrar fallback ou redirecionar
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Redirecionar para página permitida
    router.push(redirectTo)
    return <LoadingSpinner />
  }

  return <>{children}</>
}

// Componentes específicos para cada role
export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return null
  
  if (user.role !== 'student') {
    return <>{fallback || <div>Acesso negado. Esta área é apenas para alunos.</div>}</>
  }
  
  return <>{children}</>
}

export function TeacherOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return null
  
  if (user.role !== 'teacher' && user.role !== 'administrator') {
    return <>{fallback || <div>Acesso negado. Esta área é apenas para professores.</div>}</>
  }
  
  return <>{children}</>
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return null
  
  if (user.role !== 'administrator') {
    return <>{fallback || <div>Acesso negado. Esta área é apenas para administradores.</div>}</>
  }
  
  return <>{children}</>
}

// Hook para verificar permissões em componentes
export function useRBAC() {
  const { user, isLoading } = useAuth()
  const permissions = usePermissions(user)
  
  return {
    ...permissions,
    user,
    isLoading,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'administrator'
  }
}
