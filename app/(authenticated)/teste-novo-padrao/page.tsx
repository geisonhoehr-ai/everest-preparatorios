"use client"

import { MetricCard } from "@/components/ui/standard-card"
import { Users, BookOpen, BarChart3, Trophy } from "lucide-react"

export default function TesteNovoPadraoPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Teste do Novo Padrão
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Esta é uma página de teste para verificar se o novo design está funcionando
        </p>
      </div>

      {/* Cards de Teste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Usuários"
          value="1,234"
          subtitle="Usuários cadastrados"
          icon={<Users className="h-5 w-5" />}
        />
        
        <MetricCard
          title="Conteúdos"
          value="431"
          subtitle="Flashcards, quizzes e cursos"
          icon={<BookOpen className="h-5 w-5" />}
        />
        
        <MetricCard
          title="Provas Realizadas"
          value="89"
          subtitle="Tentativas de quiz"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        
        <MetricCard
          title="Ranking"
          value="#5"
          subtitle="Sua posição atual"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      {/* Teste de Layout */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Layout Teste
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Se você está vendo esta página com o novo layout (sidebar escuro à esquerda e área de conteúdo clara à direita), 
          então o novo padrão está funcionando corretamente!
        </p>
      </div>
    </div>
  )
}
