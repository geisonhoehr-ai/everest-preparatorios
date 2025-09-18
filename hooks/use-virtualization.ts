'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualizedItem {
  index: number
  start: number
  end: number
  height: number
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    )

    const visibleStartIndex = Math.max(0, startIndex - overscan)
    const visibleEndIndex = Math.min(endIndex, items.length - 1)

    const result: VirtualizedItem[] = []
    for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
      result.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        height: itemHeight,
      })
    }

    return result
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const totalHeight = useMemo(() => {
    return items.length * itemHeight
  }, [items.length, itemHeight])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollTop,
  }
}

// Hook para virtualização com altura dinâmica
export function useDynamicVirtualization<T>(
  items: T[],
  options: {
    containerHeight: number
    getItemHeight: (index: number) => number
    overscan?: number
  }
) {
  const { containerHeight, getItemHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const [itemHeights, setItemHeights] = useState<number[]>([])

  // Calcular alturas dos itens
  useEffect(() => {
    const heights = items.map((_, index) => getItemHeight(index))
    setItemHeights(heights)
  }, [items, getItemHeight])

  const visibleItems = useMemo(() => {
    if (itemHeights.length === 0) return []

    let startIndex = 0
    let currentTop = 0

    // Encontrar o índice inicial
    for (let i = 0; i < itemHeights.length; i++) {
      if (currentTop + itemHeights[i] > scrollTop) {
        startIndex = i
        break
      }
      currentTop += itemHeights[i]
    }

    // Encontrar o índice final
    let endIndex = startIndex
    let visibleHeight = 0

    for (let i = startIndex; i < itemHeights.length; i++) {
      visibleHeight += itemHeights[i]
      if (visibleHeight > containerHeight) {
        endIndex = i
        break
      }
    }

    // Aplicar overscan
    const visibleStartIndex = Math.max(0, startIndex - overscan)
    const visibleEndIndex = Math.min(endIndex + overscan, items.length - 1)

    const result: VirtualizedItem[] = []
    let top = 0

    for (let i = 0; i < visibleStartIndex; i++) {
      top += itemHeights[i]
    }

    for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
      result.push({
        index: i,
        start: top,
        end: top + itemHeights[i],
        height: itemHeights[i],
      })
      top += itemHeights[i]
    }

    return result
  }, [scrollTop, containerHeight, overscan, items.length, itemHeights])

  const totalHeight = useMemo(() => {
    return itemHeights.reduce((sum, height) => sum + height, 0)
  }, [itemHeights])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollTop,
  }
}
