"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_role")
          .eq("user_uuid", session.user.id)
          .single()
        if (profileError || !profile || !profile.user_role) {
          router.push("/role-selection")
        } else {
          router.push("/")
        }
      }
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase])

  // Etapa 1: Verificar se o e-mail existe
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setShowReset(false)
    // Tenta fazer login com senha em branco para checar se o usuário existe
    const { error } = await supabase.auth.signInWithPassword({ email, password: "" })
    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid email or password")) {
        // Usuário existe, mas senha está errada (ou em branco)
        setStep(2)
        setMessage(null)
      } else if (error.message.includes("User not found")) {
        setMessage("E-mail não cadastrado. Entre em contato com o suporte.")
      } else if (error.message.includes("Email not confirmed")) {
        setMessage("E-mail não confirmado. Verifique sua caixa de entrada.")
      } else {
        setMessage(error.message)
      }
    } else {
      // Não deveria acontecer, mas por segurança
      setStep(2)
      setMessage(null)
    }
    setLoading(false)
  }

  // Etapa 2: Login com senha
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage("Senha incorreta. Tente novamente ou redefina sua senha.")
      setShowReset(true)
      toast({
        title: "Erro de Login",
        description: error.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  // Redefinir senha
  const handleResetPassword = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setMessage("Erro ao enviar e-mail de redefinição: " + error.message)
    } else {
      setMessage("E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.")
      setShowReset(false)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription>Entre com seu e-mail para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</> : "Continuar"}
              </Button>
              {message && <p className="text-center text-sm text-red-500">{message}</p>}
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !password}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</> : "Entrar"}
              </Button>
              {showReset && (
                <Button type="button" variant="link" className="w-full p-0 h-auto" onClick={handleResetPassword} disabled={loading}>
                  Esqueci minha senha
                </Button>
              )}
              <Button type="button" variant="link" className="w-full p-0 h-auto" onClick={() => setStep(1)} disabled={loading}>
                Voltar
              </Button>
              {message && <p className="text-center text-sm text-red-500">{message}</p>}
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/signup")}>Cadastre-se</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
