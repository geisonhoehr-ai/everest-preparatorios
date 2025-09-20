"use client"

import { MessageSquare, MessageCircle, FileCheck, Bell } from "lucide-react"
import Link from "next/link"
import { DashboardCardJason } from "@/components/ui/dashboard-card-jason"

interface CommunityInteraction {
  id: string;
  type: 'question' | 'comment' | 'review' | 'reminder';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  timestamp: Date;
  status: 'pending' | 'in-progress' | 'completed';
  url: string;
}

interface CommunityInteractionsCardProps {
  data: {
    interactions: CommunityInteraction[];
  };
}

export function CommunityInteractionsCard({ data }: CommunityInteractionsCardProps) {
  // Dados padrão para demonstração
  const defaultData = {
    interactions: [
      {
        id: "1",
        type: 'question' as const,
        title: "Dúvida de Aluno",
        description: "Como funciona o RLS no Supabase?",
        priority: 'high' as const,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
        status: 'pending' as const,
        url: "/community/questions/1"
      },
      {
        id: "2",
        type: 'review' as const,
        title: "Novo Flashcard para aprovação",
        description: "Tipos de Joins SQL",
        priority: 'medium' as const,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        status: 'pending' as const,
        url: "/flashcards/review/2"
      },
      {
        id: "3",
        type: 'comment' as const,
        title: "Comentário em sua aula",
        description: "Ótima explicação!",
        priority: 'low' as const,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        status: 'completed' as const,
        url: "/community/comments/3"
      }
    ]
  };

  const interactionsData = data || defaultData;

  const typeIcons = {
    question: MessageSquare,
    comment: MessageCircle,
    review: FileCheck,
    reminder: Bell
  };

  const typeColors = {
    question: 'text-blue-500',
    comment: 'text-green-500',
    review: 'text-orange-500',
    reminder: 'text-purple-500'
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  return (
    <DashboardCardJason glowColor="indigo">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Interações Recentes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Atividades que exigem sua atenção
          </p>
        </div>
      </div>

      {/* Interactions List */}
      <div className="space-y-3 flex-1">
        {interactionsData.interactions.slice(0, 3).map((interaction) => {
          const Icon = typeIcons[interaction.type];
          return (
            <Link 
              key={interaction.id}
              href={interaction.url}
              className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeColors[interaction.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {interaction.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatTimeAgo(interaction.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {interaction.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
          Ver todas as interações →
        </button>
      </div>
    </DashboardCardJason>
  );
}
