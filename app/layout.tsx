import type React from "react"
import { Inter } from "next/font/google"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { SkipLinks } from "@/components/skip-link"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
})

export const metadata = {
  title: "Everest Preparatórios",
  description: "Plataforma completa de estudos com flashcards avançados para preparatórios.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/placeholder-logo.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/globals.css" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9626674092433076"
     crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <SkipLinks />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
          <AuthProvider>
            <ErrorBoundary>
              <PerformanceOptimizer>
                {children}
              </PerformanceOptimizer>
            </ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
