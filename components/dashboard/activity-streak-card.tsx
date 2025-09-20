"use client"

import { Flame } from "lucide-react"
import { DashboardCardJason } from "@/components/ui/dashboard-card-jason"

interface ActivityStreakCardProps {
  data: {
    currentStreak: number;
    longestStreak: number;
    weeklyActivities: boolean[];
  };
}

export function ActivityStreakCard({ data }: ActivityStreakCardProps) {
  // Dados padrão baseados na análise da imagem
  const defaultData = {
    currentStreak: 2,
    longestStreak: 15,
    weeklyActivities: [false, false, false, false, false, true, true] // Últimos 7 dias
  };

  const streakData = data || defaultData;

  return (
    <DashboardCardJason glowColor="orange">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sequência de Atividades
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mantenha sua motivação diária
          </p>
        </div>
      </div>

      {/* Streak Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-12 h-12 text-orange-500" />
            <div className="ml-3">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {streakData.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                dias seguidos
              </div>
            </div>
          </div>
          
          {/* Weekly Activity Dots */}
          <div className="flex gap-2 justify-center mb-2">
            {streakData.weeklyActivities.map((active, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  active 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                title={active ? 'Ativo' : 'Inativo'}
              />
            ))}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Melhor sequência: {streakData.longestStreak} dias
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
          Ver histórico →
        </button>
      </div>
    </DashboardCardJason>
  );
}
