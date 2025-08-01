import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Ajuste as configurações da sua conta e preferências
          </p>
        </div>

        <div className="grid gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Ajuste as configurações da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col space-y-1">
                <span>Notificações por Email</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receba atualizações e lembretes de estudo.
                </span>
              </Label>
              <Switch id="notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex flex-col space-y-1">
                <span>Modo Escuro Padrão</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Ativar o modo escuro por padrão ao carregar a página.
                </span>
              </Label>
              <Switch id="darkMode" defaultChecked />
            </div>
            <Button className="w-fit">Salvar Configurações</Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
