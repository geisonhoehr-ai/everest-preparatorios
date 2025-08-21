"use client"

import { useState, useCallback, useEffect } from 'react'

// Sistema de cache específico para páginas
interface PageCacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  path: string
}

interface PageCacheStats {
  hits: number
  misses: number
  size: number
  lastCleanup: number
}

class PageCache {
  private cache = new Map<string, PageCacheEntry<any>>()
  private stats: PageCacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    lastCleanup: Date.now()
  }
  private readonly DEFAULT_TTL = 2 * 60 * 1000 // 2 minutos para páginas
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutos

  constructor() {
    // Limpeza automática do cache
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL)
  }

  // Obter dados do cache
  get<T>(key: string, path: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Verificar se é da mesma página
    if (entry.path !== path) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.data
  }

  // Salvar dados no cache
  set<T>(key: string, data: T, path: string, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
      path
    })
    this.stats.size = this.cache.size
  }

  // Invalidar cache por padrão
  invalidate(pattern: string): number {
    let deleted = 0
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        deleted++
      }
    }
    this.stats.size = this.cache.size
    return deleted
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
    this.stats.hits = 0
    this.stats.misses = 0
  }

  // Limpeza automática
  private cleanup(): void {
    const now = Date.now()
    let deleted = 0

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        deleted++
      }
    }

    this.stats.size = this.cache.size
    this.stats.lastCleanup = now

    if (deleted > 0) {
      console.log(`🧹 [PAGE_CACHE] Limpeza automática: ${deleted} entradas removidas`)
    }
  }

  // Estatísticas
  getStats(): PageCacheStats {
    return { ...this.stats }
  }
}

// Instância global do cache
export const pageCache = new PageCache()

// Hook para usar o cache de páginas
export function usePageCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  path: string,
  ttl?: number
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar cache primeiro
      const cached = pageCache.get<T>(key, path)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      // Buscar dados
      const result = await fetcher()
      
      // Salvar no cache
      pageCache.set(key, result, path, ttl)
      
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, path, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Funções utilitárias
export function invalidatePageCache(pattern: string): number {
  return pageCache.invalidate(pattern)
}

export function clearPageCache(): void {
  pageCache.clear()
}

export function getPageCacheStats(): PageCacheStats {
  return pageCache.getStats()
}
