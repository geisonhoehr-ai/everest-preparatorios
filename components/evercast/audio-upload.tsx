'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  FileAudio, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { fixSupabaseStorageUrl, getCorrectPublicUrl } from '@/lib/supabase/storage'

interface AudioUploadProps {
  lessonId: string
  onUploadComplete: (audioUrl: string) => void
  onDeleteAudio?: () => void
  currentAudioUrl?: string
}

export function AudioUpload({ 
  lessonId, 
  onUploadComplete, 
  onDeleteAudio,
  currentAudioUrl 
}: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para extrair o caminho do arquivo da URL
  const getFilePathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'evercast-audio')
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
    } catch (error) {
      console.error('Erro ao extrair caminho da URL:', error)
    }
    return null
  }

  // Função para excluir áudio atual
  const handleDeleteAudio = async () => {
    if (!currentAudioUrl) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const filePath = getFilePathFromUrl(currentAudioUrl)
      
      if (!filePath) {
        throw new Error('Não foi possível extrair o caminho do arquivo')
      }

      console.log('🗑️ Excluindo arquivo:', filePath)
      
      const { error } = await supabase.storage
        .from('evercast-audio')
        .remove([filePath])

      if (error) {
        console.error('❌ Erro ao excluir arquivo:', error)
        throw new Error(`Erro ao excluir áudio: ${error.message}`)
      }

      console.log('✅ Arquivo excluído com sucesso')
      onDeleteAudio?.()
      toast.success('Áudio excluído com sucesso!')
      
    } catch (error) {
      console.error('Erro ao excluir áudio:', error)
      toast.error('Erro ao excluir o áudio. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('audio/')) {
      toast.error('Por favor, selecione um arquivo de áudio válido')
      return
    }

    // Validar tamanho (máximo 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 100MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      
      // Bucket já foi criado manualmente, não precisa verificar
      console.log("📦 Usando bucket 'evercast-audio' (criado manualmente)")

      // Se já existe um áudio, usar o mesmo nome para substituir
      let fileName: string
      let filePath: string
      
      if (currentAudioUrl) {
        // Extrair nome do arquivo existente
        const existingPath = getFilePathFromUrl(currentAudioUrl)
        if (existingPath) {
          const pathParts = existingPath.split('/')
          const existingFileName = pathParts[pathParts.length - 1]
          const nameWithoutExt = existingFileName.split('.')[0]
          const fileExt = file.name.split('.').pop()
          fileName = `${nameWithoutExt}.${fileExt}`
          filePath = `lessons/${fileName}`
          console.log('🔄 Atualizando arquivo existente:', fileName)
        } else {
          // Fallback: criar novo nome
          const fileExt = file.name.split('.').pop()
          fileName = `${lessonId}_${Date.now()}.${fileExt}`
          filePath = `lessons/${fileName}`
          console.log('📝 Criando novo arquivo:', fileName)
        }
      } else {
        // Criar novo arquivo
        const fileExt = file.name.split('.').pop()
        fileName = `${lessonId}_${Date.now()}.${fileExt}`
        filePath = `lessons/${fileName}`
        console.log('📝 Criando novo arquivo:', fileName)
      }

      // Upload para Supabase Storage
      console.log('📤 Iniciando upload...')
      console.log('   - Arquivo:', file.name)
      console.log('   - Tamanho:', file.size, 'bytes')
      console.log('   - Tipo:', file.type)
      console.log('   - Caminho:', filePath)
      
      const { data, error } = await supabase.storage
        .from('evercast-audio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobrescrever arquivos existentes
        })

      if (error) {
        console.error('❌ Erro no upload:', error)
        console.error('   - Código:', error.statusCode)
        console.error('   - Mensagem:', error.message)
        console.error('   - Detalhes:', JSON.stringify(error, null, 2))
        throw new Error(`Erro ao fazer upload do áudio: ${error.message}`)
      }
      
      console.log('✅ Upload bem-sucedido:', data)

      // Gerar URL pública correta diretamente
      const projectId = 'hnhzindsfuqnaxosujay'
      const correctUrl = getCorrectPublicUrl(projectId, 'evercast-audio', filePath)
      
      setUploadProgress(100)
      console.log('✅ Upload completo:', correctUrl)
      console.log('📁 Arquivo salvo em:', filePath)
      
      onUploadComplete(correctUrl)
      toast.success(currentAudioUrl ? 'Áudio atualizado com sucesso!' : 'Áudio enviado com sucesso!')
      
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar o áudio. Tente novamente.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-gray-600 hover:border-purple-500/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Enviando áudio...</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-300">
                Arraste um arquivo de áudio aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos suportados: MP3, WAV, M4A, OGG
              </p>
              <p className="text-xs text-gray-500">
                Tamanho máximo: 100MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Arquivo atual */}
      {currentAudioUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Áudio carregado</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAudio}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">
            {currentAudioUrl.split('/').pop()}
          </p>
          <p className="text-xs text-blue-400 mt-1">
            💡 Arraste um novo arquivo para substituir ou clique no X para excluir
          </p>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <p className="font-medium mb-1">Armazenamento e Dicas:</p>
            <ul className="space-y-1 text-blue-400">
              <li>• <strong>Localização:</strong> Supabase Storage (bucket: evercast-audio)</li>
              <li>• <strong>Formato:</strong> MP3, WAV, M4A, OGG (máx 100MB)</li>
              <li>• <strong>Qualidade:</strong> Use bitrate de 128kbps ou superior</li>
              <li>• <strong>Duração:</strong> Recomendado até 2 horas por arquivo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
