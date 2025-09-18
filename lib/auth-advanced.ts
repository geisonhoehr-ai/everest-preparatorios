'use client'

interface AuthConfig {
  enableBiometric: boolean
  enable2FA: boolean
  enableSSO: boolean
  sessionTimeout: number // em milissegundos
  maxLoginAttempts: number
  lockoutDuration: number // em milissegundos
  enablePasswordPolicy: boolean
  enableDeviceTracking: boolean
  enableLocationTracking: boolean
}

interface AuthSession {
  id: string
  userId: string
  deviceId: string
  deviceInfo: DeviceInfo
  location?: LocationInfo
  ipAddress: string
  userAgent: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  isActive: boolean
}

interface DeviceInfo {
  id: string
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  os: string
  browser: string
  fingerprint: string
}

interface LocationInfo {
  country: string
  region: string
  city: string
  timezone: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface LoginAttempt {
  id: string
  email: string
  ipAddress: string
  userAgent: string
  timestamp: number
  success: boolean
  failureReason?: string
  deviceInfo: DeviceInfo
  location?: LocationInfo
}

class AdvancedAuthService {
  private config: AuthConfig
  private sessions: Map<string, AuthSession> = new Map()
  private loginAttempts: LoginAttempt[] = []
  private deviceFingerprint: string = ''

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = {
      enableBiometric: true,
      enable2FA: true,
      enableSSO: true,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutos
      enablePasswordPolicy: true,
      enableDeviceTracking: true,
      enableLocationTracking: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Gerar fingerprint do dispositivo
    this.generateDeviceFingerprint()

    // Carregar sessões ativas
    this.loadActiveSessions()

    // Carregar tentativas de login
    this.loadLoginAttempts()

    // Monitorar atividade
    this.monitorActivity()

    // Limpar sessões expiradas
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, 60 * 1000) // A cada minuto
  }

  // Gerar fingerprint do dispositivo
  private generateDeviceFingerprint(): void {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown'
    ].join('|')

    this.deviceFingerprint = this.hashString(fingerprint)
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  // Obter informações do dispositivo
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent
    const deviceType = this.getDeviceType(userAgent)
    const os = this.getOperatingSystem(userAgent)
    const browser = this.getBrowser(userAgent)

