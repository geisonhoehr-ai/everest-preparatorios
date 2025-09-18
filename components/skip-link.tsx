'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg',
        'z-50 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      onClick={(e) => {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
          ;(target as HTMLElement).focus()
        }
      }}
    >
      {children}
    </a>
  )
}

// Componente para múltiplos skip links
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <SkipLink href="#main-content">
        Pular para o conteúdo principal
      </SkipLink>
      <SkipLink href="#navigation">
        Pular para a navegação
      </SkipLink>
      <SkipLink href="#footer">
        Pular para o rodapé
      </SkipLink>
    </div>
  )
}
