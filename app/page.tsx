import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, BookOpenText, Trophy, Clock, BrainCircuit, Edit, Mic, ArrowRight } from "lucide-react"
import { getRank, getNextRankInfo } from "@/lib/ranking"
import { getTotalScore, getTopicProgress, getAllTopics, getAllSubjects } from "@/actions"
import Link from "next/link"

export default async function DashboardPage() {
  const totalScore = await getTotalScore()
  const currentRank = getRank(totalScore)
  const nextRankInfo = getNextRankInfo(totalScore)
  const topicProgress = await getTopicProgress()
  const topics = await getAllTopics()
  const subjects = await getAllSubjects()

  // Calcular total de flashcards e progresso geral
  const totalFlashcardsCompleted = Object.values(topicProgress).reduce(
    (sum, topic) => sum + topic.correct + topic.incorrect,
    0,
  )
  const totalCorrect = Object.values(topicProgress).reduce((sum, topic) => sum + topic.correct, 0)
  const overallProgress = totalFlashcardsCompleted > 0 ? (totalCorrect / totalFlashcardsCompleted) * 100 : 0

  // Buscar total de flashcards por tópico (simulação, ideal: query SQL)
  // Exemplo: const flashcardCounts = { "ortografia": 50, ... }
  // Aqui, para demo, vamos simular 50 para todos
  const flashcardCounts = Object.fromEntries(topics.map(t => [t.id, 50]))

  // Paleta de cores para as barras de progresso
  const progressColors = [
    '#FF6B6B', // vermelho
    '#FFD93D', // amarelo
    '#6BCB77', // verde
    '#4D96FF', // azul
    '#FF922B', // laranja
    '#845EC2', // roxo
    '#F9C80E', // dourado
    '#F86624', // laranja escuro
    '#43E97B', // verde claro
    '#38F9D7', // azul claro
    '#FF61A6', // rosa
    '#2D4059', // azul escuro
    '#EA5455', // vermelho escuro
    '#FFB400', // amarelo escuro
    '#00C9A7', // turquesa
  ]

  // Crie o subjectMap para mapear id para nome
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]))

  // Agrupar tópicos por matéria
  const groupedTopics = topics.reduce((acc, topic) => {
    const subject = subjectMap[topic.subject_id] || 'Outros'
    if (!acc[subject]) acc[subject] = []
    acc[subject].push(topic)
    return acc
  }, {} as Record<string, typeof topics>)

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Everest Preparatórios!</h1>
      </div>

      {/* Cards de Estatísticas - COM gradiente vibrante */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Flashcards Concluídos</CardTitle>
            <BookOpenText className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalFlashcardsCompleted.toLocaleString()}</div>
            <p className="text-xs text-white/70">Total de cards revisados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pontuação Total</CardTitle>
            <Trophy className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalScore.toLocaleString()}</div>
            <p className="text-xs text-white/70">Seu ranking atual: {currentRank}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Tempo de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">120h 30m</div>
            <p className="text-xs text-white/70">+5h esta semana (simulado)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Progresso Geral</CardTitle>
            <Sparkles className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overallProgress.toFixed(0)}%</div>
            <p className="text-xs text-white/70">Baseado em acertos/erros</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Acesso Rápido */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Acesso Rápido</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-[#FF8800]/15 to-[#FF4000]/5 border-secondary/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Flashcards</CardTitle>
              <BookOpenText className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">Revise e memorize o conteúdo com eficiência.</CardDescription>
              <Button asChild className="w-full">
                <Link href="/flashcards">
                  Começar a Estudar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FF8800]/15 to-[#FF4000]/5 border-secondary/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Quiz</CardTitle>
              <BrainCircuit className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">Teste seus conhecimentos com simulados e questões.</CardDescription>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/quiz">
                  Explorar Quizzes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FF8800]/15 to-[#FF4000]/5 border-secondary/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Redação</CardTitle>
              <Edit className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">Pratique sua escrita e receba feedback.</CardDescription>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/redacao">
                  Escrever Redação <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FF8800]/15 to-[#FF4000]/5 border-secondary/50 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Podcast</CardTitle>
              <Mic className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">Aprofunde-se em temas com áudios exclusivos.</CardDescription>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/podcast">
                  Ouvir Podcasts <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-8">
        {/* Card de Progresso Português */}
        <Card className="bg-white dark:bg-[#18181b] border-primary/50 text-zinc-900 dark:text-white orange-card">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-white">Progresso em Português</CardTitle>
            <CardDescription className="text-zinc-700 dark:text-zinc-300">
              Seu progresso em tópicos de Português.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {groupedTopics['Português']?.length > 0 ? (
              groupedTopics['Português'].map((topic, idx) => {
                const stats = (topicProgress as Record<string, {correct:number, incorrect:number}>)[topic.id] || { correct: 0, incorrect: 0 }
                const total = stats.correct + stats.incorrect
                const totalCards = flashcardCounts[topic.id] || 0
                const percentage = totalCards > 0 ? (total / totalCards) * 100 : 0
                const color = progressColors[idx % progressColors.length]
                return (
                  <div key={topic.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="w-40 text-sm font-medium text-zinc-900 dark:text-white truncate">{topic.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-white/30 dark:border-zinc-700">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ width: `${percentage}%`, background: color, transition: 'width 0.5s' }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-900 dark:text-white min-w-[60px] text-right">
                        {total}/{totalCards} ({Math.round((total / (totalCards || 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-zinc-700 dark:text-zinc-300 text-center">Nenhum tópico de Português encontrado.</p>
            )}
          </CardContent>
        </Card>
        {/* Card de Progresso Regulamentos */}
        <Card className="bg-white dark:bg-[#18181b] border-primary/50 text-zinc-900 dark:text-white orange-card">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-white">Progresso em Regulamentos</CardTitle>
            <CardDescription className="text-zinc-700 dark:text-zinc-300">
              Seu progresso em tópicos de Regulamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {groupedTopics['Regulamentos']?.length > 0 ? (
              groupedTopics['Regulamentos'].map((topic, idx) => {
                const stats = (topicProgress as Record<string, {correct:number, incorrect:number}>)[topic.id] || { correct: 0, incorrect: 0 }
                const total = stats.correct + stats.incorrect
                const totalCards = flashcardCounts[topic.id] || 0
                const percentage = totalCards > 0 ? (total / totalCards) * 100 : 0
                const color = progressColors[idx % progressColors.length]
                return (
                  <div key={topic.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="w-40 text-sm font-medium text-zinc-900 dark:text-white truncate">{topic.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-white/30 dark:border-zinc-700">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ width: `${percentage}%`, background: color, transition: 'width 0.5s' }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-900 dark:text-white min-w-[60px] text-right">
                        {total}/{totalCards} ({Math.round((total / (totalCards || 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-zinc-700 dark:text-zinc-300 text-center">Nenhum tópico de Regulamentos encontrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cards com botões */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Minhas Redações</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
            <CardHeader>
              <CardTitle>Minhas Redações</CardTitle>
              <CardDescription>Acompanhe suas redações enviadas e corrigidas.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p className="mb-2">Nenhuma redação enviada ainda.</p>
              <Button asChild variant="outline">
                <Link href="/redacao">Enviar Redação</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
            <CardHeader>
              <CardTitle>Próxima Meta</CardTitle>
              <CardDescription>Alcance o próximo nível no seu estudo!</CardDescription>
            </CardHeader>
            <CardContent>
              {nextRankInfo ? (
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    Seu próximo rank é <span className="text-primary">{nextRankInfo.name}</span>!
                  </p>
                  <p className="text-muted-foreground">
                    Faltam <span className="font-bold">{nextRankInfo.scoreNeeded.toLocaleString()}</span> pontos para
                    alcançá-lo.
                  </p>
                </div>
              ) : (
                <p className="text-center text-lg font-semibold text-primary">Você alcançou o rank máximo! Parabéns!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
