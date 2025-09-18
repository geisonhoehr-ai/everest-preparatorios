'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { BackgroundAudioManager, useBackgroundAudio } from './background-audio-manager'

interface EnhancedAudioPlayerProps {
  currentLesson: any
  isPlaying: boolean
  onPlayPause: (playing: boolean) => void
  onNext: () => void
  onPrevious: () => void
  currentTime: number
  duration: number
  volume: number
  onVolumeChange: (volume: number) => void
  isMuted: boolean
  onMuteToggle: () => void
  isLooping: boolean
  onLoopToggle: () => void
  className?: string
}

export function EnhancedAudioPlayer({
  currentLesson,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  isLooping,
  onLoopToggle,
  className = ''
}: EnhancedAudioPlayerProps) {
  const { isBackgroundSupported, wakeLockSupported, hasFullSupport } = useBackgroundAudio()
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (value: number[]) => {
    // Implementar seek quando necessário
    console.log('Seek to:', value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0] / 100)
  }

  return (
    <>
      {/* Background Audio Manager */}
      <BackgroundAudioManager
        currentLesson={currentLesson}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onTimeUpdate={(time) => console.log('Time update:', time)}
        onEnded={onNext}
      />

      {/* Player Interface */}
      <Card className={`bg-white/90 dark:bg-black/90 backdrop-blur-sm border-gray-200 dark:border-white/10 ${className}`}>
        <div className="p-4">
          {/* Informações da aula */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {currentLesson?.title || 'Nenhuma aula selecionada'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {currentLesson?.module?.name || 'EverCast'}
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>

          {/* Controles principais */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            {/* Shuffle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffling(!isShuffling)}
              className={isShuffling ? 'text-orange-600' : 'text-gray-400'}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            {/* Anterior */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="text-gray-600 dark:text-gray-300"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            {/* Play/Pause */}
            <Button
              onClick={() => onPlayPause(!isPlaying)}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full w-12 h-12"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            {/* Próximo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="text-gray-600 dark:text-gray-300"
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            {/* Loop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoopToggle}
              className={isLooping ? 'text-orange-600' : 'text-gray-400'}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Controles de volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMuteToggle}
                className="text-gray-600 dark:text-gray-300"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                
                {showVolumeSlider && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
                    <Slider
                      value={[volume * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20 h-2"
                      orientation="vertical"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Indicador de suporte a background */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {hasFullSupport && (
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Background</span>
                </span>
              )}
              {isBackgroundSupported && !wakeLockSupported && (
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Parcial</span>
                </span>
              )}
              {!isBackgroundSupported && (
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Limitado</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
