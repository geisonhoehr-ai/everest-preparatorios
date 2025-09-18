'use client'

interface BackupConfig {
  enabled: boolean
  autoBackup: boolean
  backupInterval: number // em milissegundos
  maxBackups: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
  cloudStorageEnabled: boolean
  localStorageEnabled: boolean
  includeUserData: boolean
  includeSettings: boolean
  includeCache: boolean
  includeLogs: boolean
}

interface BackupData {
  id: string
  timestamp: number
  version: string
  size: number
  compressed: boolean
  encrypted: boolean
  checksum: string
  metadata: BackupMetadata
  data: any
}

interface BackupMetadata {
  userId?: string
  deviceId: string
  userAgent: string
  ipAddress: string
  location?: {
    country: string
    region: string
    city: string
  }
  dataTypes: string[]
  recordCount: number
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  lastBackup: number
  nextBackup: number
  successRate: number
  averageSize: number
  compressionRatio: number
}

class AdvancedBackupService {
  private config: BackupConfig
  private backups: BackupData[] = []
  private backupTimer: NodeJS.Timeout | null = null
  private backingUp: boolean = false

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      enabled: true,
      autoBackup: true,
      backupInterval: 24 * 60 * 60 * 1000, // 24 horas
      maxBackups: 10,
      compressionEnabled: true,
      encryptionEnabled: true,
      cloudStorageEnabled: false,
      localStorageEnabled: true,
      includeUserData: true,
      includeSettings: true,
      includeCache: true,
      includeLogs: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar backups existentes
    this.loadBackups()

    // Iniciar backup automático
    if (this.config.autoBackup) {
      this.startAutoBackup()
    }

