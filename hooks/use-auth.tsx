"use client"

import { useAuthManager } from '@/lib/auth-manager'
import { useState, useEffect, useMemo } from 'react'

export function useAuth() {
  const [isClient, setIsClient] = useState(false)
  const authState = useAuthManager()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoizar valores computados para evitar recálculos desnecessários
  const computedValues = useMemo(() => {
    if (!isClient || !authState.role) {
      return {
        isAdmin: false,
        isTeacher: false,
        isStudent: false,
        roleDisplay: 'Carregando...',
        roleColor: 'text-gray-500'
      }
    }

    return {
      isAdmin: authState.role === 'admin',
      isTeacher: authState.role === 'teacher' || authState.role === 'admin',
      isStudent: authState.role === 'student',
      roleDisplay: getRoleDisplay(authState.role),
      roleColor: getRoleColor(authState.role)
    }
  }, [isClient, authState.role])

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
      roleDisplay: 'Carregando...',
      roleColor: 'text-gray-500',
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

    // Utilitários computados
    ...computedValues,

    // Verificações de permissão
    hasRole: (role: string) => authState.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(authState.role || ''),
    canAccess: (requiredRole: string) => {
      const roleHierarchy = { admin: 3, teacher: 2, student: 1 }
      const userLevel = roleHierarchy[authState.role as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
      return userLevel >= requiredLevel
    },

    // Funções auxiliares
    isRole: (role: string) => authState.role === role,
    hasPermission: (permission: string) => {
      // Sistema de permissões baseado no role
      const permissions = {
        admin: ['all'],
        teacher: ['dashboard', 'students', 'content', 'reports'],
        student: ['dashboard', 'flashcards', 'quiz', 'progress']
      }
      
      const userPermissions = permissions[authState.role as keyof typeof permissions] || []
      return userPermissions.includes('all') || userPermissions.includes(permission)
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

// Hook para proteção de rotas específicas
export function useRouteGuard(requiredRole?: string, redirectTo?: string) {
  const auth = useAuth()
  const { useRouter } = require('next/navigation')
  const router = useRouter()

  useEffect(() => {
    if (auth.isInitialized && !auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push('/login')
      } else if (requiredRole && !auth.canAccess(requiredRole)) {
        router.push(redirectTo || '/access-denied')
      }
    }
  }, [auth.isInitialized, auth.isLoading, auth.isAuthenticated, auth.role, requiredRole, redirectTo, router])

  return auth
}

// Funções auxiliares
function getRoleDisplay(role: string): string {
  const roleNames = {
    admin: '👑 Administrador',
    teacher: '👨‍🏫 Professor',
    student: '🎓 Aluno'
  }
  return roleNames[role as keyof typeof roleNames] || 'Usuário'
}

function getRoleColor(role: string): string {
  const roleColors = {
    admin: 'text-red-600',
    teacher: 'text-green-600',
    student: 'text-blue-600'
  }
  return roleColors[role as keyof typeof roleColors] || 'text-gray-600'
} 