'use client'

interface LogLevel {
  ERROR: 0
  WARN: 1
  INFO: 2
  DEBUG: 3
  TRACE: 4
}

interface LogEntry {
  level: keyof LogLevel
  message: string
  timestamp: number
  context?: any
  userId?: string
  sessionId?: string
  requestId?: string
  stack?: string
  metadata?: Record<string, any>
}

interface LoggerConfig {
  level: keyof LogLevel
  enableConsole: boolean
  enableRemote: boolean
  enableLocalStorage: boolean
  maxLocalLogs: number
  remoteEndpoint?: string
  batchSize: number
  flushInterval: number
}

class LoggerService {
  private config: LoggerConfig
  private logQueue: LogEntry[] = []
  private logLevels: LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
  }

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'INFO',
      enableConsole: true,
      enableRemote: false,
      enableLocalStorage: true,
      maxLocalLogs: 1000,
      remoteEndpoint: '/api/logs',
      batchSize: 10,
      flushInterval: 5000,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Flush logs periodicamente
    setInterval(() => {
      this.flushLogs()
    }, this.config.flushInterval)

    // Capturar erros globais
    window.addEventListener('error', (event) => {
      this.error('Global error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })
    })

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      })
    })

    // Capturar erros de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.error('Resource error', {
          target: event.target,
          type: event.type
        })
      }
    }, true)
  }

  // Métodos de log
  error(message: string, context?: any, metadata?: Record<string, any>) {
    this.log('ERROR', message, context, metadata)
  }

  warn(message: string, context?: any, metadata?: Record<string, any>) {
    this.log('WARN', message, context, metadata)
  }

  info(message: string, context?: any, metadata?: Record<string, any>) {
    this.log('INFO', message, context, metadata)
  }

  debug(message: string, context?: any, metadata?: Record<string, any>) {
    this.log('DEBUG', message, context, metadata)
  }

  trace(message: string, context?: any, metadata?: Record<string, any>) {
    this.log('TRACE', message, context, metadata)
  }

  private log(level: keyof LogLevel, message: string, context?: any, metadata?: Record<string, any>) {
    // Verificar se o nível de log está habilitado
    if (this.logLevels[level] > this.logLevels[this.config.level]) {
      return
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      metadata,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId()
    }

    // Adicionar stack trace para erros
    if (level === 'ERROR' && context?.error) {
      logEntry.stack = context.error.stack
    }

    // Log no console
    if (this.config.enableConsole) {
      this.logToConsole(logEntry)
    }

    // Adicionar à fila
    this.logQueue.push(logEntry)

    // Salvar no localStorage
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage(logEntry)
    }

    // Flush se necessário
    if (this.logQueue.length >= this.config.batchSize) {
      this.flushLogs()
    }
  }

  private logToConsole(logEntry: LogEntry) {
    const timestamp = new Date(logEntry.timestamp).toISOString()
    const prefix = `[${timestamp}] [${logEntry.level}]`
    
    switch (logEntry.level) {
      case 'ERROR':
        console.error(prefix, logEntry.message, logEntry.context, logEntry.metadata)
        break
      case 'WARN':
        console.warn(prefix, logEntry.message, logEntry.context, logEntry.metadata)
        break
      case 'INFO':
        console.info(prefix, logEntry.message, logEntry.context, logEntry.metadata)
        break
      case 'DEBUG':
        console.debug(prefix, logEntry.message, logEntry.context, logEntry.metadata)
        break
      case 'TRACE':
        console.trace(prefix, logEntry.message, logEntry.context, logEntry.metadata)
        break
    }
  }

  private saveToLocalStorage(logEntry: LogEntry) {
    try {
      const stored = localStorage.getItem('everest-logs')
      const logs = stored ? JSON.parse(stored) : []
      
      logs.push(logEntry)
      
      // Manter apenas os logs mais recentes
      if (logs.length > this.config.maxLocalLogs) {
        logs.splice(0, logs.length - this.config.maxLocalLogs)
      }
      
      localStorage.setItem('everest-logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to save log to localStorage:', error)
    }
  }

  private async flushLogs() {
    if (!this.config.enableRemote || this.logQueue.length === 0) {
      return
    }

    const logsToFlush = [...this.logQueue]
    this.logQueue = []

    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: logsToFlush,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('Failed to flush logs:', error)
      // Re-adicionar logs à fila se falhar
      this.logQueue.unshift(...logsToFlush)
    }
  }

  // Métodos de utilidade
  private getUserId(): string | undefined {
    try {
      return localStorage.getItem('everest-user-id') || undefined
    } catch {
      return undefined
    }
  }

  private getSessionId(): string | undefined {
    try {
      return localStorage.getItem('everest-session-id') || undefined
    } catch {
      return undefined
    }
  }

  private getRequestId(): string | undefined {
    try {
      return localStorage.getItem('everest-request-id') || undefined
    } catch {
      return undefined
    }
  }

  // Obter logs do localStorage
  getLocalLogs(limit?: number): LogEntry[] {
    try {
      const stored = localStorage.getItem('everest-logs')
      const logs = stored ? JSON.parse(stored) : []
      
      if (limit) {
        return logs.slice(-limit)
      }
      
      return logs
    } catch (error) {
      console.error('Failed to get local logs:', error)
      return []
    }
  }

  // Limpar logs locais
  clearLocalLogs(): void {
    try {
      localStorage.removeItem('everest-logs')
    } catch (error) {
      console.error('Failed to clear local logs:', error)
    }
  }

  // Obter estatísticas de logs
  getLogStats(): {
    totalLogs: number
    errorCount: number
    warnCount: number
    infoCount: number
    debugCount: number
    traceCount: number
    oldestLog: number
    newestLog: number
  } {
    const logs = this.getLocalLogs()
    
    const stats = {
      totalLogs: logs.length,
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      debugCount: 0,
      traceCount: 0,
      oldestLog: 0,
      newestLog: 0
    }

    if (logs.length === 0) {
      return stats
    }

    for (const log of logs) {
      switch (log.level) {
        case 'ERROR':
          stats.errorCount++
          break
        case 'WARN':
          stats.warnCount++
          break
        case 'INFO':
          stats.infoCount++
          break
        case 'DEBUG':
          stats.debugCount++
          break
        case 'TRACE':
          stats.traceCount++
          break
      }
    }

    stats.oldestLog = Math.min(...logs.map(l => l.timestamp))
    stats.newestLog = Math.max(...logs.map(l => l.timestamp))

    return stats
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enableConsole || this.config.enableRemote || this.config.enableLocalStorage
  }

  getLevel(): keyof LogLevel {
    return this.config.level
  }

  setLevel(level: keyof LogLevel) {
    this.config.level = level
  }
}

// Instância global
export const logger = new LoggerService()

// Hook para usar logger
export function useLogger() {
  return {
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    trace: logger.trace.bind(logger),
    getLocalLogs: logger.getLocalLogs.bind(logger),
    clearLocalLogs: logger.clearLocalLogs.bind(logger),
    getLogStats: logger.getLogStats.bind(logger),
    isEnabled: logger.isEnabled.bind(logger),
    getLevel: logger.getLevel.bind(logger),
    setLevel: logger.setLevel.bind(logger),
    updateConfig: logger.updateConfig.bind(logger),
    getConfig: logger.getConfig.bind(logger)
  }
}
