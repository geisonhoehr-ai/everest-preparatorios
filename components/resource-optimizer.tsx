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
          // Carregar CSS crítico
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = '/globals.css'
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
        }
      }

      // Preload de fontes apenas quando necessário
      const preloadFonts = () => {
        const fontLoaded = document.fonts.check('16px Inter')
        
        if (!fontLoaded) {
          // Preload da fonte Inter apenas se não estiver carregada
          const fontLink = document.createElement('link')
          fontLink.rel = 'preload'
          fontLink.as = 'font'
          fontLink.type = 'font/woff2'
          fontLink.crossOrigin = 'anonymous'
          fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
          document.head.appendChild(fontLink)
        }
      }

      // Executar otimizações com delay para evitar warnings
      setTimeout(() => {
        preloadCriticalResources()
        preloadFonts()
      }, 100)
    }

    optimizeResources()
  }, [])

  return null
}
