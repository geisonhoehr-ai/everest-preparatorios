"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Home, Settings, User, GraduationCap, MessageSquareText, BookText, MonitorPlay, Calendar } from "lucide-react" // Adicionei MonitorPlay para Meus Cursos

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ElementType
    external?: boolean // Adicionado propriedade para links externos
  }[]
  collapsed?: boolean
}

export function SidebarNav({ className, items, collapsed = false, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          // Se for um link externo, abre em nova aba
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-start",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            item.href.startsWith("/teacher") && pathname.startsWith("/teacher")
              ? "bg-accent text-accent-foreground"
              : "",
            item.href.startsWith("/community") && pathname.startsWith("/community")
              ? "bg-accent text-accent-foreground"
              : "",
            collapsed ? "justify-center" : ""
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span className={cn("transition-all duration-300", collapsed ? "opacity-0 w-0 h-0" : "opacity-100")}>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

export const mainNavItems = [
  {
    href: "/",
    title: "Início",
    icon: Home,
  },
  {
    href: "/flashcards",
    title: "Flashcards",
    icon: BookText,
  },
  {
    href: "/my-flashcards",
    title: "Meus Flashcards",
    icon: BookOpen,
  },
  {
    href: "/quiz",
    title: "Quiz",
    icon: GraduationCap,
  },
  {
    href: "/redacao",
    title: "Redação",
    icon: MessageSquareText,
  },
  {
    href: "/community",
    title: "Comunidade",
    icon: MessageSquareText,
  },
  {
    href: "/calendario",
    title: "Calendário",
    icon: Calendar,
  },
  {
    href: "https://alunos.everestpreparatorios.com.br/", // Link para a Memberkit
    title: "Meus Cursos",
    icon: MonitorPlay, // Ícone para cursos/vídeos
    external: true, // Marca como link externo
  },
]

export const profileNavItems = [
  {
    href: "/profile",
    title: "Perfil",
    icon: User,
  },
  {
    href: "/settings",
    title: "Configurações",
    icon: Settings,
  },
]

export const sidebarNavItems = [...mainNavItems, ...profileNavItems]
