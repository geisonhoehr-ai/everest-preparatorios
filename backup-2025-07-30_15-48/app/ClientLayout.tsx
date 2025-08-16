"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useAuthManager } from "@/lib/auth-manager"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isLoading, isInitialized, error } = useAuthManager()
  const [showLoading, setShowLoading] = useState(true)

  // LOG TEMPORÁRIO PARA DEBUG
  console.log('🔍 [CLIENT_LAYOUT] Estado:', { isLoading, isInitialized, error })

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚠️ [CLIENT_LAYOUT] Timeout de loading - forçando renderização')
      setShowLoading(false)
    }, 15000) // 15 segundos

    return () => clearTimeout(timeout)
  }, [])

  // Atualizar estado de loading quando auth inicializar
  useEffect(() => {
    if (isInitialized) {
      setShowLoading(false)
    }
  }, [isInitialized])

  // Mostrar loading apenas se ainda não inicializou E não há erro E não passou do timeout
  if (isLoading && !isInitialized && !error && showLoading) {
    console.log('🔄 [CLIENT_LAYOUT] Mostrando loading...')
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Se há erro, mostrar mensagem de erro mas permitir acesso
  if (error) {
    console.warn('⚠️ [CLIENT_LAYOUT] Erro no AuthManager:', error)
  }

  console.log('✅ [CLIENT_LAYOUT] Renderizando children')
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
