'use client'

import React from 'react'
import { Toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      role="region"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        const colorClasses = colors[toast.type]

        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
              'animate-in slide-in-from-right-full',
              colorClasses
            )}
            role="alert"
            aria-live="assertive"
          >
            <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">
                  {toast.description}
                </p>
              )}
              {toast.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toast.action.onClick}
                  className="mt-2 h-auto p-0 text-sm font-medium hover:bg-transparent"
                >
                  {toast.action.label}
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(toast.id)}
              className="ml-2 h-auto p-1 hover:bg-transparent"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
