"use client"

import { Calendar } from "lucide-react"

interface ActivityItem {
  id: string
  action: string
  target: string
  timeAgo: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="flex flex-1 w-full h-full min-h-[4rem] p-2 flex-col space-y-2">
      <div className="flex items-center gap-1 mb-1">
        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-sm text-neutral-700 dark:text-neutral-200">
          Atividade Recente
        </h3>
      </div>
      <div className="space-y-2 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex justify-between items-center p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50" style={{ opacity: 1, transform: 'none' }}>
            <div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                {activity.action}
              </span>
              <span className="text-xs text-neutral-500 ml-1">
                {activity.target}
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              {activity.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
