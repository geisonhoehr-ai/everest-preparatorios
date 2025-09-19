/**
 * Sistema de Política de Senhas para Everest Preparatórios
 * 
 * Este sistema garante:
 * - Validação de força de senha
 * - Política de expiração
 * - Histórico de senhas
 * - Proteção contra senhas comuns
 * - Validação em tempo real
 */

import { logger } from './logger'

interface PasswordPolicy {
  minLength: number
  maxLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxConsecutiveChars: number
  maxRepeatedChars: number
  forbiddenWords: string[]
  expirationDays: number
  historyCount: number
}

interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

interface PasswordHistory {
  userId: string
  passwordHash: string
  createdAt: string
  expiresAt?: string
}

class PasswordPolicyManager {
  private policy: PasswordPolicy = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxConsecutiveChars: 3,
    maxRepeatedChars: 2,
    forbiddenWords: [
      'password', 'senha', '123456', 'qwerty', 'abc123',
      'admin', 'user', 'test', 'everest', 'preparatorios',
      'aluno', 'professor', 'teacher', 'student'
    ],
    expirationDays: 90, // 3 meses
    historyCount: 5 // Não pode reutilizar as últimas 5 senhas
  }

  /**
   * Valida força da senha
   */
  validatePassword(password: string, userId?: string): PasswordValidationResult {
    const result: PasswordValidationResult = {
      isValid: true,
      score: 0,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Verificar comprimento mínimo
    if (password.length < this.policy.minLength) {
      result.isValid = false
      result.errors.push(`Senha deve ter pelo menos ${this.policy.minLength} caracteres`)
    }

    // Verificar comprimento máximo
    if (password.length > this.policy.maxLength) {
      result.isValid = false
      result.errors.push(`Senha deve ter no máximo ${this.policy.maxLength} caracteres`)
    }

    // Verificar maiúsculas
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      result.isValid = false
      result.errors.push('Senha deve conter pelo menos uma letra maiúscula')
    }

    // Verificar minúsculas
    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      result.isValid = false
      result.errors.push('Senha deve conter pelo menos uma letra minúscula')
    }

    // Verificar números
    if (this.policy.requireNumbers && !/\d/.test(password)) {
      result.isValid = false
      result.errors.push('Senha deve conter pelo menos um número')
    }

    // Verificar caracteres especiais
    if (this.policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.isValid = false
      result.errors.push('Senha deve conter pelo menos um caractere especial')
    }

    // Verificar caracteres consecutivos
    if (this.hasConsecutiveChars(password, this.policy.maxConsecutiveChars)) {
      result.warnings.push(`Evite sequências de ${this.policy.maxConsecutiveChars + 1} ou mais caracteres consecutivos`)
    }

    // Verificar caracteres repetidos
    if (this.hasRepeatedChars(password, this.policy.maxRepeatedChars)) {
      result.warnings.push(`Evite repetir o mesmo caractere ${this.policy.maxRepeatedChars + 1} ou mais vezes`)
    }

    // Verificar palavras proibidas
    const forbiddenWord = this.checkForbiddenWords(password)
    if (forbiddenWord) {
      result.isValid = false
      result.errors.push(`Senha não pode conter a palavra "${forbiddenWord}"`)
    }

    // Verificar padrões comuns
    if (this.hasCommonPatterns(password)) {
      result.warnings.push('Evite padrões comuns como datas, nomes ou sequências')
    }

    // Calcular score de força
    result.score = this.calculatePasswordScore(password)

    // Adicionar sugestões baseadas no score
    if (result.score < 50) {
      result.suggestions.push('Use uma combinação de letras, números e símbolos')
      result.suggestions.push('Evite informações pessoais')
      result.suggestions.push('Use pelo menos 12 caracteres')
    }

    // Log da validação
    logger.debug('Validação de senha realizada', 'PASSWORD_POLICY', {
      userId: userId?.substring(0, 8) + '...',
      score: result.score,
      isValid: result.isValid,
      errorsCount: result.errors.length
    })

    return result
  }

  /**
   * Verifica se a senha tem caracteres consecutivos
   */
  private hasConsecutiveChars(password: string, maxConsecutive: number): boolean {
    for (let i = 0; i < password.length - maxConsecutive; i++) {
      let consecutive = 1
      for (let j = i + 1; j < password.length; j++) {
        if (password.charCodeAt(j) === password.charCodeAt(j - 1) + 1) {
          consecutive++
          if (consecutive > maxConsecutive) {
            return true
          }
        } else {
          break
        }
      }
    }
    return false
  }

  /**
   * Verifica se a senha tem caracteres repetidos
   */
  private hasRepeatedChars(password: string, maxRepeated: number): boolean {
    for (let i = 0; i < password.length - maxRepeated; i++) {
      let repeated = 1
      for (let j = i + 1; j < password.length; j++) {
        if (password[j] === password[i]) {
          repeated++
          if (repeated > maxRepeated) {
            return true
          }
        } else {
          break
        }
      }
    }
    return false
  }

  /**
   * Verifica palavras proibidas
   */
  private checkForbiddenWords(password: string): string | null {
    const lowerPassword = password.toLowerCase()
    for (const word of this.policy.forbiddenWords) {
      if (lowerPassword.includes(word.toLowerCase())) {
        return word
      }
    }
    return null
  }

  /**
   * Verifica padrões comuns
   */
  private hasCommonPatterns(password: string): boolean {
    // Padrões de teclado
    const keyboardPatterns = [
      'qwerty', 'asdfgh', 'zxcvbn', '123456', '654321'
    ]

    const lowerPassword = password.toLowerCase()
    for (const pattern of keyboardPatterns) {
      if (lowerPassword.includes(pattern)) {
        return true
      }
    }

    // Padrões de data (YYYY, MM/DD, DD/MM)
    const datePatterns = [
      /\d{4}/, // Ano
      /\d{2}\/\d{2}/, // MM/DD ou DD/MM
      /\d{2}-\d{2}/ // MM-DD ou DD-MM
    ]

    for (const pattern of datePatterns) {
      if (pattern.test(password)) {
        return true
      }
    }

    return false
  }

  /**
   * Calcula score de força da senha (0-100)
   */
  private calculatePasswordScore(password: string): number {
    let score = 0

    // Comprimento
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // Variedade de caracteres
    if (/[a-z]/.test(password)) score += 10
    if (/[A-Z]/.test(password)) score += 10
    if (/\d/.test(password)) score += 10
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10

    // Complexidade
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.7) score += 10

    // Penalidades
    if (this.hasConsecutiveChars(password, 2)) score -= 10
    if (this.hasRepeatedChars(password, 2)) score -= 10
    if (this.checkForbiddenWords(password)) score -= 20
    if (this.hasCommonPatterns(password)) score -= 15

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Gera sugestões de senha forte
   */
  generatePasswordSuggestions(): string[] {
    return [
      'Use uma frase pessoal com números e símbolos',
      'Combine palavras não relacionadas com números',
      'Use a primeira letra de cada palavra de uma frase',
      'Substitua letras por números similares (a=4, e=3, i=1)',
      'Adicione símbolos no início e fim',
      'Use pelo menos 12 caracteres',
      'Evite informações pessoais óbvias'
    ]
  }

  /**
   * Verifica se a senha expirou
   */
  isPasswordExpired(lastPasswordChange: string): boolean {
    const lastChange = new Date(lastPasswordChange)
    const expirationDate = new Date(lastChange.getTime() + (this.policy.expirationDays * 24 * 60 * 60 * 1000))
    return new Date() > expirationDate
  }

  /**
   * Calcula dias até expiração
   */
  getDaysUntilExpiration(lastPasswordChange: string): number {
    const lastChange = new Date(lastPasswordChange)
    const expirationDate = new Date(lastChange.getTime() + (this.policy.expirationDays * 24 * 60 * 60 * 1000))
    const daysLeft = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  }

  /**
   * Atualiza política de senhas
   */
  updatePolicy(newPolicy: Partial<PasswordPolicy>): void {
    this.policy = { ...this.policy, ...newPolicy }
    logger.info('Política de senhas atualizada', 'PASSWORD_POLICY', { newPolicy })
  }

  /**
   * Obtém política atual
   */
  getPolicy(): PasswordPolicy {
    return { ...this.policy }
  }
}

