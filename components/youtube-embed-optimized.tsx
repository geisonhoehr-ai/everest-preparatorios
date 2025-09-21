"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubeEmbedOptimizedProps {
  videoId: string;
  title: string;
  className?: string;
}

export function YouTubeEmbedOptimized({ 
  videoId, 
  title, 
  className = "" 
}: YouTubeEmbedOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLoadVideo = () => {
    setIsLoading(true);
    // Simular carregamento para melhor UX
    setTimeout(() => {
      setIsLoaded(true);
      setIsLoading(false);
    }, 500);
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!isLoaded ? (
        <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden border-2 border-orange-500/30 m-2">
          {/* Thumbnail com efeito LED */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-75 blur-sm"></div>
          
          <div className="relative w-full h-full flex items-center justify-center">
            {isIntersecting ? (
              <div className="relative">
                {/* Thumbnail do YouTube */}
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover opacity-80"
                  loading="lazy"
                />
                
                {/* Overlay com botão de play */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    onClick={handleLoadVideo}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 p-0 shadow-2xl hover:scale-110 transition-all duration-300"
                    aria-label={`Reproduzir vídeo: ${title}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    )}
                  </Button>
                </div>

                {/* Badge do YouTube */}
                <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  YouTube
                </div>
              </div>
            ) : (
              /* Placeholder enquanto não está visível */
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Play className="w-12 h-12 mb-2" />
                <p className="text-sm">Clique para carregar o vídeo</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Iframe do YouTube carregado */
        <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden border-2 border-orange-500/30 m-2">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="w-full h-full absolute inset-0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
