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
  Headphones,
  Repeat
} from 'lucide-react'

interface MP3PlayerProps {
  audioUrl: string
  title?: string
  onTimeUpdate?: (currentTime: number) => void
  onLoadedMetadata?: (duration: number) => void
  onEnded?: () => void
  onPlayPause?: (isPlaying: boolean) => void
  className?: string
  isLooping?: boolean
  onToggleLoop?: () => void
}

export function MP3Player({ 
  audioUrl, 
  title = "Áudio MP3",
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlayPause,
  className = "",
  isLooping = false,
  onToggleLoop
}: MP3PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setIsLoading(false)
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

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        duration, 
        audioRef.current.currentTime + 10
      )
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Função de download removida conforme solicitado

  return (
    <>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ea580c;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ea580c;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.3);
        }
        
        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.3);
        }
      `}</style>
      <div className={`bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 ${className}`}>
      {/* Informações da mídia */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate text-base sm:text-lg">{title}</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <span className="bg-orange-600/20 px-3 py-1 rounded-full text-xs font-medium">
              Áudio
            </span>
          </div>
        </div>

        {/* Botões de ação - download removido */}
        <div className="flex items-center space-x-2">
          {/* Botão de download removido conforme solicitado */}
        </div>
      </div>

      {/* Controles de reprodução */}
      <div className="space-y-4">
        {/* Barra de progresso */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400 font-mono min-w-[40px]">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-gray-600/50 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
            }}
          />
          <span className="text-xs text-gray-400 font-mono min-w-[40px]">{formatTime(duration)}</span>
        </div>

        {/* Controles principais */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={skipBackward}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePlayPause}
            disabled={isLoading}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={skipForward}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Controle de volume e loop - oculto em telas pequenas */}
        <div className="hidden sm:flex items-center justify-center space-x-3">
          <Button variant="ghost" size="sm" onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-600/50 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
            }}
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
              <Repeat className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}


      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        src={audioUrl}
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
        preload="metadata"
      />
      </div>
    </>
  )
}
