'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Calendar,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
import { importEaofCronograma } from '../../app/server-actions'

interface CronogramaImporterProps {
  onImportComplete: () => void
  userRole: string
  userId: string
}

export function CronogramaImporter({ onImportComplete, userRole, userId }: CronogramaImporterProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Verificar se o usuário tem permissão
  const canImport = userRole === 'admin' || userRole === 'teacher'

  const handleImportCronograma = async () => {
    if (!canImport) {
      toast.error('Você não tem permissão para importar cronogramas')
      return
    }

    setIsImporting(true)
    setImportStatus('idle')

    try {
      const result = await importEaofCronograma(userId)
      
      if (result.success) {
        setImportStatus('success')
        toast.success(`Cronograma EAOF 2026 importado com sucesso! ${result.count} eventos criados.`)
        onImportComplete()
      } else {
        throw new Error('Falha na importação')
      }
    } catch (error) {
      setImportStatus('error')
      toast.error('Erro ao importar cronograma')
      console.error('Erro na importação:', error)
    } finally {
      setIsImporting(false)
    }
  }

  if (!canImport) {
    return null
  }

  return (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Cronograma EAOF 2026
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">Este cronograma inclui:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>15 Mentorias</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>10 Simulados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>9 Resoluções</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>10 Entregas</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleImportCronograma}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importar Cronograma
              </>
            )}
          </Button>

          {importStatus === 'success' && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Importado
            </Badge>
          )}

          {importStatus === 'error' && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Erro
            </Badge>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>⚠️ Esta ação irá adicionar todos os eventos do cronograma EAOF 2026 ao calendário.</p>
          <p>Os eventos serão criados com as datas e horários especificados no cronograma oficial.</p>
        </div>
      </CardContent>
    </Card>
  )
}
