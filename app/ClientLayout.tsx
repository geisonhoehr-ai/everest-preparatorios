"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/supabase-js"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { getUserRoleClient } from "@/lib/get-user-role"
import { SiteHeader } from "@/components/site-header"

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

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth event:", event);
      console.log("Current pathname:", pathname);
      
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setSession(currentSession)
        if (currentSession?.user?.id) {
          const role = await getUserRoleClient(currentSession.user.id)
          setUserRole(role)
          console.log("User role in ClientLayout:", role);
          
          // Só redireciona se estiver na página de login após fazer login
          if (event === "SIGNED_IN" && pathname === "/login") {
            if (role === "teacher") {
              window.location.replace("/teacher");
            } else {
              window.location.replace("/dashboard");
            }
          }
        } else {
          setUserRole(null)
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUserRole(null)
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
    })
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [supabase, router, toast, pathname])

  if (loadingSession) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex items-center justify-center min-h-screen">
          <p>Carregando...</p>
        </div>
      </ThemeProvider>
    )
  }

  // Só renderiza o menu principal se não estiver em /community
  const isCommunity = pathname?.startsWith("/community")

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!isCommunity && <SiteHeader />}
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
