"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function MobileOptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: MobileOptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
    if (!priority) {
      if (!imgRef.current) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        },
        {
          rootMargin: isMobile ? '20px' : '50px',
          threshold: 0.1
        }
      );

      observerRef.current.observe(imgRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    } else {
      setIsInView(true);
    }
  }, [priority, isMobile]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Se houve erro, mostrar placeholder
  if (hasError) {
    return (
      <div
        className={cn(
          "bg-gray-100 flex items-center justify-center text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  // Gerar srcSet otimizado para mobile
  const generateSrcSet = (baseSrc: string) => {
    const baseName = baseSrc.replace(/\.[^/.]+$/, "");
    const extension = baseSrc.split('.').pop();
    
    return {
      webp: `${baseName}-320.webp 320w, ${baseName}-640.webp 640w, ${baseName}-1280.webp 1280w`,
      avif: `${baseName}-320.avif 320w, ${baseName}-640.avif 640w, ${baseName}-1280.avif 1280w`,
      fallback: `${baseName}-320.${extension} 320w, ${baseName}-640.${extension} 640w, ${baseName}-1280.${extension} 1280w`
    };
  };

  const srcSet = generateSrcSet(src);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Imagem otimizada */}
      {isInView && (
        <picture>
          {/* AVIF para browsers modernos */}
          <source
            srcSet={srcSet.avif}
            sizes={sizes}
            type="image/avif"
          />
          
          {/* WebP para browsers compatíveis */}
          <source
            srcSet={srcSet.webp}
            sizes={sizes}
            type="image/webp"
          />
          
          {/* Fallback para browsers antigos */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            srcSet={srcSet.fallback}
            sizes={sizes}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
          />
        </picture>
      )}
    </div>
  );
}
