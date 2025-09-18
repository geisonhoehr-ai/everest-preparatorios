'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Volume2, 
  Wifi, 
  WifiOff, 
  Download, 
  Play, 
  Pause,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { useBackgroundAudioService } from '@/lib/background-audio-service'
import { useServiceWorker } from '@/hooks/use-service-worker'

interface BackgroundAudioInfoProps {
  className?: string
}

export function BackgroundAudioInfo({ className = '' }: BackgroundAudioInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [cacheSize, setCacheSize] = useState(0)
  const backgroundAudioService = useBackgroundAudioService()
  const serviceWorker = useServiceWorker()

  const supportInfo = backgroundAudioService.getSupportInfo()

  useEffect(() => {
    const updateCacheSize = async () => {
      const size = await serviceWorker.getCacheSize()
      setCacheSize(size)
    }

    if (serviceWorker.isRegistered) {
      updateCacheSize()
    }
  }, [serviceWorker.isRegistered])

  const getSupportStatus = () => {
    if (supportInfo.hasFullSupport) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        text: 'Suporte Completo',
        color: 'text-green-600 border-green-600',
        description: 'Background audio totalmente funcional'
      }
    } else if (supportInfo.mediaSession) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
        text: 'Suporte Parcial',
        color: 'text-yellow-600 border-yellow-600',
        description: 'Controles básicos disponíveis'
      }
    } else {
      return {
        icon: <XCircle className="w-4 h-4 text-red-600" />,
        text: 'Suporte Limitado',
        color: 'text-red-600 border-red-600',
        description: 'Funcionalidades básicas apenas'
      }
    }
  }

  const status = getSupportStatus()

  return (
    <Card className={`bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-orange-600" />
            Background Audio
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Status Principal */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {status.icon}
            <Badge variant="outline" className={status.color}>
              {status.text}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {status.description}
          </p>
        </div>

        {/* Informações Expandidas */}
        {isExpanded && (
          <div className="space-y-4 border-t border-gray-200 dark:border-white/10 pt-4">
            {/* APIs Suportadas */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                APIs Suportadas:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  {supportInfo.mediaSession ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Media Session
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {supportInfo.wakeLock ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Wake Lock
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {supportInfo.audioContext ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Audio Context
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {serviceWorker.isSupported ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Service Worker
                  </span>
                </div>
              </div>
            </div>

            {/* Status do PWA */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                PWA Status:
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {serviceWorker.isRegistered ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {serviceWorker.isRegistered ? 'Registrado' : 'Não registrado'}
                  </span>
                </div>
                {cacheSize > 0 && (
                  <span className="text-xs text-gray-500">
                    {cacheSize} itens em cache
                  </span>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex space-x-2">
              {serviceWorker.isRegistered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => serviceWorker.clearCache()}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Limpar Cache
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => serviceWorker.updateServiceWorker()}
                className="text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Atualizar
              </Button>
            </div>

            {/* Instruções */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                Como usar:
              </h5>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Toque em uma aula para começar a reproduzir</li>
                <li>• Bloqueie o celular - o áudio continuará tocando</li>
                <li>• Use os controles no lock screen</li>
                <li>• O áudio funciona offline (se em cache)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
