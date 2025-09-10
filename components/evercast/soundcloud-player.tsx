'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react'

interface SoundCloudPlayerProps {
  soundcloudUrl: string
  title?: string
  onPlayPause?: (isPlaying: boolean) => void
  className?: string
}

export function SoundCloudPlayer({ 
  soundcloudUrl, 
  title = "Áudio do SoundCloud",
  onPlayPause,
  className = ""
}: SoundCloudPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para extrair o ID do SoundCloud da URL
  const getSoundCloudId = (url: string): string | null => {
    try {
      // Padrões de URL do SoundCloud
      const patterns = [
        /soundcloud\.com\/[^\/]+\/[^\/]+\/s-([a-zA-Z0-9]+)/,
        /soundcloud\.com\/[^\/]+\/[^\/]+\/([a-zA-Z0-9]+)/,
        /soundcloud\.com\/[^\/]+\/([a-zA-Z0-9]+)/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
      }
      
      return null
    } catch {
      return null
    }
  }

  // Função para gerar URL de embed do SoundCloud
  const getEmbedUrl = (url: string): string => {
    const id = getSoundCloudId(url)
    if (!id) return url
    
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
  }

  const handlePlayPause = () => {
    const newPlaying = !isPlaying
    setIsPlaying(newPlaying)
    onPlayPause?.(newPlaying)
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleOpenSoundCloud = () => {
    window.open(soundcloudUrl, '_blank')
  }

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    // Simular carregamento
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [soundcloudUrl])

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <VolumeX className="w-5 h-5" />
          <span className="font-medium">Erro ao carregar áudio</span>
        </div>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button
          onClick={handleOpenSoundCloud}
          className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir no SoundCloud
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">SoundCloud</p>
            </div>
          </div>
          
          <button
            onClick={handleOpenSoundCloud}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Abrir no SoundCloud"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Player */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Carregando áudio...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Controles */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              
              <button
                onClick={handleMute}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="text-sm text-gray-600">
                  {isPlaying ? 'Reproduzindo...' : 'Pausado'}
                </div>
              </div>
            </div>

            {/* Embed do SoundCloud */}
            <div className="mt-4">
              <iframe
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={getEmbedUrl(soundcloudUrl)}
                className="rounded-lg"
              />
            </div>

            {/* Link direto */}
            <div className="pt-2 border-t border-gray-100">
              <a
                href={soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvir no SoundCloud
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
