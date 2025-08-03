"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, Bell, User, Users, LogOut, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-simple"

interface HeaderMobileProps {
  onMenuClick: () => void
  onLogout: () => void
}

export function HeaderMobile({ onMenuClick, onLogout }: HeaderMobileProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Função para traduzir o role
  const getRoleDisplay = (role: string | null) => {
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

  // Função para obter iniciais do email
  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            <span className="font-bold text-base">Everest</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  aria-label="Menu do usuário"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
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
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
} 