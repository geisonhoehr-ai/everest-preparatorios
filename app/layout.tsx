import type React from "react"
import { Inter } from "next/font/google"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context-custom"
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
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/placeholder-logo.svg" type="image/svg+xml" />
        {/* YouTube Player Preloads */}
        <link rel="preload" href="https://www.youtube.com/embed/VqvU4orX3qk" as="document" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="stylesheet" href="/globals.css" />
      </head>
      <body className={inter.className}>
        <SkipLinks />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
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
