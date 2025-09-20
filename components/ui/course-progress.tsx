"use client"

import { Progress } from "@/components/ui/progress"

interface CourseProgressItem {
  title: string
  progress: number
}

interface CourseProgressProps {
  courses: CourseProgressItem[]
}

export function CourseProgress({ courses }: CourseProgressProps) {
  return (
    <div className="flex flex-1 w-full h-full min-h-[4rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2 p-1">
      {courses.map((course, index) => (
        <div key={index} className="flex flex-col space-y-1" style={{ width: "100%" }}>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-300 font-medium truncate pr-2">
              {course.title}
            </span>
            <span className="text-neutral-500 flex-shrink-0">
              {course.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300" 
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
