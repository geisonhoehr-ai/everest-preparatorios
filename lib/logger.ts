/**
 * Sistema de Logging Estruturado para Everest Preparatórios
 * 
 * Este sistema garante que:
 * - Logs de debug só aparecem em desenvolvimento
 * - Logs de erro são sempre registrados
 * - Informações sensíveis não são expostas
 * - Logs são estruturados para facilitar monitoramento
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  data?: any
  userId?: string
  sessionId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, data, userId, sessionId } = entry
    
    let formattedMessage = `[${timestamp}] ${level.toUpperCase()}`
    
    if (context) {
      formattedMessage += ` [${context}]`
    }
    
    if (userId) {
      formattedMessage += ` [User: ${userId.substring(0, 8)}...]`
    }
    
    if (sessionId) {
      formattedMessage += ` [Session: ${sessionId.substring(0, 8)}...]`
    }
    
    formattedMessage += `: ${message}`
    
    if (data && this.isDevelopment) {
      formattedMessage += `\nData: ${JSON.stringify(data, null, 2)}`
    }
    
    return formattedMessage
  }

  private sanitizeData(data: any): any {
    if (!data) return data
    
    // Lista de campos sensíveis que devem ser removidos
    const sensitiveFields = [
      'password', 'senha', 'token', 'key', 'secret', 'auth',
      'email', 'phone', 'cpf', 'rg', 'credit_card', 'cvv'
    ]
    
    if (typeof data === 'object') {
      const sanitized = { ...data }
      
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]'
        }
      }
      
      return sanitized
    }
    
    return data
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, userId?: string, sessionId?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data: this.sanitizeData(data),
      userId,
      sessionId
    }

    const formattedMessage = this.formatMessage(entry)

    // Em produção, só logar warnings e errors
    if (this.isProduction && (level === 'debug' || level === 'info')) {
      return
    }

    // Em desenvolvimento, logar tudo
    switch (level) {
      case 'debug':
        console.log(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }

    // Em produção, enviar logs críticos para serviço de monitoramento
    if (this.isProduction && level === 'error') {
      this.sendToMonitoring(entry)
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // TODO: Implementar integração com serviço de monitoramento
    // Exemplos: Sentry, LogRocket, DataDog, etc.
    // Por enquanto, apenas logar no console
    console.error('🚨 CRITICAL ERROR - Should be sent to monitoring service:', entry)
  }

  // Métodos públicos
  debug(message: string, context?: string, data?: any, userId?: string, sessionId?: string) {
    this.log('debug', message, context, data, userId, sessionId)
  }

  info(message: string, context?: string, data?: any, userId?: string, sessionId?: string) {
    this.log('info', message, context, data, userId, sessionId)
  }

  warn(message: string, context?: string, data?: any, userId?: string, sessionId?: string) {
    this.log('warn', message, context, data, userId, sessionId)
  }

  error(message: string, context?: string, data?: any, userId?: string, sessionId?: string) {
    this.log('error', message, context, data, userId, sessionId)
  }

  // Métodos específicos para diferentes contextos
  auth(message: string, data?: any, userId?: string, sessionId?: string) {
    this.info(message, 'AUTH', data, userId, sessionId)
  }

  database(message: string, data?: any, userId?: string, sessionId?: string) {
    this.info(message, 'DATABASE', data, userId, sessionId)
  }

  api(message: string, data?: any, userId?: string, sessionId?: string) {
    this.info(message, 'API', data, userId, sessionId)
  }

  security(message: string, data?: any, userId?: string, sessionId?: string) {
    this.warn(message, 'SECURITY', data, userId, sessionId)
  }

  performance(message: string, data?: any, userId?: string, sessionId?: string) {
    this.info(message, 'PERFORMANCE', data, userId, sessionId)
  }
}

// Instância global do logger
export const logger = new Logger()

// Hook para usar o logger em componentes React
export function useLogger() {
  return logger
}

// Função utilitária para logar erros de forma consistente
export function logError(error: Error, context?: string, userId?: string, sessionId?: string) {
  logger.error(error.message, context, {
    stack: error.stack,
    name: error.name
  }, userId, sessionId)
}

// Função utilitária para logar tentativas de login
export function logLoginAttempt(email: string, success: boolean, context?: string, sessionId?: string) {
  const message = success ? 'Login successful' : 'Login failed'
  const level = success ? 'info' : 'warn'
  
  logger[level](message, context || 'AUTH', {
    email: email.substring(0, 3) + '***@***', // Mascarar email
    success
  }, undefined, sessionId)
}

// Função utilitária para logar operações sensíveis
export function logSensitiveOperation(operation: string, userId: string, context?: string, sessionId?: string) {
  logger.security(`Sensitive operation: ${operation}`, {
    operation,
    userId: userId.substring(0, 8) + '...'
  }, userId, sessionId)
}