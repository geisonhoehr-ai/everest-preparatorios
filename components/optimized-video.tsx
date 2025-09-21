"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  title: string;
  description: string;
  className?: string;
}

export function OptimizedVideo({ 
  src, 
  poster, 
  title, 
  description, 
  className = "" 
}: OptimizedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: "100px",
        threshold: 0.1 
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-4 sm:p-6 border-2 border-orange-500/30 shadow-lg ${className}`}
    >
      <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden mb-4 border border-orange-500/20 relative">
        {!isIntersecting ? (
          // Placeholder com thumbnail
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-12 h-12 text-orange-400 mx-auto mb-2" />
              <p className="text-white text-sm">Clique para carregar</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls={false}
              preload="metadata"
              muted={isMuted}
              playsInline
              onLoadedData={handleLoadedData}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster={poster}
            >
              <source src={src.replace('.mp4', '.webm')} type="video/webm" />
              <source src={src} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>

            {/* Controles customizados */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
              <button
                onClick={handlePlayPause}
                className="bg-orange-500 hover:bg-orange-600 rounded-full p-3 transition-colors duration-200"
                aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {/* Botão de mute */}
            <button
              onClick={handleMuteToggle}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors duration-200"
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Loading indicator */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
          </>
        )}
      </div>
      
      <h3 className="text-lg font-bold mb-2 text-orange-400 px-1">{title}</h3>
      <p className="text-sm text-gray-300 px-1">{description}</p>
    </div>
  );
}
