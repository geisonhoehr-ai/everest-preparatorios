import { logger } from './logger'

/**
 * Lista de tags HTML permitidas para sanitização
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div', 'a', 'img'
]

/**
 * Lista de atributos permitidos
 */
const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'span': ['class'],
  'div': ['class'],
  'p': ['class'],
  'h1': ['class'],
  'h2': ['class'],
  'h3': ['class'],
  'h4': ['class'],
  'h5': ['class'],
  'h6': ['class']
}

/**
 * Lista de protocolos permitidos para URLs
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:']

class HTMLSanitizer {
  /**
   * Sanitiza HTML removendo tags e atributos perigosos
   */
  sanitize(html: string): string {
    if (!html || typeof html !== 'string') {
      return ''
    }

    try {
      // Remover scripts e eventos perigosos
      let sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
        .replace(/<input\b[^<]*>/gi, '')
        .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
        .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
        .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
        .replace(/<link\b[^<]*>/gi, '')
        .replace(/<meta\b[^<]*>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')

      // Remover atributos perigosos
      sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
      sanitized = sanitized.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '')

      // Validar URLs em links e imagens
      sanitized = this.sanitizeUrls(sanitized)

      logger.debug('HTML sanitizado com sucesso', 'SECURITY', { 
        originalLength: html.length, 
        sanitizedLength: sanitized.length 
      })

      return sanitized
    } catch (error) {
      logger.error('Erro ao sanitizar HTML', 'SECURITY', { error: (error as Error).message })
      return '' // Retornar string vazia em caso de erro
    }
  }

  /**
   * Sanitiza URLs em atributos href e src
   */
  private sanitizeUrls(html: string): string {
    // Sanitizar links
    html = html.replace(/<a\s+([^>]*?)href\s*=\s*["']([^"']*)["']([^>]*?)>/gi, (match, before, url, after) => {
      if (this.isValidUrl(url)) {
        return `<a ${before}href="${url}"${after}>`
      } else {
        return `<a ${before}${after}>`
      }
    })

    // Sanitizar imagens
    html = html.replace(/<img\s+([^>]*?)src\s*=\s*["']([^"']*)["']([^>]*?)>/gi, (match, before, url, after) => {
      if (this.isValidUrl(url)) {
        return `<img ${before}src="${url}"${after}>`
      } else {
        return ''
      }
    })

    return html
  }

  /**
   * Valida se uma URL é segura
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ALLOWED_PROTOCOLS.includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  /**
   * Sanitiza texto simples removendo HTML
   */
  sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text
      .replace(/<[^>]*>/g, '') // Remover todas as tags HTML
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .trim()
  }

  /**
   * Verifica se o HTML contém conteúdo perigoso
   */
  isDangerous(html: string): boolean {
    if (!html || typeof html !== 'string') {
      return false
    }

    const dangerousPatterns = [
      /<script\b/i,
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i,
      /<form\b/i,
      /<input\b/i,
      /<textarea\b/i,
      /<select\b/i,
      /<button\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i
    ]

    return dangerousPatterns.some(pattern => pattern.test(html))
  }
}

export const htmlSanitizer = new HTMLSanitizer()
