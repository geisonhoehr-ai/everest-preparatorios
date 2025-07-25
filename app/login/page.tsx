"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRoleClient } from "@/lib/get-user-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const router = useRouter();

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setError("");
    setIsCheckingEmail(true);

    try {
      // Pular verificação de email - deixar o Supabase Auth cuidar disso
      // Email formato válido, avançar para senha
      setEmailVerified(true);
      setStep("password");
      setIsCheckingEmail(false);
    } catch (err) {
      console.error("Erro ao verificar email:", err);
      setError("Erro ao verificar email. Tente novamente.");
      setIsCheckingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (loginError) {
        if (loginError.message.includes("Invalid login credentials")) {
          setError("Senha incorreta. Tente novamente.");
        } else {
          setError(loginError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Aguarda um pouco para garantir que a sessão foi estabelecida
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const userId = data.user.id;
        const role = await getUserRoleClient(userId);
        
        console.log("User ID:", userId);
        console.log("User role:", role);
        
        // Usa window.location.replace para garantir o redirecionamento
        if (role === "teacher") {
          window.location.replace("/teacher");
        } else if (role === "admin" || role === "student") {
          window.location.replace("/dashboard");
        } else {
          // Se não tiver role definido, vai para dashboard por padrão
          window.location.replace("/dashboard");
        }
        return;
      }

      setError("Usuário não encontrado após login.");
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro inesperado durante o login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setEmailVerified(false);
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#18181b] px-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-orange-600/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Bem-vindo de volta!
          </CardTitle>
          <CardDescription className="text-center">
            Entre na sua conta para continuar seus estudos
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={checkEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={isCheckingEmail}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isCheckingEmail || !email}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
              >
                {isCheckingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email verificado</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !password}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Ainda não tem uma conta?{" "}
            <Link href="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
              Cadastre-se
            </Link>
          </div>
          {step === "password" && (
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
              Esqueceu sua senha?
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
