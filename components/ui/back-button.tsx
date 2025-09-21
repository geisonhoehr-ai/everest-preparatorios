"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  pageName?: string
  showIconOnly?: boolean
}

export function BackButton({ 
  className, 
  variant = "ghost", 
  size = "sm",
  pageName,
  showIconOnly = false
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const getDisplayText = () => {
    if (showIconOnly) return null
    if (pageName) return pageName
    return "Voltar"
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size={size}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400",
        "border-0 hover:border-orange-200 dark:hover:border-orange-800",
        "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400",
        "group",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      {getDisplayText()}
    </Button>
  )
}
