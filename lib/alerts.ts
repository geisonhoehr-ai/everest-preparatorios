'use client'

interface AlertConfig {
  enabled: boolean
  channels: AlertChannel[]
  thresholds: AlertThresholds
  cooldown: number // em milissegundos
  maxAlertsPerHour: number
}

interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'browser'
  config: any
  enabled: boolean
}

interface AlertThresholds {
  errorRate: number // % de erros
  responseTime: number // ms
  memoryUsage: number // MB
  cpuUsage: number // %
  diskUsage: number // %
  activeUsers: number // número de usuários
}

interface Alert {
  id: string
  type: 'error' | 'performance' | 'security' | 'usage' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data: any
  timestamp: number
  resolved: boolean
  resolvedAt?: number
  acknowledged: boolean
  acknowledgedAt?: number
  acknowledgedBy?: string
}

class AlertService {
  private config: AlertConfig
  private alerts: Alert[] = []
  private lastAlertTimes = new Map<string, number>()
  private alertCounts = new Map<string, number>()

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = {
      enabled: true,
      channels: [
        {
          type: 'browser',
          config: {},
          enabled: true
        }
      ],
      thresholds: {
        errorRate: 5, // 5%
        responseTime: 2000, // 2s
        memoryUsage: 512, // 512MB
        cpuUsage: 80, // 80%
        diskUsage: 90, // 90%
        activeUsers: 1000 // 1000 usuários
      },
      cooldown: 5 * 60 * 1000, // 5 minutos
      maxAlertsPerHour: 10,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar alertas do localStorage
    this.loadAlerts()

    // Limpar alertas antigos periodicamente
    setInterval(() => {
      this.cleanupOldAlerts()
    }, 60 * 60 * 1000) // A cada hora

    // Resetar contadores de alertas
    setInterval(() => {
      this.resetAlertCounts()
    }, 60 * 60 * 1000) // A cada hora
  }

