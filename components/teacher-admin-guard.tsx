"use client"

import { useAuth } from "@/context/auth-context"
import { ReactNode } from "react"

interface TeacherAndAdminOnlyProps {
  children: ReactNode
}

export function TeacherAndAdminOnly({ children }: TeacherAndAdminOnlyProps) {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'administrator')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Esta página é restrita para professores e administradores.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Seu perfil atual: {profile?.role || 'Não identificado'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