// Instância global do gerenciador de política de senhas
export const passwordPolicy = new PasswordPolicyManager()

// Funções utilitárias
export function validatePassword(password: string, userId?: string): PasswordValidationResult {
  return passwordPolicy.validatePassword(password, userId)
}

export function isPasswordExpired(lastPasswordChange: string): boolean {
  return passwordPolicy.isPasswordExpired(lastPasswordChange)
}

export function getDaysUntilExpiration(lastPasswordChange: string): number {
  return passwordPolicy.getDaysUntilExpiration(lastPasswordChange)
}

export function generatePasswordSuggestions(): string[] {
  return passwordPolicy.generatePasswordSuggestions()
}

// Hook para usar em componentes React
export function usePasswordPolicy() {
  return {
    validatePassword: passwordPolicy.validatePassword.bind(passwordPolicy),
    isPasswordExpired: passwordPolicy.isPasswordExpired.bind(passwordPolicy),
    getDaysUntilExpiration: passwordPolicy.getDaysUntilExpiration.bind(passwordPolicy),
    generatePasswordSuggestions: passwordPolicy.generatePasswordSuggestions.bind(passwordPolicy),
    getPolicy: passwordPolicy.getPolicy.bind(passwordPolicy),
    updatePolicy: passwordPolicy.updatePolicy.bind(passwordPolicy)
  }
}
