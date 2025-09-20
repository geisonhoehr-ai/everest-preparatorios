"use client"

import { useAdminMode } from "@/hooks/use-admin-mode"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Edit, Eye, EyeOff, Shield, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminModeToggleProps {
  onToggle?: (isAdminMode: boolean) => void
  className?: string
}

export function AdminModeToggle({ onToggle, className }: AdminModeToggleProps) {
  const { isAdminMode, canUseAdminMode, toggleAdminMode, userRole } = useAdminMode()

  // Só mostrar para professores e administradores
  if (!canUseAdminMode) {
    return null
  }

  const handleToggle = () => {
    toggleAdminMode()
    onToggle?.(!isAdminMode)
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'administrator':
        return <Shield className="h-4 w-4" />
      case 'teacher':
        return <User className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRoleColor = () => {
    switch (userRole) {
      case 'administrator':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'teacher':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  const getRoleText = () => {
    switch (userRole) {
      case 'administrator':
        return 'Administrador'
      case 'teacher':
        return 'Professor'
      default:
        return 'Usuário'
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1 px-3 py-1",
          isAdminMode ? "border-orange-500 text-orange-600" : "border-gray-300 text-gray-600"
        )}
      >
        {getRoleIcon()}
        {getRoleText()}
      </Badge>
      
      <Button
        onClick={handleToggle}
        variant={isAdminMode ? "default" : "outline"}
        size="sm"
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          isAdminMode 
            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg" 
            : "border-gray-300 hover:bg-gray-50"
        )}
      >
        {isAdminMode ? (
          <>
            <Eye className="h-4 w-4" />
            Modo Visualização
          </>
        ) : (
          <>
            <Edit className="h-4 w-4" />
            Modo Edição
          </>
        )}
      </Button>
    </div>
  )
}
