"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { setUserRole } from "@/app/actions"
import Link from "next/link"
import { BookOpenText, GraduationCap, ChevronRight, AlertTriangle } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState<"student" | "teacher" | "">("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userType) {
      setError("Por favor, selecione se você é aluno ou professor")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🔐 Tentando criar conta:", { email, userType })

      // TEMPORÁRIO: Pulando verificação paid_users para testar CRUD
      const supabase = createClient();
      
      // Lista de emails permitidos (substitui verificação na tabela)
      const emailsPermitidos = ['aluno@teste.com', 'professor@teste.com', 'admin@teste.com'];
      
      if (!emailsPermitidos.includes(email)) {
        setError("Este email não possui acesso à plataforma. Use: aluno@teste.com ou professor@teste.com")
        return
      }

      console.log("✅ Email permitido confirmado:", email)

      // SEGUNDO: Criar conta no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Erro de cadastro:", authError)
        if (authError.message.includes("User already registered")) {
          setError("Este email já possui uma conta. Tente fazer login.")
        } else {
          setError(authError.message)
        }
        return
      }

      console.log("✅ Conta criada com sucesso:", authData.user?.email)

      // Se o usuário foi criado mas precisa confirmar email
      if (authData.user && !authData.session) {
        setSuccess("Conta criada! Verifique seu email para confirmar a conta antes de fazer login.")
        return
      }

      // Se há sessão, definir o role e redirecionar
      if (authData.session) {
        console.log("🔧 Definindo role:", userType)
        const roleResult = await setUserRole(userType)
        console.log("🔧 Resultado do setUserRole:", roleResult)

        if (!roleResult.success) {
          console.error("❌ Erro ao definir role:", roleResult.error)
          setError("Conta criada, mas erro ao configurar perfil. Tente fazer login.")
          return
        }

        // Aguardar um pouco para garantir que o role foi salvo
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Redirecionar baseado no tipo de usuário
        console.log("🔄 Redirecionando para:", userType === "teacher" ? "/teacher" : "/")
        if (userType === "teacher") {
          router.push("/teacher")
        } else {
          router.push("/")
        }
      }
    } catch (err) {
      console.error("❌ Erro geral no cadastro:", err)
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Crie sua conta no Everest Preparatórios!</h1>
          <p className="text-xl text-muted-foreground">Escolha seu perfil e comece a estudar hoje mesmo</p>
        </div>

        {/* Aviso sobre acesso restrito */}
        <Card className="max-w-2xl mx-auto mb-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Acesso Restrito</p>
                <p>
                  Apenas usuários com acesso autorizado podem criar contas na plataforma. Se você não conseguir se
                  cadastrar, entre em contato com o suporte para obter acesso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Perfil */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Card Aluno */}
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-[#FF8800] to-[#FF4000] rounded-full w-16 h-16 flex items-center justify-center">
                <BookOpenText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Área do Aluno</CardTitle>
              <CardDescription>Estude com flashcards, faça quizzes e pratique redação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Flashcards inteligentes com repetição espaçada</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Quizzes personalizados por tópico</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Correção de redações por IA e professores</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Acompanhamento detalhado do progresso</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Professor */}
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-[#FF8800] to-[#FF4000] rounded-full w-16 h-16 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Área do Professor</CardTitle>
              <CardDescription>Gerencie turmas e corrija redações com assistência de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Gerenciamento completo de turmas</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Correção assistida por IA avançada</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Feedback detalhado por áudio e texto</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Relatórios de desempenho dos alunos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Cadastro */}
        <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
            <CardDescription>Preencha os dados para criar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userType">Eu sou:</Label>
                <Select onValueChange={(value: "student" | "teacher") => setUserType(value)} value={userType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <BookOpenText className="h-4 w-4" />
                        <span>Aluno</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Professor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !userType}>
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/login" className="underline text-primary hover:text-primary/80">
                  Faça login aqui
                </Link>
              </div>

              <div className="mt-2 text-center text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{" "}
                <Link href="#" className="underline hover:text-foreground">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link href="#" className="underline hover:text-foreground">
                  Política de Privacidade
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
