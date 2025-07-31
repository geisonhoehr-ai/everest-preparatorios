"use client"
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ThemeIconsProps {
  collapsed?: boolean
}

export function ThemeIcons({ collapsed = false }: ThemeIconsProps) {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "light", icon: Sun, label: "Claro" },
    { value: "dark", icon: Moon, label: "Escuro" },
    { value: "system", icon: Monitor, label: "Sistema" }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[2] // default to system
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "justify-start h-8",
            collapsed ? "px-2" : "px-3",
            "hover:bg-orange-50 dark:hover:bg-orange-950"
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          {!collapsed && (
            <>
              <span className="ml-2 text-xs">{currentTheme.label}</span>
              <ChevronDown className="ml-auto h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, icon: Icon, label }) => (
          <DropdownMenuItem 
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-2",
              theme === value && "bg-orange-100 dark:bg-orange-900"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 