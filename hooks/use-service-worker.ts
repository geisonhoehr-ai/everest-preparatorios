'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se Service Worker é suportado
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
    } else {
      setError('Service Worker não é suportado neste navegador')
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setRegistration(reg)
      setIsRegistered(true)

      // Verificar se há atualizações
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log('🔄 Nova versão do Service Worker disponível')
              // Aqui você pode mostrar uma notificação para o usuário
            }
          })
        }
      })

      console.log('✅ Service Worker registrado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error)
      setError('Erro ao registrar Service Worker')
    }
  }

  const unregisterServiceWorker = async () => {
    if (registration) {
      try {
        await registration.unregister()
        setIsRegistered(false)
        setRegistration(null)
        console.log('🗑️ Service Worker removido')
      } catch (error) {
        console.error('❌ Erro ao remover Service Worker:', error)
        setError('Erro ao remover Service Worker')
      }
    }
  }

  const updateServiceWorker = async () => {
    if (registration) {
      try {
        await registration.update()
        console.log('🔄 Service Worker atualizado')
      } catch (error) {
        console.error('❌ Erro ao atualizar Service Worker:', error)
        setError('Erro ao atualizar Service Worker')
      }
    }
  }

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('🗑️ Cache limpo')
      } catch (error) {
        console.error('❌ Erro ao limpar cache:', error)
        setError('Erro ao limpar cache')
      }
    }
  }

  const getCacheSize = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        let totalSize = 0
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const keys = await cache.keys()
          totalSize += keys.length
        }
        
        return totalSize
      } catch (error) {
        console.error('❌ Erro ao calcular tamanho do cache:', error)
        return 0
      }
    }
    return 0
  }

  return {
    isSupported,
    isRegistered,
    registration,
    error,
    registerServiceWorker,
    unregisterServiceWorker,
    updateServiceWorker,
    clearCache,
    getCacheSize
  }
}