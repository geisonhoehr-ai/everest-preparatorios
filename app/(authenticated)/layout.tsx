"use client"

import { useAuth } from "@/context/auth-context-custom"
import { AuthProvider } from "@/context/auth-context-custom"
import { AutoCollapseSidebar } from "@/components/auto-collapse-sidebar"
import SupabaseRealtimeListener from "@/components/supabase-realtime-listener"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
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
    <AutoCollapseSidebar>
      {children}
      <SupabaseRealtimeListener />
    </AutoCollapseSidebar>
  )
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthenticatedContent>
        {children}
      </AuthenticatedContent>
    </AuthProvider>
  )
}