import { SmartCache, createCacheKey } from '@/lib/cache'

describe('SmartCache - Simple Tests', () => {
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
})
