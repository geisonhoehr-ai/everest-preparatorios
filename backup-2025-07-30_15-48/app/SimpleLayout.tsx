'use client'

import { useAuth } from '@/lib/auth-simple'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

interface SimpleLayoutProps {
  children: React.ReactNode
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  const { isLoading } = useAuth()

  // Mostrar loading apenas se ainda está carregando
  if (isLoading) {
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

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )
} 