"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  Crown
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"
import { getAuthAndRole } from "@/lib/get-user-role"
import { useState, useEffect } from "react"

interface SidebarNavItem {
  href: string
  title: string
  icon: React.ElementType
  external?: boolean
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[]
  collapsed?: boolean
}

export function SidebarNav({ className, items, collapsed = false, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { role } = await getAuthAndRole()
        setUserRole(role)
      } catch (error) {
        console.error('Erro ao carregar role:', error)
        setUserRole('student')
      }
    }

    loadUserRole()
  }, [])

  // Função para obter os itens do menu baseados no role
  const getMenuItems = (): SidebarNavItem[] => {
    const isTeacher = userRole === 'teacher' || userRole === 'admin'
    
    if (isTeacher) {
      return [
        {
          href: "/teacher",
          title: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/cursos",
          title: "Cursos",
          icon: BookOpen,
        },
        {
          href: "/flashcards",
          title: "Flashcards",
          icon: BookText,
        },
        {
          href: "/quiz",
          title: "Quiz",
          icon: GraduationCap,
        },
        {
          href: "/provas",
          title: "Provas",
          icon: FileText,
        },
        {
          href: "/livros",
          title: "Acervo Digital",
          icon: Archive,
        },
        {
          href: "/redacao",
          title: "Redação",
          icon: PenTool,
        },
        {
          href: "/calendario",
          title: "Calendário",
          icon: Calendar,
        },
        {
          href: "/community",
          title: "Comunidade",
          icon: Users2,
        },
        {
          href: "/suporte",
          title: "Suporte",
          icon: HelpCircle,
        },
      ]
    } else {
      // Menu para estudantes
      return [
        {
          href: "/dashboard",
          title: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/cursos",
          title: "Cursos",
          icon: BookOpen,
        },
        {
          href: "/flashcards",
          title: "Flashcards",
          icon: BookText,
        },
        {
          href: "/quiz",
          title: "Quiz",
          icon: GraduationCap,
        },
        {
          href: "/provas",
          title: "Provas",
          icon: FileText,
        },
        {
          href: "/livros",
          title: "Acervo Digital",
          icon: Archive,
        },
        {
          href: "/redacao",
          title: "Redação",
          icon: PenTool,
        },
        {
          href: "/calendario",
          title: "Calendário",
          icon: Calendar,
        },
        {
          href: "/community",
          title: "Comunidade",
          icon: Users2,
        },
        {
          href: "/suporte",
          title: "Suporte",
          icon: HelpCircle,
        },
      ]
    }
  }

  const menuItems = getMenuItems()

  return (
    <TooltipProvider>
      <nav className={cn("flex flex-col space-y-1", className)} {...props}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          const navItem = (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-accent text-accent-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0",
                collapsed ? "h-5 w-5" : "h-4 w-4"
              )} />
              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  {navItem}
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return navItem
        })}
      </nav>
    </TooltipProvider>
  )
}

// Mantendo a exportação original para compatibilidade
export const sidebarNavItems: SidebarNavItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/flashcards",
    title: "Flashcards",
    icon: BookText,
  },
  {
    href: "/quiz",
    title: "Quiz",
    icon: GraduationCap,
  },
  {
    href: "/provas",
    title: "Provas",
    icon: FileText,
  },
  {
    href: "/livros",
    title: "Acervo Digital",
    icon: Archive,
  },
  {
    href: "/redacao",
    title: "Redação",
    icon: PenTool,
  },
  {
    href: "/calendario",
    title: "Calendário",
    icon: Calendar,
  },
  {
    href: "/community",
    title: "Comunidade",
    icon: Users2,
  },
  {
    href: "/suporte",
    title: "Suporte",
    icon: HelpCircle,
  },
]
