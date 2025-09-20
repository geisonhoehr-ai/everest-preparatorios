"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context-custom"
import { useMobileMenu } from "../mobile-menu-provider"
import { 
  BarChart3, 
  Users, 
  FileText, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  GraduationCap, 
  Monitor,
  LogOut,
  User,
  Crown,
  X,
  Brain,
  Trophy,
  MessageSquare,
  Settings,
  Headphones,
  Building2,
  Sun
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function StandardSidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { isMobileOpen, toggleMobile } = useMobileMenu()
  const { success, error: showError, info } = useToast()

  // Estrutura de navegação baseada na plataforma de referência
  const navigationSections = [
    {
      title: "Navegação",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: BarChart3, access: "all" },
        { title: "Meus Cursos", href: "/flashcards", icon: BookOpen, access: "all" },
        { title: "Metas", href: "/ranking", icon: Trophy, access: "all" },
        { title: "Sugestões de Aulas", href: "/quiz", icon: Brain, access: "all" },
        { title: "Profile", href: "/profile", icon: User, access: "all" },
      ]
    },
    {
      title: "FERRAMENTAS",
      items: [
        { title: "Quiz", href: "/quiz", icon: Brain, access: "all" },
        { title: "Flashcards", href: "/flashcards", icon: BookOpen, access: "all" },
        { title: "EverCast", href: "/evercast", icon: Headphones, access: "all" },
      ]
    },
    {
      title: "COMUNIDADE",
      items: [
        { title: "Ranking", href: "/ranking", icon: Trophy, access: "all" },
        { title: "Calendário", href: "/calendario", icon: Calendar, access: "all" },
        { title: "Comunidade", href: "/community", icon: MessageSquare, access: "teacher" },
      ]
    },
    {
      title: "ADMINISTRAÇÃO",
      items: [
        { title: "Membros", href: "/membros", icon: Users, access: "teacher" },
        { title: "Redação", href: "/redacao", icon: FileText, access: "teacher" },
        { title: "Provas", href: "/provas", icon: ClipboardList, access: "teacher" },
        { title: "Livros", href: "/livros", icon: BookOpen, access: "teacher" },
        { title: "Turmas", href: "/turmas", icon: Users, access: "teacher" },
      ]
    }
  ]

  const handleLogout = async () => {
    try {
      info("Fazendo logout...", "Aguarde um momento...")
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      showError("Erro no logout", "Ocorreu um erro ao tentar sair do sistema.")
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
  }

  const handleNavigationClick = () => {
    if (isMobileOpen) {
      toggleMobile()
    }
  }

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email.split('@')[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Usuário'
  }

  // Filtrar itens baseado no role do usuário
  const filterItems = (items: any[]) => {
    return items.filter(item => {
      if (item.access === "all") return true
      if (item.access === "teacher" && (profile?.role === "teacher" || profile?.role === "administrator")) return true
      if (item.access === "admin" && profile?.role === "administrator") return true
      return false
    })
  }

  const sidebarContent = (
    <div className="h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0 justify-between gap-10">
      {/* Logo */}
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <Link 
          className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black" 
          href="/dashboard"
        >
          <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white"></div>
        </Link>

        {/* Navigation Sections */}
        {navigationSections.map((section, sectionIndex) => {
          const filteredItems = filterItems(section.items)
          
          if (filteredItems.length === 0) return null

          return (
            <div key={section.title} className={sectionIndex === 0 ? "mt-8" : "mt-6"}>
              {/* Section Title */}
              <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              
              {/* Section Items */}
              <div className="flex flex-col gap-2">
                {filteredItems.map((item) => {
                  const IconComponent = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavigationClick}
                      className={`
                        flex items-center justify-start gap-2 group/sidebar py-2
                        ${isActive 
                          ? 'bg-orange-600 text-white shadow-sm rounded-md' 
                          : 'text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 rounded-md'
                        }
                      `}
                    >
                      <IconComponent className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'group-hover/sidebar:translate-x-1 transition duration-150'}`} />
                      <span className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
                        {item.title}
                      </span>
                      {item.access === "teacher" && (
                        <span className="ml-auto text-xs bg-blue-500 text-blue-900 px-2 py-1 rounded-full font-medium">
                          PROF
                        </span>
                      )}
                      {item.access === "admin" && (
                        <span className="ml-auto text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-medium">
                          ADMIN
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Logout Section */}
        <div className="mt-8 flex flex-col gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center justify-start gap-2 group/sidebar py-2 text-neutral-700 dark:text-neutral-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover/sidebar:translate-x-1 transition duration-150" />
            <span className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
              Logout
            </span>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-2">
        {/* Everest Preparatórios */}
        <div className="flex items-center justify-start gap-2 py-2">
          <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
          </div>
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" className="flex items-center justify-start gap-2 group/sidebar py-2 text-neutral-700 dark:text-neutral-200 hover:bg-accent hover:text-accent-foreground">
          <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <Sun className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
          </div>
          <span className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
            Mudar tema: claro
          </span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center justify-start gap-2 group/sidebar py-2">
          <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {getUserInitials()}
          </div>
          <span className="text-sm text-neutral-700 dark:text-neutral-200 group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
            {getUserDisplayName()}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Sidebar Mobile */}
      <div className={`
        fixed top-0 left-0 h-full w-[300px] z-[9999] md:hidden transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>
    </>
  )
}
