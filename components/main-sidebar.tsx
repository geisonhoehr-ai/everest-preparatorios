"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useMobileMenu } from "./mobile-menu-provider"
import { 
  BarChart3, 
  Users, 
  FileText, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  GraduationCap, 
  StickyNote, 
  History, 
  Monitor,
  Sparkles,
  LogOut,
  User,
  Crown,
  X,
  Music,
  Brain,
  Trophy,
  MessageSquare,
  Settings,
  Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function MainSidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { isMobileOpen, toggleMobile } = useMobileMenu()
  const { success, error: showError, info } = useToast()

  const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: BarChart3, access: "all" },
    { title: "Quiz", href: "/quiz", icon: Brain, access: "all" },
    { title: "Flashcards", href: "/flashcards", icon: BookOpen, access: "all" },
    { title: "EverCast", href: "/evercast", icon: Headphones, access: "all" },
    { title: "Ranking", href: "/ranking", icon: Trophy, access: "all" },
    { title: "Calendário", href: "/calendario", icon: Calendar, access: "all" },
    { title: "Suporte", href: "/suporte", icon: Monitor, access: "all" },
    { title: "Configurações", href: "/settings", icon: Settings, access: "all" },
    { title: "Membros", href: "/membros", icon: Users, access: "teacher" },
    { title: "Redação", href: "/redacao", icon: FileText, access: "teacher" },
    { title: "Provas", href: "/provas", icon: ClipboardList, access: "teacher" },
    { title: "Comunidade", href: "/community", icon: MessageSquare, access: "teacher" },
    { title: "Livros", href: "/livros", icon: BookOpen, access: "teacher" },
    { title: "Turmas", href: "/turmas", icon: Users, access: "teacher" },
    { title: "Membros", href: "/membros", icon: Users, access: "admin" },
  ]

  // Filtrar itens baseado no role do usuário
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.access === "all") return true
    if (item.access === "teacher" && (profile?.role === "teacher" || profile?.role === "administrator")) return true
    if (item.access === "admin" && profile?.role === "administrator") return true
    return false
  })

  const handleLogout = async () => {
    try {
      // Mostrar toast de loading
      info("Fazendo logout...", "Aguarde um momento...")
      
      await signOut()
      
      // O toast de sucesso não será mostrado pois a página será redirecionada
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      showError("Erro no logout", "Ocorreu um erro ao tentar sair do sistema. Tentando redirecionar...")
      
      // Forçar redirecionamento mesmo com erro
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
  }

  const handleNavigationClick = () => {
    // Fecha o menu mobile quando um item é clicado
    if (isMobileOpen) {
      toggleMobile()
    }
  }

  const getUserInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (user?.email) {
      return user.email.split('@')[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (profile?.display_name) {
      return profile.display_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Usuário'
  }

  const getRoleDisplayName = () => {
    switch (profile?.role) {
      case 'administrator':
        return 'Administrador'
      case 'teacher':
        return 'Professor'
      case 'student':
        return 'Estudante'
      default:
        return 'Usuário'
    }
  }

  // Conteúdo do sidebar
  const sidebarContent = (
    <div className="h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
      {/* Header do mobile com botão de fechar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Menu</h2>
        <Button variant="ghost" size="icon" onClick={toggleMobile}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navegação */}
      <div className="flex-1 p-4 pt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Navegação
        </h3>
        
        <nav className="space-y-2 pb-4">
          {filteredNavigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  console.log('🔗 Link clicado:', item.href)
                  handleNavigationClick()
                }}
                className={`
                  flex items-center gap-3 p-3 rounded-md transition-all duration-200 group relative cursor-pointer
                  ${isActive 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400'
                  }
                `}
              >
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                <span className="font-medium">{item.title}</span>
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
        </nav>
      </div>

      {/* Footer com Informações de Autenticação */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
        {user && profile ? (
          <div className="space-y-3">
            {/* Informações do Usuário */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    profile.role === 'administrator' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' 
                      : profile.role === 'teacher'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                  }`}>
                    {profile.role === 'admin' ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        {getRoleDisplayName()}
                      </span>
                    ) : profile.role === 'teacher' ? (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {getRoleDisplayName()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getRoleDisplayName()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair do Sistema
            </Button>

            {/* Sistema Everest Preparatórios */}
            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Everest Preparatórios
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Preparatórios Militares
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-2 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Carregando...</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop - sempre visível */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar mobile - slide in/out */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-[9999] lg:hidden transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>
    </>
  )
}

export default MainSidebar
