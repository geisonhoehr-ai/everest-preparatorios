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
  Zap,
  Loader2
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto text-center p-8">
        {/* Conteúdo do modal */}
        <div className="space-y-6">
          {/* Ícone de evolução */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
            <Crown className="w-12 h-12 text-white" />
          </div>

          {/* Título */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 PARABÉNS!
            </h2>
            <p className="text-lg text-gray-600">
              Você evoluiu para <span className="font-semibold text-orange-600">{newTitle}</span>!
            </p>
          </div>

          {/* Insígnia */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">
              🏅 Nova Insígnia: <span className="font-bold">{insignia}</span>
            </p>
          </div>

          {/* Bênção */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ✨ <span className="font-medium">{blessing}</span>
            </p>
          </div>

          {/* Atividade (se especificada) */}
          {activity && (
            <div className={`bg-gradient-to-br ${getActivityColor()} p-4 rounded-lg text-white`}>
              <p className="text-sm font-medium">
                {getActivityIcon()} Atividade: {activity.charAt(0).toUpperCase() + activity.slice(1)}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button 
              onClick={handleShare}
              disabled={sharing}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {sharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compartilhando...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </div>

        {/* Modal de opções de compartilhamento */}
        {showSocialOptions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-4">Compartilhar em:</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => shareToSocial('whatsapp')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareToSocial('facebook')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Facebook
                </Button>
                <Button
                  onClick={() => shareToSocial('twitter')}
                  className="bg-blue-400 hover:bg-blue-500"
                >
                  Twitter
                </Button>
                <Button
                  onClick={() => shareToSocial('linkedin')}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  LinkedIn
                </Button>
              </div>
              <Button
                onClick={() => setShowSocialOptions(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Adicionar export default para compatibilidade com lazy loading
export default LevelUpModal; 