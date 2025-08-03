"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"
import { X, Sparkles, LogOut, Settings, User, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-simple"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export function MobileMenu({ isOpen, onClose, onLogout }: MobileMenuProps) {
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
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Menu Mobile */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header do menu mobile */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-600" />
              <span className="font-bold text-lg">Everest Preparatórios</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navegação mobile */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav 
              items={sidebarNavItems} 
              onItemClick={onClose}
            />
          </div>
          
          {/* User section mobile */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      router.push('/dashboard')
                      onClose()
                    }}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <DropdownMenuItem onClick={() => {
                        router.push('/membros')
                        onClose()
                      }}>
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
              </div>
              
              {/* Botão de logout direto */}
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 