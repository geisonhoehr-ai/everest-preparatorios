"use client"

import { TrendingUp, Users, BookOpen, BarChart3, Trophy } from "lucide-react"
import { DashboardCardJason } from "@/components/ui/dashboard-card-jason"

interface PlatformMetricsCardProps {
  data: {
    totalUsers: number;
    totalContent: number;
    quizzesCompleted: number;
    userRanking: number;
  };
}

export function PlatformMetricsCard({ data }: PlatformMetricsCardProps) {
  // Dados padrão baseados na análise da imagem atual
  const defaultData = {
    totalUsers: 1234,
    totalContent: 456,
    quizzesCompleted: 7890,
    userRanking: 5
  };

  const metricsData = data || defaultData;

  const metrics = [
    {
      label: 'Total de Usuários',
      value: metricsData.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Conteúdos Ativos',
      value: metricsData.totalContent.toLocaleString(),
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Provas Realizadas',
      value: metricsData.quizzesCompleted.toLocaleString(),
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      label: 'Seu Ranking',
      value: `#${metricsData.userRanking}`,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    }
  ];

  return (
    <DashboardCardJason glowColor="blue">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Visão Geral da Plataforma
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Métricas importantes da sua plataforma
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center mx-auto mb-3`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Ver relatório completo →
        </button>
      </div>
    </DashboardCardJason>
  );
}