  // Criar alerta
  async createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    data: any = {}
  ): Promise<Alert> {
    if (!this.config.enabled) {
      return this.createLocalAlert(type, severity, title, message, data)
    }

    const alertKey = `${type}:${severity}:${title}`
    const now = Date.now()

    // Verificar cooldown
    const lastAlertTime = this.lastAlertTimes.get(alertKey)
    if (lastAlertTime && now - lastAlertTime < this.config.cooldown) {
      return this.createLocalAlert(type, severity, title, message, data)
    }

    // Verificar limite de alertas por hora
    const alertCount = this.alertCounts.get(alertKey) || 0
    if (alertCount >= this.config.maxAlertsPerHour) {
      return this.createLocalAlert(type, severity, title, message, data)
    }

    // Criar alerta
    const alert = this.createLocalAlert(type, severity, title, message, data)
    
    // Atualizar contadores
    this.lastAlertTimes.set(alertKey, now)
    this.alertCounts.set(alertKey, alertCount + 1)

    // Enviar alerta
    await this.sendAlert(alert)

    return alert
  }

  private createLocalAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    data: any
  ): Alert {
    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      severity,
      title,
      message,
      data,
      timestamp: Date.now(),
      resolved: false,
      acknowledged: false
    }

    this.alerts.unshift(alert) // Adicionar no início
    this.saveAlerts()

    return alert
  }

  private async sendAlert(alert: Alert) {
    for (const channel of this.config.channels) {
      if (!channel.enabled) continue

      try {
        switch (channel.type) {
          case 'browser':
            await this.sendBrowserAlert(alert)
            break
          case 'slack':
            await this.sendSlackAlert(alert, channel.config)
            break
          case 'webhook':
            await this.sendWebhookAlert(alert, channel.config)
            break
          case 'email':
            await this.sendEmailAlert(alert, channel.config)
            break
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel.type}:`, error)
      }
    }
  }

  private async sendBrowserAlert(alert: Alert) {
    // Mostrar notificação no browser
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/icon-192x192.png',
        tag: alert.id,
        data: alert
      })
    }

    // Mostrar toast se disponível
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast({
        title: alert.title,
        description: alert.message,
        variant: this.getSeverityVariant(alert.severity)
      })
    }
  }

  private async sendSlackAlert(alert: Alert, config: any) {
    const payload = {
      text: `🚨 ${alert.title}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: 'Type',
              value: alert.type,
              short: true
            },
            {
              title: 'Severity',
              value: alert.severity,
              short: true
            },
            {
              title: 'Message',
              value: alert.message,
              short: false
            },
            {
              title: 'Timestamp',
              value: new Date(alert.timestamp).toISOString(),
              short: true
            }
          ]
        }
      ]
    }

    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  }

  private async sendWebhookAlert(alert: Alert, config: any) {
    await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify({
        alert,
        timestamp: new Date().toISOString()
      })
    })
  }

  private async sendEmailAlert(alert: Alert, config: any) {
    // Implementar envio de email via API
    await fetch('/api/alerts/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alert,
        config
      })
    })
  }

  // Resolver alerta
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      this.saveAlerts()
      return true
    }
    return false
  }

  // Reconhecer alerta
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true
      alert.acknowledgedAt = Date.now()
      alert.acknowledgedBy = acknowledgedBy
      this.saveAlerts()
      return true
    }
    return false
  }

  // Obter alertas
  getAlerts(filters?: {
    type?: Alert['type']
    severity?: Alert['severity']
    resolved?: boolean
    acknowledged?: boolean
    limit?: number
  }): Alert[] {
    let filteredAlerts = [...this.alerts]

    if (filters) {
      if (filters.type) {
        filteredAlerts = filteredAlerts.filter(a => a.type === filters.type)
      }
      if (filters.severity) {
        filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity)
      }
      if (filters.resolved !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.resolved === filters.resolved)
      }
      if (filters.acknowledged !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.acknowledged === filters.acknowledged)
      }
      if (filters.limit) {
        filteredAlerts = filteredAlerts.slice(0, filters.limit)
      }
    }

    return filteredAlerts
  }

  // Obter estatísticas de alertas
  getAlertStats(): {
    total: number
    unresolved: number
    unacknowledged: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
  } {
    const stats = {
      total: this.alerts.length,
      unresolved: 0,
      unacknowledged: 0,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    }

    for (const alert of this.alerts) {
      if (!alert.resolved) stats.unresolved++
      if (!alert.acknowledged) stats.unacknowledged++

      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1
    }

    return stats
  }

  // Métodos de utilidade
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getSeverityColor(severity: Alert['severity']): string {
    switch (severity) {
      case 'low': return '#36a2eb'
      case 'medium': return '#ffcd56'
      case 'high': return '#ff6384'
      case 'critical': return '#ff0000'
      default: return '#36a2eb'
    }
  }

  private getSeverityVariant(severity: Alert['severity']): string {
    switch (severity) {
      case 'low': return 'default'
      case 'medium': return 'warning'
      case 'high': return 'destructive'
      case 'critical': return 'destructive'
      default: return 'default'
    }
  }

  private loadAlerts() {
    try {
      const stored = localStorage.getItem('everest-alerts')
      if (stored) {
        this.alerts = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  private saveAlerts() {
    try {
      localStorage.setItem('everest-alerts', JSON.stringify(this.alerts))
    } catch (error) {
      console.error('Failed to save alerts:', error)
    }
  }

  private cleanupOldAlerts() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo)
    this.saveAlerts()
  }

  private resetAlertCounts() {
    this.alertCounts.clear()
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<AlertConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): AlertConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  clearAlerts(): void {
    this.alerts = []
    this.saveAlerts()
  }
}

// Instância global
export const alertService = new AlertService()

// Hook para usar alertas
export function useAlerts() {
  return {
    createAlert: alertService.createAlert.bind(alertService),
    resolveAlert: alertService.resolveAlert.bind(alertService),
    acknowledgeAlert: alertService.acknowledgeAlert.bind(alertService),
    getAlerts: alertService.getAlerts.bind(alertService),
    getAlertStats: alertService.getAlertStats.bind(alertService),
    isEnabled: alertService.isEnabled.bind(alertService),
    clearAlerts: alertService.clearAlerts.bind(alertService),
    updateConfig: alertService.updateConfig.bind(alertService),
    getConfig: alertService.getConfig.bind(alertService)
  }
}
