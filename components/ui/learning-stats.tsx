"use client"

interface StatItem {
  value: string | number
  label: string
  color: string
}

interface LearningStatsProps {
  stats: StatItem[]
}

export function LearningStats({ stats }: LearningStatsProps) {
  return (
    <div className="flex flex-1 w-full h-full items-center justify-center space-x-3">
      {stats.map((stat, index) => (
        <div key={index} className="text-center" style={{ transform: 'none' }}>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
