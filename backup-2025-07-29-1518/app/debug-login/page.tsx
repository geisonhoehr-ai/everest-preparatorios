"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { debugUserSystem, createSimpleProfile } from "@/app/actions-debug"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("professor@teste.com")
  const [debugResult, setDebugResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleDebug = async () => {
    setLoading(true)
    try {
      const result = await debugUserSystem(email)
      setDebugResult(result)
      console.log("Debug result:", result)
    } catch (error) {
      console.error("Debug error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async (role: "student" | "teacher") => {
    setLoading(true)
    try {
      const result = await createSimpleProfile(email, role)
      console.log("Create profile result:", result)
      alert(result.success ? "Perfil criado com sucesso!" : `Erro: ${result.error}`)
    } catch (error) {
      console.error("Create profile error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Sistema de Login</CardTitle>
            <CardDescription>Ferramenta para debugar problemas de login e perfis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email para Debug</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@teste.com"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDebug} disabled={loading}>
                {loading ? "Debugando..." : "Debug Sistema"}
              </Button>
              <Button onClick={() => handleCreateProfile("teacher")} disabled={loading} variant="outline">
                Criar Perfil Professor
              </Button>
              <Button onClick={() => handleCreateProfile("student")} disabled={loading} variant="outline">
                Criar Perfil Aluno
              </Button>
            </div>

            {debugResult && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Resultado do Debug:</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
