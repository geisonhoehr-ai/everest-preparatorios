'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Heart, 
  Download,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AudioModule, AudioLesson } from '@/actions-evercast-client';

interface MobileModuleAccordionProps {
  module: AudioModule;
  isExpanded: boolean;
  onToggle: () => void;
  onPlayLesson: (lesson: AudioLesson) => void;
  onToggleFavorite: (lessonId: string) => void;
  onCacheAudio: (lesson: AudioLesson) => void;
  favoriteAudios: Set<string>;
  cachedAudios: Set<string>;
  isLooping: boolean;
  onToggleLoop: () => void;
  currentLesson?: AudioLesson | null;
}

export default function MobileModuleAccordion({
  module,
  isExpanded,
  onToggle,
  onPlayLesson,
  onToggleFavorite,
  onCacheAudio,
  favoriteAudios,
  cachedAudios,
  isLooping,
  onToggleLoop,
  currentLesson
}: MobileModuleAccordionProps) {
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

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10 mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {module.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{module.name}</h3>
              <p className="text-gray-400 text-sm">
                {module.audio_lessons?.length || 0} aulas • {formatDuration(module.total_duration || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {module.audio_lessons?.map((lesson, index) => {
              const isFavorite = favoriteAudios.has(lesson.id);
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
                    {/* Número da aula */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCurrent 
                        ? 'bg-orange-500 shadow-lg shadow-orange-500/30' 
                        : 'bg-gray-700'
                    }`}>
                      <span className="text-white text-sm font-medium">
                        {index + 1}
                      </span>
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

                      {/* Botão de favorito */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(lesson.id)}
                        className={`p-2 ${
                          isFavorite 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            isFavorite ? 'fill-current' : ''
                          }`} 
                        />
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
      )}
    </Card>
  );
}
