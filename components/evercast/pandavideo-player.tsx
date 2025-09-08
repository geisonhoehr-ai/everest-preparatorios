'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Headphones
} from 'lucide-react'

interface PandavideoPlayerProps {
  videoId: string
  title?: string
  onTimeUpdate?: (currentTime: number) => void
  onLoadedMetadata?: (duration: number) => void
  onEnded?: () => void
  className?: string
}

export function PandavideoPlayer({ 
  videoId, 
  title = "Vídeo da Pandavideo",
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  className = ""
}: PandavideoPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Extrair o ID do vídeo da URL completa
  const extractVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/)
    return match ? match[1] : videoId
  }

  // Gerar URLs alternativas para tentar extrair áudio
  const generateAudioUrls = (videoId: string) => {
    const baseUrl = `https://player-vz-e9d62059-4a4.tv.pandavideo.com.br`
    const urls = []
    
    // Estratégias para extrair áudio
    const strategies = [
      `/embed/?v=${videoId}&audio_only=1`,
      `/embed/?v=${videoId}&format=audio`,
      `/embed/?v=${videoId}&stream=audio`,
      `/embed/?v=${videoId}&audio=1`,
      `/embed/?v=${videoId}&type=audio`,
      `/embed/?v=${videoId}&media=audio`,
      `/embed/?v=${videoId}&playback=audio`,
      `/embed/?v=${videoId}&mode=audio`,
      `/embed/?v=${videoId}&output=audio`,
      `/embed/?v=${videoId}&extract=audio`
    ]
    
    strategies.forEach(strategy => {
      urls.push(`${baseUrl}${strategy}`)
    })
    
    // Tentar com diferentes extensões
    const audioExtensions = ['.mp3', '.aac', '.ogg', '.wav', '.m4a']
    audioExtensions.forEach(ext => {
      urls.push(`${baseUrl}/audio/${videoId}${ext}`)
      urls.push(`${baseUrl}/stream/${videoId}${ext}`)
      urls.push(`${baseUrl}/media/${videoId}${ext}`)
    })
    
    return urls
  }

  // Testar URLs e encontrar uma que funcione
  const findWorkingAudioUrl = async (videoId: string) => {
    const urls = generateAudioUrls(videoId)
    
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          console.log(`✅ URL de áudio encontrada: ${url}`)
          return url
        }
      } catch (error) {
        console.log(`❌ URL não funciona: ${url}`)
      }
    }
    
    // Se nenhuma URL de áudio funcionar, usar a URL original do vídeo
    console.log(`⚠️  Nenhuma URL de áudio encontrada, usando vídeo original`)
    return `https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/?v=${videoId}`
  }

  // Carregar a URL de áudio quando o componente montar
  useEffect(() => {
    const loadAudioUrl = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const url = await findWorkingAudioUrl(videoId)
        setAudioUrl(url)
      } catch (error) {
        console.error('Erro ao carregar URL de áudio:', error)
        setError('Erro ao carregar o áudio')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAudioUrl()
  }, [videoId])

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return

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
      setError('Erro ao reproduzir o áudio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
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
    const videoUrl = `https://player-vz-e9d62059-4a4.tv.pandavideo.com.br/embed/?v=${videoId}`
    window.open(videoUrl, '_blank')
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
          <p className="text-sm text-gray-400">
            {audioUrl?.includes('audio') ? 'Reproduzindo apenas o áudio' : 'Vídeo da Pandavideo'}
          </p>
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
          disabled={isLoading || !audioUrl}
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
            Clique no ícone de link externo para abrir o vídeo completo no navegador.
          </p>
        </div>
      )}

      {/* Informações técnicas */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Fonte: Pandavideo (áudio extraído)</p>
        <p>ID do Vídeo: {videoId}</p>
        {audioUrl && (
          <p>URL: {audioUrl}</p>
        )}
      </div>

      {/* Elemento de áudio oculto */}
      {audioUrl && (
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
            setError('Erro ao carregar o áudio')
            setIsLoading(false)
          }}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          src={audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
    </div>
  )
}
