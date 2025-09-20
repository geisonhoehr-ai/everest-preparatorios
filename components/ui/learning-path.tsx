"use client"

interface LearningPathItem {
  id: string
  title: string
  completed: boolean
  current: boolean
}

interface LearningPathProps {
  items: LearningPathItem[]
}

export function LearningPath({ items }: LearningPathProps) {
  return (
    <div className="flex flex-1 w-full h-full min-h-[4rem] p-2 flex-col justify-center">
      <h3 className="font-bold text-sm text-neutral-700 dark:text-neutral-200 mb-2 text-center">
        Trilha de Aprendizado
      </h3>
      <div className="flex flex-col space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-2" style={{ opacity: 1, transform: 'none' }}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              item.completed 
                ? 'bg-green-500' 
                : item.current 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <span className={`text-xs font-medium ${
              item.completed 
                ? 'text-green-600 dark:text-green-400' 
                : item.current 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-neutral-600 dark:text-neutral-300'
            }`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
