"use client"

import { Suspense, lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoaderProps {
  component: ComponentType<any>
  fallback?: React.ReactNode
  props?: any
}

export function LazyLoader({ component, fallback, props }: LazyLoaderProps) {
  const LazyComponent = lazy(() => Promise.resolve({ default: component }))
  
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      <span className="ml-2 text-gray-600">Carregando...</span>
    </div>
  )
}

// Componentes específicos para lazy loading
export const LazyVideoPlayer = lazy(() => import('./video-player').then(module => ({ default: module.VideoPlayer })))
export const LazyPandavideoIntegration = lazy(() => import('./pandavideo-integration').then(module => ({ default: module.PandavideoIntegration })))
export const LazyCorrecaoDetalhada = lazy(() => import('./correcao-detalhada').then(module => ({ default: module.CorrecaoDetalhada }))) 