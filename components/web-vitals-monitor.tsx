'use client'

import { useEffect } from 'react'

// Web Vitals types
interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// Simplified web vitals functions usando Performance API nativa
function observeMetric(type: string, callback: (metric: any) => void) {
  if (typeof window === 'undefined') return

  switch (type) {
    case 'LCP':
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            callback({
              name: 'LCP',
              value: lastEntry.startTime,
              rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
              id: Math.random().toString(36).substr(2, 9)
            })
          }
        })
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          console.warn('LCP observer not supported')
        }
      }
      break

    case 'CLS':
      if ('PerformanceObserver' in window) {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          callback({
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            id: Math.random().toString(36).substr(2, 9)
          })
        })
        try {
          observer.observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          console.warn('CLS observer not supported')
        }
      }
      break

    case 'FCP':
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            callback({
              name: 'FCP',
              value: fcpEntry.startTime,
              rating: fcpEntry.startTime < 1800 ? 'good' : fcpEntry.startTime < 3000 ? 'needs-improvement' : 'poor',
              id: Math.random().toString(36).substr(2, 9)
            })
          }
        })
        try {
          observer.observe({ entryTypes: ['paint'] })
        } catch (e) {
          console.warn('FCP observer not supported')
        }
      }
      break
  }
}

export function WebVitalsMonitor() {
  useEffect(() => {
    const sendToAnalytics = (metric: WebVitalsMetric) => {
      // Log para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Web Vitals [${metric.name}]:`, {
          value: Math.round(metric.value),
          rating: metric.rating,
          id: metric.id
        })
      }

      // Enviar para analytics em produção
      if (process.env.NODE_ENV === 'production') {
        // Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', metric.name, {
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            metric_id: metric.id,
          })
        }
      }
    }

    // Monitorar Core Web Vitals usando Performance API nativa
    observeMetric('LCP', sendToAnalytics)
    observeMetric('CLS', sendToAnalytics)
    observeMetric('FCP', sendToAnalytics)

    // Performance Observer para outras métricas
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitorar long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long Task detected: ${Math.round(entry.duration)}ms`)
          }
        }
      })

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Long task observer não suportado
      }

      // Monitorar layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.value > 0.1) {
            console.warn(`⚠️ Layout Shift detected: ${entry.value}`)
          }
        }
      })

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // Layout shift observer não suportado
      }

      return () => {
        longTaskObserver.disconnect()
        layoutShiftObserver.disconnect()
      }
    }
  }, [])

  return null
}

// Hook personalizado para Web Vitals
export function useWebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simple performance timing usando Navigation API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        console.log('🔍 Page Load Performance:', {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          ttfb: Math.round(navigation.responseStart - navigation.requestStart)
        })
      }
    }
  }, [])
}

// Declare global para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    va: (...args: any[]) => void
  }
}