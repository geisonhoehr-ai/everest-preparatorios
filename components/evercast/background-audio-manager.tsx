'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/auth-context'

interface BackgroundAudioManagerProps {
  currentLesson: any
  isPlaying: boolean
  onPlayPause: (playing: boolean) => void
  onTimeUpdate: (time: number) => void
  onEnded: () => void
}

export function BackgroundAudioManager({
  currentLesson,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onEnded
}: BackgroundAudioManagerProps) {
  const { user } = useAuth()
  const [isBackgroundMode, setIsBackgroundMode] = useState(false)
  const [mediaSessionSupported, setMediaSessionSupported] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaSessionRef = useRef<MediaSession | null>(null)

  // Verificar suporte ao Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator) {
      setMediaSessionSupported(true)
      mediaSessionRef.current = navigator.mediaSession
    }
  }, [])

  // Configurar Media Session para controle em background
  useEffect(() => {
    if (!mediaSessionSupported || !currentLesson) return

    const mediaSession = navigator.mediaSession

    // Metadados da música
    mediaSession.metadata = new MediaMetadata({
      title: currentLesson.title,
      artist: 'EverCast - Everest Preparatórios',
      album: currentLesson.module?.name || 'Curso de Áudio',
      artwork: [
        {
          src: '/icons/evercast-icon-96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/evercast-icon-128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/evercast-icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/evercast-icon-256.png',
          sizes: '256x256',
          type: 'image/png'
        }
      ]
    })

    // Ações de controle
    mediaSession.setActionHandler('play', () => {
      if (audioRef.current) {
        audioRef.current.play()
        onPlayPause(true)
      }
    })

    mediaSession.setActionHandler('pause', () => {
      if (audioRef.current) {
        audioRef.current.pause()
        onPlayPause(false)
      }
    })

    mediaSession.setActionHandler('stop', () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        onPlayPause(false)
      }
    })

    mediaSession.setActionHandler('seekbackward', (details) => {
      if (audioRef.current) {
        const skipTime = details.seekOffset || 10
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime)
      }
    })

    mediaSession.setActionHandler('seekforward', (details) => {
      if (audioRef.current) {
        const skipTime = details.seekOffset || 10
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration,
          audioRef.current.currentTime + skipTime
        )
      }
    })

    mediaSession.setActionHandler('seekto', (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime
      }
    })

    // Atualizar estado de reprodução
    mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

  }, [currentLesson, isPlaying, mediaSessionSupported, onPlayPause])

  // Configurar áudio para background
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    // Configurações para background
    audio.preload = 'metadata'
    audio.crossOrigin = 'anonymous'

    // Event listeners
    const handleTimeUpdate = () => {
      onTimeUpdate(audio.currentTime)
      
      // Atualizar posição no Media Session
      if (mediaSessionSupported && navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration || 0,
          playbackRate: audio.playbackRate,
          position: audio.currentTime
        })
      }
    }

    const handleEnded = () => {
      onEnded()
      if (mediaSessionSupported && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'none'
      }
    }

    const handlePlay = () => {
      onPlayPause(true)
      if (mediaSessionSupported && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'playing'
      }
    }

    const handlePause = () => {
      onPlayPause(false)
      if (mediaSessionSupported && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'paused'
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBackgroundMode(true)
      } else {
        setIsBackgroundMode(false)
      }
    }

    // Adicionar event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Configurar Wake Lock para manter o dispositivo ativo
    let wakeLock: WakeLockSentinel | null = null
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
          console.log('🔒 Wake Lock ativado para background audio')
        }
      } catch (err) {
        console.log('⚠️ Wake Lock não suportado:', err)
      }
    }

    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release()
        wakeLock = null
        console.log('🔓 Wake Lock liberado')
      }
    }

    if (isPlaying) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      releaseWakeLock()
    }
  }, [isPlaying, onTimeUpdate, onEnded, onPlayPause, mediaSessionSupported])

  // Atualizar src do áudio quando a aula mudar
  useEffect(() => {
    if (!audioRef.current || !currentLesson) return

    const audio = audioRef.current
    const audioUrl = currentLesson.audio_url || currentLesson.hls_url || currentLesson.embed_url

    if (audioUrl) {
      audio.src = audioUrl
      audio.load()
    }
  }, [currentLesson])

  // Controlar reprodução
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error)
        onPlayPause(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, onPlayPause])

  return (
    <>
      {/* Elemento de áudio oculto para background */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Indicador de modo background */}
      {isBackgroundMode && (
        <div className="fixed top-4 right-4 z-50 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          🎧 Tocando em background
        </div>
      )}
    </>
  )
}

// Hook para gerenciar background audio
export function useBackgroundAudio() {
  const [isBackgroundSupported, setIsBackgroundSupported] = useState(false)
  const [wakeLockSupported, setWakeLockSupported] = useState(false)

  useEffect(() => {
    // Verificar suporte ao Media Session API
    if ('mediaSession' in navigator) {
      setIsBackgroundSupported(true)
    }

    // Verificar suporte ao Wake Lock API
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true)
    }
  }, [])

  return {
    isBackgroundSupported,
    wakeLockSupported,
    hasFullSupport: isBackgroundSupported && wakeLockSupported
  }
}
