'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { ErrorBoundary } from './error-boundary'

interface LazyWrapperProps {
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

// Loading component padrão
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">Carregando...</span>
  </div>
)

// Error fallback padrão
const DefaultErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="text-red-500 mb-2">⚠️ Erro ao carregar componente</div>
      <div className="text-sm text-gray-600">{error.message}</div>
    </div>
  </div>
)

// HOC para lazy loading
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyWrapperProps = {}
) {
  const LazyComponent = lazy(importFunc)
  
  const {
    fallback = <DefaultFallback />,
    errorFallback,
    onError
  } = options

  return function LazyWrapper(props: P) {
    return (
      <ErrorBoundary
        fallback={errorFallback}
        onError={onError}
      >
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// Componente para lazy loading com retry
export function LazyComponent({
  importFunc,
  fallback,
  errorFallback,
  onError,
  retryCount = 3,
  retryDelay = 1000,
  ...props
}: {
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  onError?: (error: Error, errorInfo: any) => void
  retryCount?: number
  retryDelay?: number
  [key: string]: any
}) {
  const [LazyComponent, setLazyComponent] = React.useState<ComponentType<any> | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [retryAttempts, setRetryAttempts] = React.useState(0)

  const loadComponent = React.useCallback(async () => {
    try {
      setError(null)
      const module = await importFunc()
      setLazyComponent(() => module.default)
    } catch (err) {
      const error = err as Error
      setError(error)
      
      if (retryAttempts < retryCount) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1)
          loadComponent()
        }, retryDelay * Math.pow(2, retryAttempts)) // Exponential backoff
      }
    }
  }, [importFunc, retryAttempts, retryCount, retryDelay])

  React.useEffect(() => {
    loadComponent()
  }, [loadComponent])

  if (error && retryAttempts >= retryCount) {
    return errorFallback || <DefaultErrorFallback error={error} />
  }

  if (!LazyComponent) {
    return fallback || <DefaultFallback />
  }

  return (
    <ErrorBoundary
      fallback={errorFallback}
      onError={onError}
    >
      <LazyComponent {...props} />
    </ErrorBoundary>
  )
}

// Hook para lazy loading
export function useLazyComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: {
    retryCount?: number
    retryDelay?: number
  } = {}
) {
  const [Component, setComponent] = React.useState<ComponentType<P> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [retryAttempts, setRetryAttempts] = React.useState(0)

  const { retryCount = 3, retryDelay = 1000 } = options

  const loadComponent = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const module = await importFunc()
      setComponent(() => module.default)
    } catch (err) {
      const error = err as Error
      setError(error)
      
      if (retryAttempts < retryCount) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1)
          loadComponent()
        }, retryDelay * Math.pow(2, retryAttempts))
      }
    } finally {
      setLoading(false)
    }
  }, [importFunc, retryAttempts, retryCount, retryDelay])

  React.useEffect(() => {
    loadComponent()
  }, [loadComponent])

  const retry = React.useCallback(() => {
    setRetryAttempts(0)
    setError(null)
    loadComponent()
  }, [loadComponent])

  return {
    Component,
    loading,
    error,
    retry,
    canRetry: retryAttempts < retryCount
  }
}

// Componente para lazy loading de rotas
export function LazyRoute({
  importFunc,
  fallback,
  errorFallback,
  onError
}: {
  importFunc: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  onError?: (error: Error, errorInfo: any) => void
}) {
  return (
    <LazyComponent
      importFunc={importFunc}
      fallback={fallback}
      errorFallback={errorFallback}
      onError={onError}
    />
  )
}
