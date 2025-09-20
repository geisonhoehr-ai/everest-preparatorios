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
        {/* PandaVideo Player Preloads */}
        <link rel="preload" href="https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/css/styles.css" as="style" />
        <link rel="prerender" href="https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/?v=eb23fc2c-66de-4b86-9e7a-1ee57cd9f24e" />
        <link rel="preload" href="https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/js/hls.js" as="script" />
        <link rel="preload" href="https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/js/plyr.polyfilled.min.js" as="script" />
        <link rel="preload" href="https://config.tv.pandavideo.com.br/vz-e9d62059-4a4/eb23fc2c-66de-4b86-9e7a-1ee57cd9f24e.json" as="fetch" />
        <link rel="preload" href="https://config.tv.pandavideo.com.br/vz-e9d62059-4a4/config.json" as="fetch" />
        <link rel="preload" href="https://b-vz-e9d62059-4a4.tv.pandavideo.com.br/eb23fc2c-66de-4b86-9e7a-1ee57cd9f24e/playlist.m3u8" as="fetch" />
        <link rel="dns-prefetch" href="https://b-vz-e9d62059-4a4.tv.pandavideo.com.br" />
        <link rel="dns-prefetch" href="https://player-vz-e9d62059-4a4.tv.pandavideo.com.br" />
        <link rel="dns-prefetch" href="https://vz-e9d62059-4a4.b-cdn.net" />
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
