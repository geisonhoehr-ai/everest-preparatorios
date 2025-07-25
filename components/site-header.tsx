"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

const marqueeMessages = [
  "🎯 Mantenha o foco! Você está mais perto do seu objetivo.",
  "📺 Próxima live: 10/08 às 19h com o Prof. Tiago Costa!",
  "📚 Não esqueça de revisar seus flashcards hoje!",
  "🎓 Simulado CIAAR disponível - teste seus conhecimentos agora!",
  "✅ Nova redação corrigida disponível em seu perfil.",
  "🔥 Sua sequência de estudos: 5 dias consecutivos!"
];

function HeaderMarquee() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // Após fade out, troca a mensagem e faz fade in
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % marqueeMessages.length);
        setIsVisible(true);
      }, 600); // 600ms para a transição de fade out
    }, 5000); // Troca de mensagem a cada 5 segundos (mais lento)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden h-8">
      <div 
        className={`text-sm text-white/95 font-medium text-center px-4 transition-all duration-700 ease-in-out transform ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2'
        }`}
      >
        {marqueeMessages[currentMessageIndex]}
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-gradient-to-r from-orange-500 to-orange-700 backdrop-blur-lg shadow-lg">
      <div className="container flex h-16 items-center justify-between py-4 gap-2">
        <div className="flex items-center space-x-2 min-w-fit flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <Sparkles className="h-6 w-6 text-white flex-shrink-0" />
            <span className="font-bold text-lg text-white whitespace-nowrap">Everest Preparatórios</span>
          </Link>
        </div>
        <HeaderMarquee />
        <div className="w-2 flex-shrink-0" /> {/* Espaçador menor para manter o layout centrado */}
      </div>
    </header>
  )
}
