'use client'

import { Loader2, FileAudio, BookOpen, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingStatesProps {
  type: 'courses' | 'modules' | 'lessons' | 'audio' | 'upload'
  message?: string
}

export function LoadingStates({ type, message }: LoadingStatesProps) {
  const getLoadingConfig = () => {
    switch (type) {
      case 'courses':
        return {
          icon: <BookOpen className="w-8 h-8 text-orange-500" />,
          title: 'Carregando cursos...',
          description: 'Buscando seus cursos de áudio disponíveis',
          defaultMessage: 'Aguarde enquanto carregamos seus cursos de áudio'
        }
      case 'modules':
        return {
          icon: <FileAudio className="w-8 h-8 text-orange-500" />,
          title: 'Carregando módulos...',
          description: 'Organizando o conteúdo do curso',
          defaultMessage: 'Preparando os módulos para você'
        }
      case 'lessons':
        return {
          icon: <Play className="w-8 h-8 text-orange-500" />,
          title: 'Carregando aulas...',
          description: 'Listando as aulas disponíveis',
          defaultMessage: 'Organizando as aulas do módulo'
        }
      case 'audio':
        return {
          icon: <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />,
          title: 'Preparando áudio...',
          description: 'Carregando o arquivo de áudio',
          defaultMessage: 'Aguarde enquanto preparamos o áudio para reprodução'
        }
      case 'upload':
        return {
          icon: <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />,
          title: 'Enviando arquivo...',
          description: 'Fazendo upload do seu áudio',
          defaultMessage: 'Enviando e processando o arquivo de áudio'
        }
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />,
          title: 'Carregando...',
          description: 'Processando sua solicitação',
          defaultMessage: 'Aguarde um momento'
        }
    }
  }

  const config = getLoadingConfig()

  return (
    <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {config.icon}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {message || config.defaultMessage}
            </p>
          </div>

          {/* Barra de progresso animada */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>

          {/* Dicas contextuais */}
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            {type === 'courses' && (
              <>
                <p>💡 Dica: Os cursos são organizados por módulos e aulas</p>
                <p>🎧 Você pode reproduzir os áudios em qualquer ordem</p>
              </>
            )}
            {type === 'upload' && (
              <>
                <p>📤 Seu arquivo está sendo enviado com segurança</p>
                <p>🎵 A compressão automática otimiza o tamanho</p>
              </>
            )}
            {type === 'audio' && (
              <>
                <p>🔊 Preparando o player de áudio</p>
                <p>⏯️ Controles de reprodução serão habilitados em breve</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para loading inline
export function InlineLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}

// Componente para loading de botão
export function ButtonLoading({ children, loading, ...props }: any) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// Componente para skeleton loading
export function SkeletonCard() {
  return (
    <Card className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-gray-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para skeleton de lista
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
