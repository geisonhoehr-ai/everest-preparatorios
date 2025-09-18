'use client'

interface PushNotificationConfig {
  enabled: boolean
  vapidPublicKey: string
  vapidPrivateKey: string
  endpoint: string
  retryAttempts: number
  retryDelay: number
  maxNotifications: number
  enableSound: boolean
  enableVibration: boolean
  enableBadge: boolean
}

interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: Array<{ action: string; title: string; icon?: string }>
  requireInteraction?: boolean
  silent?: boolean
  timestamp: number
  read: boolean
  clicked: boolean
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class PushNotificationService {
  private config: PushNotificationConfig
  private notifications: PushNotification[] = []
  private subscription: PushSubscription | null = null
  private listeners: Set<(notification: PushNotification) => void> = new Set()

  constructor(config: Partial<PushNotificationConfig> = {}) {
    this.config = {
      enabled: true,
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      vapidPrivateKey: process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || '',
      endpoint: '/api/push-notifications',
      retryAttempts: 3,
      retryDelay: 1000,
      maxNotifications: 100,
      enableSound: true,
      enableVibration: true,
      enableBadge: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar notificações do localStorage
    this.loadNotifications()

    // Carregar subscription do localStorage
    this.loadSubscription()

    // Registrar event listeners
    this.registerEventListeners()

    // Verificar permissões
    this.checkPermissions()
  }

  private registerEventListeners() {
    // Listener para notificações recebidas
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
          this.handlePushNotification(event.data.notification)
        }
      })
    }

    // Listener para cliques em notificações
    window.addEventListener('beforeunload', () => {
      this.saveNotifications()
      this.saveSubscription()
    })
  }

  // Verificar permissões
  async checkPermissions(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Push notifications are not supported in this browser')
      return 'denied'
    }

    return Notification.permission
  }

  // Solicitar permissões
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Push notifications are not supported in this browser')
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      await this.subscribe()
    }

    return permission
  }

  // Inscrever para notificações push
  async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported in this browser')
    }

    try {
      // Registrar service worker se necessário
      const registration = await navigator.serviceWorker.ready

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.config.vapidPublicKey
      })

      this.subscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      }

      // Salvar subscription
      this.saveSubscription()

      // Enviar subscription para o servidor
      await this.sendSubscriptionToServer(this.subscription)

      return this.subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  // Cancelar inscrição
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
      }

      this.subscription = null
      this.saveSubscription()

      // Notificar servidor
      await this.sendUnsubscriptionToServer()

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  // Enviar notificação
  async sendNotification(notification: Omit<PushNotification, 'id' | 'timestamp' | 'read' | 'clicked'>): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    try {
      const fullNotification: PushNotification = {
        ...notification,
        id: this.generateNotificationId(),
        timestamp: Date.now(),
        read: false,
        clicked: false
      }

      // Adicionar à lista local
      this.notifications.unshift(fullNotification)
      this.trimNotifications()

      // Salvar no localStorage
      this.saveNotifications()

      // Notificar listeners
      this.notifyListeners(fullNotification)

      // Enviar para o servidor
      await this.sendNotificationToServer(fullNotification)

      return true
    } catch (error) {
      console.error('Failed to send notification:', error)
      return false
    }
  }

  // Obter notificações
  getNotifications(limit?: number): PushNotification[] {
    if (limit) {
      return this.notifications.slice(0, limit)
    }
    return [...this.notifications]
  }

  // Marcar como lida
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      return true
    }
    return false
  }

  // Marcar como clicada
  markAsClicked(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.clicked = true
      this.saveNotifications()
      return true
    }
    return false
  }

  // Limpar notificações
  clearNotifications(): void {
    this.notifications = []
    this.saveNotifications()
  }

  // Obter estatísticas
  getStats(): {
    total: number
    unread: number
    unclicked: number
    byType: Record<string, number>
  } {
    const stats = {
      total: this.notifications.length,
      unread: 0,
      unclicked: 0,
      byType: {} as Record<string, number>
    }

    for (const notification of this.notifications) {
      if (!notification.read) stats.unread++
      if (!notification.clicked) stats.unclicked++
      
      const type = notification.tag || 'default'
      stats.byType[type] = (stats.byType[type] || 0) + 1
    }

    return stats
  }

  // Adicionar listener
  addListener(listener: (notification: PushNotification) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Métodos privados
  private handlePushNotification(notification: PushNotification) {
    this.notifications.unshift(notification)
    this.trimNotifications()
    this.saveNotifications()
    this.notifyListeners(notification)
  }

  private trimNotifications() {
    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.config.maxNotifications)
    }
  }

  private notifyListeners(notification: PushNotification) {
    this.listeners.forEach(listener => listener(notification))
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray as Uint8Array
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'subscribe',
          subscription
        })
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  private async sendUnsubscriptionToServer(): Promise<void> {
    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'unsubscribe'
        })
      })
    } catch (error) {
      console.error('Failed to send unsubscription to server:', error)
    }
  }

  private async sendNotificationToServer(notification: PushNotification): Promise<void> {
    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'notification',
          notification
        })
      })
    } catch (error) {
      console.error('Failed to send notification to server:', error)
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('everest-push-notifications')
      if (stored) {
        this.notifications = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('everest-push-notifications', JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  private loadSubscription(): void {
    try {
      const stored = localStorage.getItem('everest-push-subscription')
      if (stored) {
        this.subscription = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
    }
  }

  private saveSubscription(): void {
    try {
      if (this.subscription) {
        localStorage.setItem('everest-push-subscription', JSON.stringify(this.subscription))
      } else {
        localStorage.removeItem('everest-push-subscription')
      }
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<PushNotificationConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): PushNotificationConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  }

  isSubscribed(): boolean {
    return this.subscription !== null
  }

  getSubscription(): PushSubscription | null {
    return this.subscription
  }
}

// Instância global
export const pushNotificationService = new PushNotificationService()

// Hook para usar notificações push
export function usePushNotifications() {
  return {
    checkPermissions: pushNotificationService.checkPermissions.bind(pushNotificationService),
    requestPermission: pushNotificationService.requestPermission.bind(pushNotificationService),
    subscribe: pushNotificationService.subscribe.bind(pushNotificationService),
    unsubscribe: pushNotificationService.unsubscribe.bind(pushNotificationService),
    sendNotification: pushNotificationService.sendNotification.bind(pushNotificationService),
    getNotifications: pushNotificationService.getNotifications.bind(pushNotificationService),
    markAsRead: pushNotificationService.markAsRead.bind(pushNotificationService),
    markAsClicked: pushNotificationService.markAsClicked.bind(pushNotificationService),
    clearNotifications: pushNotificationService.clearNotifications.bind(pushNotificationService),
    getStats: pushNotificationService.getStats.bind(pushNotificationService),
    addListener: pushNotificationService.addListener.bind(pushNotificationService),
    isEnabled: pushNotificationService.isEnabled.bind(pushNotificationService),
    isSupported: pushNotificationService.isSupported.bind(pushNotificationService),
    isSubscribed: pushNotificationService.isSubscribed.bind(pushNotificationService),
    getSubscription: pushNotificationService.getSubscription.bind(pushNotificationService),
    updateConfig: pushNotificationService.updateConfig.bind(pushNotificationService),
    getConfig: pushNotificationService.getConfig.bind(pushNotificationService)
  }
}
