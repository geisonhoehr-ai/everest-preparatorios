import { SmartCache, createCacheKey, invalidateCachePattern } from '@/lib/cache'

describe('SmartCache', () => {
  let cache: SmartCache<string>

  beforeEach(() => {
    cache = new SmartCache<string>({
      ttl: 1000, // 1 segundo para testes
      maxSize: 3,
      strategy: 'lru'
    })
  })

  afterEach(() => {
    cache.clear()
  })

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull()
    })

    it('should check if key exists', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('non-existent')).toBe(false)
    })

    it('should remove keys', () => {
      cache.set('key1', 'value1')
      expect(cache.remove('key1')).toBe(true)
      expect(cache.get('key1')).toBeNull()
      expect(cache.remove('non-existent')).toBe(false)
    })

    it('should clear all keys', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.size()).toBe(0)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should expire values after TTL', async () => {
      cache.set('key1', 'value1', 100) // 100ms TTL
      expect(cache.get('key1')).toBe('value1')

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(cache.get('key1')).toBeNull()
    })

    it('should not expire values before TTL', async () => {
      cache.set('key1', 'value1', 1000) // 1s TTL
      expect(cache.get('key1')).toBe('value1')

      // Aguardar menos que TTL
      await new Promise(resolve => setTimeout(resolve, 500))
      expect(cache.get('key1')).toBe('value1')
    })

    it('should use default TTL when not specified', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('LRU Eviction', () => {
    it('should evict least recently used item when max size reached', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      
      // Acessar key1 para torná-lo mais recente
      cache.get('key1')
      
      // Adicionar key4 deve remover key2 (menos recente)
      cache.set('key4', 'value4')
      
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeNull()
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })

    it('should update access order on get', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      
      // Acessar key1
      cache.get('key1')
      
      // Adicionar key4 deve remover key2
      cache.set('key4', 'value4')
      
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('FIFO Eviction', () => {
    it('should evict first in first out when strategy is FIFO', () => {
      const fifoCache = new SmartCache<string>({
        ttl: 1000,
        maxSize: 3,
        strategy: 'fifo'
      })

      fifoCache.set('key1', 'value1')
      fifoCache.set('key2', 'value2')
      fifoCache.set('key3', 'value3')
      
      // Adicionar key4 deve remover key1 (primeiro)
      fifoCache.set('key4', 'value4')
      
      expect(fifoCache.get('key1')).toBeNull()
      expect(fifoCache.get('key2')).toBe('value2')
      expect(fifoCache.get('key3')).toBe('value3')
      expect(fifoCache.get('key4')).toBe('value4')
    })
  })

  describe('TTL Eviction', () => {
    it('should evict oldest item when strategy is TTL', () => {
      const ttlCache = new SmartCache<string>({
        ttl: 1000,
        maxSize: 3,
        strategy: 'ttl'
      })

      ttlCache.set('key1', 'value1')
      // Aguardar um pouco para key1 ser mais antigo
      setTimeout(() => {
        ttlCache.set('key2', 'value2')
        ttlCache.set('key3', 'value3')
        
        // Adicionar key4 deve remover key1 (mais antigo)
        ttlCache.set('key4', 'value4')
        
        expect(ttlCache.get('key1')).toBeNull()
        expect(ttlCache.get('key2')).toBe('value2')
        expect(ttlCache.get('key3')).toBe('value3')
        expect(ttlCache.get('key4')).toBe('value4')
      }, 10)
    })
  })

  describe('Cleanup', () => {
    it('should clean up expired items', async () => {
      cache.set('key1', 'value1', 100)
      cache.set('key2', 'value2', 1000)
      
      // Aguardar expiração de key1
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const cleaned = cache.cleanup()
      expect(cleaned).toBe(1)
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
    })
  })

  describe('Statistics', () => {
    it('should provide correct statistics', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(3)
      expect(stats.expired).toBe(0)
      expect(stats.strategy).toBe('lru')
    })
  })

  describe('Keys', () => {
    it('should return all keys', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const keys = cache.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toHaveLength(2)
    })
  })
})

describe('Cache Utilities', () => {
  describe('createCacheKey', () => {
    it('should create cache key from prefix and parts', () => {
      expect(createCacheKey('prefix', 'part1', 'part2')).toBe('prefix:part1:part2')
      expect(createCacheKey('users', '123', 'profile')).toBe('users:123:profile')
    })
  })

  describe('invalidateCachePattern', () => {
    it('should invalidate keys matching pattern', () => {
      const cache = new SmartCache<string>()
      cache.set('users:123:profile', 'value1')
      cache.set('users:456:profile', 'value2')
      cache.set('posts:789:content', 'value3')
      
      const invalidated = invalidateCachePattern(cache, 'users:.*:profile')
      expect(invalidated).toBe(2)
      expect(cache.get('users:123:profile')).toBeNull()
      expect(cache.get('users:456:profile')).toBeNull()
      expect(cache.get('posts:789:content')).toBe('value3')
    })
  })
})
