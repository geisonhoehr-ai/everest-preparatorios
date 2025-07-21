"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/supabase-js"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { getUserRoleClient } from "@/lib/get-user-role"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    console.log("🔄 [ClientLayout] useEffect: Inicializando listener de autenticação.")
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(
        `⚡️ [ClientLayout] onAuthStateChange: Evento '${event}', Session:`,
        currentSession ? "presente" : "ausente",
      )

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setSession(currentSession)
        if (currentSession?.user?.id) {
          console.log("👤 [ClientLayout] Usuário logado. Buscando role...")
          const role = await getUserRoleClient(currentSession.user.id)
          setUserRole(role)
          console.log("✅ [ClientLayout] Role do usuário:", role)

          // Redirecionamento baseado na role após login/sessão inicial
          if (event === "SIGNED_IN") {
            // Apenas redireciona no SIGNED_IN para evitar loops no INITIAL_SESSION
            if (role === "teacher" && window.location.pathname !== "/teacher") {
              console.log("➡️ [ClientLayout] Redirecionando para /teacher")
              router.push("/teacher")
              router.refresh() // Força um refresh para carregar o layout correto
            } else if (role === "student" && window.location.pathname !== "/") {
              console.log("➡️ [ClientLayout] Redirecionando para /")
              router.push("/")
              router.refresh() // Força um refresh
            }
          }
        } else {
          console.log("⚠️ [ClientLayout] Sessão presente, mas user.id ausente.")
          setUserRole(null)
        }
      } else if (event === "SIGNED_OUT") {
        console.log("👋 [ClientLayout] Usuário deslogado. Limpando sessão e role.")
        setSession(null)
        setUserRole(null)
        // Redirecionar para a página de login se não estiver já nela
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
          console.log("➡️ [ClientLayout] Redirecionando para /login")
          router.push("/login")
          router.refresh() // Força um refresh
        }
        toast({
          title: "Sessão encerrada",
          description: "Você foi desconectado.",
          variant: "destructive",
        })
      }
      setLoadingSession(false)
      console.log("✅ [ClientLayout] onAuthStateChange processado.")
    })

    // Limpar o listener ao desmontar o componente
    return () => {
      console.log("🧹 [ClientLayout] Limpando listener de autenticação.")
      // authListener contém { subscription }
      authListener?.subscription?.unsubscribe()
    }
  }, [supabase, router, toast]) // Adicionar toast como dependência

  // Se estiver carregando a sessão, pode mostrar um loading global
  if (loadingSession) {
    console.log("⏳ [ClientLayout] Carregando sessão...")
    // Você pode retornar um spinner ou tela de carregamento aqui
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex items-center justify-center min-h-screen">
          <p>Carregando...</p>
        </div>
      </ThemeProvider>
    )
  }

  console.log("✨ [ClientLayout] Renderizando children. Session:", session ? "presente" : "ausente", "Role:", userRole)
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
