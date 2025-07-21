import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r border-border/40 py-6 pr-2 md:sticky md:block lg:py-8">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden py-6 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
