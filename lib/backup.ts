'use client'

interface BackupConfig {
  enabled: boolean
  interval: number // em minutos
  maxBackups: number
  includeUserData: boolean
  includeSettings: boolean
  includeCache: boolean
}

interface BackupData {
  timestamp: number
  version: string
  userData?: any
  settings?: any
  cache?: any
  metadata: {
    userAgent: string
    url: string
    sessionId: string
  }
}

class BackupService {
  private config: BackupConfig
  private backupKey = 'everest-backup'
  private versionKey = 'everest-version'

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      enabled: true,
      interval: 60, // 1 hora
      maxBackups: 5,
      includeUserData: true,
      includeSettings: true,
      includeCache: false,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Verificar se backup está habilitado
    if (!this.config.enabled) return

    // Executar backup inicial
    this.performBackup()

    // Configurar backup periódico
    this.setupPeriodicBackup()

    // Backup antes de sair da página
    this.setupBeforeUnloadBackup()
  }

  private setupPeriodicBackup() {
    setInterval(() => {
      this.performBackup()
    }, this.config.interval * 60 * 1000) // Converter para milissegundos
  }

  private setupBeforeUnloadBackup() {
    window.addEventListener('beforeunload', () => {
      this.performBackup(true)
    })
  }

  async performBackup(sync = false): Promise<boolean> {
    try {
      const backupData = await this.collectBackupData()
      
      if (sync) {
        // Usar sendBeacon para envio síncrono
        const data = JSON.stringify(backupData)
        return navigator.sendBeacon('/api/backup', data)
      } else {
        // Envio assíncrono normal
        const response = await fetch('/api/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backupData)
        })
        
        return response.ok
      }
    } catch (error) {
      console.error('Backup failed:', error)
      return false
    }
  }

  private async collectBackupData(): Promise<BackupData> {
    const backupData: BackupData = {
      timestamp: Date.now(),
      version: this.getAppVersion(),
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId()
      }
    }

    // Coletar dados do usuário
    if (this.config.includeUserData) {
      backupData.userData = this.collectUserData()
    }

    // Coletar configurações
    if (this.config.includeSettings) {
      backupData.settings = this.collectSettings()
    }

    // Coletar cache
    if (this.config.includeCache) {
      backupData.cache = this.collectCache()
    }

    return backupData
  }

  private collectUserData(): any {
    const userData: any = {}

    // Dados do localStorage relacionados ao usuário
    const userKeys = [
      'user-profile',
      'user-preferences',
      'user-progress',
      'user-settings',
      'analytics-user-id',
      'monitoring-user-id'
    ]

    userKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          userData[key] = JSON.parse(value)
        } catch {
          userData[key] = value
        }
      }
    })

    return userData
  }

  private collectSettings(): any {
    const settings: any = {}

    // Configurações da aplicação
    const settingKeys = [
      'app-theme',
      'app-language',
      'app-notifications',
      'app-privacy',
      'pwa-theme'
    ]

    settingKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          settings[key] = JSON.parse(value)
        } catch {
          settings[key] = value
        }
      }
    })

    return settings
  }

  private collectCache(): any {
    const cache: any = {}

    // Dados do cache
    const cacheKeys = [
      'flashcard-cache',
      'user-cache',
      'api-cache'
    ]

    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          cache[key] = JSON.parse(value)
        } catch {
          cache[key] = value
        }
      }
    })

    return cache
  }

  private getAppVersion(): string {
    return localStorage.getItem(this.versionKey) || '1.0.0'
  }

  private getSessionId(): string {
    return localStorage.getItem('session-id') || 'unknown'
  }

  // Métodos públicos
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/backup/${backupId}`)
      if (!response.ok) return false

      const backupData: BackupData = await response.json()
      
      // Restaurar dados do usuário
      if (backupData.userData) {
        this.restoreUserData(backupData.userData)
      }

      // Restaurar configurações
      if (backupData.settings) {
        this.restoreSettings(backupData.settings)
      }

      // Restaurar cache
      if (backupData.cache) {
        this.restoreCache(backupData.cache)
      }

      return true
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  }

  private restoreUserData(userData: any) {
    Object.entries(userData).forEach(([key, value]) => {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
      } else {
        localStorage.setItem(key, value as string)
      }
    })
  }

  private restoreSettings(settings: any) {
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
      } else {
        localStorage.setItem(key, value as string)
      }
    })
  }

  private restoreCache(cache: any) {
    Object.entries(cache).forEach(([key, value]) => {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
      } else {
        localStorage.setItem(key, value as string)
      }
    })
  }

  async getBackupList(): Promise<any[]> {
    try {
      const response = await fetch('/api/backup')
      if (!response.ok) return []

      const data = await response.json()
      return data.backups || []
    } catch (error) {
      console.error('Failed to get backup list:', error)
      return []
    }
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Failed to delete backup:', error)
      return false
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<BackupConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): BackupConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  getLastBackupTime(): number | null {
    const lastBackup = localStorage.getItem(`${this.backupKey}-last`)
    return lastBackup ? parseInt(lastBackup) : null
  }

  setLastBackupTime(timestamp: number) {
    localStorage.setItem(`${this.backupKey}-last`, timestamp.toString())
  }
}

// Instância global
export const backupService = new BackupService()

// Hook para usar backup
export function useBackup() {
  return {
    performBackup: backupService.performBackup.bind(backupService),
    restoreBackup: backupService.restoreBackup.bind(backupService),
    getBackupList: backupService.getBackupList.bind(backupService),
    deleteBackup: backupService.deleteBackup.bind(backupService),
    updateConfig: backupService.updateConfig.bind(backupService),
    getConfig: backupService.getConfig.bind(backupService),
    isEnabled: backupService.isEnabled.bind(backupService),
    getLastBackupTime: backupService.getLastBackupTime.bind(backupService)
  }
}
