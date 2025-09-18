'use client'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  date?: boolean
  number?: boolean
  integer?: boolean
  positive?: boolean
  negative?: boolean
  custom?: (value: any) => boolean | string
  message?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface ValidationSchema {
  [key: string]: ValidationRule | ValidationRule[]
}

class ValidationService {
  private schemas = new Map<string, ValidationSchema>()

  // Registrar schema de validação
  registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema)
  }

  // Validar dados contra schema
  validate(data: any, schemaName: string): ValidationResult {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      return {
        isValid: false,
        errors: [`Schema '${schemaName}' not found`],
        warnings: []
      }
    }

    return this.validateData(data, schema)
  }

  // Validar dados contra schema inline
  validateInline(data: any, schema: ValidationSchema): ValidationResult {
    return this.validateData(data, schema)
  }

  private validateData(data: any, schema: ValidationSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }

    for (const [field, rules] of Object.entries(schema)) {
      const fieldRules = Array.isArray(rules) ? rules : [rules]
      const value = data[field]

      for (const rule of fieldRules) {
        const fieldResult = this.validateField(value, rule, field)
        
        if (!fieldResult.isValid) {
          result.isValid = false
          result.errors.push(...fieldResult.errors)
        }
        
        if (fieldResult.warnings.length > 0) {
          result.warnings.push(...fieldResult.warnings)
        }
      }
    }

    return result
  }

  private validateField(value: any, rule: ValidationRule, fieldName: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }

    // Required
    if (rule.required && (value === undefined || value === null || value === '')) {
      result.isValid = false
      result.errors.push(rule.message || `${fieldName} is required`)
      return result
    }

    // Se não é obrigatório e está vazio, pular outras validações
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return result
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be at least ${rule.minLength} characters`)
      }

      // Max length
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be at most ${rule.maxLength} characters`)
      }

      // Pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} format is invalid`)
      }

      // Email
      if (rule.email && !this.isValidEmail(value)) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be a valid email`)
      }

      // URL
      if (rule.url && !this.isValidUrl(value)) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be a valid URL`)
      }

      // Date
      if (rule.date && !this.isValidDate(value)) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be a valid date`)
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value)

      // Number type
      if (rule.number && isNaN(numValue)) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be a number`)
      }

      // Integer
      if (rule.integer && !Number.isInteger(numValue)) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be an integer`)
      }

      // Min
      if (rule.min !== undefined && numValue < rule.min) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be at least ${rule.min}`)
      }

      // Max
      if (rule.max !== undefined && numValue > rule.max) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be at most ${rule.max}`)
      }

      // Positive
      if (rule.positive && numValue <= 0) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be positive`)
      }

      // Negative
      if (rule.negative && numValue >= 0) {
        result.isValid = false
        result.errors.push(rule.message || `${fieldName} must be negative`)
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value)
      if (customResult !== true) {
        result.isValid = false
        result.errors.push(typeof customResult === 'string' ? customResult : `${fieldName} is invalid`)
      }
    }

    return result
  }

  // Métodos de utilidade
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidDate(date: string): boolean {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }

  // Schemas pré-definidos
  getPredefinedSchemas(): Record<string, ValidationSchema> {
    return {
      user: {
        name: {
          required: true,
          minLength: 2,
          maxLength: 50,
          message: 'Name must be between 2 and 50 characters'
        },
        email: {
          required: true,
          email: true,
          message: 'Email must be valid'
        },
        age: {
          required: true,
          integer: true,
          min: 0,
          max: 150,
          message: 'Age must be between 0 and 150'
        }
      },
      flashcard: {
        question: {
          required: true,
          minLength: 10,
          maxLength: 500,
          message: 'Question must be between 10 and 500 characters'
        },
        answer: {
          required: true,
          minLength: 10,
          maxLength: 1000,
          message: 'Answer must be between 10 and 1000 characters'
        },
        topic_id: {
          required: true,
          message: 'Topic ID is required'
        }
      },
      quiz: {
        title: {
          required: true,
          minLength: 5,
          maxLength: 100,
          message: 'Title must be between 5 and 100 characters'
        },
        description: {
          maxLength: 500,
          message: 'Description must be at most 500 characters'
        },
        time_limit: {
          integer: true,
          min: 0,
          message: 'Time limit must be a positive integer'
        }
      }
    }
  }

  // Registrar schemas pré-definidos
  registerPredefinedSchemas(): void {
    const schemas = this.getPredefinedSchemas()
    for (const [name, schema] of Object.entries(schemas)) {
      this.registerSchema(name, schema)
    }
  }

  // Obter schema
  getSchema(name: string): ValidationSchema | undefined {
    return this.schemas.get(name)
  }

  // Listar schemas
  listSchemas(): string[] {
    return Array.from(this.schemas.keys())
  }

  // Remover schema
  removeSchema(name: string): boolean {
    return this.schemas.delete(name)
  }

  // Limpar todos os schemas
  clearSchemas(): void {
    this.schemas.clear()
  }
}

// Instância global
export const validationService = new ValidationService()

// Registrar schemas pré-definidos
validationService.registerPredefinedSchemas()

// Hook para usar validação
export function useValidation() {
  return {
    validate: validationService.validate.bind(validationService),
    validateInline: validationService.validateInline.bind(validationService),
    registerSchema: validationService.registerSchema.bind(validationService),
    getSchema: validationService.getSchema.bind(validationService),
    listSchemas: validationService.listSchemas.bind(validationService),
    removeSchema: validationService.removeSchema.bind(validationService),
    clearSchemas: validationService.clearSchemas.bind(validationService)
  }
}
