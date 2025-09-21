"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface MobileVideoStrategyProps {
  src: string;
  title: string;
  description: string;
  className?: string;
}

export function MobileVideoStrategy({ 
  src, 
  title, 
  description, 
  className = "" 
}: MobileVideoStrategyProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        rootMargin: isMobile ? "50px" : "100px",
        threshold: 0.1 
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile]);

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
      <div className={`${isMobile ? 'aspect-[9/16]' : 'aspect-[9/16]'} bg-black rounded-xl overflow-hidden mb-4 border border-orange-500/20 relative`}>
        {!isIntersecting ? (
          // Placeholder mobile-otimizado
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <Play className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-orange-400 mx-auto mb-2`} />
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white`}>Clique para carregar</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls={false}
              preload={isMobile ? "none" : "metadata"}
              muted={isMuted}
              playsInline
              onLoadedData={handleLoadedData}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster={`${src.replace('.mp4', '-poster.jpg')}`}
            >
              {/* Mobile: WebM preferencial, Desktop: MP4 */}
              {isMobile ? (
                <>
                  <source src={src.replace('.mp4', '.webm')} type="video/webm" />
                  <source src={src} type="video/mp4" />
                </>
              ) : (
                <>
                  <source src={src} type="video/mp4" />
                  <source src={src.replace('.mp4', '.webm')} type="video/webm" />
                </>
              )}
              Seu navegador não suporta vídeos.
            </video>

            {/* Controles customizados - menores no mobile */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
              <button
                onClick={handlePlayPause}
                className={`bg-orange-500 hover:bg-orange-600 rounded-full transition-colors duration-200 ${isMobile ? 'p-2' : 'p-3'}`}
                aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
              >
                {isPlaying ? (
                  <Pause className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
                ) : (
                  <Play className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
                )}
              </button>
            </div>

            {/* Botão de mute - menor no mobile */}
            <button
              onClick={handleMuteToggle}
              className={`absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200 ${isMobile ? 'p-1' : 'p-2'}`}
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? (
                <VolumeX className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
              ) : (
                <Volume2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
              )}
            </button>

            {/* Loading indicator - menor no mobile */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}></div>
              </div>
            )}
          </>
        )}
      </div>
      
      <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-2 text-orange-400 px-1`}>{title}</h3>
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 px-1`}>{description}</p>
    </div>
  );
}
