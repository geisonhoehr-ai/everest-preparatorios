"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { useIsMobile, useIsTablet, useIsDesktop, useDeviceType, useOrientation, useTouchDevice } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestResponsivePage() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const deviceType = useDeviceType()
  const orientation = useOrientation()
  const isTouchDevice = useTouchDevice()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teste de Responsividade</h1>
          <p className="text-muted-foreground">
            Esta página testa se a responsividade está funcionando corretamente.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivo</CardTitle>
              <CardDescription>Informações sobre o dispositivo atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Mobile:</span>
                <Badge variant={isMobile ? "default" : "secondary"}>
                  {isMobile ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Tablet:</span>
                <Badge variant={isTablet ? "default" : "secondary"}>
                  {isTablet ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Desktop:</span>
                <Badge variant={isDesktop ? "default" : "secondary"}>
                  {isDesktop ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Tipo:</span>
                <Badge variant="outline">{deviceType}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orientação</CardTitle>
              <CardDescription>Orientação atual do dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg">
                {orientation === 'portrait' ? '📱 Retrato' : '🖥️ Paisagem'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Touch</CardTitle>
              <CardDescription>Dispositivo com tela touch</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={isTouchDevice ? "default" : "secondary"}>
                {isTouchDevice ? "✅ Touch" : "❌ Não Touch"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Layout</CardTitle>
            <CardDescription>
              Este card deve se adaptar ao tamanho da tela
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">Card 1</span>
              </div>
              <div className="h-20 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">Card 2</span>
              </div>
              <div className="h-20 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">Card 3</span>
              </div>
              <div className="h-20 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium">Card 4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Mobile</CardTitle>
            <CardDescription>
              Teste o menu sanduíche no canto superior esquerdo em dispositivos móveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Em dispositivos móveis, você deve ver um botão de menu no header.
                Clique nele para abrir o menu lateral.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">📱 Mobile: Menu lateral deslizante</Badge>
                <Badge variant="outline">💻 Desktop: Sidebar fixa</Badge>
                <Badge variant="outline">🔄 Responsivo: Adapta automaticamente</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
} 