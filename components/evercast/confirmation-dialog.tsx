'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          borderColor: 'border-red-200 dark:border-red-800',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        }
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          borderColor: 'border-blue-200 dark:border-blue-800',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        }
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-gray-500" />,
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white',
          borderColor: 'border-gray-200 dark:border-gray-800',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${styles.bgColor} ${styles.borderColor} border-2`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            {styles.icon}
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {message}
          </p>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={styles.confirmButton}
            >
              {isLoading ? 'Processando...' : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
