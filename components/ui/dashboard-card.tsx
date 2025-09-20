"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DashboardCardProps {
  title: string
  description: string
  icon: ReactNode
  iconColor?: string
  children: ReactNode
  className?: string
  glowEffect?: boolean
}

export function DashboardCard({ 
  title, 
  description, 
  icon, 
  iconColor = "text-blue-500", 
  children, 
  className,
  glowEffect = true 
}: DashboardCardProps) {
  return (
    <div className={cn(
      "relative h-full rounded-2.5xl border border-neutral-200 dark:border-neutral-800 p-2 md:rounded-3xl md:p-3",
      className
    )}>
      {/* Glow Effect */}
      {glowEffect && (
        <div className="pointer-events-none absolute -inset-px hidden rounded-[inherit] border transition-opacity opacity-100">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity opacity-100" style={{
            "--blur": "0px",
            "--spread": "20", 
            "--start": "-58.06653614265457",
            "--active": "1",
            "--glowingeffect-border-width": "3px",
            "--repeating-conic-gradient-times": "5",
            "--gradient": "radial-gradient(circle, #3b82f6 10%, #3b82f600 20%), radial-gradient(circle at 40% 40%, #6366f1 5%, #6366f100 15%), radial-gradient(circle at 60% 60%, #8b5cf6 10%, #8b5cf600 20%), radial-gradient(circle at 40% 60%, #a855f7 10%, #a855f700 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #3b82f6 0%, #6366f1 calc(25% / var(--repeating-conic-gradient-times)), #8b5cf6 calc(50% / var(--repeating-conic-gradient-times)), #a855f7 calc(75% / var(--repeating-conic-gradient-times)), #3b82f6 calc(100% / var(--repeating-conic-gradient-times)))"
          } as React.CSSProperties}>
            <div className="glow rounded-[inherit] after:content-[''] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))] after:[border:var(--glowingeffect-border-width)_solid_transparent] after:[background:var(--gradient)] after:[background-attachment:fixed] after:opacity-[var(--active)] after:transition-opacity after:duration-300 after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect] after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"></div>
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl border-0.75 border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 shadow-sm dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-4">
        <div className="relative flex flex-1 flex-col justify-between gap-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="w-fit rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5 bg-neutral-50 dark:bg-neutral-800">
              <div className={cn("h-4 w-4", iconColor)}>
                {icon}
              </div>
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="pt-0.5 text-lg/[1.25rem] font-semibold font-sans -tracking-4 md:text-xl/[1.5rem] text-balance text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="font-sans text-xs/[1rem] md:text-sm/[1.125rem] text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
