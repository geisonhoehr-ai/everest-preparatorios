'use client'

import { useState, useEffect } from 'react'
import { validatePassword, generatePasswordSuggestions } from '@/lib/password-policy'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Lightbulb } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
  userId?: string
  showSuggestions?: boolean
  className?: string
}

export function PasswordStrengthMeter({ 
  password, 
  userId, 
  showSuggestions = true, 
  className = '' 
}: PasswordStrengthMeterProps) {
  const [validation, setValidation] = useState(validatePassword(password, userId))
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const result = validatePassword(password, userId)
    setValidation(result)
    
    if (showSuggestions && result.score < 70) {
      setSuggestions(generatePasswordSuggestions())
    } else {
      setSuggestions([])
    }
  }, [password, userId, showSuggestions])

  const getScoreColor = (score: number) => {
    if (score < 30) return 'bg-red-500'
    if (score < 50) return 'bg-orange-500'
    if (score < 70) return 'bg-yellow-500'
    if (score < 90) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Muito Fraca'
    if (score < 50) return 'Fraca'
    if (score < 70) return 'Média'
    if (score < 90) return 'Forte'
    return 'Muito Forte'
  }

  const getScoreIcon = (score: number) => {
    if (score < 30) return <XCircle className="h-4 w-4 text-red-500" />
    if (score < 50) return <XCircle className="h-4 w-4 text-orange-500" />
    if (score < 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    if (score < 90) return <CheckCircle className="h-4 w-4 text-blue-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Medidor de Força */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Força da Senha:</span>
          <div className="flex items-center gap-2">
            {getScoreIcon(validation.score)}
            <span className={`font-semibold ${
              validation.score < 30 ? 'text-red-600' :
              validation.score < 50 ? 'text-orange-600' :
              validation.score < 70 ? 'text-yellow-600' :
              validation.score < 90 ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {getScoreLabel(validation.score)}
            </span>
          </div>
        </div>
        
        <Progress 
          value={validation.score} 
          className="h-2"
        />
        
        <div className="text-xs text-gray-500 text-center">
          {validation.score}/100 pontos
        </div>
      </div>

      {/* Erros */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Avisos */}
      {validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Dicas para uma senha mais forte:</p>
              <ul className="space-y-1 text-sm">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Critérios de Validação */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Critérios de Validação:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            {password.length >= 8 ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Mínimo 8 caracteres</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/[A-Z]/.test(password) ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Letra maiúscula</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/[a-z]/.test(password) ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Letra minúscula</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/\d/.test(password) ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Número</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Caractere especial</span>
          </div>
          
          <div className="flex items-center gap-2">
            {password.length >= 12 ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span>Recomendado 12+</span>
          </div>
        </div>
      </div>
    </div>
  )
}
