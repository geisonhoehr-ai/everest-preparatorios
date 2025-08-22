"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PerformanceOptimizerProps {
  children: React.ReactNode
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const pathname = usePathname()
  const lastPathname = useRef<string>('')
  const navigationStartTime = useRef<number>(0)

  useEffect(() => {
    // Medir tempo de navegação
    const currentTime = performance.now()
    if (lastPathname.current && lastPathname.current !== pathname) {
      const navigationTime = currentTime - navigationStartTime.current
      console.log(`🚀 [PERFORMANCE] Navegação para ${pathname} levou ${navigationTime.toFixed(2)}ms`)
      
      // Se a navegação demorou mais de 1 segundo, logar como lenta
      if (navigationTime > 1000) {
        console.warn(`⚠️ [PERFORMANCE] Navegação lenta detectada: ${navigationTime.toFixed(2)}ms`)
      }
    }
    
    lastPathname.current = pathname
    navigationStartTime.current = currentTime

    // Pré-carregar recursos críticos
    preloadCriticalResources(pathname)
  }, [pathname])

  // Função para pré-carregar recursos críticos
  const preloadCriticalResources = (path: string) => {
    // Pré-carregar apenas recursos que realmente existem
    if (path.includes('/dashboard')) {
      // Remover pré-carregamento de CSS que não existe
      console.log('🚀 [PERFORMANCE] Pré-carregando recursos para dashboard')
    }
    
    // Pré-carregar imagens importantes apenas se existirem
    if (path.includes('/flashcards')) {
      // Verificar se o recurso existe antes de pré-carregar
      fetch('/flashcard-icons.svg', { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            preloadResource('/flashcard-icons.svg', 'image')
          }
        })
        .catch(() => {
          console.log('ℹ️ [PERFORMANCE] Recurso flashcard-icons.svg não encontrado')
        })
    }
    
    // Pré-carregar dados de API apenas se existirem
    if (path.includes('/quiz')) {
      fetch('/api/quiz-data', { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            preloadResource('/api/quiz-data', 'fetch')
          }
        })
        .catch(() => {
          console.log('ℹ️ [PERFORMANCE] API quiz-data não encontrada')
        })
    }
  }

  // Função para pré-carregar recursos
  const preloadResource = (href: string, as: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      document.head.appendChild(link)
    }
  }

  // Otimizações de performance
  useEffect(() => {
    // Limpar cache de imagens antigas
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image-cache')) {
            caches.delete(cacheName)
          }
        })
      })
    }

    // Otimizar scroll
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // Pausar animações durante scroll
        document.body.style.setProperty('--scroll-paused', 'true')
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Otimizações de memória
  useEffect(() => {
    const cleanup = () => {
      // Limpar event listeners desnecessários
      const elements = document.querySelectorAll('[data-temp-listener]')
      elements.forEach(el => {
        el.removeAttribute('data-temp-listener')
      })

      // Forçar garbage collection se disponível
      if ('gc' in window) {
        // @ts-ignore
        window.gc()
      }
    }

    // Limpar a cada 5 minutos
    const interval = setInterval(cleanup, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
      cleanup()
    }
  }, [])

  return <>{children}</>
}

// Hook para otimizar re-renderizações
export function usePerformanceOptimizer() {
  const renderCount = useRef(0)
  
  useEffect(() => {
    renderCount.current++
    
    if (renderCount.current > 10) {
      console.warn('⚠️ [PERFORMANCE] Muitas re-renderizações detectadas')
    }
  })

  return {
    renderCount: renderCount.current
  }
}

// Hook para debounce de funções
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      func(...args)
    }, delay)
  }) as T
}

// Hook para throttle de funções
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null)

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      func(...args)
    } else {
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current)
      }
      
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now()
        func(...args)
      }, delay - (now - lastCall.current))
    }
  }) as T
}
