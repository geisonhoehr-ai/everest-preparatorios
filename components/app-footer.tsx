"use client"

export function AppFooter() {
  return (
    <footer className="border-t bg-background px-4 py-6 md:px-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Everest Preparatórios. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Desenvolvido por Geison Höehr & Tiago Costa
          </p>
        </div>
      </div>
    </footer>
  )
}
