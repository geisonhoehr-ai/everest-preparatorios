'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface HLSTestPlayerProps {
  hlsUrl: string
  title?: string
}

export function HLSTestPlayer({ hlsUrl, title = "Teste HLS" }: HLSTestPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hlsStatus, setHlsStatus] = useState<string>('Iniciando...')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[HLS Test] ${message}`)
  }

  useEffect(() => {
    if (!hlsUrl) return

    addLog(`🔍 Iniciando teste com URL: ${hlsUrl}`)
    setHlsStatus('Carregando HLS.js...')

    const setupHLS = async () => {
      try {
        // Carregar HLS.js
        if (!window.Hls) {
          addLog('📦 Carregando HLS.js...')
          const Hls = (await import('hls.js')).default
          window.Hls = Hls
          addLog(`✅ HLS.js carregado (versão: ${Hls.version})`)
        }

        if (window.Hls.isSupported()) {
          addLog('✅ HLS.js suportado pelo navegador')
          setHlsStatus('Configurando HLS...')

          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            debug: true, // Ativar debug para teste
            startLevel: -1,
            capLevelToPlayerSize: true,
            enableSoftwareAES: true,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 3,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 3
          })

          hls.loadSource(hlsUrl)
          hls.attachMedia(audioRef.current!)

          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            addLog('✅ Manifest HLS carregado com sucesso')
            addLog(`📊 Níveis disponíveis: ${hls.levels.length}`)
            hls.levels.forEach((level: any, index: number) => {
              addLog(`   ${index}: ${level.height}p - ${level.bitrate} bps`)
            })
            setHlsStatus('Pronto para reproduzir')
            setIsLoading(false)
          })

          hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
            addLog(`❌ Erro HLS: ${data.type} - ${data.details}`)
            addLog(`   Fatal: ${data.fatal}`)
            addLog(`   URL: ${data.url}`)
            
            if (data.fatal) {
              setHlsStatus(`Erro fatal: ${data.details}`)
              setError(`Erro HLS: ${data.details}`)
            }
          })

          hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const level = hls.levels[data.level]
            if (level) {
              addLog(`🔄 Qualidade alterada para: ${level.height}p`)
            }
          })

        } else if (audioRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          addLog('🍎 Usando HLS nativo do Safari')
          setHlsStatus('Usando HLS nativo')
          audioRef.current.src = hlsUrl
          setIsLoading(false)
        } else {
          addLog('❌ HLS não suportado neste navegador')
          setHlsStatus('HLS não suportado')
          setError('HLS não suportado neste navegador')
        }

      } catch (error) {
        addLog(`❌ Erro ao configurar HLS: ${error}`)
        setHlsStatus('Erro na configuração')
        setError(`Erro: ${error}`)
      }
    }

    setupHLS()
  }, [hlsUrl])

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        addLog('⏸️ Reprodução pausada')
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
        addLog('▶️ Reprodução iniciada')
      }
    } catch (error) {
      addLog(`❌ Erro ao reproduzir: ${error}`)
      setError(`Erro de reprodução: ${error}`)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      addLog(`📊 Duração carregada: ${audioRef.current.duration}s`)
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

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <span>Teste HLS - {title}</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={clearLogs} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar Logs
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Status: {hlsStatus}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Controles */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handlePlayPause}
              disabled={isLoading || !!error}
              className="w-12 h-12 rounded-full"
            >
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm text-gray-600">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* URL */}
          <div className="bg-gray-100 p-3 rounded text-sm">
            <strong>URL:</strong> {hlsUrl}
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Logs de Debug:</h4>
              <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-60 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Elemento de áudio oculto */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              addLog(`❌ Erro no áudio: ${e}`)
              setError('Erro no elemento de áudio')
            }}
            onLoadStart={() => {
              addLog('📥 Iniciando carregamento...')
              setIsLoading(true)
            }}
            onCanPlay={() => {
              addLog('✅ Áudio pronto para reproduzir')
              setIsLoading(false)
            }}
            preload="metadata"
            crossOrigin="anonymous"
            playsInline
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Declaração global para HLS.js
declare global {
  interface Window {
    Hls: any
  }
}
