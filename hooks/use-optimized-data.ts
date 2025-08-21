"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface UseOptimizedDataOptions<T> {
  key: string
  fetcher: () => Promise<T>
  ttl?: number
  dependencies?: any[]
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useOptimizedData<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000, // 5 minutos padrão
  dependencies = [],
  immediate = true,
  onSuccess,
  onError
}: UseOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  
  // Cache local para evitar múltiplas chamadas
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const abortController = useRef<AbortController | null>(null)

  // Função para obter dados do cache
  const getFromCache = useCallback((cacheKey: string): T | null => {
    const entry = cache.current.get(cacheKey)
    
    if (!entry) return null
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.current.delete(cacheKey)
      return null
    }
    
    return entry.data
  }, [])

  // Função para salvar dados no cache
  const saveToCache = useCallback((cacheKey: string, data: T) => {
    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }, [ttl])

  // Função para buscar dados
  const fetchData = useCallback(async (force = false) => {
    const cacheKey = `${key}:${JSON.stringify(dependencies)}`
    
    // Verificar cache primeiro (a menos que force seja true)
    if (!force) {
      const cached = getFromCache(cacheKey)
      if (cached) {
        console.log(`✅ [OPTIMIZED_DATA] Usando cache para ${key}`)
        setData(cached)
        setError(null)
        return
      }
    }

    // Cancelar requisição anterior se existir
    if (abortController.current) {
      abortController.current.abort()
    }

    // Criar novo controller para esta requisição
    abortController.current = new AbortController()

    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔍 [OPTIMIZED_DATA] Buscando dados para ${key}`)
      
      const result = await fetcher()
      
      // Verificar se a requisição foi cancelada
      if (abortController.current.signal.aborted) {
        return
      }
      
      setData(result)
      setLastFetch(Date.now())
      
      // Salvar no cache
      saveToCache(cacheKey, result)
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess(result)
      }
      
      console.log(`✅ [OPTIMIZED_DATA] Dados carregados para ${key}`)
      
    } catch (err) {
      // Verificar se a requisição foi cancelada
      if (abortController.current?.signal.aborted) {
        return
      }
      
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      
      // Callback de erro
      if (onError) {
        onError(error)
      }
      
      console.error(`❌ [OPTIMIZED_DATA] Erro ao carregar ${key}:`, error)
    } finally {
      if (!abortController.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, [key, fetcher, dependencies, getFromCache, saveToCache, onSuccess, onError])

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    cache.current.clear()
    console.log(`🧹 [OPTIMIZED_DATA] Cache limpo para ${key}`)
  }, [key])

  // Função para recarregar dados
  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Efeito para buscar dados automaticamente
  useEffect(() => {
    if (immediate) {
      fetchData()
    }
    
    // Cleanup: cancelar requisição ao desmontar
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [immediate, fetchData])

  // Efeito para limpar cache quando dependências mudam
  useEffect(() => {
    invalidateCache()
  }, dependencies)

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    invalidateCache,
    // Função para verificar se os dados estão em cache
    isCached: () => {
      const cacheKey = `${key}:${JSON.stringify(dependencies)}`
      return cache.current.has(cacheKey)
    }
  }
}

// Hook para dados que não mudam frequentemente (como subjects, topics)
export function useStaticData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 10 * 60 * 1000 // 10 minutos para dados estáticos
) {
  return useOptimizedData({
    key,
    fetcher,
    ttl,
    immediate: true
  })
}

// Hook para dados que mudam frequentemente (como flashcards, progresso)
export function useDynamicData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 2 * 60 * 1000 // 2 minutos para dados dinâmicos
) {
  return useOptimizedData({
    key,
    fetcher,
    ttl,
    immediate: true
  })
}

// Hook para dados que precisam ser sempre atualizados
export function useLiveData<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  return useOptimizedData({
    key,
    fetcher,
    ttl: 0, // Sem cache
    immediate: true
  })
}
