'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from './use-debounce'

export interface SearchOptions<T> {
  data: T[]
  searchFields: (keyof T)[]
  minLength?: number
  debounceMs?: number
  caseSensitive?: boolean
}

export function useSearch<T>({
  data,
  searchFields,
  minLength = 2,
  debounceMs = 300,
  caseSensitive = false
}: SearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minLength) {
      return data
    }

    const term = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase()
    
    return data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field]
        if (typeof fieldValue === 'string') {
          const value = caseSensitive ? fieldValue : fieldValue.toLowerCase()
          return value.includes(term)
        }
        return false
      })
    })
  }, [data, debouncedSearchTerm, searchFields, minLength, caseSensitive])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const setSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  useEffect(() => {
    setIsSearching(!!debouncedSearchTerm && debouncedSearchTerm.length >= minLength)
  }, [debouncedSearchTerm, minLength])

  return {
    searchTerm,
    setSearch,
    clearSearch,
    filteredData,
    isSearching,
    hasResults: filteredData.length > 0,
    resultCount: filteredData.length,
    totalCount: data.length
  }
}