    // Backup antes de fechar a página
    window.addEventListener('beforeunload', () => {
      this.performBackup()
    })
  }

  // Iniciar backup automático
  startAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
    }

    this.backupTimer = setInterval(() => {
      this.performBackup()
    }, this.config.backupInterval)
  }

  // Parar backup automático
  stopAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
      this.backupTimer = null
    }
  }

  // Realizar backup
  async performBackup(): Promise<BackupData | null> {
    if (!this.config.enabled || this.backingUp) {
      return null
    }

    this.backingUp = true

    try {
      // Coletar dados
      const data = await this.collectData()

      // Criar backup
      const backup = await this.createBackup(data)

      // Salvar backup
      await this.saveBackup(backup)

      // Limpar backups antigos
      this.cleanupOldBackups()

      return backup
    } catch (error) {
      console.error('Backup failed:', error)
      return null
    } finally {
      this.backingUp = false
    }
  }

  // Coletar dados para backup
  private async collectData(): Promise<any> {
    const data: any = {
      timestamp: Date.now(),
      version: '1.0.0',
      userData: {},
      settings: {},
      cache: {},
      logs: {}
    }

    // Dados do usuário
    if (this.config.includeUserData) {
      data.userData = await this.collectUserData()
    }

    // Configurações
    if (this.config.includeSettings) {
      data.settings = await this.collectSettings()
    }

    // Cache
    if (this.config.includeCache) {
      data.cache = await this.collectCache()
    }

    // Logs
    if (this.config.includeLogs) {
      data.logs = await this.collectLogs()
    }

    return data
  }

  // Coletar dados do usuário
  private async collectUserData(): Promise<any> {
    const userData: any = {}

    try {
      // Dados do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('everest-user-')) {
          userData[key] = localStorage.getItem(key)
        }
      }

      // Dados do sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('everest-session-')) {
          userData[key] = sessionStorage.getItem(key)
        }
      }
    } catch (error) {
      console.error('Failed to collect user data:', error)
    }

    return userData
  }

  // Coletar configurações
  private async collectSettings(): Promise<any> {
    const settings: any = {}

    try {
      // Configurações do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('everest-settings-')) {
          settings[key] = localStorage.getItem(key)
        }
      }
    } catch (error) {
      console.error('Failed to collect settings:', error)
    }

    return settings
  }

  // Coletar cache
  private async collectCache(): Promise<any> {
    const cache: any = {}

    try {
      // Cache do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('everest-cache-')) {
          cache[key] = localStorage.getItem(key)
        }
      }
    } catch (error) {
      console.error('Failed to collect cache:', error)
    }

    return cache
  }

  // Coletar logs
  private async collectLogs(): Promise<any> {
    const logs: any = {}

    try {
      // Logs do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('everest-logs-')) {
          logs[key] = localStorage.getItem(key)
        }
      }
    } catch (error) {
      console.error('Failed to collect logs:', error)
    }

    return logs
  }

  // Criar backup
  private async createBackup(data: any): Promise<BackupData> {
    const backupId = this.generateBackupId()
    const timestamp = Date.now()
    const version = '1.0.0'

    // Comprimir se habilitado
    let processedData = data
    if (this.config.compressionEnabled) {
      processedData = await this.compressData(JSON.stringify(data))
    }

    // Criptografar se habilitado
    if (this.config.encryptionEnabled) {
      processedData = await this.encryptData(JSON.stringify(processedData))
    }

    // Calcular checksum
    const checksum = await this.calculateChecksum(JSON.stringify(processedData))

    // Criar metadata
    const metadata: BackupMetadata = {
      deviceId: this.getDeviceId(),
      userAgent: navigator.userAgent,
      ipAddress: await this.getIPAddress(),
      dataTypes: this.getDataTypes(data),
      recordCount: this.getRecordCount(data)
    }

    // Calcular tamanho
    const size = new Blob([JSON.stringify(processedData)]).size

    return {
      id: backupId,
      timestamp,
      version,
      size,
      compressed: this.config.compressionEnabled,
      encrypted: this.config.encryptionEnabled,
      checksum,
      metadata,
      data: processedData
    }
  }

  // Salvar backup
  private async saveBackup(backup: BackupData): Promise<void> {
    // Salvar localmente
    if (this.config.localStorageEnabled) {
      this.saveBackupLocally(backup)
    }

    // Salvar na nuvem
    if (this.config.cloudStorageEnabled) {
      await this.saveBackupToCloud(backup)
    }

    // Adicionar à lista
    this.backups.unshift(backup)
    this.saveBackupList()
  }

  // Salvar backup localmente
  private saveBackupLocally(backup: BackupData): void {
    try {
      const backupKey = `everest-backup-${backup.id}`
      localStorage.setItem(backupKey, JSON.stringify(backup))
    } catch (error) {
      console.error('Failed to save backup locally:', error)
    }
  }

  // Salvar backup na nuvem
  private async saveBackupToCloud(backup: BackupData): Promise<void> {
    try {
      await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backup)
      })
    } catch (error) {
      console.error('Failed to save backup to cloud:', error)
    }
  }

  // Restaurar backup
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backup = this.getBackup(backupId)
      if (!backup) {
        throw new Error('Backup not found')
      }

      // Verificar checksum
      const isValid = await this.verifyBackup(backup)
      if (!isValid) {
        throw new Error('Backup is corrupted')
      }

      // Descriptografar se necessário
      let data = backup.data
      if (backup.encrypted) {
        data = await this.decryptData(data)
      }

      // Descomprimir se necessário
      if (backup.compressed) {
        data = await this.decompressData(data)
      }

      // Restaurar dados
      await this.restoreData(data)

      return true
    } catch (error) {
      console.error('Failed to restore backup:', error)
      return false
    }
  }

  // Restaurar dados
  private async restoreData(data: any): Promise<void> {
    try {
      // Restaurar dados do usuário
      if (data.userData) {
        for (const [key, value] of Object.entries(data.userData)) {
          localStorage.setItem(key, value as string)
        }
      }

      // Restaurar configurações
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          localStorage.setItem(key, value as string)
        }
      }

      // Restaurar cache
      if (data.cache) {
        for (const [key, value] of Object.entries(data.cache)) {
          localStorage.setItem(key, value as string)
        }
      }

      // Restaurar logs
      if (data.logs) {
        for (const [key, value] of Object.entries(data.logs)) {
          localStorage.setItem(key, value as string)
        }
      }
    } catch (error) {
      console.error('Failed to restore data:', error)
    }
  }

  // Obter backup
  getBackup(backupId: string): BackupData | null {
    return this.backups.find(backup => backup.id === backupId) || null
  }

  // Obter backups
  getBackups(limit?: number): BackupData[] {
    if (limit) {
      return this.backups.slice(0, limit)
    }
    return [...this.backups]
  }

  // Verificar backup
  async verifyBackup(backup: BackupData): Promise<boolean> {
    try {
      const calculatedChecksum = await this.calculateChecksum(JSON.stringify(backup.data))
      return calculatedChecksum === backup.checksum
    } catch (error) {
      console.error('Failed to verify backup:', error)
      return false
    }
  }

  // Limpar backups antigos
  private cleanupOldBackups(): void {
    if (this.backups.length > this.config.maxBackups) {
      const backupsToRemove = this.backups.slice(this.config.maxBackups)
      
      for (const backup of backupsToRemove) {
        this.removeBackup(backup.id)
      }
      
      this.backups = this.backups.slice(0, this.config.maxBackups)
    }
  }

  // Remover backup
  removeBackup(backupId: string): boolean {
    const index = this.backups.findIndex(backup => backup.id === backupId)
    if (index === -1) return false

    this.backups.splice(index, 1)
    this.saveBackupList()

    // Remover do localStorage
    try {
      const backupKey = `everest-backup-${backupId}`
      localStorage.removeItem(backupKey)
    } catch (error) {
      console.error('Failed to remove backup from localStorage:', error)
    }

    return true
  }

  // Obter estatísticas
  getStats(): BackupStats {
    const totalBackups = this.backups.length
    const totalSize = this.backups.reduce((sum, backup) => sum + backup.size, 0)
    const lastBackup = this.backups.length > 0 ? this.backups[0].timestamp : 0
    const nextBackup = lastBackup + this.config.backupInterval
    const successRate = 1.0 // Placeholder
    const averageSize = totalBackups > 0 ? totalSize / totalBackups : 0
    const compressionRatio = 0.5 // Placeholder

    return {
      totalBackups,
      totalSize,
      lastBackup,
      nextBackup,
      successRate,
      averageSize,
      compressionRatio
    }
  }

  // Métodos de utilidade
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceId(): string {
    return localStorage.getItem('everest-device-id') || 'unknown'
  }

  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  private getDataTypes(data: any): string[] {
    const types: string[] = []
    if (data.userData) types.push('userData')
    if (data.settings) types.push('settings')
    if (data.cache) types.push('cache')
    if (data.logs) types.push('logs')
    return types
  }

  private getRecordCount(data: any): number {
    let count = 0
    if (data.userData) count += Object.keys(data.userData).length
    if (data.settings) count += Object.keys(data.settings).length
    if (data.cache) count += Object.keys(data.cache).length
    if (data.logs) count += Object.keys(data.logs).length
    return count
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async compressData(data: string): Promise<string> {
    // Implementar compressão
    return data
  }

  private async decompressData(data: string): Promise<string> {
    // Implementar descompressão
    return data
  }

  private async encryptData(data: string): Promise<string> {
    // Implementar criptografia
    return data
  }

  private async decryptData(data: string): Promise<string> {
    // Implementar descriptografia
    return data
  }

  // Salvar lista de backups
  private saveBackupList(): void {
    try {
      localStorage.setItem('everest-backup-list', JSON.stringify(this.backups))
    } catch (error) {
      console.error('Failed to save backup list:', error)
    }
  }

  // Carregar backups
  private loadBackups(): void {
    try {
      const stored = localStorage.getItem('everest-backup-list')
      if (stored) {
        this.backups = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load backups:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<BackupConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.autoBackup !== undefined) {
      if (newConfig.autoBackup) {
        this.startAutoBackup()
      } else {
        this.stopAutoBackup()
      }
    }
  }

  getConfig(): BackupConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  isBackingUp(): boolean {
    return this.backingUp
  }
}

// Instância global
export const advancedBackupService = new AdvancedBackupService()

// Hook para usar backup avançado
export function useAdvancedBackup() {
  return {
    performBackup: advancedBackupService.performBackup.bind(advancedBackupService),
    restoreBackup: advancedBackupService.restoreBackup.bind(advancedBackupService),
    getBackup: advancedBackupService.getBackup.bind(advancedBackupService),
    getBackups: advancedBackupService.getBackups.bind(advancedBackupService),
    verifyBackup: advancedBackupService.verifyBackup.bind(advancedBackupService),
    removeBackup: advancedBackupService.removeBackup.bind(advancedBackupService),
    getStats: advancedBackupService.getStats.bind(advancedBackupService),
    startAutoBackup: advancedBackupService.startAutoBackup.bind(advancedBackupService),
    stopAutoBackup: advancedBackupService.stopAutoBackup.bind(advancedBackupService),
    isEnabled: advancedBackupService.isEnabled.bind(advancedBackupService),
    isBackingUp: advancedBackupService.isBackingUp.bind(advancedBackupService),
    updateConfig: advancedBackupService.updateConfig.bind(advancedBackupService),
    getConfig: advancedBackupService.getConfig.bind(advancedBackupService)
  }
}
