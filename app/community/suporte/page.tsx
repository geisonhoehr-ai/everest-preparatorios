import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SuportePage() {
  return (
    <DashboardShell>
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Suporte ao Aluno</CardTitle>
            <CardDescription>
              Precisa de ajuda? Envie sua dúvida, sugestão ou problema e nossa equipe entrará em contato o mais rápido possível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium mb-1">Nome</label>
                <Input id="nome" name="nome" placeholder="Seu nome" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div>
                <label htmlFor="mensagem" className="block text-sm font-medium mb-1">Mensagem</label>
                <Textarea id="mensagem" name="mensagem" placeholder="Descreva sua dúvida ou solicitação" rows={5} required />
              </div>
              <Button type="submit" className="w-full bg-[#FF4000] text-white border-none hover:brightness-110">Enviar Mensagem</Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Ou envie um e-mail diretamente para <a href="mailto:suporte@everestpreparatorios.com" className="underline text-[#FF4000]">suporte@everestpreparatorios.com</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
} 