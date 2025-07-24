"use client"

import type React from "react"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside
          className={`fixed top-16 z-30 hidden h-[calc(100vh-4rem)] shrink-0 overflow-y-auto border-r border-border/40 py-6 pr-2 md:sticky md:block lg:py-8 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
          style={{ minWidth: collapsed ? 64 : 256 }}
        >
          <button
            className="mb-6 flex items-center justify-center w-full text-white hover:text-primary transition-colors"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <SidebarNav items={sidebarNavItems} collapsed={collapsed} />
        </aside>
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:py-6 w-full mx-auto max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  )
}
