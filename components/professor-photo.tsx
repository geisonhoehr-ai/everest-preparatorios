'use client'

import React from 'react'

export default function ProfessorPhoto() {
  return (
    <div className="relative w-48 h-48 mx-auto md:mx-0 mb-8">
      {/* Efeito LED girando ao redor da foto */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 via-purple-500 via-blue-500 via-green-500 to-orange-500 bg-[length:400%_400%] animate-spin-slow"></div>
      
      {/* Borda interna com gradiente */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-400 via-pink-400 via-purple-400 via-blue-400 via-green-400 to-orange-400 bg-[length:400%_400%] animate-spin-slow-reverse"></div>
      
      {/* Container da foto com fundo escuro */}
      <div className="absolute inset-4 rounded-full bg-black p-1">
        <div className="w-full h-full rounded-full overflow-hidden">
          <img
            src="/professor-tiago-costa.jpg"
            alt="Professor Tiago Costa"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
      
      {/* Efeito de brilho pulsante */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 animate-pulse"></div>
    </div>
  )
}
