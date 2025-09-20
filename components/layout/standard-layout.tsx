"use client"

import { ReactNode, useState } from "react"
import { StandardSidebar } from "./standard-sidebar"
import { StandardHeader } from "./standard-header"
import { useMobileMenu } from "../mobile-menu-provider"

interface StandardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function StandardLayout({ children, title, subtitle }: StandardLayoutProps) {
  const { isMobileOpen } = useMobileMenu()

  return (
    <div className="flex w-full h-screen flex-col bg-gray-100 md:flex-row dark:bg-neutral-800">
      {/* Sidebar Desktop */}
      <StandardSidebar />
      
      {/* Header Mobile */}
      <StandardHeader />
      
      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        <div className="w-full flex-1 rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 relative overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-2 md:p-10">
              <div className="space-y-8">
                {/* Page Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {subtitle}
                    </p>
                  )}
                </div>
                
                {/* Page Content */}
                <div className="space-y-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
          onClick={() => {}}
        />
      )}
    </div>
  )
}
