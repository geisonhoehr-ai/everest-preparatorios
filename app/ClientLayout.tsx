"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/supabase-js"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { getUserRoleClient, getAuthAndRole, clearUserRoleCache } from "@/lib/get-user-role"
// import { SiteHeader } from "@/components/site-header"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    console.log("🔄 [CLIENT_LAYOUT] Iniciando configuração de autenticação...")
    
    // Função para carregar dados do usuário
    const loadUserData = async (currentSession: Session | null) => {
      try {
        if (currentSession?.user?.id) {
          console.log("✅ [CLIENT_LAYOUT] Sessão encontrada, carregando role...")
          const role = await getUserRoleClient(currentSession.user.id)
          setUserRole(role)
          console.log("✅ [CLIENT_LAYOUT] Role carregado:", role)
        } else {
          console.log("❌ [CLIENT_LAYOUT] Nenhuma sessão encontrada")
          setUserRole(null)
        }
      } catch (error) {
        console.error("❌ [CLIENT_LAYOUT] Erro ao carregar dados do usuário:", error)
        setUserRole(null)
      }
    }

    // Configurar listener de mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("🔄 [CLIENT_LAYOUT] Auth event:", event)
      console.log("🔄 [CLIENT_LAYOUT] Current pathname:", pathname)
      console.log("🔄 [CLIENT_LAYOUT] Session user:", currentSession?.user?.email)
      
      setSession(currentSession)
      
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (currentSession?.user?.id) {
          // Limpar cache para garantir dados frescos
          clearUserRoleCache(currentSession.user.id)
          
          // Carregar dados do usuário
          await loadUserData(currentSession)
          
          // Só redireciona se estiver na página de login após fazer login
          if (event === "SIGNED_IN" && pathname === "/login") {
            const role = await getUserRoleClient(currentSession.user.id)
            console.log("🔄 [CLIENT_LAYOUT] Redirecionando após login, role:", role)
            
            if (role === "teacher") {
              window.location.replace("/teacher")
            } else {
              window.location.replace("/dashboard")
            }
          }
        } else {
          setUserRole(null)
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🔄 [CLIENT_LAYOUT] Usuário desconectado")
        setUserRole(null)
        
        // Limpar cache
        clearUserRoleCache()
        
        if (pathname !== "/" && pathname !== "/login" && pathname !== "/signup") {
          router.push("/login")
          router.refresh()
        }
        toast({
          title: "Sessão encerrada",
          description: "Você foi desconectado.",
          variant: "destructive",
        })
      }
      
      setLoadingSession(false)
      setAuthInitialized(true)
    })

    // Carregar sessão inicial
    const loadInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        console.log("🔄 [CLIENT_LAYOUT] Sessão inicial:", initialSession?.user?.email)
        
        if (initialSession) {
          setSession(initialSession)
          await loadUserData(initialSession)
        }
      } catch (error) {
        console.error("❌ [CLIENT_LAYOUT] Erro ao carregar sessão inicial:", error)
      } finally {
        setLoadingSession(false)
        setAuthInitialized(true)
      }
    }

    loadInitialSession()

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [supabase, router, toast, pathname])

  // Mostrar loading apenas se ainda não inicializou
  if (loadingSession && !authInitialized) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Só renderiza o menu principal se não estiver em /community
  // const isCommunity = pathname?.startsWith("/community")

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* {!isCommunity && <SiteHeader />} */}
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
