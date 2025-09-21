import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals-optimized.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Everest Preparatórios - #1 para CIAAR',
  description: 'Plataforma líder em preparação para CIAAR com metodologia exclusiva, flashcards, quizzes e redação. Aprenda com o Professor Tiago Costa.',
  keywords: 'CIAAR, preparatório, concurso, flashcards, quiz, redação, Professor Tiago Costa',
  authors: [{ name: 'Everest Preparatórios' }],
  creator: 'Everest Preparatórios',
  publisher: 'Everest Preparatórios',
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
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://everestpreparatorios.com.br',
    title: 'Everest Preparatórios - #1 para CIAAR',
    description: 'Plataforma líder em preparação para CIAAR com metodologia exclusiva',
    siteName: 'Everest Preparatórios',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Everest Preparatórios - CIAAR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Everest Preparatórios - #1 para CIAAR',
    description: 'Plataforma líder em preparação para CIAAR',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        
        {/* DNS Prefetch para recursos não críticos */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Preload para recursos críticos */}
        <link
          rel="preload"
          href="/professor-tiago-costa.jpg"
          as="image"
          type="image/jpeg"
        />
        
        {/* Critical CSS inline seria ideal aqui */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS inline */
            body { margin: 0; font-family: var(--font-inter), system-ui, sans-serif; }
            .loading { opacity: 0; }
            .loaded { opacity: 1; transition: opacity 0.3s; }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Loading indicator */}
        <div id="loading-indicator" className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Main content */}
        <div id="main-content" className="loading">
          {children}
        </div>
        
        {/* Script para remover loading indicator */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              const loading = document.getElementById('loading-indicator');
              const content = document.getElementById('main-content');
              if (loading && content) {
                loading.style.display = 'none';
                content.classList.remove('loading');
                content.classList.add('loaded');
              }
            });
          `
        }} />
      </body>
    </html>
  )
}
