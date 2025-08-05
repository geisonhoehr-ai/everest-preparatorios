'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'

export function AuthTokenFix() {
  const [isFixing, setIsFixing] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearAuthData = async () => {
    setIsFixing(true)
    setError(null)
    
    try {
      console.log('🧹 [TOKEN-FIX] Iniciando limpeza de dados de autenticação...')
      
      // 1. Limpar localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove = []
        
        // Encontrar todas as chaves relacionadas ao Supabase
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        
        // Remover as chaves encontradas
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log('🗑️ [TOKEN-FIX] Removido:', key)
        })
        
        console.log(`✅ [TOKEN-FIX] ${keysToRemove.length} itens removidos do localStorage`)
      }
      
      // 2. Limpar sessionStorage
      if (typeof window !== 'undefined') {
        const sessionKeysToRemove = []
        
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
            sessionKeysToRemove.push(key)
          }
        }
        
        sessionKeysToRemove.forEach(key => {
          sessionStorage.removeItem(key)
          console.log('🗑️ [TOKEN-FIX] Removido do sessionStorage:', key)
        })
        
        console.log(`✅ [TOKEN-FIX] ${sessionKeysToRemove.length} itens removidos do sessionStorage`)
      }
      
      // 3. Aguardar um pouco para garantir que a limpeza foi processada
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsFixed(true)
      console.log('✅ [TOKEN-FIX] Limpeza concluída com sucesso')
      
      // 4. Recarregar a página após um breve delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (err) {
      console.error('❌ [TOKEN-FIX] Erro durante limpeza:', err)
      setError('Erro ao limpar dados de autenticação. Tente novamente.')
    } finally {
      setIsFixing(false)
    }
  }

  const resetState = () => {
    setIsFixed(false)
    setError(null)
  }

  if (isFixed) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Dados de autenticação limpos com sucesso! A página será recarregada automaticamente...
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetState}
          className="mt-2"
        >
          Tentar Novamente
        </Button>
      </Alert>
    )
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 mb-3">
        Detectamos um problema com o token de autenticação. Isso pode ser resolvido limpando os dados locais.
      </AlertDescription>
      <Button 
        onClick={clearAuthData}
        disabled={isFixing}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        {isFixing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Limpando...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Dados de Autenticação
          </>
        )}
      </Button>
    </Alert>
  )
} 