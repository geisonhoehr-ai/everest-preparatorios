'use client'


interface CDNConfig {
  enabled: boolean
  baseUrl: string
  fallbackUrl: string
  cacheTime: number // em milissegundos
  retryAttempts: number
  retryDelay: number
  timeout: number
}

interface CDNAsset {
  url: string
  type: 'image' | 'video' | 'audio' | 'document' | 'font' | 'script' | 'style'
  size?: number
  cached: boolean
  lastAccessed: number
}

class CDNService {
  private config: CDNConfig
  private cache = new Map<string, CDNAsset>()
  private loadingPromises = new Map<string, Promise<string>>()

  constructor(config: Partial<CDNConfig> = {}) {
    this.config = {
      enabled: true,
      baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.everest.com',
      fallbackUrl: process.env.NEXT_PUBLIC_FALLBACK_URL || '',
      cacheTime: 24 * 60 * 60 * 1000, // 24 horas
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 10000,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Limpar cache expirado periodicamente
    setInterval(() => {
      this.cleanupCache()
    }, 60 * 60 * 1000) // A cada hora
  }

  // Obter URL do CDN
  getCDNUrl(path: string): string {
    if (!this.config.enabled) {
      return path.startsWith('http') ? path : `${this.config.fallbackUrl}${path}`
    }

    // Se já é uma URL completa, retornar como está
    if (path.startsWith('http')) {
      return path
    }

    // Remover barra inicial se existir
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    return `${this.config.baseUrl}/${cleanPath}`
  }

  // Carregar asset do CDN
  async loadAsset(path: string, type: CDNAsset['type'] = 'image'): Promise<string> {
    const cdnUrl = this.getCDNUrl(path)
    
    // Verificar cache primeiro
    const cached = this.cache.get(cdnUrl)
    if (cached && this.isCacheValid(cached)) {
      cached.lastAccessed = Date.now()
      return cdnUrl
    }

    // Verificar se já está carregando
    if (this.loadingPromises.has(cdnUrl)) {
      return this.loadingPromises.get(cdnUrl)!
    }

    // Carregar asset
    const loadPromise = this.performLoad(cdnUrl, type)
    this.loadingPromises.set(cdnUrl, loadPromise)

    try {
      const result = await loadPromise
      this.loadingPromises.delete(cdnUrl)
      return result
    } catch (error) {
      this.loadingPromises.delete(cdnUrl)
      throw error
    }
  }

  private async performLoad(url: string, type: CDNAsset['type']): Promise<string> {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, this.config.timeout)
        
        if (response.ok) {
          // Cache do asset
          this.cache.set(url, {
            url,
            type,
            size: response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!) : undefined,
            cached: true,
            lastAccessed: Date.now()
          })

          return url
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        console.warn(`CDN load attempt ${attempt} failed for ${url}:`, error)
        
        if (attempt === this.config.retryAttempts) {
          // Última tentativa falhou, usar fallback
          return this.getFallbackUrl(url)
        }

        // Aguardar antes da próxima tentativa
        await this.delay(this.config.retryDelay * attempt)
      }
    }

    return this.getFallbackUrl(url)
  }

  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'HEAD', // Apenas verificar se o asset existe
        cache: 'force-cache'
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private getFallbackUrl(originalUrl: string): string {
    if (this.config.fallbackUrl) {
      // Extrair path da URL original
      const url = new URL(originalUrl)
      const path = url.pathname
      return `${this.config.fallbackUrl}${path}`
    }
    
    return originalUrl
  }

  private isCacheValid(asset: CDNAsset): boolean {
    return Date.now() - asset.lastAccessed < this.config.cacheTime
  }

  private cleanupCache() {
    const now = Date.now()
    for (const [url, asset] of this.cache.entries()) {
      if (now - asset.lastAccessed > this.config.cacheTime) {
        this.cache.delete(url)
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Pré-carregar assets
  async preloadAssets(paths: string[], type: CDNAsset['type'] = 'image'): Promise<void> {
    const promises = paths.map(path => this.loadAsset(path, type))
    await Promise.allSettled(promises)
  }

  // Obter estatísticas do cache
  getCacheStats(): {
    size: number
    hitRate: number
    totalAssets: number
    cacheTime: number
  } {
    const totalAssets = this.cache.size
    const now = Date.now()
    let validAssets = 0

    for (const asset of this.cache.values()) {
      if (this.isCacheValid(asset)) {
        validAssets++
      }
    }

    return {
      size: this.cache.size,
      hitRate: totalAssets > 0 ? validAssets / totalAssets : 0,
      totalAssets,
      cacheTime: this.config.cacheTime
    }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear()
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<CDNConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): CDNConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  getBaseUrl(): string {
    return this.config.baseUrl
  }

  getFallbackUrlConfig(): string {
    return this.config.fallbackUrl
  }
}

// Instância global
export const cdnService = new CDNService()

// Hook para usar CDN
export function useCDN() {
  return {
    getCDNUrl: cdnService.getCDNUrl.bind(cdnService),
    loadAsset: cdnService.loadAsset.bind(cdnService),
    preloadAssets: cdnService.preloadAssets.bind(cdnService),
    getCacheStats: cdnService.getCacheStats.bind(cdnService),
    clearCache: cdnService.clearCache.bind(cdnService),
    isEnabled: cdnService.isEnabled.bind(cdnService),
    getBaseUrl: cdnService.getBaseUrl.bind(cdnService),
    getFallbackUrl: cdnService.getFallbackUrlConfig.bind(cdnService),
    updateConfig: cdnService.updateConfig.bind(cdnService),
    getConfig: cdnService.getConfig.bind(cdnService)
  }
}

// Componente movido para components/cdn-asset.tsx
