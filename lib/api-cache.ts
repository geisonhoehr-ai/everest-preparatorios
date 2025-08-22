// Sistema de cache inteligente para APIs
import { useState, useCallback, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  lastCleanup: number
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now()
  }
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000 // 10 minutos

  constructor() {
    // Limpeza automática do cache
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
  }

  // Obter dados do cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      return null
    }

    this.stats.hits++
    return entry.data
  }

  // Salvar dados no cache
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    this.stats.size = this.cache.size
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      return false
    }
    
    return true
  }

  // Invalidar cache específico
  invalidate(key: string): boolean {
    return this.cache.delete(key)
  }

  // Invalidar cache por padrão
  invalidatePattern(pattern: string): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        count++
      }
    }
    this.stats.size = this.cache.size
    return count
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  // Limpeza automática de entradas expiradas
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    this.stats.size = this.cache.size
    this.stats.lastCleanup = now
    
    if (cleaned > 0) {
      console.log(`🧹 [API_CACHE] Limpeza automática: ${cleaned} entradas removidas`)
    }
  }

  // Obter estatísticas do cache
  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Obter tamanho do cache
  getSize(): number {
    return this.cache.size
  }
}

// Instância global do cache
export const apiCache = new APICache()

// Funções utilitárias para cache
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')
  
  return `${prefix}:${sortedParams}`
}

// Hook para usar cache em componentes React
export function useAPICache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    // Verificar cache primeiro
    const cached = apiCache.get<T>(key)
    if (cached) {
      setData(cached)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      apiCache.set(key, result, ttl)
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Função para pré-carregar dados
export async function preloadData<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<void> {
  if (!apiCache.has(key)) {
    try {
      const data = await fetcher()
      apiCache.set(key, data, ttl)
    } catch (error) {
      console.warn(`⚠️ [API_CACHE] Erro ao pré-carregar ${key}:`, error)
    }
  }
}

// Função para invalidar cache relacionado
export function invalidateRelatedCache(pattern: string): number {
  return apiCache.invalidatePattern(pattern)
}

export default APICache
