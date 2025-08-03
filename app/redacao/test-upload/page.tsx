"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createRedacao } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, Upload, Send } from "lucide-react"

export default function TestUploadPage() {
  const [titulo, setTitulo] = useState("")
  const [temaId, setTemaId] = useState("1")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleTestUpload = async () => {
    if (!titulo || !temaId || selectedFiles.length === 0) {
      toast.error("Preencha todos os campos")
      return
    }

    setUploading(true)
    console.log("🧪 [TEST] Iniciando teste de upload...")
    console.log("📝 Dados:", { titulo, temaId, numFiles: selectedFiles.length })

    try {
      const result = await createRedacao({
        titulo,
        tema_id: parseInt(temaId),
        observacoes: "Teste de upload",
        imagens: selectedFiles
      })

      console.log("📋 [TEST] Resultado:", result)

      if (result.success) {
        toast.success("✅ Teste de upload bem-sucedido!")
        setTitulo("")
        setSelectedFiles([])
      } else {
        toast.error(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      console.error("❌ [TEST] Erro:", error)
      toast.error("Erro no teste")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Upload de Redação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da Redação</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da redação"
            />
          </div>

          <div>
            <Label htmlFor="tema">ID do Tema</Label>
            <Input
              id="tema"
              type="number"
              value={temaId}
              onChange={(e) => setTemaId(e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="files">Arquivos</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFiles.length} arquivo(s) selecionado(s)
              </p>
            )}
          </div>

          <Button
            onClick={handleTestUpload}
            disabled={uploading || !titulo || !temaId || selectedFiles.length === 0}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Testar Upload
              </>
            )}
          </Button>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">📋 Instruções de Teste:</h4>
            <ol className="text-sm space-y-1">
              <li>1. Preencha o título da redação</li>
              <li>2. Use o ID do tema (1, 2, 3, etc.)</li>
              <li>3. Selecione arquivos (imagens ou PDFs)</li>
              <li>4. Clique em "Testar Upload"</li>
              <li>5. Verifique o console do navegador para logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 