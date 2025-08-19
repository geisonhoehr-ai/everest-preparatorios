import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detecta se está em ambiente de desenvolvimento ou produção
 */
export function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    // Cliente-side: verificar hostname
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost')
  }
  
  // Server-side: verificar variável de ambiente
  return process.env.NODE_ENV === 'development'
}

/**
 * Retorna a URL base correta baseada no ambiente
 */
export function getBaseUrl(): string {
  if (isDevelopment()) {
    return 'http://localhost:3001'
  }
  
  return 'https://everestpreparatorios.com.br'
}

/**
 * Retorna a URL completa para uma rota específica
 */
export function getUrlForRoute(route: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${route}`
}
