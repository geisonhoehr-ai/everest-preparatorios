"use client"

import type React from "react"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Menu, X, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
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
import { useAuth } from "@/hooks/use-auth"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { user, role, isAuthenticated, isLoading, isInitialized } = useAuth()

  const handleLogout = async () => {
    console.log("🔄 [DASHBOARD_SHELL] Iniciando logout...")
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Função para traduzir o role
  const getRoleDisplay = (role: string | null) => {
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
  }

  // Mostrar loading apenas se ainda não inicializou
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen w-full flex bg-background">
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Overlay para mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Menu Mobile - Implementação mais simples */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav items={sidebarNavItems} />
          </div>
          
          {/* Footer Mobile */}
          <div className="border-t p-3 space-y-3">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              {user?.email && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <AvatarWithAutoFallback 
                        email={user.email}
                        fallback={user.email ? user.email.substring(0, 2).toUpperCase() : "US"}
                        size="sm"
                        className="h-8 w-8"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {isLoading ? "Carregando..." : getRoleDisplay(role)}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botão Menu Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar Desktop */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-sidebar bg-background border-r transition-all duration-300",
        collapsed ? "w-16" : "w-72"
      )}>
        {/* Header do Sidebar */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && (
            <span className="text-base font-semibold">Everest Preparatórios</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
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

        {/* Footer do Sidebar Desktop - Corrigido z-index e posicionamento */}
        <div className="border-t p-3 relative z-20 bg-background">
          <div className={cn(
            "space-y-3",
            collapsed && "flex flex-col items-center space-y-2"
          )}>
            {/* Theme Toggle */}
            <div className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-between"
            )}>
              {!collapsed && <span className="text-sm font-medium">Tema</span>}
              <ThemeToggle />
            </div>

            {!collapsed && <Separator />}

            {/* User Profile - Corrigido z-index e posicionamento */}
            {user?.email && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start p-2 h-auto",
                      collapsed && "w-10 h-10 p-0 justify-center"
                    )}
                  >
                    <AvatarWithAutoFallback 
                      email={user.email}
                      fallback={user.email ? user.email.substring(0, 2).toUpperCase() : "US"}
                      size="sm"
                      className="h-8 w-8"
                    />
                    {!collapsed && (
                      <div className="ml-3 flex-1 text-left">
                        <p className="text-sm font-medium leading-none truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isLoading ? "Carregando..." : getRoleDisplay(role)}
                        </p>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 z-dropdown" 
                  align={collapsed ? "end" : "start"} 
                  side={collapsed ? "right" : "top"}
                  forceMount
                  sideOffset={5}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isLoading ? "Carregando..." : getRoleDisplay(role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Corrigido padding para evitar sobreposição */}
      <main className={cn(
        "flex-1 transition-all duration-300 md:pl-72",
        collapsed && "md:pl-16"
      )}>
        <div className="h-full p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
