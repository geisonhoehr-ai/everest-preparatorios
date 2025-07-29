"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Settings, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  Shield,
  Lock,
  Clock,
  HardDrive,
  Folder,
  Copy
} from "lucide-react"
import { gradients } from "@/lib/gradients"

interface PandavideoVideo {
  id: string
  title: string
  description?: string
  duration: number
  thumbnail?: string
  status: 'processing' | 'ready' | 'error'
  created_at: string
  folder_id?: string
}

interface PandavideoFolder {
  id: string
  name: string
  videos: PandavideoVideo[]
}

export function PandavideoIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videos, setVideos] = useState<PandavideoVideo[]>([])
  const [folders, setFolders] = useState<PandavideoFolder[]>([])
  const [apiKey, setApiKey] = useState("")
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [connectionType, setConnectionType] = useState<'api_key' | 'oauth2'>('oauth2')
  const [oauthClientId, setOauthClientId] = useState("28444mbcl1t9570i0gfnod8l7i")
  const [oauthClientSecret, setOauthClientSecret] = useState("huvj3e0rqra9uu1vfm99olqk2hvi3f9na370fdeb32lbh9nhttb")
  const [error, setError] = useState<string | null>(null)

  // Verificar se já existe uma API key salva
  useEffect(() => {
    console.log('🎥 [Pandavideo] useEffect executando...')
    console.log('🎥 [Pandavideo] URL atual:', window.location.href)
    console.log('🎥 [Pandavideo] Parâmetros da URL:', window.location.search)
    
    // Verificar se há erros na URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    const errorMessage = urlParams.get('message')
    
    if (errorParam) {
      console.error('❌ [Pandavideo] Erro detectado na URL:', errorParam, errorMessage)
      setError(`Erro OAuth: ${errorMessage || errorParam}`)
      
      // Limpar URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      newUrl.searchParams.delete('message')
      window.history.replaceState({}, '', newUrl.toString())
      
      return
    }
    
    const savedApiKey = localStorage.getItem('pandavideo_api_key')
    const savedOauthData = localStorage.getItem('pandavideo_oauth_data')
    
    // Verificar se há token na URL (após redirecionamento OAuth2)
    const tokenFromUrl = urlParams.get('token')
    const expiresInFromUrl = urlParams.get('expires_in')
    const successParam = urlParams.get('success')
    
    console.log('🎥 [Pandavideo] Parâmetros da URL:')
    console.log('  - token:', tokenFromUrl ? 'encontrado' : 'não encontrado')
    console.log('  - expires_in:', expiresInFromUrl)
    console.log('  - success:', successParam)
    
    if (tokenFromUrl) {
      console.log('🎥 [Pandavideo] Token encontrado na URL, salvando...')
      console.log('🎥 [Pandavideo] Token (primeiros 10 chars):', tokenFromUrl.substring(0, 10) + '...')
      
      // Salvar token no localStorage
      localStorage.setItem('pandavideo_access_token', tokenFromUrl)
      if (expiresInFromUrl) {
        localStorage.setItem('pandavideo_token_expires', expiresInFromUrl)
      }
      
      // Limpar URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('token')
      newUrl.searchParams.delete('expires_in')
      newUrl.searchParams.delete('success')
      window.history.replaceState({}, '', newUrl.toString())
      
      console.log('🎥 [Pandavideo] URL limpa:', newUrl.toString())
      
      // Configurar como conectado
      setConnectionType('oauth2')
      setIsConnected(true)
      setError(null)
      
      console.log('🎥 [Pandavideo] Configurado como conectado, agendando busca de vídeos...')
      
      // Buscar vídeos automaticamente
      setTimeout(() => {
        console.log('🎥 [Pandavideo] Executando busca automática de vídeos...')
        fetchVideosWithOAuth()
      }, 1000)
      
      return
    }
    
    console.log('🎥 [Pandavideo] Nenhum token na URL, verificando dados salvos...')
    console.log('🎥 [Pandavideo] API Key salva:', savedApiKey ? 'encontrada' : 'não encontrada')
    console.log('🎥 [Pandavideo] OAuth Data salva:', savedOauthData ? 'encontrada' : 'não encontrada')
    
    if (savedApiKey) {
      console.log('🎥 [Pandavideo] Usando API Key salva...')
      setApiKey(savedApiKey)
      setConnectionType('api_key')
      setIsConnected(true)
      fetchVideos(savedApiKey)
    } else if (savedOauthData) {
      console.log('🎥 [Pandavideo] Usando dados OAuth salvos...')
      const oauthData = JSON.parse(savedOauthData)
      setOauthClientId(oauthData.clientId)
      setOauthClientSecret(oauthData.clientSecret)
      setConnectionType('oauth2')
      setIsConnected(true)
      fetchVideosWithOAuth()
    } else {
      console.log('🎥 [Pandavideo] Nenhuma conexão salva encontrada')
    }
  }, [])

  // Verificar se o token é válido
  const checkTokenValidity = async (token: string): Promise<boolean> => {
    try {
      console.log('🎥 [Pandavideo] Verificando validade do token...')
      
      const response = await fetch('https://api-v2.pandavideo.com.br/videos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 401) {
        console.log('❌ [Pandavideo] Token expirado ou inválido')
        localStorage.removeItem('pandavideo_access_token')
        localStorage.removeItem('pandavideo_token_expires')
        return false
      }
      
      console.log('✅ [Pandavideo] Token válido')
      return response.ok
    } catch (error) {
      console.error('❌ [Pandavideo] Erro ao verificar token:', error)
      return false
    }
  }

  // Iniciar fluxo OAuth
  const initiateOAuthFlow = () => {
    console.log('🎥 [Pandavideo] Iniciando fluxo OAuth...')
    
    // Detectar se estamos em desenvolvimento ou produção
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const redirectUri = isDevelopment 
      ? 'http://localhost:3000/api/pandavideo/callback'
      : 'https://everestpreparatorios.com.br/api/pandavideo/callback'
    
    console.log('🎥 [Pandavideo] Ambiente:', isDevelopment ? 'Desenvolvimento' : 'Produção')
    console.log('🎥 [Pandavideo] URL de callback:', redirectUri)
    
    const state = Math.random().toString(36).substring(7)
    
    const authUrl = `https://app.pandavideo.com.br/oauth/authorize?` +
      `client_id=${encodeURIComponent(oauthClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=read&` +
      `state=${state}`
    
    console.log('🎥 [Pandavideo] URL de autorização:', authUrl)
    
    // Salvar dados OAuth
    localStorage.setItem('pandavideo_oauth_data', JSON.stringify({
      clientId: oauthClientId,
      clientSecret: oauthClientSecret,
      redirectUri: redirectUri
    }))
    
    // Salvar state para verificação
    localStorage.setItem('pandavideo_oauth_state', state)
    
    // Redirecionar para autorização
    window.location.href = authUrl
  }

  const handleConnectWithAPIKey = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, insira sua API Key do Pandavideo')
      return
    }

    setIsLoading(true)
    try {
      // Testar a conexão com a API
      const response = await fetch('https://api-v2.pandavideo.com.br/videos', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVideos(data.data || [])
        setIsConnected(true)
        localStorage.setItem('pandavideo_api_key', apiKey)
        setIsConfigDialogOpen(false)
        
        // Buscar pastas também
        await fetchFolders(apiKey)
      } else {
        throw new Error('API Key inválida')
      }
    } catch (error) {
      console.error('Erro ao conectar com Pandavideo:', error)
      alert('Erro ao conectar com Pandavideo. Verifique sua API Key.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectWithOAuth = async () => {
    if (!oauthClientId.trim() || !oauthClientSecret.trim()) {
      alert('Por favor, preencha o Client ID e Client Secret')
      return
    }

    setIsLoading(true)
    try {
      console.log('🎥 [Pandavideo] Iniciando conexão OAuth2...')
      
      // Verificar se já existe um token válido
      const existingToken = localStorage.getItem('pandavideo_access_token')
      if (existingToken) {
        console.log('🎥 [Pandavideo] Token existente encontrado, verificando validade...')
        const isValid = await checkTokenValidity(existingToken)
        
        if (isValid) {
          console.log('✅ [Pandavideo] Token válido, conectando...')
          setConnectionType('oauth2')
          setIsConnected(true)
          setError(null)
          fetchVideosWithOAuth()
          setIsConfigDialogOpen(false)
          return
        } else {
          console.log('❌ [Pandavideo] Token inválido, iniciando novo fluxo...')
        }
      }
      
      // Iniciar fluxo OAuth
      initiateOAuthFlow()
      
    } catch (error) {
      console.error('Erro ao iniciar OAuth:', error)
      alert('Erro ao iniciar autenticação OAuth.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVideos = async (key: string) => {
    try {
      const response = await fetch('https://api-v2.pandavideo.com.br/videos', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVideos(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error)
    }
  }

  // Buscar vídeos usando OAuth2
  const fetchVideosWithOAuth = async () => {
    if (!isConnected) {
      console.log('❌ Não conectado ao Pandavideo')
      return
    }

    setIsLoading(true)
    try {
      console.log('🎥 [Pandavideo] Buscando vídeos com OAuth2...')
      console.log('🎥 [Pandavideo] Status de conexão:', isConnected)
      console.log('🎥 [Pandavideo] Tipo de conexão:', connectionType)
      
      // Buscar o token do localStorage
      let token = localStorage.getItem('pandavideo_access_token')
      console.log('🎥 [Pandavideo] Token do localStorage:', token ? 'encontrado' : 'não encontrado')
      
      if (!token) {
        console.error('❌ [Pandavideo] Token não encontrado')
        console.error('❌ [Pandavideo] URL atual:', window.location.href)
        console.error('❌ [Pandavideo] Parâmetros da URL:', window.location.search)
        setError('Token de acesso não encontrado. Reconecte ao Pandavideo.')
        setIsConnected(false)
        return
      }

      // Verificar se o token é válido
      const isValid = await checkTokenValidity(token)
      if (!isValid) {
        console.error('❌ [Pandavideo] Token inválido')
        setError('Token de acesso inválido. Reconecte ao Pandavideo.')
        setIsConnected(false)
        return
      }

      console.log('🎥 [Pandavideo] Token válido, fazendo requisição...')
      console.log('🎥 [Pandavideo] Token (primeiros 10 chars):', token.substring(0, 10) + '...')

      // Buscar vídeos da API do Pandavideo
      const response = await fetch('https://api-v2.pandavideo.com.br/videos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [Pandavideo] Erro na API:', response.status, errorText)
        throw new Error(`Erro na API: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ [Pandavideo] Resposta da API:', data)

      if (data.videos && Array.isArray(data.videos)) {
        setVideos(data.videos)
        console.log(`✅ [Pandavideo] ${data.videos.length} vídeos encontrados`)
      } else if (data.data && Array.isArray(data.data)) {
        setVideos(data.data)
        console.log(`✅ [Pandavideo] ${data.data.length} vídeos encontrados`)
      } else {
        console.log('⚠️ [Pandavideo] Formato de resposta inesperado:', data)
        setVideos([])
      }

      // Buscar pastas/folders também
      await fetchFoldersWithOAuth(token)

    } catch (error) {
      console.error('❌ [Pandavideo] Erro ao buscar vídeos:', error)
      setError(`Erro ao buscar vídeos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar pastas usando OAuth2
  const fetchFoldersWithOAuth = async (token: string) => {
    try {
      console.log('🎥 [Pandavideo] Buscando pastas...')
      
      const response = await fetch('https://api-v2.pandavideo.com.br/folders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [Pandavideo] Pastas encontradas:', data)
        
        if (data.folders && Array.isArray(data.folders)) {
          setFolders(data.folders)
        } else if (data.data && Array.isArray(data.data)) {
          setFolders(data.data)
        }
      } else {
        console.log('⚠️ [Pandavideo] Não foi possível buscar pastas')
      }
    } catch (error) {
      console.error('❌ [Pandavideo] Erro ao buscar pastas:', error)
    }
  }

  const fetchFolders = async (key: string) => {
    try {
      const response = await fetch('https://api-v2.pandavideo.com.br/folders', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFolders(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar pastas:', error)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('pandavideo_api_key')
    localStorage.removeItem('pandavideo_oauth_data')
    localStorage.removeItem('pandavideo_access_token')
    localStorage.removeItem('pandavideo_token_expires')
    localStorage.removeItem('pandavideo_oauth_state')
    setIsConnected(false)
    setVideos([])
    setFolders([])
    setApiKey("")
    setOauthClientId("28444mbcl1t9570i0gfnod8l7i")
    setOauthClientSecret("huvj3e0rqra9uu1vfm99olqk2hvi3f9na370fdeb32lbh9nhttb")
    setError(null)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500'
      case 'processing': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Pronto'
      case 'processing': return 'Processando'
      case 'error': return 'Erro'
      default: return 'Desconhecido'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'default'
      case 'processing': return 'secondary'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integração Pandavideo</h2>
          <p className="text-muted-foreground">
            Conecte sua conta Pandavideo para importar seus vídeos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button variant="outline" onClick={handleDisconnect}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          ) : (
            <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button className={gradients.buttonOrange}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Conectar Pandavideo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Conectar com Pandavideo</DialogTitle>
                  <DialogDescription>
                    Escolha o método de autenticação para conectar sua conta
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={connectionType} onValueChange={(value) => setConnectionType(value as 'api_key' | 'oauth2')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="oauth2" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      OAuth2 (Recomendado)
                    </TabsTrigger>
                    <TabsTrigger value="api_key" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Key
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="oauth2" className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          Método Seguro OAuth2
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Use OAuth2 para uma integração mais segura e sem expor suas credenciais.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Client ID</label>
                        <Input
                          value={oauthClientId}
                          onChange={(e) => setOauthClientId(e.target.value)}
                          placeholder="Seu Client ID do Pandavideo"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Client Secret</label>
                        <Input
                          type="password"
                          value={oauthClientSecret}
                          onChange={(e) => setOauthClientSecret(e.target.value)}
                          placeholder="Seu Client Secret do Pandavideo"
                        />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p>✅ Credenciais OAuth2 configuradas automaticamente</p>
                        <p className="mt-1">URL de callback: <code className="bg-muted px-1 rounded">{'https://everestpreparatorios.com.br/api/pandavideo/callback'}</code></p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="api_key" className="space-y-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800 dark:text-orange-300">
                          Método API Key
                        </span>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        Use API Key para uma integração mais simples (menos seguro).
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Sua API Key do Pandavideo"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Encontre sua API Key em: 
                        <a 
                          href="https://app.pandavideo.com.br/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline ml-1"
                        >
                          app.pandavideo.com.br/api-keys
                        </a>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={connectionType === 'oauth2' ? handleConnectWithOAuth : handleConnectWithAPIKey}
                    disabled={isLoading || (connectionType === 'oauth2' ? (!oauthClientId.trim() || !oauthClientSecret.trim()) : !apiKey.trim())}
                    className={gradients.buttonOrange}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    {connectionType === 'oauth2' ? 'Conectar com OAuth2' : 'Conectar com API Key'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Status da Conexão */}
      {isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800">Conectado ao Pandavideo</span>
            <Badge variant="secondary" className="text-xs">
              {connectionType === 'oauth2' ? 'OAuth2' : 'API Key'}
            </Badge>
          </div>
          
          <div className="text-sm text-green-700 mb-3">
            {videos.length > 0 ? (
              <span>{videos.length} vídeos encontrados</span>
            ) : (
              <span>0 vídeos encontrados</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => connectionType === 'oauth2' ? fetchVideosWithOAuth() : fetchVideos(apiKey)}
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Buscar Vídeos
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDisconnect}
            >
              Desconectar
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Lista de Vídeos */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vídeos Encontrados ({videos.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video: any, index: number) => (
              <Card key={video.id || index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title || 'Thumbnail'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Play className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Informações do Vídeo */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {video.title || video.name || `Vídeo ${index + 1}`}
                      </h4>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        {video.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                        
                        {video.size && (
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            <span>{formatFileSize(video.size)}</span>
                          </div>
                        )}
                        
                        {video.status && (
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={getStatusVariant(video.status)}
                              className="text-xs"
                            >
                              {video.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* ID do Vídeo */}
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        ID: {video.id || 'N/A'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(video.id || '')
                          // Aqui você pode adicionar um toast
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Pastas */}
      {folders.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Pastas Encontradas ({folders.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder: any, index: number) => (
              <Card key={folder.id || index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Folder className="h-8 w-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {folder.name || folder.title || `Pasta ${index + 1}`}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {folder.video_count || 0} vídeos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instruções */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Como conectar sua conta Pandavideo</CardTitle>
            <CardDescription>
              Escolha o método de autenticação mais adequado para você:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">🔐 OAuth2 (Recomendado)</h4>
              <p className="text-sm text-muted-foreground">
                Método mais seguro que não expõe suas credenciais. Requer configuração no painel do Pandavideo.
              </p>
              
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  📋 Configuração OAuth2 no Pandavideo
                </h5>
                <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                  <p>1. Acesse: <a href="https://app.pandavideo.com.br/oauth/applications" target="_blank" rel="noopener noreferrer" className="underline">app.pandavideo.com.br/oauth/applications</a></p>
                  <p>2. Crie uma nova aplicação OAuth2</p>
                  <p>3. Configure as URLs de callback:</p>
                  <div className="ml-4 space-y-1">
                    <p><strong>Desenvolvimento:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://localhost:3000/api/pandavideo/callback</code></p>
                    <p><strong>Produção:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">https://everestpreparatorios.com.br/api/pandavideo/callback</code></p>
                  </div>
                  <p>4. Use as credenciais configuradas automaticamente</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">🔑 API Key</h4>
              <p className="text-sm text-muted-foreground">
                Método mais simples, mas menos seguro. Ideal para testes rápidos.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">📋 Próximos Passos</h4>
              <p className="text-sm text-muted-foreground">
                Clique em "Conectar Pandavideo" e escolha o método de sua preferência.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 