"use client"

import { useState, useRef } from "react"
import { AvatarWithAutoFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  email: string | null
  currentAvatarUrl?: string | null
  onAvatarUpdate?: (newUrl: string) => void
}

export function AvatarUpload({ email, currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError, warning } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      showError("Erro", "Por favor, selecione apenas arquivos de imagem.")
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Erro", "A imagem deve ter no máximo 5MB.")
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file || !email) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const supabase = createClient()
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${email.replace('@', '_at_')}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Erro no upload:', error)
        throw new Error('Erro ao fazer upload da imagem')
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        setUploadProgress(100)
        success("Sucesso!", "Avatar atualizado com sucesso.")
        
        // Limpar preview
        setPreviewUrl(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Chamar callback
        onAvatarUpdate?.(urlData.publicUrl)
      }

    } catch (error) {
      console.error('Erro no upload:', error)
      showError("Erro", "Erro ao fazer upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!email) return

    try {
      setIsUploading(true)
      
      const supabase = createClient()
      
      // Remover arquivo do storage
      const fileName = `${email.replace('@', '_at_')}_${Date.now()}`
      const { error } = await supabase.storage
        .from('user-avatars')
        .remove([`avatars/${fileName}`])

      if (error) {
        console.error('Erro ao remover avatar:', error)
      }

      success("Avatar removido", "Avatar removido com sucesso.")
      
      // Limpar preview e chamar callback
      setPreviewUrl(null)
      onAvatarUpdate?.('')

    } catch (error) {
      console.error('Erro ao remover avatar:', error)
      showError("Erro", "Erro ao remover avatar. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const clearPreview = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto do Perfil
        </CardTitle>
        <CardDescription>
          Faça upload de uma nova foto para seu perfil. Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <AvatarWithAutoFallback
              email={email}
              src={previewUrl || currentAvatarUrl}
              size="xl"
              className="h-20 w-20"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="text-white text-xs">Uploading...</div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium">Avatar Atual</p>
            <p className="text-xs text-muted-foreground">
              {previewUrl ? "Nova imagem selecionada" : 
               currentAvatarUrl ? "Imagem personalizada" : "Avatar automático baseado no email"}
            </p>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Selecionar Imagem
            </Button>
            
            {previewUrl && (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {isUploading ? "Fazendo Upload..." : "Salvar Avatar"}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={clearPreview}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
            
            {currentAvatarUrl && !previewUrl && (
              <Button
                variant="destructive"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remover Avatar
              </Button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Formatos aceitos: JPG, PNG, GIF</p>
          <p>• Tamanho máximo: 5MB</p>
          <p>• Dimensões recomendadas: 400x400 pixels</p>
          <p>• Se não fizer upload, será usado o avatar automático baseado no seu email</p>
        </div>
      </CardContent>
    </Card>
  )
} 