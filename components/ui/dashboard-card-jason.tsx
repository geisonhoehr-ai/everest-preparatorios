"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DashboardCardJasonProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'indigo';
}

export function DashboardCardJason({ 
  children, 
  className = '',
  glowColor = 'blue' 
}: DashboardCardJasonProps) {
  const glowVariants = {
    blue: 'from-blue-500 via-indigo-500 to-purple-500',
    purple: 'from-purple-500 via-pink-500 to-red-500',
    green: 'from-green-500 via-emerald-500 to-teal-500',
    orange: 'from-orange-500 via-red-500 to-pink-500',
    teal: 'from-teal-500 via-cyan-500 to-blue-500',
    indigo: 'from-indigo-500 via-purple-500 to-pink-500'
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Glow Effect Container */}
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-all duration-300 rounded-2xl blur-sm group-hover:blur-md",
        `bg-gradient-to-r ${glowVariants[glowColor]}`
      )} />
      
      {/* Card Content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-neutral-200 dark:border-gray-700 p-6 h-full min-h-[280px] flex flex-col shadow-sm dark:shadow-[0px_0px_27px_0px_#2D2D2D] hover:shadow-lg dark:hover:shadow-[0px_0px_35px_0px_#3D3D3D] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
