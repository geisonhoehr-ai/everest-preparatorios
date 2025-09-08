import type React from "react"
import { Inter } from "next/font/google"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9626674092433076"
     crossOrigin="anonymous"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
            html {
              scroll-behavior: smooth;
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: ${inter.style.fontFamily};
              background-color: #0a0a0a;
              color: #ffffff;
            }
            
            /* Estilos básicos para o site */
            .bg-gradient-to-br {
              background: linear-gradient(to bottom right, #1a1a1a, #0a0a0a);
            }
            
            .text-white {
              color: #ffffff;
            }
            
            .text-orange-500 {
              color: #f97316;
            }
            
            .bg-purple-600 {
              background-color: #9333ea;
            }
            
            .rounded-lg {
              border-radius: 0.5rem;
            }
            
            .p-6 {
              padding: 1.5rem;
            }
            
            .mb-4 {
              margin-bottom: 1rem;
            }
            
            .text-xl {
              font-size: 1.25rem;
            }
            
            .text-2xl {
              font-size: 1.5rem;
            }
            
            .text-3xl {
              font-size: 1.875rem;
            }
            
            .font-bold {
              font-weight: 700;
            }
            
            .text-center {
              text-align: center;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <PerformanceOptimizer>
              {children}
            </PerformanceOptimizer>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
