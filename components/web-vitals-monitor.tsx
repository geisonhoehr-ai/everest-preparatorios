'use client'

import { useEffect } from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
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
        if (typeof gtag !== 'undefined') {
          gtag('event', metric.name, {
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            metric_id: metric.id,
          })
        }

        // Vercel Analytics
        if (typeof window !== 'undefined' && window.va) {
          window.va('track', 'Web Vitals', {
            metric: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating,
          })
        }
      }
    }

    // Monitorar Core Web Vitals
    getCLS(sendToAnalytics)
    getFID(sendToAnalytics)
    getFCP(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)

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
    const reportWebVitals = (metric: WebVitalsMetric) => {
      const thresholds = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
        FCP: { good: 1800, poor: 3000 },
        TTFB: { good: 800, poor: 1800 },
      }

      const threshold = thresholds[metric.name as keyof typeof thresholds]
      if (threshold) {
        let rating: 'good' | 'needs-improvement' | 'poor' = 'good'
        if (metric.value > threshold.poor) rating = 'poor'
        else if (metric.value > threshold.good) rating = 'needs-improvement'

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('webvital', {
          detail: { ...metric, rating }
        }))
      }
    }

    getCLS(reportWebVitals)
    getFID(reportWebVitals)
    getFCP(reportWebVitals)
    getLCP(reportWebVitals)
    getTTFB(reportWebVitals)
  }, [])
}

// Declare global para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    va: (...args: any[]) => void
  }
}