"use client"

import { useEffect } from 'react'

interface PerformanceOptimizerProps {
  children: React.ReactNode
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  useEffect(() => {
    // Preload de recursos críticos
    const preloadCriticalResources = () => {
      // Carregar fonte diretamente (sem preload para evitar warnings)
      const fontLink = document.createElement('link')
      fontLink.rel = 'stylesheet'
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      document.head.appendChild(fontLink)

      // Preload de imagens críticas
      const criticalImages = [
        '/professor-tiago-costa.jpg'
      ]

      criticalImages.forEach(src => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = src
        link.as = 'image'
        document.head.appendChild(link)
      })
    }

    // Lazy load de recursos não críticos
    const lazyLoadNonCritical = () => {
      // Lazy load de vídeos
      const videos = document.querySelectorAll('video[data-lazy]')
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement
            video.src = video.dataset.src || ''
            video.load()
            videoObserver.unobserve(video)
          }
        })
      })

      videos.forEach(video => videoObserver.observe(video))
    }

    // Otimizar scroll performance
    const optimizeScroll = () => {
      let ticking = false
      
      const updateScroll = () => {
        // Implementar otimizações de scroll se necessário
        ticking = false
      }

      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll)
          ticking = true
        }
      }

      window.addEventListener('scroll', requestTick, { passive: true })
    }

    // Executar otimizações
    preloadCriticalResources()
    lazyLoadNonCritical()
    optimizeScroll()

    // Cleanup
    return () => {
      // Cleanup será feito automaticamente pelo React
    }
  }, [])

  return <>{children}</>
}
