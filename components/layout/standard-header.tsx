"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobileMenu } from "../mobile-menu-provider"

export function StandardHeader() {
  const { toggleMobile } = useMobileMenu()

  return (
    <div className="h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full">
      <div className="flex justify-end z-20 w-full">
        <Button variant="ghost" size="icon" onClick={toggleMobile}>
          <Menu className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
        </Button>
      </div>
    </div>
  )
}
