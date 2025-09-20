"use client"

import { Calendar, Home, BookOpen, HelpCircle, Trophy, Users, MessageCircle, Settings, LogOut, UserCheck, FileText, PenTool, Book, HeadphonesIcon, GraduationCap, BarChart3 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/context/auth-context-custom"
import { useRouter, usePathname } from "next/navigation"
import { getMenuItemsForRole, usePermissions } from "@/lib/rbac-system"

// Mapeamento de ícones para os itens do menu
const menuIcons: Record<string, any> = {
  "Dashboard": Home,
  "Cursos": GraduationCap,
  "Flashcards": BookOpen,
  "Quiz": HelpCircle,
  "Ranking": Trophy,
  "Turmas": Users,
  "Calendário": Calendar,
  "Comunidade": MessageCircle,
  "Configurações": Settings,
  "Membros": UserCheck,
  "Suporte": HeadphonesIcon,
  "Redação": PenTool,
  "Provas": FileText,
  "Livros": Book,
  "Administração": Settings
}

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { getMenuItems } = usePermissions(user)

  console.log('🔍 [SIDEBAR] Usuário completo:', user)
  console.log('🔍 [SIDEBAR] Usuário atual:', user ? { 
    name: `${user.first_name} ${user.last_name}`.trim(), 
    email: user.email, 
    role: user.role,
    id: user.id
  } : 'null')

  // Obter itens do menu baseados no sistema RBAC
  const items = getMenuItems()

  console.log('🔍 [SIDEBAR] Itens do menu para role', user?.role, ':', items.map(item => item.title))

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleNavigation = (url: string) => {
    console.log('🔍 [SIDEBAR] Navegando para:', url)
    router.push(url)
  }

  return (
    <Sidebar variant="inset" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-foreground">
              <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">E</span>
              </div>
              <span className="font-medium whitespace-pre text-foreground">Everest Preparatórios</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <div className="mt-8 flex flex-col gap-2">
          {items.map((item) => {
            const IconComponent = menuIcons[item.title]
            const isActive = pathname === item.url
            return (
              <a
                key={item.title}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation(item.url)
                }}
                className={`flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground hover:shadow-sm'
                }`}
              >
                <IconComponent className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground group-hover/sidebar:text-primary'
                }`} />
                <span className="font-medium text-sm">{item.title}</span>
              </a>
            )
          })}
        </div>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <a
            onClick={(e) => {
              e.preventDefault()
              handleLogout()
            }}
            className="flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:shadow-sm"
          >
            <LogOut className="h-5 w-5 shrink-0 transition-colors duration-200 group-hover/sidebar:text-destructive" />
            <span className="font-medium text-sm">Logout</span>
          </a>
          
          <div className="flex items-center justify-between w-full p-3 rounded-lg bg-accent border border-border">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                {user?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">{user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuário'}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <ModeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
