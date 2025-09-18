'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000, // 5 segundos padrão
      ...toast,
    }

    setState(prev => ({
      toasts: [...prev.toasts, newToast]
    }))

    // Auto remove após duração especificada
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setState(prev => ({
      toasts: prev.toasts.filter(toast => toast.id !== id)
    }))
  }, [])

  const clearAll = useCallback(() => {
    setState({ toasts: [] })
  }, [])

  // Métodos de conveniência
  const success = useCallback((title: string, description?: string) => {
    return addToast({ type: 'success', title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    return addToast({ type: 'error', title, description })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ type: 'warning', title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    return addToast({ type: 'info', title, description })
  }, [addToast])

  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}