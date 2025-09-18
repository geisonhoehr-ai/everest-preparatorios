'use client'

import { useState, useEffect, useCallback } from 'react'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  isOnline: boolean
  hasUpdate: boolean
  deferredPrompt: any
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    isOnline: navigator.onLine,
    hasUpdate: false,
    deferredPrompt: null
  })

  // Verificar se está em modo standalone
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://')
    
    setState(prev => ({ ...prev, isStandalone }))
  }, [])

  // Verificar se está instalado
  useEffect(() => {
    const isInstalled = localStorage.getItem('pwa-installed') === 'true'
    setState(prev => ({ ...prev, isInstalled }))
  }, [])

  // Monitorar eventos de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setState(prev => ({ 
        ...prev, 
        isInstallable: true, 
        deferredPrompt: e 
      }))
    }

    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true,
        deferredPrompt: null 
      }))
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Monitorar atualizações do Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setState(prev => ({ ...prev, hasUpdate: true }))
      })
    }
  }, [])

  // Instalar PWA
  const install = useCallback(async () => {
    if (!state.deferredPrompt) return false

    try {
      state.deferredPrompt.prompt()
      const { outcome } = await state.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setState(prev => ({ 
          ...prev, 
          isInstallable: false, 
          isInstalled: true,
          deferredPrompt: null 
        }))
        localStorage.setItem('pwa-installed', 'true')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }, [state.deferredPrompt])

  // Atualizar PWA
  const update = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      } catch (error) {
        console.error('Erro ao atualizar PWA:', error)
      }
    }
  }, [])

  // Verificar se é PWA
  const isPWA = state.isStandalone || state.isInstalled

  return {
    ...state,
    install,
    update,
    isPWA
  }
}

// Hook para gerenciar tema PWA
export function usePWATheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('pwa-theme') as 'light' | 'dark' | 'system' || 'system'
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setResolvedTheme(systemTheme)
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateResolvedTheme)
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
    }
  }, [theme])

  const setThemeAndSave = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('pwa-theme', newTheme)
  }, [])

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeAndSave
  }
}

// Hook para gerenciar splash screen
export function usePWASplash() {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // Mostrar splash screen apenas em PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://')

    if (isPWA) {
      setShowSplash(true)
      // Esconder splash após carregamento
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  return { showSplash, setShowSplash }
}
