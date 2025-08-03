"use client"

import { AvatarWithAutoFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AvatarDemo() {
  const demoUsers = [
    { email: "joao.silva@email.com", name: "João Silva" },
    { email: "maria.santos@email.com", name: "Maria Santos" },
    { email: "pedro.oliveira@email.com", name: "Pedro Oliveira" },
    { email: "ana.costa@email.com", name: "Ana Costa" },
    { email: "carlos.rodrigues@email.com", name: "Carlos Rodrigues" },
    { email: "lucia.ferreira@email.com", name: "Lúcia Ferreira" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Demonstração de Avatares Automáticos</h2>
        <p className="text-muted-foreground mb-6">
          Os avatares são gerados automaticamente baseados no email do usuário usando a API DiceBear.
          Se não houver email ou imagem, mostra as iniciais em um gradiente colorido.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoUsers.map((user, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <AvatarWithAutoFallback 
                  email={user.email}
                  size="lg"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <AvatarWithAutoFallback 
                  email={user.email}
                  size="sm"
                />
                <AvatarWithAutoFallback 
                  email={user.email}
                  size="md"
                />
                <AvatarWithAutoFallback 
                  email={user.email}
                  size="lg"
                />
                <AvatarWithAutoFallback 
                  email={user.email}
                  size="xl"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Casos Especiais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <AvatarWithAutoFallback 
              email={null}
              fallback="U"
              size="md"
            />
            <div>
              <p className="font-medium">Usuário sem email</p>
              <p className="text-sm text-muted-foreground">Mostra fallback personalizado</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AvatarWithAutoFallback 
              email="test@example.com"
              src="/placeholder-user.jpg"
              size="md"
            />
            <div>
              <p className="font-medium">Com imagem personalizada</p>
              <p className="text-sm text-muted-foreground">Prioriza a imagem fornecida</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 