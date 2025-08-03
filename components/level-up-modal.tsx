"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Crown,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react"
import { generateShareText } from "@/lib/rpg-system"

interface LevelUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newLevel: number
  newTitle: string
  insignia: string
  blessing: string
  activity?: string
}

export function LevelUpModal({
  open,
  onOpenChange,
  newLevel,
  newTitle,
  insignia,
  blessing,
  activity
}: LevelUpModalProps) {
  const [showSocialOptions, setShowSocialOptions] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    try {
      setSharing(true)
      
      const shareData = {
        title: `🎉 PARABÉNS! Você evoluiu para ${newTitle}!`,
        text: `${blessing} - Everest Preparatórios`,
        url: 'https://everest-preparatorios.vercel.app',
        hashtags: ['#EverestPreparatorios', '#Conhecimento', '#Evolução']
      }

      // Tentar Web Share API primeiro
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback para redes específicas
        setShowSocialOptions(true)
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
      setShowSocialOptions(true)
    } finally {
      setSharing(false)
    }
  }

  const shareToSocial = (platform: string) => {
    const shareUrl = encodeURIComponent(window.location.href)
    const shareText = encodeURIComponent(`🎉 Acabei de evoluir para ${newTitle}! ${blessing}`)
    
    const socialLinks = {
      whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
    }
    
    window.open(socialLinks[platform as keyof typeof socialLinks], '_blank')
    setShowSocialOptions(false)
  }

  const getActivityColor = () => {
    switch (activity) {
      case 'flashcard': return 'from-purple-500 to-purple-600'
      case 'quiz': return 'from-blue-500 to-blue-600'
      case 'redacao': return 'from-green-500 to-green-600'
      case 'prova': return 'from-orange-500 to-orange-600'
      default: return 'from-purple-500 to-purple-600'
    }
  }

  const getActivityIcon = () => {
    switch (activity) {
      case 'flashcard': return '📚'
      case 'quiz': return '🧠'
      case 'redacao': return '✍️'
      case 'prova': return '📝'
      default: return '🏆'
    }
  }

  return (
    <>
      {/* Modal Principal de Parabéns */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
          <div className="text-center space-y-6 p-6">
            {/* Animação de confete */}
            <div className="confetti-animation text-2xl">
              🎉🎊🎉🎊🎉
            </div>
            
            {/* Insígnia animada */}
            <div className="text-8xl animate-bounce">
              {insignia}
            </div>
            
            {/* Título épico */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                PARABÉNS, GUERREIRO!
              </h2>
              
              <h3 className="text-xl font-semibold">
                Você evoluiu para:
              </h3>
              
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-2xl font-bold text-yellow-300">
                  {newTitle}
                </h4>
                
                {activity && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-lg">{getActivityIcon()}</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      Nível {newLevel}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bênção */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm italic text-white/90">
                "{blessing}"
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleShare}
                disabled={sharing}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold"
              >
                {sharing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Compartilhando...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Conquista
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Continuar Jornada
              </Button>
            </div>
            
            {/* Dica motivacional */}
            <div className="text-xs text-white/70 bg-white/5 rounded p-2">
              💡 Compartilhar suas conquistas motiva outros estudantes!
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Opções de Redes Sociais */}
      <Dialog open={showSocialOptions} onOpenChange={setShowSocialOptions}>
        <DialogContent className="max-w-sm">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Compartilhar Conquista</h3>
              <p className="text-sm text-muted-foreground">
                Escolha onde compartilhar sua evolução para {newTitle}:
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => shareToSocial('whatsapp')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button 
                onClick={() => shareToSocial('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              
              <Button 
                onClick={() => shareToSocial('twitter')}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              
              <Button 
                onClick={() => shareToSocial('linkedin')}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                🎉 Dica: Compartilhar suas conquistas motiva outros estudantes!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes confetti {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(90deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          75% { transform: translateY(-10px) rotate(270deg); }
        }
        
        .confetti-animation {
          animation: confetti 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
} 