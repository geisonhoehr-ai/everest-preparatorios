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
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setSession(currentSession)
        if (currentSession?.user?.id) {
          const role = await getUserRoleClient(currentSession.user.id)
          setUserRole(role)
          if (event === "SIGNED_IN") {
            if (role === "teacher" && window.location.pathname !== "/teacher") {
              router.push("/teacher")
              router.refresh()
            } else if (role === "student" && window.location.pathname !== "/") {
              router.push("/")
              router.refresh()
            }
          }
        } else {
          setUserRole(null)
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUserRole(null)
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
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
  }, [supabase, router, toast])

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
