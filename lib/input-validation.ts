import { logger } from './logger'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'email' | 'boolean' | 'array'
  custom?: (value: any) => string | null
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: { [key: string]: string }
  sanitizedData: any
}

class InputValidationService {
  /**
   * Valida dados de entrada baseado em um schema
   */
  validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [key: string]: string } = {}
    const sanitizedData: any = {}

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const error = this.validateField(field, value, rules)
      
      if (error) {
        errors[field] = error
      } else {
        // Sanitizar dados válidos
        sanitizedData[field] = this.sanitizeValue(value, rules.type)
      }
    }

    // Verificar se há campos obrigatórios ausentes
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !(field in data)) {
        errors[field] = `${field} é obrigatório`
      }
    }

    const isValid = Object.keys(errors).length === 0

    if (!isValid) {
      logger.warn('Validação de entrada falhou', 'SECURITY', { 
        errors, 
        fields: Object.keys(data) 
      })
    }

    return {
      isValid,
      errors,
      sanitizedData
    }
  }

  private validateField(field: string, value: any, rules: ValidationRule): string | null {
    // Verificar se é obrigatório
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${field} é obrigatório`
    }

    // Se não é obrigatório e está vazio, pular validação
    if (!rules.required && (value === undefined || value === null || value === '')) {
      return null
    }

    // Verificar tipo
    if (rules.type && !this.validateType(value, rules.type)) {
      return `${field} deve ser do tipo ${rules.type}`
    }

    // Verificar comprimento para strings
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${field} deve ter pelo menos ${rules.minLength} caracteres`
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field} deve ter no máximo ${rules.maxLength} caracteres`
      }
    }

    // Verificar padrão regex
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${field} tem formato inválido`
    }

    // Validação customizada
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        return customError
      }
    }

    return null
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case 'array':
        return Array.isArray(value)
      default:
        return true
    }
  }

  private sanitizeValue(value: any, type?: string): any {
    if (typeof value === 'string') {
      // Remover caracteres perigosos para XSS
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
    }
    
    if (type === 'number' && typeof value === 'string') {
      const num = parseFloat(value)
      return isNaN(num) ? 0 : num
    }

    if (type === 'boolean' && typeof value === 'string') {
      return value.toLowerCase() === 'true'
    }

    return value
  }

  /**
   * Schemas de validação pré-definidos
   */
  getSchemas() {
    return {
      // Validação para posts da comunidade
      communityPost: {
        title: {
          required: true,
          type: 'string' as const,
          minLength: 3,
          maxLength: 200,
          pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/
        },
        content: {
          required: true,
          type: 'string' as const,
          minLength: 10,
          maxLength: 5000
        },
        tags: {
          required: false,
          type: 'string' as const,
          maxLength: 500
        }
      },

      // Validação para comentários
      communityComment: {
        content: {
          required: true,
          type: 'string' as const,
          minLength: 1,
          maxLength: 1000
        },
        post_id: {
          required: true,
          type: 'string' as const,
          pattern: /^[a-f0-9\-]{36}$/ // UUID format
        }
      },

      // Validação para membros
      member: {
        full_name: {
          required: true,
          type: 'string' as const,
          minLength: 2,
          maxLength: 100,
          pattern: /^[a-zA-ZÀ-ÿ\s]+$/
        },
        email: {
          required: true,
          type: 'email' as const,
          maxLength: 255
        },
        cpf_cnpj: {
          required: false,
          type: 'string' as const,
          pattern: /^[\d.\-/]+$/,
          custom: (value: string) => {
            if (!value) return null
            const clean = value.replace(/[^\d]/g, '')
            if (clean.length !== 11 && clean.length !== 14) {
              return 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'
            }
            return null
          }
        },
        phone: {
          required: false,
          type: 'string' as const,
          pattern: /^[\d\s\-\(\)\+]+$/
        }
      },

      // Validação para avaliações de redação
      redacaoAvaliacao: {
        redacao_id: {
          required: true,
          type: 'number' as const,
          custom: (value: number) => {
            if (!Number.isInteger(value) || value <= 0) {
              return 'ID da redação deve ser um número inteiro positivo'
            }
            return null
          }
        },
        feedback_geral: {
          required: false,
          type: 'string' as const,
          maxLength: 2000
        },
        sugestoes_melhoria: {
          required: false,
          type: 'string' as const,
          maxLength: 2000
        }
      }
    }
  }
}

export const inputValidator = new InputValidationService()
