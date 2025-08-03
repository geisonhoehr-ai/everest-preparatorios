"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPandavideoPage() {
  const [urlParams, setUrlParams] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [localStorageToken, setLocalStorageToken] = useState<string>("")
  const [cookies, setCookies] = useState<string>("")

  useEffect(() => {
    // Capturar parâmetros da URL
    const params = window.location.search
    setUrlParams(params)
    
    // Verificar token na URL
    const urlParamsObj = new URLSearchParams(params)
    const tokenFromUrl = urlParamsObj.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      console.log('🎥 [TEST] Token encontrado na URL:', tokenFromUrl.substring(0, 20) + '...')
    }
    
    // Verificar localStorage
    const storedToken = localStorage.getItem('pandavideo_access_token')
    if (storedToken) {
      setLocalStorageToken(storedToken)
      console.log('🎥 [TEST] Token encontrado no localStorage:', storedToken.substring(0, 20) + '...')
    }
    
    // Verificar cookies
    setCookies(document.cookie)
    console.log('🎥 [TEST] Todos os cookies:', document.cookie)
  }, [])

  const handleSaveToken = () => {
    if (token) {
      localStorage.setItem('pandavideo_access_token', token)
      setLocalStorageToken(token)
      console.log('🎥 [TEST] Token salvo no localStorage')
    }
  }

  const handleClearToken = () => {
    localStorage.removeItem('pandavideo_access_token')
    setLocalStorageToken("")
    console.log('🎥 [TEST] Token removido do localStorage')
  }

  const handleTestAPI = async () => {
    const storedToken = localStorage.getItem('pandavideo_access_token')
    if (!storedToken) {
      alert('Nenhum token encontrado')
      return
    }

    try {
      console.log('🎥 [TEST] Testando API com token...')
      const response = await fetch('https://api-v2.pandavideo.com.br/videos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [TEST] API funcionando:', data)
        alert(`API funcionando! ${data.videos?.length || data.data?.length || 0} vídeos encontrados`)
      } else {
        const errorText = await response.text()
        console.error('❌ [TEST] Erro na API:', response.status, errorText)
        alert(`Erro na API: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('❌ [TEST] Erro ao testar API:', error)
      alert(`Erro ao testar API: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Teste Pandavideo</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da URL</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>URL atual:</strong> {window.location.href}</p>
          <p><strong>Parâmetros:</strong> {urlParams}</p>
          <p><strong>Token na URL:</strong> {token ? `${token.substring(0, 20)}...` : 'Não encontrado'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>localStorage</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Token no localStorage:</strong> {localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'Não encontrado'}</p>
          <div className="flex gap-2 mt-2">
            <Button onClick={handleSaveToken} disabled={!token}>
              Salvar Token da URL
            </Button>
            <Button onClick={handleClearToken} variant="outline">
              Limpar Token
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Cookies:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {cookies || 'Nenhum cookie encontrado'}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste da API</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestAPI} disabled={!localStorageToken}>
            Testar API Pandavideo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Teste com token:</strong></p>
            <a 
              href="/test-pandavideo?token=test_token_123&success=pandavideo_connected" 
              className="text-blue-500 hover:underline block"
            >
              /test-pandavideo?token=test_token_123&success=pandavideo_connected
            </a>
            
            <p className="mt-4"><strong>Teste OAuth2:</strong></p>
            <a 
              href="https://app.pandavideo.com.br/oauth/authorize?client_id=28444mbcl1t9570i0gfnod8l7i&redirect_uri=https%3A%2F%2Feverestpreparatorios.com.br%2Fapi%2Fpandavideo%2Fcallback&response_type=code&scope=read&state=test123" 
              className="text-blue-500 hover:underline block"
              target="_blank"
            >
              Conectar com Pandavideo (OAuth2)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 