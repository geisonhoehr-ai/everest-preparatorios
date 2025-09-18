'use client'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  strategy?: 'lru' | 'fifo' | 'ttl' // Cache eviction strategy
}

class SmartCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private accessOrder: string[] = []
  private readonly options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      strategy: options.strategy || 'lru'
    }
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    }

    // Remove existing item if it exists
    if (this.cache.has(key)) {
      this.remove(key)
    }

    // Check if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evict()
    }

    this.cache.set(key, item)
    this.updateAccessOrder(key)
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.remove(key)
      return null
    }

    this.updateAccessOrder(key)
    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (this.isExpired(item)) {
      this.remove(key)
      return false
    }
    
    return true
  }

  remove(key: string): boolean {
    const removed = this.cache.delete(key)
    if (removed) {
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
    }
    return removed
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }

  private evict(): void {
    switch (this.options.strategy) {
      case 'lru':
        this.evictLRU()
        break
      case 'fifo':
        this.evictFIFO()
        break
      case 'ttl':
        this.evictTTL()
        break
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder[0]
      this.remove(oldestKey)
    }
  }

  private evictFIFO(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder[0]
      this.remove(oldestKey)
    }
  }

  private evictTTL(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.remove(oldestKey)
    }
  }

  // Cleanup expired items
  cleanup(): number {
    let cleaned = 0
    const now = Date.now()

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.remove(key)
        cleaned++
      }
    }

    return cleaned
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expired = 0
    let totalAge = 0

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expired++
      }
      totalAge += now - item.timestamp
    }

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      expired,
      hitRate: this.calculateHitRate(),
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
      strategy: this.options.strategy
    }
  }

  private hitCount = 0
  private missCount = 0

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount
    return total > 0 ? this.hitCount / total : 0
  }
}

// Global cache instances
export const flashcardCache = new SmartCache({ ttl: 10 * 60 * 1000, maxSize: 50 })
export const userCache = new SmartCache({ ttl: 5 * 60 * 1000, maxSize: 20 })
export const apiCache = new SmartCache({ ttl: 2 * 60 * 1000, maxSize: 100 })

// Cache utilities
export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`
}

export function invalidateCachePattern(cache: SmartCache<any>, pattern: string): number {
  let invalidated = 0
  const regex = new RegExp(pattern)
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.remove(key)
      invalidated++
    }
  }
  
  return invalidated
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    flashcardCache.cleanup()
    userCache.cleanup()
    apiCache.cleanup()
  }, 5 * 60 * 1000)
}