"use client"

import { useAuthManager } from '@/lib/auth-manager'
import { useState, useEffect } from 'react'

export function useAuth() {
  const [isClient, setIsClient] = useState(false)
  const authState = useAuthManager()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Se ainda não estamos no cliente, retornar estado padrão
  if (!isClient) {
    return {
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      error: null,
      signOut: () => {},
      refresh: () => {},
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
      hasRole: () => false,
      hasAnyRole: () => false,
      canAccess: () => false
    }
  }

  return {
    // Estado básico
    user: authState.user,
    role: authState.role,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    isInitialized: authState.isInitialized,
    error: authState.error,

    // Ações
    signOut: authState.signOut,
    refresh: authState.refresh,

    // Utilitários
    isAdmin: authState.role === 'admin',
    isTeacher: authState.role === 'teacher' || authState.role === 'admin',
    isStudent: authState.role === 'student',

    // Verificações de permissão
    hasRole: (role: string) => authState.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(authState.role || ''),
    canAccess: (requiredRole: string) => {
      const roleHierarchy = { admin: 3, teacher: 2, student: 1 }
      const userLevel = roleHierarchy[authState.role as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
      return userLevel >= requiredLevel
    }
  }
}

// Hook para proteção de componentes
export function useRequireAuth(requiredRole?: string) {
  const auth = useAuth()

  if (!auth.isInitialized) {
    return { ...auth, canRender: false, reason: 'loading' }
  }

  if (!auth.isAuthenticated) {
    return { ...auth, canRender: false, reason: 'unauthenticated' }
  }

  if (requiredRole && !auth.canAccess(requiredRole)) {
    return { ...auth, canRender: false, reason: 'insufficient_permissions' }
  }

  return { ...auth, canRender: true, reason: 'authorized' }
} 