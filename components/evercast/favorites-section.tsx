'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Play, 
  Clock,
  Download,
  Star,
  Music
} from 'lucide-react';
import { AudioLesson } from '@/actions-evercast-client';

interface FavoritesSectionProps {
  favoriteAudios: AudioLesson[];
  onPlayLesson: (lesson: AudioLesson) => void;
  onToggleFavorite: (lessonId: string) => void;
  onCacheAudio: (lesson: AudioLesson) => void;
  cachedAudios: Set<string>;
  currentLesson?: AudioLesson | null;
}

export default function FavoritesSection({
  favoriteAudios,
  onPlayLesson,
  onToggleFavorite,
  onCacheAudio,
  cachedAudios,
  currentLesson
}: FavoritesSectionProps) {
  const formatDuration = (seconds: number | string) => {
    const numSeconds = typeof seconds === 'string' ? parseInt(seconds) || 0 : seconds;
    const mins = Math.floor(numSeconds / 60);
    const secs = Math.floor(numSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioType = (lesson: AudioLesson) => {
    if (lesson.hls_url) return 'HLS';
    if (lesson.audio_url) return 'MP3';
    if (lesson.soundcloud_url) return 'SoundCloud';
    return 'Embed';
  };

  const getAudioTypeColor = (type: string) => {
    switch (type) {
      case 'HLS': return 'bg-blue-500/20 text-blue-300';
      case 'MP3': return 'bg-green-500/20 text-green-300';
      case 'SoundCloud': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (favoriteAudios.length === 0) {
    return (
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            Nenhum áudio favorito ainda
          </h3>
          <p className="text-gray-400 text-sm">
            Toque no coração ❤️ para adicionar áudios aos seus favoritos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-red-900/20 to-pink-900/20 backdrop-blur-sm border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          Meus Áudios Favoritos
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
            {favoriteAudios.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favoriteAudios.map((lesson, index) => {
            const isCached = cachedAudios.has(lesson.id);
            const isCurrent = currentLesson?.id === lesson.id;
            const audioType = getAudioType(lesson);

            return (
              <div
                key={lesson.id}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-orange-500/30 border-orange-500 shadow-lg shadow-orange-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Ícone de música */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCurrent 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                      : 'bg-gradient-to-br from-red-500 to-pink-500'
                  }`}>
                    <Music className="w-5 h-5 text-white" />
                  </div>

                  {/* Informações da aula */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${
                      isCurrent ? 'text-orange-300' : 'text-white'
                    }`}>
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getAudioTypeColor(audioType)}`}
                      >
                        {audioType}
                      </Badge>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatDuration(lesson.duration || 0)}
                      </div>
                      {isCached && (
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <Download className="w-3 h-3" />
                          Offline
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-1">
                    {/* Botão de cache */}
                    {!isCached && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCacheAudio(lesson)}
                        className="text-gray-400 hover:text-white p-2"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Botão de favorito (remover) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFavorite(lesson.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>

                    {/* Botão de play */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayLesson(lesson)}
                      className={`p-2 ${
                        isCurrent 
                          ? 'text-orange-400 hover:text-orange-300' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