    return {
      id: this.deviceFingerprint,
      name: `${os} ${browser}`,
      type: deviceType,
      os,
      browser,
      fingerprint: this.deviceFingerprint
    }
  }

  private getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet'
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile'
    return 'desktop'
  }

  private getOperatingSystem(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows'
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS'
    if (/linux/i.test(userAgent)) return 'Linux'
    if (/android/i.test(userAgent)) return 'Android'
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS'
    return 'Unknown'
  }

  private getBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome'
    if (/firefox/i.test(userAgent)) return 'Firefox'
    if (/safari/i.test(userAgent)) return 'Safari'
    if (/edge/i.test(userAgent)) return 'Edge'
    if (/opera/i.test(userAgent)) return 'Opera'
    return 'Unknown'
  }

  // Obter localização
  private async getLocation(): Promise<LocationInfo | undefined> {
    if (!this.config.enableLocationTracking) return undefined

    try {
      // Usar serviço de geolocalização
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()

      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude
        }
      }
    } catch (error) {
      console.warn('Failed to get location:', error)
      return undefined
    }
  }

  // Registrar tentativa de login
  async recordLoginAttempt(
    email: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> {
    const attempt: LoginAttempt = {
      id: this.generateId(),
      email,
      ipAddress: await this.getIPAddress(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      success,
      failureReason,
      deviceInfo: this.getDeviceInfo(),
      location: await this.getLocation()
    }

    this.loginAttempts.unshift(attempt)
    this.trimLoginAttempts()
    this.saveLoginAttempts()

    // Verificar se deve bloquear
    if (!success) {
      await this.checkForLockout(email)
    }
  }

  // Verificar bloqueio por tentativas
  private async checkForLockout(email: string): Promise<void> {
    const recentAttempts = this.loginAttempts.filter(
      attempt => 
        attempt.email === email && 
        !attempt.success && 
        Date.now() - attempt.timestamp < this.config.lockoutDuration
    )

    if (recentAttempts.length >= this.config.maxLoginAttempts) {
      // Bloquear usuário
      await this.lockoutUser(email)
    }
  }

  // Bloquear usuário
  private async lockoutUser(email: string): Promise<void> {
    const lockoutKey = `lockout_${email}`
    const lockoutData = {
      email,
      lockedAt: Date.now(),
      expiresAt: Date.now() + this.config.lockoutDuration
    }

    localStorage.setItem(lockoutKey, JSON.stringify(lockoutData))
  }

  // Verificar se usuário está bloqueado
  isUserLockedOut(email: string): boolean {
    const lockoutKey = `lockout_${email}`
    const lockoutData = localStorage.getItem(lockoutKey)

    if (!lockoutData) return false

    try {
      const data = JSON.parse(lockoutData)
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(lockoutKey)
        return false
      }
      return true
    } catch {
      return false
    }
  }

  // Criar sessão
  async createSession(userId: string): Promise<AuthSession> {
    const session: AuthSession = {
      id: this.generateId(),
      userId,
      deviceId: this.deviceFingerprint,
      deviceInfo: this.getDeviceInfo(),
      location: await this.getLocation(),
      ipAddress: await this.getIPAddress(),
      userAgent: navigator.userAgent,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + this.config.sessionTimeout,
      isActive: true
    }

    this.sessions.set(session.id, session)
    this.saveActiveSessions()

    return session
  }

  // Atualizar atividade da sessão
  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = Date.now()
      this.saveActiveSessions()
    }
  }

  // Encerrar sessão
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.sessions.delete(sessionId)
      this.saveActiveSessions()
    }
  }

  // Encerrar todas as sessões
  endAllSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false
        this.sessions.delete(sessionId)
      }
    }
    this.saveActiveSessions()
  }

  // Obter sessões ativas
  getActiveSessions(userId?: string): AuthSession[] {
    const sessions = Array.from(this.sessions.values())
      .filter(session => session.isActive && session.expiresAt > Date.now())

    if (userId) {
      return sessions.filter(session => session.userId === userId)
    }

    return sessions
  }

  // Verificar se sessão é válida
  isSessionValid(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    if (!session.isActive || session.expiresAt <= Date.now()) {
      this.sessions.delete(sessionId)
      return false
    }

    return true
  }

  // Monitorar atividade
  private monitorActivity(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateAllSessionsActivity()
      }, { passive: true })
    })
  }

  private updateAllSessionsActivity(): void {
    for (const session of this.sessions.values()) {
      if (session.isActive) {
        session.lastActivity = Date.now()
      }
    }
  }

  // Limpar sessões expiradas
  private cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        session.isActive = false
        this.sessions.delete(sessionId)
      }
    }
    this.saveActiveSessions()
  }

  // Obter IP address
  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  // Gerar ID único
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Limitar tentativas de login
  private trimLoginAttempts(): void {
    if (this.loginAttempts.length > 1000) {
      this.loginAttempts = this.loginAttempts.slice(0, 1000)
    }
  }

  // Salvar sessões ativas
  private saveActiveSessions(): void {
    try {
      const sessions = Array.from(this.sessions.values())
      localStorage.setItem('everest-active-sessions', JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to save active sessions:', error)
    }
  }

  // Carregar sessões ativas
  private loadActiveSessions(): void {
    try {
      const stored = localStorage.getItem('everest-active-sessions')
      if (stored) {
        const sessions = JSON.parse(stored)
        for (const session of sessions) {
          if (session.isActive && session.expiresAt > Date.now()) {
            this.sessions.set(session.id, session)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error)
    }
  }

  // Salvar tentativas de login
  private saveLoginAttempts(): void {
    try {
      localStorage.setItem('everest-login-attempts', JSON.stringify(this.loginAttempts))
    } catch (error) {
      console.error('Failed to save login attempts:', error)
    }
  }

  // Carregar tentativas de login
  private loadLoginAttempts(): void {
    try {
      const stored = localStorage.getItem('everest-login-attempts')
      if (stored) {
        this.loginAttempts = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load login attempts:', error)
    }
  }

  // Obter estatísticas
  getStats(): {
    activeSessions: number
    totalLoginAttempts: number
    failedLoginAttempts: number
    uniqueDevices: number
    uniqueLocations: number
  } {
    const activeSessions = this.getActiveSessions().length
    const totalLoginAttempts = this.loginAttempts.length
    const failedLoginAttempts = this.loginAttempts.filter(a => !a.success).length
    
    const uniqueDevices = new Set(this.loginAttempts.map(a => a.deviceInfo.id)).size
    const uniqueLocations = new Set(
      this.loginAttempts
        .filter(a => a.location)
        .map(a => `${a.location!.country}-${a.location!.region}`)
    ).size

    return {
      activeSessions,
      totalLoginAttempts,
      failedLoginAttempts,
      uniqueDevices,
      uniqueLocations
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<AuthConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): AuthConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return true
  }

  getDeviceFingerprint(): string {
    return this.deviceFingerprint
  }
}

// Instância global
export const advancedAuthService = new AdvancedAuthService()

// Hook para usar autenticação avançada
export function useAdvancedAuth() {
  return {
    recordLoginAttempt: advancedAuthService.recordLoginAttempt.bind(advancedAuthService),
    isUserLockedOut: advancedAuthService.isUserLockedOut.bind(advancedAuthService),
    createSession: advancedAuthService.createSession.bind(advancedAuthService),
    updateSessionActivity: advancedAuthService.updateSessionActivity.bind(advancedAuthService),
    endSession: advancedAuthService.endSession.bind(advancedAuthService),
    endAllSessions: advancedAuthService.endAllSessions.bind(advancedAuthService),
    getActiveSessions: advancedAuthService.getActiveSessions.bind(advancedAuthService),
    isSessionValid: advancedAuthService.isSessionValid.bind(advancedAuthService),
    getStats: advancedAuthService.getStats.bind(advancedAuthService),
    isEnabled: advancedAuthService.isEnabled.bind(advancedAuthService),
    getDeviceFingerprint: advancedAuthService.getDeviceFingerprint.bind(advancedAuthService),
    updateConfig: advancedAuthService.updateConfig.bind(advancedAuthService),
    getConfig: advancedAuthService.getConfig.bind(advancedAuthService)
  }
}
