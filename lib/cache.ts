// Sistema de cache simples para o servidor
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()

// Obter dados do cache
export async function getCache(key: string): Promise<any | null> {
  const entry = cache.get(key)
  
  if (!entry) {
    return null
  }

  // Verificar se expirou
  if (Date.now() - entry.timestamp > entry.ttl * 1000) {
    cache.delete(key)
    return null
  }

  return entry.data
}

// Salvar dados no cache
export async function setCache(key: string, data: any, ttlSeconds: number): Promise<void> {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000
  })
}

// Invalidar cache
export async function invalidateCache(key: string): Promise<boolean> {
  return cache.delete(key)
}

// Limpar todo o cache
export async function clearCache(): Promise<void> {
  cache.clear()
}

// Obter estatísticas do cache
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}
