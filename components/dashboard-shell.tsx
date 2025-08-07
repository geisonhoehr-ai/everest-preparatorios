"use client"

import type React from "react"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight, Menu, User, Settings, LogOut, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeIcons } from "@/components/theme-icons"
import { Avatar, AvatarFallback, AvatarImage, AvatarWithAutoFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-simple"
import { useIsMobile } from "@/hooks/use-mobile"
import { HeaderMobile } from "@/components/ui/header-mobile"
import { MobileMenu } from "@/components/ui/mobile-menu"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()
  const isMobile = useIsMobile()

  // Fechar menu mobile quando mudar de rota
  useEffect(() => {
    setMobileOpen(false)
  }, [router])

  // Fechar menu mobile quando redimensionar para desktop
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [isMobile, mobileOpen])

  const handleLogout = useCallback(async () => {
    console.log("🔄 [DASHBOARD_SHELL] Iniciando logout...")
    try {
      await signOut()
      // Redirecionar para a home externa após logout
      window.location.href = "https://everestpreparatorios.com.br"
    } catch (error) {
      console.error("❌ [DASHBOARD_SHELL] Erro no logout:", error)
    }
  }, [signOut])

  // Função para traduzir o role
  const getRoleDisplay = useCallback((role: string | null) => {
    if (isLoading) {
      return "Carregando..."
    }
    
    switch (role) {
      case "teacher":
        return "Professor"
      case "admin":
        return "Administrador"
      case "student":
      default:
        return "Estudante"
    }
  }, [isLoading])

  // Função para obter iniciais do email
  const getInitials = useCallback((email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }, [])

  // Memoizar o conteúdo do usuário para evitar re-renderizações
  const userContent = useMemo(() => {
    if (!user) return null

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-orange-100 text-orange-600">
            {getInitials(user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.email}</p>
          <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }, [user, getInitials, getRoleDisplay, handleLogout])

  // Mostrar loading apenas se ainda não inicializou
  if (isLoading) {
    return (
      <div className="dashboard-layout bg-background">
        <div className="flex items-center justify-center w-full h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout bg-background" style={{ margin: 0, padding: 0 }}>
      {/* Header Mobile */}
      <HeaderMobile 
        onMenuClick={() => setMobileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Menu Mobile */}
      <MobileMenu 
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Sidebar Desktop */}
      <div className={cn(
        "hidden md:flex md:flex-col sidebar-stable",
        collapsed && "collapsed"
      )} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: collapsed ? '4rem' : '16rem',
        zIndex: 50
      }}>
        <div className="flex h-full flex-col border-r bg-background">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-600" />
              {!collapsed && (
                <span className="font-bold text-lg">Everest Preparatórios</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav items={sidebarNavItems} collapsed={collapsed} />
          </div>
          
          {/* Mobile menu button for collapsed sidebar */}
          {collapsed && (
            <div className="px-3 pb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="w-full h-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* User section desktop */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <DropdownMenuItem onClick={() => router.push('/membros')}>
                        <Users className="mr-2 h-4 w-4" />
                        Membros
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Theme Icons no menu lateral */}
              <div className="mt-3">
                <ThemeIcons collapsed={collapsed} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content - Corrigido para mobile sem margem à esquerda */}
      <div className={cn(
        "main-content-stable",
        collapsed && "collapsed"
      )} style={{ 
        margin: 0, 
        padding: 0, 
        marginLeft: isMobile ? 0 : (collapsed ? '4rem' : '16rem'),
        width: isMobile ? '100vw' : (collapsed ? 'calc(100vw - 4rem)' : 'calc(100vw - 16rem)'),
        position: 'relative',
        left: 0,
        top: 0
      }}>
        {/* Page content - Corrigido para mobile sem margem à esquerda */}
        <main className="content-wrapper" style={{ 
          margin: 0, 
          padding: isMobile ? '4rem 0.5rem 1rem 0.5rem' : '1rem 1.5rem',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          marginLeft: isMobile ? 0 : 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
