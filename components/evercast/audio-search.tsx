'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, CheckCircle, XCircle, Music, ExternalLink, List } from 'lucide-react'

interface AudioSearchProps {
  onAudioFound: (audioData: any) => void
  currentVideoId?: string
}

export function AudioSearch({ onAudioFound, currentVideoId }: AudioSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [videoId, setVideoId] = useState(currentVideoId || '')
  const [searchType, setSearchType] = useState<'id' | 'title'>('title')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recentVideos, setRecentVideos] = useState<any[]>([])

  // Carregar vídeos recentes
  useEffect(() => {
    loadRecentVideos()
  }, [])

  const loadRecentVideos = async () => {
    try {
      const response = await fetch('/api/pandavideo/videos?limit=5')
      const result = await response.json()
      
      if (result.success) {
        setRecentVideos(result.videos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos recentes:', error)
    }
  }

  const searchAudio = async () => {
    if (searchType === 'id' && !videoId.trim()) {
      setError('Digite o ID do vídeo')
      return
    }

    if (searchType === 'title' && !searchQuery.trim()) {
      setError('Digite o título do vídeo')
      return
    }

    setIsSearching(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('🎵 [AudioSearch] Buscando áudio:', { searchType, query: searchType === 'id' ? videoId : searchQuery })
      
      const response = await fetch('/api/pandavideo/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: searchType === 'id' ? videoId.trim() : undefined,
          title: searchType === 'title' ? searchQuery.trim() : undefined
        })
      })

      const result = await response.json()
      console.log('📊 [AudioSearch] Resultado da busca:', result)

      if (result.success) {
        onAudioFound(result.audio)
        setSuccess(`Áudio encontrado: ${result.audio.title}`)
        setError(null)
      } else {
        setError(result.error || 'Erro na busca do áudio')
        setSuccess(null)
      }
    } catch (err) {
      console.error('❌ [AudioSearch] Erro de conexão:', err)
      setError('Erro de conexão. Tente novamente.')
      setSuccess(null)
    } finally {
      setIsSearching(false)
    }
  }

  const selectVideo = (video: any) => {
    setVideoId(video.id)
    setSearchQuery(video.title)
    setSearchType('id')
  }

  const openPandaVideo = () => {
    window.open('https://app.pandavideo.com.br/videos', '_blank')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Buscar Áudio no PandaVideo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de busca */}
        <div className="flex space-x-2">
          <Select value={searchType} onValueChange={(value: 'id' | 'title') => setSearchType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Por Título</SelectItem>
              <SelectItem value="id">Por ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campo de busca */}
        <div className="flex space-x-2">
          <Input
            value={searchType === 'id' ? videoId : searchQuery}
            onChange={(e) => {
              if (searchType === 'id') {
                setVideoId(e.target.value)
              } else {
                setSearchQuery(e.target.value)
              }
            }}
            placeholder={searchType === 'id' ? 'Digite o ID do vídeo...' : 'Digite o título do vídeo...'}
            className="flex-1"
            disabled={isSearching}
          />
          <Button
            onClick={searchAudio}
            disabled={isSearching || (!videoId.trim() && !searchQuery.trim())}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Buscar
          </Button>
        </div>

        {/* Vídeos recentes */}
        {recentVideos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vídeos Recentes:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => selectVideo(video)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <List className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{video.title}</span>
                    <span className="text-xs text-gray-500">({video.id})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão para abrir PandaVideo */}
        <div className="flex justify-end">
          <Button
            onClick={openPandaVideo}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir PandaVideo
          </Button>
        </div>

        {/* Sucesso */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">Sucesso:</span>
            </div>
            <p className="text-green-600 text-sm mt-1">{success}</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-medium">Erro:</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
