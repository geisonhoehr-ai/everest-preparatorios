"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function DebugTheme() {
  const { theme, setTheme, systemTheme, themes } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-4 border rounded bg-yellow-50 dark:bg-yellow-900">
        <p className="text-sm">🔄 Carregando tema...</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded bg-blue-50 dark:bg-blue-900">
      <h3 className="font-bold mb-2">🔍 Debug do Tema</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Tema atual:</strong> {theme}</p>
        <p><strong>Tema do sistema:</strong> {systemTheme}</p>
        <p><strong>Temas disponíveis:</strong> {themes?.join(', ')}</p>
        <p><strong>Mounted:</strong> {mounted ? 'Sim' : 'Não'}</p>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTheme('light')}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
          >
            Claro
          </button>
          <button
            onClick={() => setTheme('dark')}
            className="px-3 py-1 bg-gray-800 text-white border rounded hover:bg-gray-700"
          >
            Escuro
          </button>
          <button
            onClick={() => setTheme('system')}
            className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200"
          >
            Sistema
          </button>
        </div>
      </div>
    </div>
  )
}
