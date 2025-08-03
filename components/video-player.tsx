"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  Loader2,
  AlertCircle
} from "lucide-react"

// Declaração global para o PandaPlayer
declare global {
  interface Window {
    PandaPlayer: any
  }
}

interface VideoPlayerProps {
  videoId: string
  title?: string
  onClose?: () => void
}

export function VideoPlayer({ videoId, title, onClose }: VideoPlayerProps) {
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  // Função para verificar se o elemento existe
  const ensureElementExists = (selector: string, timeout = 5000): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkElement = () => {
        const element = document.querySelector(selector) as HTMLElement
        
        if (element) {
          console.log(`✅ [VideoPlayer] Elemento encontrado: ${selector}`)
          resolve(element)
          return
        }
        
        if (Date.now() - startTime > timeout) {
          console.error(`❌ [VideoPlayer] Timeout: elemento não encontrado: ${selector}`)
          reject(new Error(`Elemento não encontrado: ${selector}`))
          return
        }
        
        // Tentar novamente em 100ms
        setTimeout(checkElement, 100)
      }
      
      checkElement()
    })
  }

  // Carregar script do Pandavideo
  useEffect(() => {
    if (scriptLoadedRef.current) return

    const loadScript = async () => {
      try {
        console.log('🎥 [VideoPlayer] Carregando script do Pandavideo...')
        
        // Verificar se o script já existe
        if (document.querySelector('script[src*="pandavideo"]')) {
          console.log('✅ [VideoPlayer] Script já carregado')
          scriptLoadedRef.current = true
          return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.pandavideo.com.br/player.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ [VideoPlayer] Script carregado com sucesso')
          scriptLoadedRef.current = true
        }
        
        script.onerror = () => {
          console.error('❌ [VideoPlayer] Erro ao carregar script')
          setError('Erro ao carregar player do Pandavideo')
        }
        
        document.head.appendChild(script)
      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao carregar script:', error)
        setError('Erro ao carregar player do Pandavideo')
      }
    }

    loadScript()
  }, [])

  // Inicializar player
  useEffect(() => {
    if (!scriptLoadedRef.current || !videoId) return

    const initPlayer = async () => {
      try {
        console.log('🎥 [VideoPlayer] Inicializando player...')
        setIsLoading(true)
        setError(null)

        // Aguardar um pouco para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verificar se o container existe
        if (!containerRef.current) {
          throw new Error('Container do player não encontrado')
        }

        console.log('🎥 [VideoPlayer] Container encontrado, criando player...')

        // Verificar se o PandaPlayer está disponível
        if (typeof window.PandaPlayer === 'undefined') {
          throw new Error('PandaPlayer não está disponível')
        }

        // Criar ID único para o player
        const playerId = `panda-${videoId}-${Date.now()}`
        console.log('🎥 [VideoPlayer] Player ID:', playerId)

        // Configurar o container
        containerRef.current.id = playerId
        containerRef.current.innerHTML = '' // Limpar conteúdo anterior

        // Criar o player
        const player = new window.PandaPlayer(playerId, {
          library_id: videoId,
          width: '100%',
          height: '100%',
          autoplay: false,
          controls: true
        })

        console.log('🎥 [VideoPlayer] Player criado:', player)

        // Configurar eventos
        player.on('ready', () => {
          console.log('✅ [VideoPlayer] Player pronto')
          setIsPlayerReady(true)
          setIsLoading(false)
        })

        player.on('play', () => {
          console.log('▶️ [VideoPlayer] Vídeo iniciado')
          setIsPlaying(true)
        })

        player.on('pause', () => {
          console.log('⏸️ [VideoPlayer] Vídeo pausado')
          setIsPlaying(false)
        })

        player.on('timeupdate', (event: any) => {
          if (event.data?.currentTime) {
            setCurrentTime(event.data.currentTime)
          }
          if (event.data?.duration) {
            setDuration(event.data.duration)
          }
        })

        player.on('volumechange', (event: any) => {
          if (event.data?.volume !== undefined) {
            setVolume(event.data.volume)
            setIsMuted(event.data.volume === 0)
          }
        })

        player.on('fullscreenchange', (event: any) => {
          if (event.data?.isFullscreen !== undefined) {
            setIsFullscreen(event.data.isFullscreen)
          }
        })

        player.on('error', (event: any) => {
          console.error('❌ [VideoPlayer] Erro no player:', event)
          setError('Erro no player de vídeo')
          setIsLoading(false)
        })

        // Salvar referência do player
        playerRef.current = player

      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao inicializar player:', error)
        setError(`Erro ao inicializar player: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setIsLoading(false)
      }
    }

    // Aguardar um pouco mais para garantir que tudo está pronto
    const timer = setTimeout(initPlayer, 1000)

    return () => {
      clearTimeout(timer)
      if (playerRef.current) {
        try {
          console.log('🎥 [VideoPlayer] Destruindo player...')
          playerRef.current.destroy?.()
        } catch (error) {
          console.error('❌ [VideoPlayer] Erro ao destruir player:', error)
        }
      }
    }
  }, [videoId, scriptLoadedRef.current])

  // Funções de controle do player
  const handlePlay = () => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.play()
      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao reproduzir:', error)
      }
    }
  }

  const handlePause = () => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.pause()
      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao pausar:', error)
      }
    }
  }

  const handleSeek = (time: number) => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.setCurrentTime(time)
      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao buscar tempo:', error)
      }
    }
  }

  const handleVolume = (newVolume: number) => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.setVolume(newVolume)
      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao alterar volume:', error)
      }
    }
  }

  const handleToggleMute = () => {
    if (isMuted) {
      handleVolume(volume || 1)
    } else {
      handleVolume(0)
    }
  }

  const handleToggleFullscreen = () => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.toggleFullscreen()
      } catch (error) {
        console.error('❌ [VideoPlayer] Erro ao alternar fullscreen:', error)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {title || `Vídeo ${videoId}`}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Player Container */}
        <div className="relative">
          {isLoading && !error && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Carregando player...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-50 dark:bg-red-950/20 flex items-center justify-center z-10">
              <div className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                  Erro no Player
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Container do Player */}
          <div 
            ref={containerRef}
            className="w-full h-96 bg-gray-900 relative"
            style={{ minHeight: '400px' }}
          >
            {/* O Pandavideo irá inserir o player aqui */}
          </div>
        </div>

        {/* Controles */}
        {isPlayerReady && !error && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <Button
                variant="outline"
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              {/* Tempo */}
              <div className="flex items-center gap-2 text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolume(parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSeek(0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 