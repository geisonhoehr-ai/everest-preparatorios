"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gradient-to-br from-red-50 to-background border-red-200 dark:from-red-950/20 dark:border-red-800">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl text-red-800 dark:text-red-200">Acesso Negado</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              Você não possui autorização para acessar esta plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-red-700 dark:text-red-300">
              <p className="mb-4">
                Apenas usuários com acesso autorizado podem utilizar o Everest Preparatórios. Se você acredita que
                deveria ter acesso, entre em contato conosco.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="mailto:suporte@everest.com" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Entrar em Contato
                </Link>
              </Button>

              <Button asChild className="w-full" variant="ghost">
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Login
                </Link>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Como obter acesso:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Entre em contato com o suporte</li>
                <li>• Verifique se você possui uma assinatura ativa</li>
                <li>• Confirme se está usando o email correto</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
