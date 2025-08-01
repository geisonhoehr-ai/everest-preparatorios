import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, BookOpen, Trophy } from "lucide-react"

export default function MyFlashcardsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Meus Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie seus próprios flashcards personalizados
          </p>
        </div>

        <div className="grid gap-6">
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
      </div>
    </DashboardShell>
  )
}
