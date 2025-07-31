"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPandavideoPage() {
  const [urlParams, setUrlParams] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [localStorageToken, setLocalStorageToken] = useState<string>("")
  const [cookies, setCookies] = useState<string>("")
  const [currentUrl, setCurrentUrl] = useState<string>("")

  useEffect(() => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') return

    // Capturar parâmetros da URL
    const params = window.location.search
    setUrlParams(params)
    setCurrentUrl(window.location.href)
    
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
    if (typeof window === 'undefined') return
    
    if (token) {
      localStorage.setItem('pandavideo_access_token', token)
      setLocalStorageToken(token)
      console.log('🎥 [TEST] Token salvo no localStorage')
    }
  }

  const handleClearToken = () => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('pandavideo_access_token')
    setLocalStorageToken("")
    console.log('🎥 [TEST] Token removido do localStorage')
  }

  const handleTestAPI = async () => {
    if (typeof window === 'undefined') return
    
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
          <p><strong>URL atual:</strong> {currentUrl || 'Carregando...'}</p>
          <p><strong>Parâmetros:</strong> {urlParams}</p>
          <p><strong>Token na URL:</strong> {token ? `${token.substring(0, 20)}...` : 'Não encontrado'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LocalStorage</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Token salvo:</strong> {localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'Não encontrado'}</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveToken} disabled={!token}>
              Salvar Token
            </Button>
            <Button onClick={handleClearToken} variant="destructive">
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
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {cookies || 'Nenhum cookie encontrado'}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste da API</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestAPI}>
            Testar API Pandavideo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 