'use client'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
}

interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  batchSize: number
  flushInterval: number
  endpoint: string
}

class Analytics {
  private config: AnalyticsConfig
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private userId: string | null = null
  private flushTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      endpoint: '/api/analytics',
      ...config
    }

    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Restaurar userId do localStorage
    this.userId = localStorage.getItem('analytics-user-id')

    // Gerar userId se não existir
    if (!this.userId) {
      this.userId = this.generateUserId()
      localStorage.setItem('analytics-user-id', this.userId)
    }

    // Configurar flush automático
    this.startFlushTimer()

    // Rastrear eventos de página
    this.trackPageView()

    // Rastrear eventos de visibilidade
    this.trackVisibility()

    // Rastrear eventos de performance
    this.trackPerformance()

    if (this.config.debug) {
      console.log('[Analytics] Inicializado', {
        sessionId: this.sessionId,
        userId: this.userId,
        enabled: this.config.enabled
      })
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private trackPageView() {
    if (typeof window === 'undefined') return

    const pageView: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId
    }

    this.track(pageView)
  }

  private trackVisibility() {
    if (typeof document === 'undefined') return

    let isVisible = !document.hidden
    let visibilityStart = Date.now()

    const handleVisibilityChange = () => {
      const now = Date.now()
      
      if (document.hidden && isVisible) {
        // Página ficou oculta
        this.track({
          name: 'page_hidden',
          properties: {
            duration: now - visibilityStart
          }
        })
        isVisible = false
      } else if (!document.hidden && !isVisible) {
        // Página ficou visível
        this.track({
          name: 'page_visible',
          properties: {
            duration: now - visibilityStart
          }
        })
        isVisible = true
        visibilityStart = now
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  private trackPerformance() {
    if (typeof window === 'undefined' || !window.performance) return

    // Aguardar carregamento completo
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          this.track({
            name: 'page_performance',
            properties: {
              loadTime: navigation.loadEventEnd - navigation.loadEventStart,
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              firstPaint: this.getFirstPaint(),
              firstContentfulPaint: this.getFirstContentfulPaint(),
              largestContentfulPaint: this.getLargestContentfulPaint(),
              cumulativeLayoutShift: this.getCumulativeLayoutShift()
            }
          })
        }
      }, 1000)
    })
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : null
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return firstContentfulPaint ? firstContentfulPaint.startTime : null
  }

  private getLargestContentfulPaint(): number | null {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    const lastLcp = lcpEntries[lcpEntries.length - 1]
    return lastLcp ? lastLcp.startTime : null
  }

  private getCumulativeLayoutShift(): number | null {
    const clsEntries = performance.getEntriesByType('layout-shift')
    let cls = 0
    clsEntries.forEach(entry => {
      if (!(entry as any).hadRecentInput) {
        cls += (entry as any).value
      }
    })
    return cls
  }

  track(event: AnalyticsEvent | string, properties?: Record<string, any>) {
    if (!this.config.enabled) return

    const analyticsEvent: AnalyticsEvent = typeof event === 'string' 
      ? {
          name: event,
          properties,
          timestamp: Date.now(),
          userId: this.userId || undefined,
          sessionId: this.sessionId
        }
      : {
          ...event,
          timestamp: event.timestamp || Date.now(),
          userId: event.userId || this.userId || undefined,
          sessionId: event.sessionId || this.sessionId
        }

    this.events.push(analyticsEvent)

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', analyticsEvent)
    }

    // Flush se atingir batch size
    if (this.events.length >= this.config.batchSize) {
      this.flush()
    }
  }

  private async flush() {
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      if (this.config.debug) {
        console.log('[Analytics] Flushing events:', eventsToSend)
      }

      // Em produção, enviar para endpoint real
      if (this.config.enabled && this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            events: eventsToSend,
            sessionId: this.sessionId,
            userId: this.userId
          })
        })
      }
    } catch (error) {
      console.error('[Analytics] Error flushing events:', error)
      // Recolocar eventos na fila em caso de erro
      this.events.unshift(...eventsToSend)
    }
  }

  // Métodos públicos
  identify(userId: string, traits?: Record<string, any>) {
    this.userId = userId
    localStorage.setItem('analytics-user-id', userId)
    
    this.track('user_identified', {
      userId,
      traits
    })
  }

  page(name?: string, properties?: Record<string, any>) {
    this.track('page_view', {
      name: name || document.title,
      url: window.location.href,
      path: window.location.pathname,
      ...properties
    })
  }

  // Eventos específicos do app
  flashcardStudied(topicId: string, score: number, timeSpent: number) {
    this.track('flashcard_studied', {
      topicId,
      score,
      timeSpent,
      accuracy: score
    })
  }

  quizCompleted(quizId: string, score: number, timeSpent: number) {
    this.track('quiz_completed', {
      quizId,
      score,
      timeSpent
    })
  }

  userLoggedIn(method: string) {
    this.track('user_logged_in', {
      method
    })
  }

  userLoggedOut() {
    this.track('user_logged_out')
  }

  featureUsed(feature: string, properties?: Record<string, any>) {
    this.track('feature_used', {
      feature,
      ...properties
    })
  }

  errorOccurred(error: string, context?: Record<string, any>) {
    this.track('error_occurred', {
      error,
      context,
      url: window.location.href
    })
  }

  // Limpar dados
  clear() {
    this.events = []
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  // Destruir instância
  destroy() {
    this.flush()
    this.clear()
  }
}

// Instância global
export const analytics = new Analytics()

// Hook para usar analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics),
    flashcardStudied: analytics.flashcardStudied.bind(analytics),
    quizCompleted: analytics.quizCompleted.bind(analytics),
    userLoggedIn: analytics.userLoggedIn.bind(analytics),
    userLoggedOut: analytics.userLoggedOut.bind(analytics),
    featureUsed: analytics.featureUsed.bind(analytics),
    errorOccurred: analytics.errorOccurred.bind(analytics)
  }
}
