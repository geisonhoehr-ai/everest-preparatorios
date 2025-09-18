'use client'

import React, { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  showClearButton?: boolean
  isLoading?: boolean
  resultCount?: number
  totalCount?: number
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    className, 
    onClear, 
    showClearButton = true, 
    isLoading = false,
    resultCount,
    totalCount,
    value,
    ...props 
  }, ref) => {
    const hasValue = value && value.toString().length > 0
    const showResults = resultCount !== undefined && totalCount !== undefined

    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={ref}
            className={cn(
              "pl-10 pr-10",
              isLoading && "animate-pulse",
              className
            )}
            value={value}
            {...props}
          />
          {hasValue && showClearButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={onClear}
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showResults && (
          <div className="mt-2 text-sm text-gray-600">
            {resultCount === totalCount ? (
              <span>Mostrando todos os {totalCount} resultados</span>
            ) : (
              <span>
                Mostrando {resultCount} de {totalCount} resultados
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
