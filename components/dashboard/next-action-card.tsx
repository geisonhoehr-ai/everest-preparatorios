"use client"

import { FileText, Plus, Shield, BookOpen } from "lucide-react"
import Link from "next/link"
import { DashboardCardJason } from "@/components/ui/dashboard-card-jason"

interface NextActionCardProps {
  data: {
    type: 'review' | 'create' | 'moderate' | 'study';
    title: string;
    description: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    estimatedTime: number;
    actionUrl: string;
  };
}

export function NextActionCard({ data }: NextActionCardProps) {
  // Dados padrão para demonstração
  const defaultData = {
    type: 'review' as const,
    title: "Revisar Flashcards",
    description: "Conceitos de Banco de Dados",
    priority: 'high' as const,
    estimatedTime: 15,
    actionUrl: "/flashcards/review"
  };

  const actionData = data || defaultData;

  const typeIcons = {
    review: FileText,
    create: Plus,
    moderate: Shield,
    study: BookOpen
  };

  const typeColors = {
    review: 'text-teal-500',
    create: 'text-blue-500',
    moderate: 'text-orange-500',
    study: 'text-green-500'
  };

  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  };

  const Icon = typeIcons[actionData.type];

  return (
    <DashboardCardJason glowColor="teal">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${typeColors[actionData.type]}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Próxima Ação Relevante
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sugestão personalizada para você
          </p>
        </div>
      </div>

      {/* Action Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {actionData.title}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[actionData.priority]}`}>
              {actionData.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {actionData.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ⏱️ ~{actionData.estimatedTime} min
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href={actionData.actionUrl}
          className="block w-full bg-teal-500 hover:bg-teal-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Começar Agora
        </Link>
      </div>
    </DashboardCardJason>
  );
}
