'use client'

import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const communityNavItems = [
  { href: "/community", title: "Feed", icon: "🏠" },
  { href: "/provas", title: "Provas", icon: "📝" },
  { href: "/livros", title: "Acervo Digital", icon: "📚" },
  { href: "/suporte", title: "Suporte", icon: "💬" },
]

export default function CommunitySidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`transition-all duration-300 bg-background/80 text-white flex flex-col py-8 px-2 border-r border-[#23272f] min-h-screen justify-between ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ minWidth: collapsed ? 64 : 256 }}
    >
      <div>
        <button
          className="mb-6 flex items-center justify-center w-full text-white hover:text-primary transition-colors"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div className={`mb-8 ${collapsed ? 'text-center' : ''}`}>
          <h2 className={`text-xl font-bold mb-2 transition-all duration-300 ${collapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>Comunidade</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {communityNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-2 py-2 justify-start ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="mr-2 text-lg">{item.icon}</span>
              <span className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-8">
        <Link
          href="/"
          className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 px-2 py-2 w-full justify-start ${collapsed ? 'justify-center' : ''}`}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className={`transition-all duration-300 ${collapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>Sair da Comunidade</span>
        </Link>
      </div>
    </aside>
  )
} 