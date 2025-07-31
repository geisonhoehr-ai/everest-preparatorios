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
  Crown,
  UserCheck,
  GraduationCap as ClassIcon
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-simple"

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
  const { user } = useAuth()
  const role = user?.role || 'student'

  // Função para obter os itens do menu baseados no role
  const getMenuItems = (): SidebarNavItem[] => {
    const isTeacher = role === 'teacher' || role === 'admin'
    
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
          href: "/membros",
          title: "Membros",
          icon: UserCheck,
        },
        {
          href: "/turmas",
          title: "Turmas",
          icon: ClassIcon,
        },
        {
          href: "/community",
          title: "Comunidade",
          icon: Users2,
        },
        {
          href: "/calendario",
          title: "Calendário",
          icon: Calendar,
        },
        {
          href: "/suporte",
          title: "Suporte",
          icon: HelpCircle,
        },
      ]
    } else {
      return [
        {
          href: "/dashboard",
          title: "Dashboard",
          icon: Home,
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
          href: "/community",
          title: "Comunidade",
          icon: Users2,
        },
        {
          href: "/calendario",
          title: "Calendário",
          icon: Calendar,
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
          const isActive = pathname === item.href
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
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

// Itens padrão para compatibilidade
export const sidebarNavItems: SidebarNavItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Home,
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
    href: "/membros",
    title: "Membros",
    icon: UserCheck,
  },
  {
    href: "/turmas",
    title: "Turmas",
    icon: ClassIcon,
  },
  {
    href: "/community",
    title: "Comunidade",
    icon: Users2,
  },
  {
    href: "/calendario",
    title: "Calendário",
    icon: Calendar,
  },
  {
    href: "/suporte",
    title: "Suporte",
    icon: HelpCircle,
  },
]
