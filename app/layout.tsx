import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WebVitalsMonitor } from "@/components/web-vitals-monitor"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial']
})

export const metadata = {
  title: {
    default: "Everest Preparatórios - Preparação Completa para CIAAR",
    template: "%s | Everest Preparatórios"
  },
  description: "Plataforma completa de estudos com flashcards avançados, simulados e correção de redações para concursos militares da aeronáutica. +785 flashcards, +41 alunos aprovados EAOF 2025.",
  keywords: [
    "CIAAR", "concurso militar", "aeronáutica", "preparatório", "EAOF",
    "português", "redação", "flashcards", "simulados", "Professor Tiago Costa",
    "concurso público", "militar", "preparação", "estudo"
  ],
  authors: [{ name: "Professor Tiago Costa", url: "https://everestpreparatorios.com.br" }],
  creator: "Everest Preparatórios",
  publisher: "Everest Preparatórios",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://everestpreparatorios.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Everest Preparatórios - Preparação Completa para CIAAR",
    description: "Plataforma completa de estudos com flashcards avançados, simulados e correção de redações para concursos militares da aeronáutica.",
    url: 'https://everestpreparatorios.com.br',
    siteName: 'Everest Preparatórios',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Everest Preparatórios - Preparação para CIAAR',
      }
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Everest Preparatórios - Preparação para CIAAR",
    description: "Plataforma completa de estudos para concursos militares da aeronáutica.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'education',
  generator: 'Next.js'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preload recursos críticos para LCP */}
        <link rel="preload" href="/professor-tiago-costa.jpg" as="image" fetchPriority="high" />
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />

        {/* Preconnect para recursos externos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://hnhzindsfuqnaxosujay.supabase.co" />

        {/* DNS Prefetch para recursos secundários */}
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://app.pandavideo.com.br" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        
        {/* CSS Crítico otimizado para melhor LCP */}
        <style dangerouslySetInnerHTML={{
          __html: `
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            html {
              font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
              line-height: 1.5;
              -webkit-text-size-adjust: 100%;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              scroll-behavior: smooth;
            }

            body {
              background: #000;
              color: #fff;
              overflow-x: hidden;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }

            /* Prevenção de CLS */
            .hero-section {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            /* Otimizações de performance */
            img, video {
              max-width: 100%;
              height: auto;
            }

            /* Loading spinner crítico */
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #374151;
              border-top: 4px solid #f97316;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
          <WebVitalsMonitor />
        </ThemeProvider>
      </body>
    </html>
  )
}
