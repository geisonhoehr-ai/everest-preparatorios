"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { DashboardShell } from "@/components/dashboard-shell"
import { usePathname } from "next/navigation"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  
  // Rotas que não devem usar o DashboardShell (páginas públicas)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/access-denied',
    '/test-teacher',
    '/test-login',
    '/test-session',
    '/debug',
    '/debug-auth',
    '/debug-login',
    '/test-pandavideo',
    '/test-responsive',
    '/avatar-demo'
  ]
  
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Se for rota pública, renderizar sem DashboardShell
  if (isPublicRoute) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    )
  }
  
  // Para rotas protegidas, usar DashboardShell com menu lateral
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DashboardShell>
        {children}
      </DashboardShell>
      <Toaster />
    </ThemeProvider>
  )
}
