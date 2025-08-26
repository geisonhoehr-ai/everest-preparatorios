"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Home, 
  Settings, 
  User, 
  GraduationCap, 
  MessageSquare, 
  BookText, 
  Calendar,
  LayoutDashboard,
  PenTool,
  Users2,
  Trophy,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Library,
  Users,
  Archive,
  Crown,
  UserCheck,
  GraduationCap as ClassIcon,
  PlayCircle,
  Shield,
  UserPlus,
  Plane
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from '@/components/page-auth-wrapper'

interface SidebarNavItem {
  href: string
  title: string
  icon: React.ElementType
  external?: boolean
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: SidebarNavItem[]
  collapsed?: boolean
}

export function SidebarNav({ className, items: propItems, collapsed: propCollapsed, ...props }: SidebarNavProps) {
  const authResult = useAuth()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Usar collapsed passado como prop ou estado interno
  const collapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed
  
  // Garantir que todos os valores tenham valores padrão seguros
  const userRole = authResult?.user?.role || 'student'
  const isUserAuthenticated = authResult?.isAuthenticated || false
  const currentUser = authResult?.user || null
  
  // Garantir que className tenha um valor padrão
  const safeClassName = className || ""
  
  // Se items foi passado como prop, usar eles
  if (propItems) {
    console.log('🔍 [SIDEBAR] Usando items passados como prop')
  }
  
  // Menu baseado no role do usuário
  let menuItems: SidebarNavItem[]
  if (userRole === 'admin' || userRole === 'teacher') {
    console.log('🔍 [SIDEBAR] Usando menu completo para admin/professor')
    menuItems = adminSidebarNavItems
  } else {
    console.log('🔍 [SIDEBAR] Usando menu limitado para aluno')
    menuItems = sidebarNavItems
  }

  const pathname = usePathname()
  
  return (
    <TooltipProvider>
      <nav className={cn("flex flex-col space-y-1", safeClassName)} {...props}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive && !item.external
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4 w-4", collapsed && "h-5 w-5")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return (
            <div key={item.href}>
              {linkContent}
            </div>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}

// Itens padrão para alunos (menu limitado)
export const sidebarNavItems: SidebarNavItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Home,
    external: false,
  },
  {
    href: "https://alunos.everestpreparatorios.com.br",
    title: "Aulas",
    icon: PlayCircle,
    external: true,
  },
  {
    href: "/flashcards",
    title: "Flashcards",
    icon: BookText,
    external: false,
  },
  {
    href: "/quiz",
    title: "Quiz",
    icon: GraduationCap,
    external: false,
  },
  {
    href: "/calendario",
    title: "Calendário",
    icon: Calendar,
    external: false,
  },
  {
    href: "/suporte",
    title: "Suporte",
    icon: HelpCircle,
    external: false,
  },
]

// Itens completos para admin/professor
export const adminSidebarNavItems: SidebarNavItem[] = [
  ...sidebarNavItems,
  {
    href: "/provas",
    title: "Provas",
    icon: FileText,
    external: false,
  },
  {
    href: "/livros",
    title: "Acervo Digital",
    icon: Archive,
    external: false,
  },
  {
    href: "/redacao",
    title: "Redação",
    icon: PenTool,
    external: false,
  },
  {
    href: "/membros",
    title: "Membros",
    icon: UserCheck,
    external: false,
  },
  {
    href: "/turmas",
    title: "Turmas",
    icon: ClassIcon,
    external: false,
  },
  {
    href: "/community",
    title: "Comunidade",
    icon: Users2,
    external: false,
  },
]
