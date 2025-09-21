"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  BookOpen,
  Brain
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/auth-context-custom"
import { exportFlashcardsToTxt, importFlashcardsFromTxt, getAllSubjects, getTopicsBySubject } from "../../server-actions"

interface Subject {
  id: string
  name: string
}

interface Topic {
  id: string
  name: string
  subject_id: string
}

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados das configurações originais
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)
  
  // Estados para exportação/importação
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [selectedContentType, setSelectedContentType] = useState<'flashcards' | 'quiz'>('flashcards')
  
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportResult, setExportResult] = useState<any>(null)
  const [importResult, setImportResult] = useState<any>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')

  // Carregar assuntos ao montar o componente
  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const subjects = await getAllSubjects()
      setSubjects(subjects || [])
    } catch (error) {
      console.error('Erro ao carregar assuntos:', error)
    }
  }

  const loadTopics = async (subjectId: string) => {
    try {
      const topics = await getTopicsBySubject(subjectId)
      setTopics(topics || [])
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error)
    }
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopic('all')
    if (subjectId && subjectId !== 'all') {
      loadTopics(subjectId)
    } else {
      setTopics([])
    }
  }

  const handleExport = async () => {
    if (!user?.id) return

    setIsExporting(true)
    setExportResult(null)
    
    try {
      const result = await exportFlashcardsToTxt(
        selectedSubject && selectedSubject !== 'all' ? selectedSubject : undefined,
        selectedTopic && selectedTopic !== 'all' ? selectedTopic : undefined
      )
      
      setExportResult(result)
      
      if (result.success) {
        // Criar e baixar arquivo
        const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      setExportResult({ success: false, error: 'Erro na exportação' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFileContent(content)
      }
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!user?.id || !fileContent) return

    setIsImporting(true)
    setImportResult(null)
    
    try {
      const result = await importFlashcardsFromTxt(fileContent, user.id)
      setImportResult(result)
    } catch (error) {
      console.error('Erro ao importar:', error)
      setImportResult({ success: false, error: 'Erro na importação' })
    } finally {
      setIsImporting(false)
    }
  }

  const getExportScope = () => {
    if (selectedTopic && selectedTopic !== 'all') {
      const topic = topics.find(t => t.id === selectedTopic)
      return topic?.name || 'Tópico selecionado'
    }
    if (selectedSubject && selectedSubject !== 'all') {
      const subject = subjects.find(s => s.id === selectedSubject)
      return subject?.name || 'Assunto selecionado'
    }
    return `Todos os ${selectedContentType === 'flashcards' ? 'flashcards' : 'quiz'}`
  }

  // Verificar se o usuário tem permissão para exportar/importar
  const canExportImport = profile?.role === 'administrator' || profile?.role === 'teacher'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <BackButton pageName="Configurações" />
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
          <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome Completo
              </Label>
              <Input 
                id="name" 
                placeholder="Seu nome completo" 
                defaultValue="Aluno Teste"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                defaultValue="aluno@teste.com"
                className="mt-1"
                disabled
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </Label>
              <div className="relative mt-1">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Sua senha atual"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nova Senha
              </Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="Nova senha" 
                className="mt-1"
              />
            </div>
            
            <Button className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notificações
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Receber notificações sobre novos conteúdos
                </p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modo Escuro
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Usar tema escuro na interface
                </p>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Atualizações por Email
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Receber emails sobre progresso e novidades
                </p>
              </div>
              <Switch 
                checked={emailUpdates} 
                onCheckedChange={setEmailUpdates}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacidade e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidade e Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Sessões Ativas</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerencie onde você está logado
                </p>
              </div>
              <Button variant="outline" size="sm">
                Gerenciar
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Dados Pessoais</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualizar e exportar seus dados
                </p>
              </div>
              <Button variant="outline" size="sm">
                Visualizar
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/10">
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Excluir Conta</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Esta ação não pode ser desfeita
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Exportação e Importação - Apenas para Professores e Administradores */}
      {canExportImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Exportação e Importação de Conteúdo
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exporte e importe flashcards e quiz para correção em massa e backup
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Exportação */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Exportar Conteúdo</h3>
                </div>

                {/* Seletor de Tipo de Conteúdo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Conteúdo
                  </Label>
                  <Select value={selectedContentType} onValueChange={(value: 'flashcards' | 'quiz') => setSelectedContentType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flashcards">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Flashcards
                        </div>
                      </SelectItem>
                      <SelectItem value="quiz">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Quiz
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtros */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assunto (opcional)
                    </Label>
                    <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecionar assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os assuntos</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSubject && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tópico (opcional)
                      </Label>
                      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecionar tópico" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os tópicos</SelectItem>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Informações do escopo */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Escopo da exportação:</strong> {getExportScope()}
                  </p>
                </div>

                {/* Botão de exportação */}
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar para TXT
                    </>
                  )}
                </Button>

                {/* Resultado da exportação */}
                {exportResult && (
                  <div className={`p-3 rounded-lg border ${
                    exportResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    {exportResult.success ? (
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Exportação concluída! {exportResult.count} itens exportados.
                          Arquivo baixado: {exportResult.filename}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Erro: {exportResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Importação */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Importar Conteúdo</h3>
                </div>

                {/* Seletor de arquivo */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Arquivo TXT
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {selectedFile ? selectedFile.name : 'Selecionar arquivo'}
                  </Button>
                </div>

                {/* Informações do arquivo */}
                {selectedFile && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Arquivo selecionado:</strong> {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}

                {/* Instruções */}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-semibold mb-1">Instruções:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use o arquivo TXT exportado como base</li>
                        <li>Edite as perguntas e respostas conforme necessário</li>
                        <li>Mantenha a estrutura do arquivo intacta</li>
                        <li>Conteúdo existente será atualizado</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botão de importação */}
                <Button
                  onClick={handleImport}
                  disabled={isImporting || !selectedFile}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Arquivo
                    </>
                  )}
                </Button>

                {/* Resultado da importação */}
                {importResult && (
                  <div className={`p-3 rounded-lg border ${
                    importResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    {importResult.success ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-semibold">
                            Importação concluída!
                          </span>
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          <p>Total processado: {importResult.summary?.total}</p>
                          <p>Sucessos: {importResult.summary?.success}</p>
                          {importResult.summary?.errors > 0 && (
                            <p>Erros: {importResult.summary?.errors}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Erro: {importResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Exemplo de formato */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Exemplo de Formato do Arquivo TXT:
              </h4>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre>{`# EXPORTAÇÃO DE FLASHCARDS
# Gerado em: 21/09/2025 15:30:00
# Total de flashcards: 3

## ASSUNTO: PORTUGUÊS

### TÓPICO: GRAMÁTICA

[1] ID: abc123-def456-ghi789
PERGUNTA: Qual é a regra para o uso do hífen?
RESPOSTA: O hífen é usado em palavras compostas e prefixos.
DIFICULDADE: 3
CRIADO EM: 21/09/2025 10:00:00
---`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
