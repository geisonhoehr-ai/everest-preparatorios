"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context-custom"

export function useAdminMode() {
  const { profile } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Verificar se o usuário tem permissão para modo admin
  const canUseAdminMode = profile && (profile.role === 'teacher' || profile.role === 'administrator')
  
  // Debug logs
  console.log('🔧 [USE_ADMIN_MODE] profile:', profile)
  console.log('🔧 [USE_ADMIN_MODE] canUseAdminMode:', canUseAdminMode)
  console.log('🔧 [USE_ADMIN_MODE] isAdminMode:', isAdminMode)

  // Carregar estado do localStorage ao inicializar
  useEffect(() => {
    if (canUseAdminMode) {
      const storedAdminMode = localStorage.getItem('adminMode')
      setIsAdminMode(storedAdminMode === 'true')
    } else {
      setIsAdminMode(false)
      localStorage.removeItem('adminMode')
    }
  }, [canUseAdminMode])

  const toggleAdminMode = () => {
    if (canUseAdminMode) {
      setIsAdminMode(prev => {
        const newState = !prev
        localStorage.setItem('adminMode', String(newState))
        return newState
      })
    }
  }

  const enableAdminMode = () => {
    if (canUseAdminMode) {
      setIsAdminMode(true)
      localStorage.setItem('adminMode', 'true')
    }
  }

  const disableAdminMode = () => {
    setIsAdminMode(false)
    localStorage.removeItem('adminMode')
  }

  return {
    isAdminMode: isAdminMode && canUseAdminMode,
    canUseAdminMode,
    toggleAdminMode,
    enableAdminMode,
    disableAdminMode,
    userRole: profile?.role
  }
}
