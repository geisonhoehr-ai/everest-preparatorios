'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  componentMounts: number
  reRenders: number
}

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    reRenders: 0
  })

  const renderStartTime = useRef<number>(0)
  const mountTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  const mountCount = useRef<number>(0)

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])

  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current
      renderCount.current += 1
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        reRenders: renderCount.current
      }))
    }
  }, [])

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
      }))
    }
  }, [])

  const measureMount = useCallback(() => {
    mountTime.current = performance.now()
    mountCount.current += 1
    
    setMetrics(prev => ({
      ...prev,
      componentMounts: mountCount.current
    }))
  }, [])

  // Medir tempo de montagem
  useEffect(() => {
    measureMount()
  }, [measureMount])

  // Medir memória periodicamente
  useEffect(() => {
    const interval = setInterval(measureMemory, 5000)
    return () => clearInterval(interval)
  }, [measureMemory])

  // Log de performance em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERFORMANCE] ${componentName}:`, {
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        memoryUsage: `${metrics.memoryUsage.toFixed(2)}MB`,
        reRenders: metrics.reRenders,
        mounts: metrics.componentMounts
      })
    }
  }, [componentName, metrics])

  return {
    metrics,
    startRender,
    endRender,
    measureMemory,
    measureMount
  }
}

// Hook para medir performance de funções
export function useFunctionPerformance() {
  const measureFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now()
      const result = fn(...args)
      const end = performance.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[FUNCTION_PERFORMANCE] ${functionName}: ${(end - start).toFixed(2)}ms`)
      }
      
      return result
    }) as T
  }, [])

  return { measureFunction }
}

// Hook para detectar re-renders desnecessários
export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0)
  const prevProps = useRef<any>({})
  const prevState = useRef<any>({})

  const trackRender = useCallback((props: any, state: any) => {
    renderCount.current += 1
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RENDER_TRACKER] ${componentName} - Render #${renderCount.current}`)
      
      // Detectar mudanças nas props
      const propChanges = Object.keys(props).filter(
        key => prevProps.current[key] !== props[key]
      )
      
      if (propChanges.length > 0) {
        console.log(`[RENDER_TRACKER] ${componentName} - Props changed:`, propChanges)
      }
      
      // Detectar mudanças no state
      const stateChanges = Object.keys(state).filter(
        key => prevState.current[key] !== state[key]
      )
      
      if (stateChanges.length > 0) {
        console.log(`[RENDER_TRACKER] ${componentName} - State changed:`, stateChanges)
      }
      
      prevProps.current = { ...props }
      prevState.current = { ...state }
    }
  }, [componentName])

  return { trackRender, renderCount: renderCount.current }
}
