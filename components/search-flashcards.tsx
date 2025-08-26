"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchFlashcardsProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchFlashcards({ 
  onSearch, 
  placeholder = "Buscar flashcards...", 
  className = "" 
}: SearchFlashcardsProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  
  // Efeito para debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [query])
  
  // Efeito para chamar a função de busca
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])
  
  // Função para limpar a busca
  const handleClear = () => {
    setQuery("")
    setDebouncedQuery("")
  }
  
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-10 h-10 bg-background"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 h-full aspect-square rounded-l-none"
          onClick={handleClear}
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar busca</span>
        </Button>
      )}
    </div>
  )
}
