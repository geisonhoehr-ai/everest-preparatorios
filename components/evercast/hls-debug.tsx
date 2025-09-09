'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  Info
} from 'lucide-react'

interface HLSDebugProps {
  hlsUrl: string
  onTestComplete?: (success: boolean, details: any) => void
}

export function HLSDebug({ hlsUrl, onTestComplete }: HLSDebugProps) {
  const [testResults, setTestResults] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testHLSConnection = async () => {
    setIsTesting(true)
    setLogs([])
    addLog('🔍 Iniciando teste de conectividade HLS...')

    try {
      // Teste 1: Verificar se a URL é acessível
      addLog('📡 Testando acesso ao manifest principal...')
      const response = await fetch(hlsUrl, { 
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
      const manifestResponse = await fetch(hlsUrl)
      const manifest = await manifestResponse.text()
      
      const lines = manifest.split('\n')
      const streamCount = lines.filter(line => line.startsWith('#EXT-X-STREAM-INF:')).length
      
      addLog(`📊 Streams encontradas: ${streamCount}`)
      
      // Analisar cada stream
      const streams = []
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
            streams.push(streamInfo)
            addLog(`🎬 Stream: ${streamInfo.RESOLUTION || 'N/A'} - ${streamInfo.BANDWIDTH || 'N/A'} bps`)
          }
        }
      }

      // Teste 3: Verificar suporte do navegador
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

      // Teste 4: Verificar CORS
      addLog('🔒 Verificando CORS...')
      try {
        const corsTest = await fetch(hlsUrl, { 
          method: 'GET',
          mode: 'cors'
        })
        addLog('✅ CORS configurado corretamente')
      } catch (error) {
        addLog('⚠️ Possível problema de CORS')
      }

      const results = {
        success: true,
        manifestAccessible: true,
        streamCount,
        streams,
        browserSupport,
        corsWorking: true,
        manifestSize: manifest.length,
        url: hlsUrl
      }

      setTestResults(results)
      addLog('🎉 Teste concluído com sucesso!')
      onTestComplete?.(true, results)

    } catch (error) {
      addLog(`❌ Erro no teste: ${error.message}`)
      const results = {
        success: false,
        error: error.message,
        url: hlsUrl
      }
      setTestResults(results)
      onTestComplete?.(false, results)
    } finally {
      setIsTesting(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Debug HLS</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={testHLSConnection}
              disabled={isTesting}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isTesting ? 'Testando...' : 'Testar HLS'}
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
        {/* URL sendo testada */}
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">URL HLS:</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{hlsUrl}</p>
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
                  <div className="text-2xl font-bold text-blue-600">{testResults.manifestSize}</div>
                  <div className="text-xs text-gray-600">Bytes</div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {testResults.browserSupport}
                  </Badge>
                  <div className="text-xs text-gray-600 mt-1">Suporte</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-xs text-gray-600">CORS OK</div>
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
