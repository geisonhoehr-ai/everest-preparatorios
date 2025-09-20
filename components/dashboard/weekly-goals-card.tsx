"use client"

import { Target, Check } from "lucide-react"
import { DashboardCardJason } from "@/components/ui/dashboard-card-jason"

interface WeeklyGoal {
  id: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface WeeklyGoalsCardProps {
  data: {
    goals: WeeklyGoal[];
    completedCount: number;
    totalCount: number;
  };
}

export function WeeklyGoalsCard({ data }: WeeklyGoalsCardProps) {
  // Dados padrão para demonstração
  const defaultData = {
    goals: [
      { id: "1", description: "Revisar 5 flashcards pendentes", completed: false, priority: 'high' as const },
      { id: "2", description: "Criar 1 novo quiz para módulo X", completed: false, priority: 'medium' as const },
      { id: "3", description: "Responder a 3 dúvidas na comunidade", completed: false, priority: 'medium' as const },
      { id: "4", description: "Concluir módulo 'Design de UI'", completed: false, priority: 'low' as const }
    ],
    completedCount: 0,
    totalCount: 4
  };

  const goalsData = data || defaultData;
  const completionPercentage = (goalsData.completedCount / goalsData.totalCount) * 100;

  return (
    <DashboardCardJason glowColor="purple">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Metas da Semana
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {goalsData.completedCount}/{goalsData.totalCount} concluídas
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3 flex-1">
        {goalsData.goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
              goal.completed 
                ? 'border-purple-500 bg-purple-500' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
            }`}>
              {goal.completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm flex-1 ${
              goal.completed 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {goal.description}
            </span>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              goal.priority === 'high' ? 'bg-red-500' :
              goal.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
          Gerenciar metas →
        </button>
      </div>
    </DashboardCardJason>
  );
}
