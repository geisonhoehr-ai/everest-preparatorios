import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, BookOpenText, Trophy, Clock, BrainCircuit, Edit, Mic, ArrowRight } from "lucide-react"
import { getRank, getNextRankInfo } from "@/lib/ranking"
import { getTotalScore, getTopicProgress } from "@/actions"
import Link from "next/link"

export default async function DashboardPage() {
  const totalScore = await getTotalScore()
  const currentRank = getRank(totalScore)
  const nextRankInfo = getNextRankInfo(totalScore)
  const topicProgress = await getTopicProgress()

  // Calcular total de flashcards e progresso geral
  const totalFlashcardsCompleted = Object.values(topicProgress).reduce(
    (sum, topic) => sum + topic.correct + topic.incorrect,
    0,
  )
  const totalCorrect = Object.values(topicProgress).reduce((sum, topic) => sum + topic.correct, 0)
  const overallProgress = totalFlashcardsCompleted > 0 ? (totalCorrect / totalFlashcardsCompleted) * 100 : 0

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
        {/* Card de Progresso */}
        <Card className="col-span-2 bg-gradient-to-b from-[#FF8800] to-[#FF4000] border-primary/50 text-white orange-card">
          <CardHeader>
            <CardTitle className="text-white">Progresso de Estudo por Tópico (Flashcards)</CardTitle>
            <CardDescription className="text-white/80">
              Seu progresso acumulado em diferentes tópicos de flashcards.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {Object.keys(topicProgress).length > 0 ? (
              Object.entries(topicProgress).map(([topicId, stats]) => {
                const total = stats.correct + stats.incorrect
                const percentage = total > 0 ? (stats.correct / total) * 100 : 0
                const topicName = flashcardTopics.find((t) => t.id === topicId)?.name || topicId
                return (
                  <div key={topicId} className="flex items-center gap-4">
                    <span className="w-32 text-sm font-medium text-white">{topicName}</span>
                    <Progress value={percentage} className="flex-1 bg-white/20 dashboard-progress" />
                    <span className="text-sm text-white/70">{percentage.toFixed(0)}%</span>
                  </div>
                )
              })
            ) : (
              <p className="text-white/80 text-center">Comece a estudar flashcards para ver seu progresso aqui!</p>
            )}
          </CardContent>
        </Card>

        {/* Cards com botões */}
        <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/50">
          <CardHeader>
            <CardTitle>Progresso em Quiz</CardTitle>
            <CardDescription>Seu desempenho geral nos quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p className="mb-2">Nenhum quiz realizado ainda.</p>
            <Button asChild variant="outline">
              <Link href="/quiz">Fazer o primeiro Quiz</Link>
            </Button>
          </CardContent>
        </Card>

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

        <Card className="col-span-2 bg-gradient-to-br from-primary/20 to-background border-primary/50">
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
    </DashboardShell>
  )
}

// Dummy data for flashcardTopics (needed for topic names in dashboard)
const flashcardTopics = [
  { id: "fonetica-fonologia", name: "Fonetica e Fonologia", cards: [] },
  { id: "ortografia", name: "Ortografia", cards: [] },
  { id: "acentuacao-grafica", name: "Acentuação Gráfica", cards: [] },
  { id: "morfologia-classes", name: "Morfologia: Classes de Palavras", cards: [] },
  { id: "morfologia-flexao", name: "Morfologia: Flexão", cards: [] },
  { id: "sintaxe-termos-essenciais", name: "Sintaxe: Termos Essenciais", cards: [] },
  { id: "sintaxe-termos-integrantes", name: "Sintaxe: Termos Integrantes", cards: [] },
  { id: "sintaxe-termos-acessorios", name: "Sintaxe: Termos Acessórios", cards: [] },
  { id: "sintaxe-periodo-composto", name: "Sintaxe: Período Composto", cards: [] },
  { id: "concordancia", name: "Concordância Verbal e Nominal", cards: [] },
  { id: "regencia", name: "Regência Verbal e Nominal", cards: [] },
  { id: "crase", name: "Crase", cards: [] },
  { id: "colocacao-pronominal", name: "Colocação Pronominal", cards: [] },
  { id: "semantica-estilistica", name: "Semântica e Estilística", cards: [] },
]
