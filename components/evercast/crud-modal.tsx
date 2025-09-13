'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Save, 
  Upload, 
  FileAudio, 
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { AudioUpload } from './audio-upload'
import { ConfirmationDialog } from './confirmation-dialog'
import { 
  createAudioCourse, 
  updateAudioCourse, 
  deleteAudioCourse,
  createAudioModule, 
  updateAudioModule, 
  deleteAudioModule,
  createAudioLesson, 
  updateAudioLesson, 
  deleteAudioLesson,
  type AudioCourse, 
  type AudioModule, 
  type AudioLesson 
} from '@/actions-evercast-client'

interface CrudModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'course' | 'module' | 'lesson'
  item?: AudioCourse | AudioModule | AudioLesson | null
  parentItem?: AudioCourse | AudioModule | null
  onSuccess: () => void
  userUuid: string
}

export function CrudModal({ 
  isOpen, 
  onClose, 
  type, 
  item, 
  parentItem, 
  onSuccess, 
  userUuid 
}: CrudModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    duration_seconds: 0,
    order_index: 0,
    is_preview: false,
    audio_url: '',
    hls_url: '',
    soundcloud_url: '',
    embed_url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return 'Curso'
      case 'module': return 'Módulo'
      case 'lesson': return 'Aula'
      default: return 'Item'
    }
  }

  const isEditing = !!item
  const title = isEditing ? `Editar ${getTypeLabel(type)}` : `Criar ${getTypeLabel(type)}`

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          name: (item as any).name || (item as any).title || '',
          description: (item as any).description || '',
          duration: (item as any).duration || '',
          duration_seconds: (item as any).duration_seconds || 0,
          order_index: (item as any).order_index || 0,
          is_preview: (item as any).is_preview || false,
          audio_url: (item as any).audio_url || '',
          hls_url: (item as any).hls_url || '',
          soundcloud_url: (item as any).soundcloud_url || '',
          embed_url: (item as any).embed_url || ''
        })
      } else {
        setFormData({
          name: '',
          description: '',
          duration: '',
          duration_seconds: 0,
          order_index: 0,
          is_preview: false,
          audio_url: '',
          hls_url: '',
          soundcloud_url: '',
          embed_url: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, item])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (type === 'lesson') {
      if (!formData.audio_url && !formData.hls_url && !formData.soundcloud_url && !formData.embed_url) {
        newErrors.audio_url = 'Pelo menos uma URL de áudio é obrigatória'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setIsLoading(true)
    try {
      if (type === 'course') {
        if (isEditing) {
          await updateAudioCourse(userUuid, item!.id, formData)
          toast.success('Curso atualizado com sucesso!')
        } else {
          await createAudioCourse(userUuid, formData)
          toast.success('Curso criado com sucesso!')
        }
      } else if (type === 'module') {
        if (isEditing) {
          await updateAudioModule(userUuid, item!.id, {
            ...formData,
            course_id: parentItem!.id
          })
          toast.success('Módulo atualizado com sucesso!')
        } else {
          await createAudioModule(userUuid, {
            ...formData,
            course_id: parentItem!.id
          })
          toast.success('Módulo criado com sucesso!')
        }
      } else if (type === 'lesson') {
        if (isEditing) {
          await updateAudioLesson(userUuid, item!.id, {
            ...formData,
            module_id: parentItem!.id
          })
          toast.success('Aula atualizada com sucesso!')
        } else {
          await createAudioLesson(userUuid, {
            ...formData,
            module_id: parentItem!.id
          })
          toast.success('Aula criada com sucesso!')
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (!item) return
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!item) return

    setIsDeleting(true)
    try {
      if (type === 'course') {
        await deleteAudioCourse(userUuid, item.id)
      } else if (type === 'module') {
        await deleteAudioModule(userUuid, item.id)
      } else if (type === 'lesson') {
        await deleteAudioLesson(userUuid, item.id)
      }

      toast.success(`${getTypeLabel(type)} excluído com sucesso!`)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir. Tente novamente.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleAudioUpload = (audioUrl: string) => {
    setFormData(prev => ({ ...prev, audio_url: audioUrl }))
  }

  const handleAudioDelete = () => {
    setFormData(prev => ({ ...prev, audio_url: '' }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome/Título */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {type === 'lesson' ? 'Título da Aula' : 'Nome'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`Digite o ${type === 'lesson' ? 'título' : 'nome'}...`}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite uma descrição..."
                rows={3}
              />
            </div>

            {/* Duração (apenas para aulas) */}
            {type === 'lesson' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (formato)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Ex: 15:30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_seconds">Duração (segundos)</Label>
                  <Input
                    id="duration_seconds"
                    type="number"
                    value={formData.duration_seconds}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_seconds: parseInt(e.target.value) || 0 }))}
                    placeholder="930"
                  />
                </div>
              </div>
            )}

            {/* Ordem */}
            <div className="space-y-2">
              <Label htmlFor="order_index">Ordem</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            {/* Preview (apenas para aulas) */}
            {type === 'lesson' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_preview"
                  checked={formData.is_preview}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_preview: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_preview">Aula de preview (gratuita)</Label>
              </div>
            )}

            {/* URLs de áudio (apenas para aulas) */}
            {type === 'lesson' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload de Áudio</Label>
                  <AudioUpload
                    lessonId={item?.id || 'new'}
                    onUploadComplete={handleAudioUpload}
                    onDeleteAudio={handleAudioDelete}
                    currentAudioUrl={formData.audio_url}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hls_url">URL HLS</Label>
                  <Input
                    id="hls_url"
                    value={formData.hls_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, hls_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soundcloud_url">URL SoundCloud</Label>
                  <Input
                    id="soundcloud_url"
                    value={formData.soundcloud_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, soundcloud_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embed_url">URL de Embed</Label>
                  <Input
                    id="embed_url"
                    value={formData.embed_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, embed_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                {errors.audio_url && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.audio_url}
                  </p>
                )}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-between pt-4">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Excluir
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={`Excluir ${getTypeLabel(type)}`}
        message={`Tem certeza que deseja excluir "${(item as any)?.name || (item as any)?.title || 'este item'}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
