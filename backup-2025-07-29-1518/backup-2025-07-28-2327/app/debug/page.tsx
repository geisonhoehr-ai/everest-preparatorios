import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTotalScore, getTopicProgress } from "@/app/actions"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function getDebugInfo() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const totalScore = await getTotalScore()
  const topicProgress = await getTopicProgress()

  // Verificar dados diretamente no banco
  let userScoresData = null
  let userTopicProgressData = null

  if (user?.id) {
    const { data: scoresData } = await supabase.from("user_scores").select("*").eq("user_uuid", user.id)

    const { data: progressData } = await supabase.from("user_topic_progress").select("*").eq("user_uuid", user.id)

    userScoresData = scoresData
    userTopicProgressData = progressData
  }

  return {
    user,
    userError,
    totalScore,
    topicProgress,
    userScoresData,
    userTopicProgressData,
  }
}

export default async function DebugPage() {
  const debugInfo = await getDebugInfo()

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Debug - Progresso do Usuário</h1>
      </div>

      <div className="grid gap-6 mt-6">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>Dados de autenticação e identificação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <p>
                <strong>User ID:</strong> {debugInfo.user?.id || "Não autenticado"}
              </p>
              <p>
                <strong>Email:</strong> {debugInfo.user?.email || "N/A"}
              </p>
              <p>
                <strong>Erro de Auth:</strong> {debugInfo.userError?.message || "Nenhum"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader>
            <CardTitle>Pontuação Total</CardTitle>
            <CardDescription>Dados da função getTotalScore()</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <p>
                <strong>Pontuação (Server Action):</strong> {debugInfo.totalScore}
              </p>
              <p>
                <strong>Dados diretos do banco:</strong>
              </p>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.userScoresData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader>
            <CardTitle>Progresso por Tópico</CardTitle>
            <CardDescription>Dados da função getTopicProgress()</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <p>
                <strong>Progresso (Server Action):</strong>
              </p>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.topicProgress, null, 2)}
              </pre>
              <p>
                <strong>Dados diretos do banco:</strong>
              </p>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.userTopicProgressData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
