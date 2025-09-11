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
  Repeat
} from 'lucide-react'

interface AudioPlayerProps {
  src: string
  isVideo?: boolean
  title?: string
  onTimeUpdate?: (currentTime: number) => void
  onLoadedMetadata?: (duration: number) => void
  onEnded?: () => void
  className?: string
  isLooping?: boolean
  onToggleLoop?: () => void
}

export function AudioPlayer({ 
  src, 
  isVideo = false, 
  title,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  className = "",
  isLooping = false,
  onToggleLoop
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para detectar se é uma URL da Pandavideo
  const isPandavideoUrl = (url: string) => {
    return url.includes('pandavideo.com.br') || url.includes('pandavideo')
  }

  // Função para extrair apenas o áudio de um vídeo
  const getAudioOnlyUrl = (videoUrl: string) => {
    // Para URLs da Pandavideo, tentamos diferentes estratégias
    if (isPandavideoUrl(videoUrl)) {
      // Estratégia 1: Adicionar parâmetro para áudio apenas
      if (videoUrl.includes('?')) {
        return `${videoUrl}&audio_only=1`
      } else {
        return `${videoUrl}?audio_only=1`
      }
    }
    return videoUrl
  }

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

  // Funções de download e abrir vídeo removidas conforme solicitado

  // Determinar a URL final (áudio apenas se for vídeo)
  const finalSrc = isVideo ? getAudioOnlyUrl(src) : src

  return (
    <div className={`bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 ${className}`}>
      {/* Informações da mídia */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <Play className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">
            {title || (isVideo ? 'Vídeo da Pandavideo' : 'Áudio')}
          </h4>
          <p className="text-sm text-gray-400">
            {isVideo ? 'Reproduzindo apenas o áudio' : 'Arquivo de áudio'}
          </p>
        </div>

        {/* Botões de ação - download e abrir vídeo removidos */}
        <div className="flex items-center space-x-2">
          {/* Botões de download e abrir vídeo removidos conforme solicitado */}
        </div>
      </div>

      {/* Controles de reprodução */}
      <div className="flex items-center space-x-4 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePlayPause}
          disabled={isLoading}
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

        {/* Controle de volume e loop */}
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
          {onToggleLoop && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleLoop}
              className={`${
                isLooping 
                  ? 'text-orange-400 hover:text-orange-300' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          {isVideo && (
            <p className="text-red-300 text-xs mt-1">
              Tentando reproduzir apenas o áudio do vídeo. Se não funcionar, 
              clique no ícone de link externo para abrir o vídeo completo.
            </p>
          )}
        </div>
      )}

      {/* Informações técnicas */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Fonte: {isVideo ? 'Vídeo (áudio apenas)' : 'Arquivo de áudio'}</p>
        {isVideo && (
          <p>URL: {src}</p>
        )}
      </div>

      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (isLooping) {
            // Se está em loop, reinicia o áudio
            if (audioRef.current) {
              audioRef.current.currentTime = 0
              audioRef.current.play()
            }
          } else {
            setIsPlaying(false)
            onEnded?.()
          }
        }}
        onError={(e) => {
          console.error('Erro no áudio:', e)
          setError('Erro ao carregar o áudio')
          setIsLoading(false)
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        src={finalSrc}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  )
}
