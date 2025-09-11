'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Info
} from 'lucide-react'

interface PandaVideoTestProps {
  onUrlTested?: (url: string, success: boolean) => void
}

export function PandaVideoTest({ onUrlTested }: PandaVideoTestProps) {
  const [testUrl, setTestUrl] = useState('https://b-vz-e9d62059-4a4.tv.pandavideo.com.br/e13112a8-6545-49e7-ba1c-9825b15c9c09/playlist.m3u8')
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[PandaVideo Test] ${message}`)
  }

  const testPandaVideoUrl = async () => {
    if (!testUrl) return

    setIsTesting(true)
    setLogs([])
    setTestResults(null)
    addLog('🔍 Iniciando teste de URL do PandaVideo...')

    try {
      // Teste 1: Verificar se a URL é acessível
      addLog('📡 Testando acesso ao manifest...')
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      addLog(`✅ Manifest acessível (${response.status})`)
      addLog(`📄 Content-Type: ${response.headers.get('content-type')}`)

      // Teste 2: Baixar e analisar o manifest
      addLog('📋 Baixando e analisando manifest...')
      const manifestResponse = await fetch(testUrl)
      const manifest = await manifestResponse.text()
      
      addLog(`📊 Tamanho do manifest: ${manifest.length} bytes`)
      
      // Analisar streams disponíveis
      const lines = manifest.split('\n')
      const streamInfos = []
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.startsWith('#EXT-X-STREAM-INF:')) {
          const streamInfo: any = {}
          const params = line.substring(18).split(',')
          
          params.forEach(param => {
            const [key, value] = param.split('=')
            if (key && value) {
              streamInfo[key] = value
            }
          })
          
          // Verificar se há URL na próxima linha
          if (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].startsWith('#')) {
            streamInfo.url = lines[i + 1].trim()
            streamInfos.push(streamInfo)
            addLog(`🎬 Stream: ${streamInfo.RESOLUTION || 'N/A'} - ${streamInfo.BANDWIDTH || 'N/A'} bps`)
          }
        }
      }

      // Teste 3: Verificar se é stream de vídeo ou áudio
      const hasVideo = streamInfos.some(stream => stream.RESOLUTION && stream.RESOLUTION !== '0x0')
      const streamType = hasVideo ? 'Vídeo' : 'Áudio'
      
      addLog(`🎥 Tipo de stream detectado: ${streamType}`)
      
      if (hasVideo) {
        addLog('⚠️ Stream de vídeo detectado - será reproduzido apenas o áudio')
        addLog('💡 Para melhor experiência, considere usar um stream de áudio puro')
      }

      // Teste 4: Verificar suporte do navegador
      addLog('🌐 Verificando suporte do navegador...')
      let browserSupport = 'Nenhum'
      
      if (typeof window !== 'undefined') {
        if (window.Hls && window.Hls.isSupported()) {
          browserSupport = 'HLS.js'
          addLog('✅ HLS.js suportado')
        } else if (document.createElement('audio').canPlayType('application/vnd.apple.mpegurl')) {
          browserSupport = 'HLS Nativo (Safari)'
          addLog('✅ HLS nativo suportado')
        } else {
          addLog('❌ HLS não suportado neste navegador')
        }
      }

      const results = {
        success: true,
        url: testUrl,
        streamType,
        streamCount: streamInfos.length,
        streams: streamInfos,
        browserSupport,
        manifestSize: manifest.length,
        isVideo: hasVideo
      }

      setTestResults(results)
      addLog('🎉 Teste concluído com sucesso!')
      onUrlTested?.(testUrl, true)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      addLog(`❌ Erro no teste: ${errorMessage}`)
      const results = {
        success: false,
        error: errorMessage,
        url: testUrl
      }
      setTestResults(results)
      onUrlTested?.(testUrl, false)
    } finally {
      setIsTesting(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const openUrlInNewTab = () => {
    window.open(testUrl, '_blank')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Teste PandaVideo HLS</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={testPandaVideoUrl}
              disabled={isTesting || !testUrl}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isTesting ? 'Testando...' : 'Testar URL'}
            </Button>
            <Button
              onClick={openUrlInNewTab}
              disabled={!testUrl}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir URL
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
            >
              Limpar Logs
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input de URL */}
        <div className="space-y-2">
          <Label htmlFor="pandavideo-url">URL do PandaVideo HLS:</Label>
          <Input
            id="pandavideo-url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://b-vz-e9d62059-4a4.tv.pandavideo.com.br/..."
            className="font-mono text-sm"
          />
        </div>

        {/* Resultados do teste */}
        {testResults && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {testResults.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {testResults.success ? 'Teste Concluído' : 'Teste Falhou'}
              </span>
            </div>

            {testResults.success && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.streamCount}</div>
                  <div className="text-xs text-gray-600">Streams</div>
                </div>
                <div className="text-center">
                  <Badge variant={testResults.isVideo ? "default" : "secondary"} className="text-xs">
                    {testResults.streamType}
                  </Badge>
                  <div className="text-xs text-gray-600 mt-1">Tipo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResults.manifestSize}</div>
                  <div className="text-xs text-gray-600">Bytes</div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {testResults.browserSupport}
                  </Badge>
                  <div className="text-xs text-gray-600 mt-1">Suporte</div>
                </div>
              </div>
            )}

            {testResults.streams && testResults.streams.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Streams Disponíveis:</h4>
                <div className="space-y-2">
                  {testResults.streams.map((stream: any, index: number) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {stream.RESOLUTION || 'Resolução N/A'}
                        </span>
                        <span className="text-gray-600">
                          {stream.BANDWIDTH ? `${Math.round(parseInt(stream.BANDWIDTH) / 1000)}kbps` : 'N/A'}
                        </span>
                      </div>
                      {stream.url && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {stream.url}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResults.isVideo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Stream de Vídeo Detectado
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Este é um stream de vídeo do PandaVideo. O player reproduzirá apenas o áudio.
                      Para melhor experiência, considere usar um stream de áudio puro se disponível.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Logs de Debug:</h4>
            <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Declaração global para HLS.js
declare global {
  interface Window {
    Hls: any
  }
}
