import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function MyFlashcardsPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Meus Flashcards</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Criar Novo Flashcard
        </Button>
      </div>

      <div className="grid gap-6 mt-6">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader>
            <CardTitle>Flashcards Personalizados</CardTitle>
            <CardDescription>Gerencie seus próprios flashcards aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você ainda não criou nenhum flashcard personalizado. Clique em "Criar Novo Flashcard" para começar!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
