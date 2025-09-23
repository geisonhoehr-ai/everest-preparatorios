"use client"

import { useEffect } from "react"

export function ResourceOptimizer() {
  useEffect(() => {
    // Otimizar carregamento de recursos críticos
    const optimizeResources = () => {
      // Preload de recursos críticos apenas quando necessário
      const preloadCriticalResources = () => {
        // Verificar se o CSS já foi carregado
        const cssLoaded = document.querySelector('link[href*="globals.css"]')?.getAttribute('rel') === 'stylesheet'
        
        if (!cssLoaded) {
          // Carregar CSS crítico sem crossorigin para evitar warnings
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = '/globals.css'
          link.media = 'all'
          document.head.appendChild(link)
        }
      }

      // Preload de fontes apenas quando necessário
      const preloadFonts = () => {
        const fontLoaded = document.fonts.check('16px Inter')
        
        if (!fontLoaded) {
          // Carregar CSS da fonte diretamente
          const fontCssLink = document.createElement('link')
          fontCssLink.rel = 'stylesheet'
          fontCssLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          document.head.appendChild(fontCssLink)
        }
      }

      // Executar otimizações imediatamente
      preloadCriticalResources()
      preloadFonts()
    }

    optimizeResources()
  }, [])

  return null
}
