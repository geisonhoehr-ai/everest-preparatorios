'use client'

import React from 'react'
import Image from 'next/image'

interface ProfessorPhotoProps {
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
}

export default function ProfessorPhoto({ size = 'md', priority = true }: ProfessorPhotoProps) {
  const sizes = {
    sm: { container: 'w-32 h-32', inset: 'inset-3' },
    md: { container: 'w-48 h-48', inset: 'inset-4' },
    lg: { container: 'w-64 h-64', inset: 'inset-5' }
  }

  const currentSize = sizes[size]

  return (
    <div className={`relative ${currentSize.container} mx-auto md:mx-0 mb-8`}>
      {/* Efeito LED girando ao redor da foto */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 via-blue-500 via-green-500 to-orange-500 bg-[length:400%_400%] animate-spin-slow"></div>

      {/* Borda interna com gradiente */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-400 via-pink-400 via-purple-400 via-blue-400 via-green-400 to-orange-400 bg-[length:400%_400%] animate-spin-slow-reverse"></div>

      {/* Container da foto com fundo escuro */}
      <div className={`absolute ${currentSize.inset} rounded-full bg-black p-1`}>
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <Image
            src="/professor-tiago-costa.jpg"
            alt="Professor Tiago Costa - Especialista em Português e Redação para concursos militares"
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 768px) 150px, (max-width: 1024px) 200px, 250px"
            quality={90}
          />
        </div>
      </div>

      {/* Efeito de brilho pulsante */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 animate-pulse"></div>
    </div>
  )
}
