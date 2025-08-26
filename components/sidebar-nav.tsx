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
  
  // Debug detalhado
  console.log('🔍 [SIDEBAR DEBUG] Valores completos:', {
    authResult: authResult,
    userRole,
    isUserAuthenticated,
    currentUser,
    propItems: !!propItems
  })
  
  // Garantir que className tenha um valor padrão
  const safeClassName = className || ""
  
  // Verificação de segurança para evitar erros de renderização
  if (!authResult) {
    console.warn('⚠️ [SIDEBAR] useAuth retornou undefined, usando valores padrão')
  }
  
  // Menu baseado no role para evitar re-renderizações
  const menuItems = (() => {
    // Debug: verificar valores de autenticação
    console.log('🔍 [SIDEBAR DEBUG] Valores de autenticação:', {
      authResult: !!authResult,
      userRole,
      isUserAuthenticated,
      currentUser: !!currentUser,
      propItems: !!propItems
    })
    
    // Se items foi passado como prop, usar eles
    if (propItems) {
      console.log('🔍 [SIDEBAR] Usando items passados como prop')
      return propItems
    }
    
    // Verificação de segurança adicional
    if (!isUserAuthenticated || !currentUser || !userRole) {
      console.log('⚠️ [SIDEBAR] Valores de autenticação não definidos:', { isUserAuthenticated, currentUser, userRole })
      return []
    }
    
    console.log('🔍 [SIDEBAR] Role detectado:', userRole)
    
    // Menu específico para estudantes
    if (userRole === 'student') {
      console.log('👨‍🎓 [SIDEBAR] Renderizando menu de estudante')
      return [
        {
          title: "Dashboard Aluno",
          href: "/dashboard/aluno",
          icon: Home,
          external: false,
        },
        {
          title: "Aulas",
          href: "https://alunos.everestpreparatorios.com.br",
          icon: PlayCircle,
          external: true,
        },
        {
          title: "Flashcards",
          href: "/flashcards",
          icon: BookOpen,
          external: false,
        },
        {
          title: "Quiz",
          href: "/quiz",
          icon: HelpCircle,
          external: false,
        },
        {
          title: "Calendário",
          href: "/calendario",
          icon: Calendar,
          external: false,
        },
        {
          title: "Suporte",
          href: "/suporte",
          icon: HelpCircle,
          external: false,
        },
      ]
    }

    // Menu para professores e admins (todas as páginas)
    console.log('👨‍🏫 [SIDEBAR] Renderizando menu completo para:', userRole)
    const baseItems = [
      {
        title: "Dashboard",
        href: userRole === 'teacher' ? "/dashboard/professor" : "/dashboard/admin",
        icon: Home,
        external: false,
      },
      {
        title: "Aulas",
        href: "https://alunos.everestpreparatorios.com.br",
        icon: PlayCircle,
        external: true,
      },
      {
        title: "Flashcards",
        href: "/flashcards",
        icon: BookOpen,
        external: false,
      },
      {
        title: "Quiz",
        href: "/quiz",
        icon: HelpCircle,
        external: false,
      },
      {
        title: "CIAAR",
        href: "/ciaar",
        icon: Plane,
        external: false,
      },
      {
        title: "Provas",
        href: "/provas",
        icon: FileText,
        external: false,
      },
      {
        title: "Acervo Digital",
        href: "/livros",
        icon: Archive,
        external: false,
      },
      {
        title: "Redação",
        href: "/redacao",
        icon: PenTool,
        external: false,
      },
      {
        title: "Membros",
        href: "/membros",
        icon: UserCheck,
        external: false,
      },
      {
        title: "Turmas",
        href: "/turmas",
        icon: ClassIcon,
        external: false,
      },
      {
        title: "Comunidade",
        href: "/community",
        icon: Users2,
        external: false,
      },
      {
        title: "Calendário",
        href: "/calendario",
        icon: Calendar,
        external: false,
      },
      {
        title: "Suporte",
        href: "/suporte",
        icon: HelpCircle,
        external: false,
      },
    ]

    // Adicionar página de Admin apenas para admins
    if (userRole === 'admin') {
      baseItems.push(
        {
          title: "Admin",
          href: "/admin",
          icon: Shield,
          external: false,
        }
      )
    }

    console.log('🔍 [SIDEBAR] Menu final:', baseItems.length, 'itens')
    return baseItems
  })()

  // Log otimizado - apenas quando o role muda
  useEffect(() => {
    if (userRole === 'teacher' || userRole === 'admin') {
      console.log('👨‍🏫 [SIDEBAR] Mostrando menu completo para professor/admin')
    } else if (userRole === 'student') {
      console.log('👨‍🎓 [SIDEBAR] Mostrando menu limitado para estudante')
    }
  }, [userRole])

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

// Itens padrão para compatibilidade
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
