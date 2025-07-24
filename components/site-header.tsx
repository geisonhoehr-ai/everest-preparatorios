"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sparkles } from "lucide-react"
import { supabaseClient } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const marqueeMessages = [
  "Mantenha o foco! Você está mais perto do seu objetivo.",
  "Próxima live: 10/08 às 19h com o Prof. Tiago Costa!",
  "Não esqueça de revisar seus flashcards hoje!"
];

function HeaderMarquee() {
  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden h-8">
      <div className="whitespace-nowrap animate-marquee text-sm text-white/90 font-medium">
        {marqueeMessages.map((msg, idx) => (
          <span key={idx} className="mx-8">
            {msg}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 100%;
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}

export function SiteHeader() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userInitials, setUserInitials] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (user) {
        setUserEmail(user.email)
        setUserInitials(user.email ? user.email.substring(0, 2).toUpperCase() : "US")
      } else {
        setUserEmail(null)
        setUserInitials(null)
      }
    }
    getUser()

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email)
        setUserInitials(session.user.email ? session.user.email.substring(0, 2).toUpperCase() : "US")
      } else {
        setUserEmail(null)
        setUserInitials(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between py-4 gap-4">
        <div className="flex items-center space-x-4 min-w-fit">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Everest Preparatórios</span>
          </Link>
        </div>
        <HeaderMarquee />
        <div className="flex items-center space-x-4 min-w-fit">
          <ThemeToggle />
          {userEmail ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userEmail}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push("/login")}>Entrar</Button>
          )}
        </div>
      </div>
    </header>
  )
}
