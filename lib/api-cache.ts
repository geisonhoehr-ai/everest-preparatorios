'use client'

interface APICacheConfig {
  enabled: boolean
  defaultTTL: number // em milissegundos
  maxSize: number // número máximo de entradas
  strategy: 'LRU' | 'FIFO' | 'TTL'
  compression: boolean
  encryption: boolean
}

interface APICacheEntry {
  data: any
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  compressed: boolean
  encrypted: boolean
}

interface APICacheStats {
  size: number
  hitRate: number
  missRate: number
  totalRequests: number
  totalHits: number
  totalMisses: number
  averageResponseTime: number
  memoryUsage: number
}

class APICacheService {
  private config: APICacheConfig
  private cache = new Map<string, APICacheEntry>()
  private stats = {
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    totalResponseTime: 0
  }

  constructor(config: Partial<APICacheConfig> = {}) {
    this.config = {
      enabled: true,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxSize: 1000,
      strategy: 'LRU',
      compression: true,
      encryption: false,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Limpar cache expirado periodicamente
    setInterval(() => {
      this.cleanupExpired()
    }, 60 * 1000) // A cada minuto

    // Limpar cache se exceder o tamanho máximo
    setInterval(() => {
      this.enforceMaxSize()
    }, 30 * 1000) // A cada 30 segundos
  }

  // Obter dados do cache
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) return null

    const startTime = Date.now()
    this.stats.totalRequests++

    const entry = this.cache.get(key)
    if (!entry) {
      this.stats.totalMisses++
      return null
    }

    // Verificar se expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.totalMisses++
      return null
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.totalHits++
    this.stats.totalResponseTime += Date.now() - startTime

    // Descomprimir se necessário
    let data = entry.data
    if (entry.compressed) {
      data = await this.decompress(data)
    }

    // Descriptografar se necessário
    if (entry.encrypted) {
      data = await this.decrypt(data)
    }

    return data
  }

  // Armazenar dados no cache
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) return

    const now = Date.now()
    let processedData = data

    // Comprimir se habilitado
    if (this.config.compression) {
      processedData = await this.compress(processedData)
    }

    // Criptografar se habilitado
    if (this.config.encryption) {
      processedData = await this.encrypt(processedData)
    }

    const entry: APICacheEntry = {
      data: processedData,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: now,
      compressed: this.config.compression,
      encrypted: this.config.encryption
    }

    this.cache.set(key, entry)
  }

  // Remover entrada do cache
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Limpar cache
  clear(): void {
    this.cache.clear()
    this.resetStats()
  }

  // Verificar se chave existe
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  // Obter múltiplas chaves
  async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {}
    
    for (const key of keys) {
      results[key] = await this.get<T>(key)
    }
    
    return results
  }

  // Armazenar múltiplas chaves
  async setMany<T>(entries: Record<string, T>, ttl?: number): Promise<void> {
    const promises = Object.entries(entries).map(([key, data]) => 
      this.set(key, data, ttl)
    )
    
    await Promise.all(promises)
  }

  // Invalidar cache por padrão
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let invalidated = 0
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        invalidated++
      }
    }
    
    return invalidated
  }

  // Pré-carregar dados
  async preload<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached) return cached

    const data = await fetcher()
    await this.set(key, data, ttl)
    return data
  }

  // Obter estatísticas
  getStats(): APICacheStats {
    const hitRate = this.stats.totalRequests > 0 
      ? this.stats.totalHits / this.stats.totalRequests 
      : 0
    
    const missRate = this.stats.totalRequests > 0 
      ? this.stats.totalMisses / this.stats.totalRequests 
      : 0

    const averageResponseTime = this.stats.totalHits > 0 
      ? this.stats.totalResponseTime / this.stats.totalHits 
      : 0

    return {
      size: this.cache.size,
      hitRate,
      missRate,
      totalRequests: this.stats.totalRequests,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      averageResponseTime,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // Métodos privados
  private isExpired(entry: APICacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private enforceMaxSize(): void {
    if (this.cache.size <= this.config.maxSize) return

    const entriesToRemove = this.cache.size - this.config.maxSize
    
    switch (this.config.strategy) {
      case 'LRU':
        this.removeLRU(entriesToRemove)
        break
      case 'FIFO':
        this.removeFIFO(entriesToRemove)
        break
      case 'TTL':
        this.removeOldest(entriesToRemove)
        break
    }
  }

  private removeLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
    
    for (let i = 0; i < count && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private removeFIFO(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    for (let i = 0; i < count && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private removeOldest(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    for (let i = 0; i < count && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private async compress(data: any): Promise<any> {
    // Implementar compressão se necessário
    return data
  }

  private async decompress(data: any): Promise<any> {
    // Implementar descompressão se necessário
    return data
  }

  private async encrypt(data: any): Promise<any> {
    // Implementar criptografia se necessário
    return data
  }

  private async decrypt(data: any): Promise<any> {
    // Implementar descriptografia se necessário
    return data
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2 // UTF-16
      totalSize += JSON.stringify(entry).length * 2
    }
    
    return totalSize
  }

  private resetStats(): void {
    this.stats = {
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      totalResponseTime: 0
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<APICacheConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): APICacheConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  getSize(): number {
    return this.cache.size
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Instância global
export const apiCache = new APICacheService()

// Hook para usar cache de API
export function useAPICache() {
  return {
    get: apiCache.get.bind(apiCache),
    set: apiCache.set.bind(apiCache),
    delete: apiCache.delete.bind(apiCache),
    clear: apiCache.clear.bind(apiCache),
    has: apiCache.has.bind(apiCache),
    getMany: apiCache.getMany.bind(apiCache),
    setMany: apiCache.setMany.bind(apiCache),
    invalidatePattern: apiCache.invalidatePattern.bind(apiCache),
    preload: apiCache.preload.bind(apiCache),
    getStats: apiCache.getStats.bind(apiCache),
    isEnabled: apiCache.isEnabled.bind(apiCache),
    getSize: apiCache.getSize.bind(apiCache),
    getKeys: apiCache.getKeys.bind(apiCache),
    updateConfig: apiCache.updateConfig.bind(apiCache),
    getConfig: apiCache.getConfig.bind(apiCache)
  }
}