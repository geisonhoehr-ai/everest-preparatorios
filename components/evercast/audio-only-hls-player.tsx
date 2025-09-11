'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AudioOnlyHLSPlayerProps {
  hlsUrl: string;
  title?: string;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

export default function AudioOnlyHLSPlayer({ 
  hlsUrl, 
  title = 'Áudio HLS',
  onError,
  onLoadStart,
  onLoadEnd 
}: AudioOnlyHLSPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configurar HLS.js para reprodução apenas de áudio
  useEffect(() => {
    if (!hlsUrl || !audioRef.current) return;

    const audio = audioRef.current;
    let hls: any = null;

    const setupHLS = async () => {
      try {
        setIsLoading(true);
        onLoadStart?.();
        setError(null);

        // Verificar se o navegador suporta HLS nativamente
        if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari - reprodução nativa
          audio.src = hlsUrl;
          audio.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          // Outros navegadores - usar HLS.js
          hls = new window.Hls({
            // Configurações otimizadas para áudio
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferHole: 0.1,
            highBufferWatchdogPeriod: 2,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 3,
            maxFragLookUpTolerance: 0.2,
            liveSyncDurationCount: 2,
            liveMaxLatencyDurationCount: 5,
            liveDurationInfinity: true,
            liveBackBufferLength: 0,
            maxLiveSyncPlaybackRate: 1.5,
            liveSyncDuration: 2,
            liveSyncDurationCount: 2,
            liveMaxLatencyDurationCount: 5,
            liveDurationInfinity: true,
            liveBackBufferLength: 0,
            maxLiveSyncPlaybackRate: 1.5,
            // Configurações específicas para áudio
            audioPreference: 'audio',
            audioCodecSwitch: true,
            // Desabilitar vídeo
            videoPreference: false,
            videoCodecSwitch: false,
            // Configurações de rede
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 3,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 3,
            // Debug
            debug: false,
            // CORS
            xhrSetup: (xhr: XMLHttpRequest) => {
              xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            }
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(audio);

          // Event listeners para HLS
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            console.log('[HLS] Manifest carregado com sucesso');
            setIsLoading(false);
            onLoadEnd?.();
          });

          hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
            console.error('[HLS] Erro:', data);
            
            if (data.fatal) {
              switch (data.type) {
                case window.Hls.ErrorTypes.NETWORK_ERROR:
                  setError('Erro de rede. Verificando conectividade...');
                  hls.startLoad();
                  break;
                case window.Hls.ErrorTypes.MEDIA_ERROR:
                  setError('Erro de mídia. Tentando recuperar...');
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Erro fatal. Reiniciando player...');
                  hls.destroy();
                  setupHLS();
                  break;
              }
            }
          });
        } else {
          throw new Error('HLS não suportado neste navegador');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar áudio';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      }
    };

    setupHLS();

    // Cleanup
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [hlsUrl, onError, onLoadStart, onLoadEnd]);

  // Event listeners do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleVolumeChange = () => setVolume(audio.volume);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Controles do player
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {/* Player de áudio */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Controles */}
      <div className="space-y-4">
        {/* Botão Play/Pause */}
        <div className="flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !!error}
            className="w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading || !!error}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controle de volume */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Status e erros */}
      {isLoading && (
        <div className="mt-4 text-center text-blue-600">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Carregando áudio...
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
