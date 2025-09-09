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
  className?: string
}

export function HLSPlayer({ 
  hlsUrl, 
  title = "Streaming HLS",
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
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
          lowLatencyMode: false, // Desabilitar para streams VOD
          backBufferLength: 90,
          maxBufferLength: 60, // Aumentar buffer para streams longos
          maxMaxBufferLength: 120, // Buffer máximo maior
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          liveDurationInfinity: false, // Desabilitar para streams VOD
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 3,
          maxFragLookUpTolerance: 0.25,
          liveBackBufferLength: 0,
          maxLiveSyncPlaybackRate: 1.5,
          liveSyncDuration: 3,
          livePlaybackRate: 1,
          livePlaybackRateOffset: 0.1,
          maxLiveSyncPlaybackRateOffset: 0.2,
          // Configurações específicas para Pandavideo
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
            xhr.withCredentials = false
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
            xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type')
          }
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
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
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
    <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 ${className}`}>
      {/* Informações da mídia */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <Headphones className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{title}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Streaming HLS</span>
            {streamQuality && (
              <span className="bg-purple-600/30 px-2 py-1 rounded text-xs">
                {streamQuality}
              </span>
            )}
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenInNewTab}
            className="text-gray-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Controles de reprodução */}
      <div className="flex items-center space-x-4 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePlayPause}
          disabled={isLoading || !isOnline}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Barra de progresso */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controle de volume */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
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
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPause={() => {
          console.log('⏸️ HLS Player pausado em:', audioRef.current?.currentTime)
        }}
        onStalled={() => {
          console.log('🔄 HLS Player stalled em:', audioRef.current?.currentTime)
        }}
        onWaiting={() => {
          console.log('⏳ HLS Player waiting em:', audioRef.current?.currentTime)
        }}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  )
}

// Declaração global para HLS.js
declare global {
  interface Window {
    Hls: any
  }
}
