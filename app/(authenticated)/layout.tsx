"use client"

import { useAuth } from "@/context/auth-context-custom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import SupabaseRealtimeListener from "@/components/supabase-realtime-listener"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 [LAYOUT] Auth state:', { isLoading, user: user?.email, hasUser: !!user, userRole: user?.role })
    
    // Só redirecionar se não estiver carregando E não tiver usuário
    if (!isLoading && !user) {
      console.log('❌ [LAYOUT] Usuário não encontrado, redirecionando para login')
      router.push('/login')
    } else if (!isLoading && user) {
      console.log('✅ [LAYOUT] Usuário autenticado:', { email: user.email, role: user.role, name: `${user.first_name} ${user.last_name}`.trim() })
    }
  }, [isLoading, user, router])

  // Mostrar loading enquanto está verificando a sessão
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Se não está carregando e não tem usuário, mostrar loading (vai redirecionar)
  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Everest Preparatórios
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
      <SupabaseRealtimeListener />
    </SidebarProvider>
  )
}