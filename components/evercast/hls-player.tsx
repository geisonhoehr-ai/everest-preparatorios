'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Headphones,
  Wifi,
  WifiOff
} from 'lucide-react'

interface HLSPlayerProps {
  hlsUrl: string
  title?: string
  onTimeUpdate?: (currentTime: number) => void
  onLoadedMetadata?: (duration: number) => void
  onEnded?: () => void
  onPlayPause?: (isPlaying: boolean) => void
  className?: string
}

export function HLSPlayer({ 
  hlsUrl, 
  title = "Streaming HLS",
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlayPause,
  className = ""
}: HLSPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [streamQuality, setStreamQuality] = useState<string>('auto')

  // Verificar se está online
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Carregar HLS.js se necessário
  useEffect(() => {
    const loadHLS = async () => {
      if (typeof window !== 'undefined' && !window.Hls) {
        try {
          const Hls = (await import('hls.js')).default
          window.Hls = Hls
        } catch (error) {
          console.error('Erro ao carregar HLS.js:', error)
        }
      }
    }
    
    loadHLS()
  }, [])

  // Configurar HLS quando o componente montar
  useEffect(() => {
    if (!audioRef.current || !hlsUrl) return

    const audio = audioRef.current
    let hls: any = null

    const setupHLS = () => {
      if (window.Hls && window.Hls.isSupported()) {
        // Limpar URL se tiver @ no início
        const cleanUrl = hlsUrl.startsWith('@') ? hlsUrl.substring(1) : hlsUrl
        
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 3,
          maxFragLookUpTolerance: 0.25,
          // Configurações adicionais para melhor compatibilidade
          startLevel: -1, // Auto
          capLevelToPlayerSize: true,
          debug: false,
          enableSoftwareAES: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 3
        })

        hls.loadSource(cleanUrl)
        hls.attachMedia(audio)

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest carregado')
          console.log('📊 HLS Levels:', hls.levels)
          console.log('⏱️ Duração estimada:', hls.media?.duration)
          setIsLoading(false)
        })

        hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
          console.error('❌ Erro HLS:', data)
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                setError('Erro de rede. Verifique sua conexão.')
                break
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                setError('Erro de mídia. Tentando recuperar...')
                hls.recoverMediaError()
                break
              default:
                setError('Erro fatal. Recarregando...')
                hls.destroy()
                break
            }
          }
        })

        hls.on(window.Hls.Events.LEVEL_SWITCHED, (event: any, data: any) => {
          const level = hls.levels[data.level]
          if (level) {
            setStreamQuality(`${level.height}p`)
            console.log('🔄 HLS Level switched to:', level)
          }
        })

        hls.on(window.Hls.Events.FRAG_LOADED, (event: any, data: any) => {
          console.log('📦 HLS Fragment loaded:', data.frag.sn, 'at', data.frag.start)
        })

        hls.on(window.Hls.Events.BUFFER_APPENDED, (event: any, data: any) => {
          console.log('📈 HLS Buffer appended, current time:', audio.currentTime)
        })

      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari nativo
        const cleanUrl = hlsUrl.startsWith('@') ? hlsUrl.substring(1) : hlsUrl
        audio.src = cleanUrl
        setIsLoading(false)
      } else {
        setError('HLS não suportado neste navegador')
      }
    }

    setIsLoading(true)
    setError(null)
    setupHLS()

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [hlsUrl])

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        onPlayPause?.(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
        onPlayPause?.(true)
      }
    } catch (err) {
      console.error('Erro ao reproduzir:', err)
      setError('Erro ao reproduzir o stream')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
      
      // Log a cada 5 segundos para debug
      if (Math.floor(time) % 5 === 0 && Math.floor(time) > 0) {
        console.log(`⏱️ HLS Player - Tempo atual: ${time.toFixed(2)}s, Duração: ${audioRef.current.duration?.toFixed(2)}s`)
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration
      setDuration(dur)
      onLoadedMetadata?.(dur)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOpenInNewTab = () => {
    window.open(hlsUrl, '_blank')
  }

  return (
    <>
      {/* Estilos CSS para sliders responsivos */}
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .slider::-webkit-slider-track {
          background: #4b5563;
          height: 4px;
          border-radius: 2px;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: #ea580c;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #c2410c;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-track {
          background: #4b5563;
          height: 4px;
          border-radius: 2px;
          border: none;
        }
        
        .slider::-moz-range-thumb {
          background: #ea580c;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb:hover {
          background: #c2410c;
          transform: scale(1.1);
        }
        
        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            height: 20px;
            width: 20px;
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
          }
        }
      `}</style>
      
      <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4 ${className}`}>
      {/* Informações da mídia */}
      <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center">
          <Headphones className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate text-sm sm:text-base">{title}</h4>
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-400 flex-wrap">
            <span>Streaming HLS</span>
            {streamQuality && (
              <span className="bg-orange-600/30 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                {streamQuality}
              </span>
            )}
            {isOnline ? (
              <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenInNewTab}
            className="text-gray-400 hover:text-white p-1 sm:p-2"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Controles de reprodução */}
      <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePlayPause}
          disabled={isLoading || !isOnline}
          className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-orange-600 hover:bg-orange-700 p-0"
        >
          {isLoading ? (
            <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          ) : (
            <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          )}
        </Button>

        {/* Barra de progresso */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
            <span className="text-xs text-gray-400 hidden sm:inline">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-400 hidden sm:inline">{formatTime(duration)}</span>
          </div>
          {/* Tempo em mobile */}
          <div className="flex justify-between text-xs text-gray-400 sm:hidden">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controle de volume */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleMute} className="p-1 sm:p-2">
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-12 sm:w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-red-300 text-xs mt-1">
            Verifique sua conexão com a internet e tente novamente.
          </p>
        </div>
      )}

      {/* Status offline */}
      {!isOnline && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
          <p className="text-yellow-400 text-sm">
            Você está offline. Reconecte-se para continuar o streaming.
          </p>
        </div>
      )}

      {/* Informações técnicas */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Fonte: Pandavideo HLS Stream</p>
        <p>URL: {hlsUrl}</p>
        <p>Qualidade: {streamQuality || 'Auto'}</p>
        <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      </div>

      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false)
          onEnded?.()
        }}
        onError={(e) => {
          console.error('Erro no áudio:', e)
          setError('Erro ao carregar o stream')
          setIsLoading(false)
        }}
        onLoadStart={() => {
          console.log('🔄 HLS Player iniciando carregamento...')
          setIsLoading(true)
        }}
        onCanPlay={() => {
          console.log('✅ HLS Player pronto para reproduzir')
          setIsLoading(false)
        }}
        onPause={() => {
          console.log('⏸️ HLS Player pausado em:', audioRef.current?.currentTime)
        }}
        onStalled={() => {
          console.log('🔄 HLS Player stalled em:', audioRef.current?.currentTime)
        }}
        onWaiting={() => {
          console.log('⏳ HLS Player waiting em:', audioRef.current?.currentTime)
        }}
        onLoadStart={() => {
          console.log('📥 HLS Player carregando dados...')
        }}
        onCanPlayThrough={() => {
          console.log('🎵 HLS Player pode reproduzir completamente')
        }}
        preload="metadata"
        crossOrigin="anonymous"
        playsInline
        webkit-playsinline="true"
      />
    </div>
    </>
  )
}

// Declaração global para HLS.js
declare global {
  interface Window {
    Hls: any
  }
}
