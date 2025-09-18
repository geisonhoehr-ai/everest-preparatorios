'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [node, setNode] = useState<Element | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const disconnect = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!node) return

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        
        if (freezeOnceVisible && entry.isIntersecting) {
          disconnect()
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    )

    observer.current.observe(node)

    return () => {
      disconnect()
    }
  }, [node, threshold, root, rootMargin, freezeOnceVisible, disconnect])

  return {
    ref: setNode,
    entry,
    isIntersecting: entry?.isIntersecting ?? false,
    intersectionRatio: entry?.intersectionRatio ?? 0,
    disconnect
  }
}

// Hook para lazy loading de imagens
export function useLazyImage(src: string, options: UseIntersectionObserverOptions = {}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true
  })

  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      setImageSrc(src)
    }
  }, [isIntersecting, src, imageSrc])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setIsError(false)
  }, [])

  const handleError = useCallback(() => {
    setIsError(true)
    setIsLoaded(false)
  }, [])

  return {
    ref,
    src: imageSrc,
    isLoaded,
    isError,
    isIntersecting,
    onLoad: handleLoad,
    onError: handleError
  }
}

// Hook para lazy loading de componentes
export function useLazyComponent<T>(
  shouldLoad: boolean,
  loadFunction: () => Promise<T>,
  options: {
    retryCount?: number
    retryDelay?: number
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryAttempts, setRetryAttempts] = useState(0)

  const { retryCount = 3, retryDelay = 1000 } = options

  const load = useCallback(async () => {
    if (loading || data) return

    try {
      setLoading(true)
      setError(null)
      const result = await loadFunction()
      setData(result)
    } catch (err) {
      const error = err as Error
      setError(error)
      
      if (retryAttempts < retryCount) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1)
          load()
        }, retryDelay * Math.pow(2, retryAttempts))
      }
    } finally {
      setLoading(false)
    }
  }, [loadFunction, loading, data, retryAttempts, retryCount, retryDelay])

  useEffect(() => {
    if (shouldLoad && !data && !loading) {
      load()
    }
  }, [shouldLoad, data, loading, load])

  const retry = useCallback(() => {
    setRetryAttempts(0)
    setError(null)
    setData(null)
    load()
  }, [load])

  return {
    data,
    loading,
    error,
    retry,
    canRetry: retryAttempts < retryCount
  }
}

// Hook para lazy loading de listas
export function useLazyList<T>(
  items: T[],
  options: {
    initialCount?: number
    increment?: number
    threshold?: number
  } = {}
) {
  const {
    initialCount = 10,
    increment = 10,
    threshold = 0.1
  } = options

  const [visibleCount, setVisibleCount] = useState(initialCount)
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: false
  })

  useEffect(() => {
    if (isIntersecting && visibleCount < items.length) {
      setVisibleCount(prev => Math.min(prev + increment, items.length))
    }
  }, [isIntersecting, visibleCount, items.length, increment])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return {
    visibleItems,
    hasMore,
    loadMoreRef: ref,
    totalCount: items.length,
    visibleCount
  }
}
