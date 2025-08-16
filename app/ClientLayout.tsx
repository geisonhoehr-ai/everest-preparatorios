"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // DESABILITADO TEMPORARIAMENTE PARA PERMITIR LOGIN
  console.log('⚠️ [CLIENT_LAYOUT] Desabilitado temporariamente - renderizando diretamente')
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )

  // CÓDIGO ORIGINAL COMENTADO - REABILITAR DEPOIS QUE LOGIN ESTIVER ESTÁVEL
  /*
  useEffect(() => {
    // Inicializar AuthManager de forma segura
    const initAuth = async () => {
      try {
        await AuthManager.getInstance().updateAuthState()
      } catch (error) {
        console.warn('⚠️ [CLIENT_LAYOUT] Erro ao inicializar AuthManager:', error)
      }
    }
    
    initAuth()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )
  */
}
