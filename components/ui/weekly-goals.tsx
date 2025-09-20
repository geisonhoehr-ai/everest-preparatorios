"use client"

interface WeeklyGoal {
  id: string
  title: string
  completed: boolean
}

interface WeeklyGoalsProps {
  goals: WeeklyGoal[]
}

export function WeeklyGoals({ goals }: WeeklyGoalsProps) {
  return (
    <div className="flex flex-1 w-full h-full flex-col space-y-1.5 overflow-hidden">
      {goals.map((goal) => (
        <div key={goal.id} className="flex items-center space-x-2" style={{ opacity: 1, transform: 'none' }}>
          <div className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            goal.completed 
              ? 'border-green-500 bg-green-500' 
              : 'border-neutral-300 dark:border-neutral-600'
          }`}>
            {goal.completed && (
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>
          <span className={`text-sm leading-relaxed ${
            goal.completed 
              ? 'text-green-600 dark:text-green-400 line-through' 
              : 'text-neutral-700 dark:text-neutral-200'
          }`}>
            {goal.title}
          </span>
        </div>
      ))}
    </div>
  )
}
