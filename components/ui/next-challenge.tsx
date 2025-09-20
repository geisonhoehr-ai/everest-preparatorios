"use client"

import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

interface NextChallengeProps {
  title: string
  description: string
  onStart: () => void
}

export function NextChallenge({ title, description, onStart }: NextChallengeProps) {
  return (
    <div className="flex flex-1 w-full h-full">
      <div className="w-full rounded-lg p-2 flex flex-col justify-between" style={{ transform: 'none' }}>
        <div>
          <BookOpen className="h-5 w-5 mb-1 text-blue-500" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Próximo Curso
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <Button 
          onClick={onStart}
          className="mt-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-1 text-xs font-medium transition-colors"
          style={{ transform: 'none' }}
        >
          Começar Agora
        </Button>
      </div>
    </div>
  )
}
