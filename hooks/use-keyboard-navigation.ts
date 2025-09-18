'use client'

import { useEffect, useCallback, useRef, useState } from 'react'

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  onSpace?: () => void
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onSpace,
    preventDefault = true,
    stopPropagation = false,
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, code } = event

    // Prevenir comportamento padrão se especificado
    if (preventDefault) {
      event.preventDefault()
    }

    // Parar propagação se especificado
    if (stopPropagation) {
      event.stopPropagation()
    }

    // Mapear teclas para callbacks
    switch (key) {
      case 'Enter':
        onEnter?.()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'ArrowUp':
        onArrowUp?.()
        break
      case 'ArrowDown':
        onArrowDown?.()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        break
      case 'ArrowRight':
        onArrowRight?.()
        break
      case 'Tab':
        onTab?.()
        break
      case ' ':
        onSpace?.()
        break
    }
  }, [
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onSpace,
    preventDefault,
    stopPropagation,
  ])

  return { handleKeyDown }
}

// Hook para gerenciar foco em listas
export function useFocusManagement<T extends HTMLElement>(
  items: any[],
  options: {
    initialIndex?: number
    loop?: boolean
    onFocusChange?: (index: number) => void
  } = {}
) {
  const { initialIndex = 0, loop = true, onFocusChange } = options
  const [focusedIndex, setFocusedIndex] = useState(initialIndex)
  const itemRefs = useRef<(T | null)[]>([])

  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index)
      onFocusChange?.(index)
      itemRefs.current[index]?.focus()
    }
  }, [items.length, onFocusChange])

  const focusNext = useCallback(() => {
    const nextIndex = focusedIndex + 1
    if (nextIndex < items.length) {
      focusItem(nextIndex)
    } else if (loop) {
      focusItem(0)
    }
  }, [focusedIndex, items.length, loop, focusItem])

  const focusPrevious = useCallback(() => {
    const prevIndex = focusedIndex - 1
    if (prevIndex >= 0) {
      focusItem(prevIndex)
    } else if (loop) {
      focusItem(items.length - 1)
    }
  }, [focusedIndex, items.length, loop, focusItem])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusNext()
        break
      case 'ArrowUp':
        event.preventDefault()
        focusPrevious()
        break
      case 'Home':
        event.preventDefault()
        focusItem(0)
        break
      case 'End':
        event.preventDefault()
        focusItem(items.length - 1)
        break
    }
  }, [focusNext, focusPrevious, focusItem, items.length])

  return {
    focusedIndex,
    focusItem,
    focusNext,
    focusPrevious,
    handleKeyDown,
    itemRefs,
  }
}

// Hook para gerenciar ARIA attributes
export function useAriaAttributes(options: {
  role?: string
  label?: string
  describedBy?: string
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
  hidden?: boolean
}) {
  const {
    role,
    label,
    describedBy,
    expanded,
    selected,
    disabled,
    hidden,
  } = options

  const ariaAttributes = {
    ...(role && { role }),
    ...(label && { 'aria-label': label }),
    ...(describedBy && { 'aria-describedby': describedBy }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    ...(selected !== undefined && { 'aria-selected': selected }),
    ...(disabled && { 'aria-disabled': disabled }),
    ...(hidden && { 'aria-hidden': hidden }),
  }

  return ariaAttributes
}
