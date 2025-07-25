import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações pessoais e preferências de conta
          </p>
        </div>

        <div className="grid gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" defaultValue="João Pedro" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="joao.pedro@example.com" readOnly />
            </div>
            <Button className="w-fit">Salvar Alterações</Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
