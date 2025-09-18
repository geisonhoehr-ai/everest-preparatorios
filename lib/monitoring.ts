'use client'

interface MonitoringEvent {
  type: 'error' | 'performance' | 'user_action' | 'api_call'
  message: string
  data?: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
  url: string
  userAgent: string
}

interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  totalBlockingTime: number
}

class MonitoringService {
  private sessionId: string
  private userId: string | null = null
  private events: MonitoringEvent[] = []
  private performanceMetrics: PerformanceMetrics | null = null
  private isOnline: boolean = true

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Restaurar userId do localStorage
    this.userId = localStorage.getItem('monitoring-user-id')

    // Monitorar eventos de erro
    this.setupErrorMonitoring()

    // Monitorar performance
    this.setupPerformanceMonitoring()

    // Monitorar status online/offline
    this.setupConnectivityMonitoring()

    // Monitorar mudanças de página
    this.setupPageMonitoring()

    // Enviar dados periodicamente
    this.setupPeriodicReporting()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupErrorMonitoring() {
    // Capturar erros JavaScript
    window.addEventListener('error', (event) => {
      this.trackError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    })

    // Capturar erros de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as any
        this.trackError('Resource Error', {
          type: target?.tagName,
          src: target?.src,
          href: target?.href
        })
      }
    }, true)
  }

  private setupPerformanceMonitoring() {
    // Aguardar carregamento completo
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectPerformanceMetrics()
      }, 1000)
    })

    // Monitorar Web Vitals
    this.observeWebVitals()
  }

  private collectPerformanceMetrics() {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      this.performanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint(),
        cumulativeLayoutShift: this.getCumulativeLayoutShift(),
        firstInputDelay: this.getFirstInputDelay(),
        totalBlockingTime: this.getTotalBlockingTime()
      }

      this.trackPerformance('Page Load', this.performanceMetrics)
    }
  }

  private observeWebVitals() {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.trackPerformance('First Contentful Paint', {
            value: entry.startTime
          })
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      // Fallback para navegadores que não suportam
    }
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : 0
  }

  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    const lastLcp = lcpEntries[lcpEntries.length - 1]
    return lastLcp ? lastLcp.startTime : 0
  }

  private getCumulativeLayoutShift(): number {
    const clsEntries = performance.getEntriesByType('layout-shift')
    let cls = 0
    clsEntries.forEach(entry => {
      if (!(entry as any).hadRecentInput) {
        cls += (entry as any).value
      }
    })
    return cls
  }

  private getFirstInputDelay(): number {
    const fidEntries = performance.getEntriesByType('first-input')
    const fid = fidEntries[0] as any
    return fid ? fid.processingStart - fid.startTime : 0
  }

  private getTotalBlockingTime(): number {
    const longTasks = performance.getEntriesByType('long-task')
    let tbt = 0
    longTasks.forEach(task => {
      tbt += task.duration - 50 // Tarefas > 50ms
    })
    return tbt
  }

  private setupConnectivityMonitoring() {
    const updateOnlineStatus = () => {
      this.isOnline = navigator.onLine
      this.trackUserAction('Connectivity Change', {
        online: this.isOnline
      })
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  }

  private setupPageMonitoring() {
    // Monitorar mudanças de página
    let pageStartTime = Date.now()

    const trackPageView = () => {
      const pageDuration = Date.now() - pageStartTime
      this.trackUserAction('Page View', {
        url: window.location.href,
        duration: pageDuration
      })
      pageStartTime = Date.now()
    }

    // SPA navigation
    let currentUrl = window.location.href
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        trackPageView()
        currentUrl = window.location.href
      }
    }

    setInterval(checkUrlChange, 1000)

    // Popstate event
    window.addEventListener('popstate', trackPageView)
  }

  private setupPeriodicReporting() {
    // Enviar dados a cada 30 segundos
    setInterval(() => {
      this.flushEvents()
    }, 30000)

    // Enviar dados antes de sair da página
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true)
    })
  }

  // Métodos públicos
  trackError(message: string, data?: Record<string, any>) {
    this.addEvent('error', message, data)
  }

  trackPerformance(message: string, data?: Record<string, any>) {
    this.addEvent('performance', message, data)
  }

  trackUserAction(message: string, data?: Record<string, any>) {
    this.addEvent('user_action', message, data)
  }

  trackApiCall(url: string, method: string, status: number, duration: number) {
    this.addEvent('api_call', 'API Call', {
      url,
      method,
      status,
      duration
    })
  }

  private addEvent(type: MonitoringEvent['type'], message: string, data?: Record<string, any>) {
    const event: MonitoringEvent = {
      type,
      message,
      data,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    this.events.push(event)

    // Enviar imediatamente para erros críticos
    if (type === 'error') {
      this.sendEvent(event)
    }
  }

  private async flushEvents(sync = false) {
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      if (sync) {
        // Usar sendBeacon para envio síncrono
        const data = JSON.stringify({
          events: eventsToSend,
          sessionId: this.sessionId,
          userId: this.userId,
          performance: this.performanceMetrics
        })

        navigator.sendBeacon('/api/monitoring', data)
      } else {
        // Envio assíncrono normal
        await fetch('/api/monitoring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            events: eventsToSend,
            sessionId: this.sessionId,
            userId: this.userId,
            performance: this.performanceMetrics
          })
        })
      }
    } catch (error) {
      console.error('Failed to send monitoring data:', error)
      // Recolocar eventos na fila em caso de erro
      this.events.unshift(...eventsToSend)
    }
  }

  private async sendEvent(event: MonitoringEvent) {
    try {
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: [event],
          sessionId: this.sessionId,
          userId: this.userId
        })
      })
    } catch (error) {
      console.error('Failed to send monitoring event:', error)
    }
  }

  // Métodos de configuração
  setUserId(userId: string) {
    this.userId = userId
    localStorage.setItem('monitoring-user-id', userId)
  }

  getSessionId(): string {
    return this.sessionId
  }

  getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics
  }

  // Métodos de utilidade
  isOnlineStatus(): boolean {
    return this.isOnline
  }

  getEventCount(): number {
    return this.events.length
  }
}

// Instância global
export const monitoring = new MonitoringService()

// Hook para usar monitoring
export function useMonitoring() {
  return {
    trackError: monitoring.trackError.bind(monitoring),
    trackPerformance: monitoring.trackPerformance.bind(monitoring),
    trackUserAction: monitoring.trackUserAction.bind(monitoring),
    trackApiCall: monitoring.trackApiCall.bind(monitoring),
    setUserId: monitoring.setUserId.bind(monitoring),
    getSessionId: monitoring.getSessionId.bind(monitoring),
    getPerformanceMetrics: monitoring.getPerformanceMetrics.bind(monitoring),
    isOnline: monitoring.isOnlineStatus.bind(monitoring)
  }
}
