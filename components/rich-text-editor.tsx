"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [lastValue, setLastValue] = useState(value)

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== lastValue) {
      editorRef.current.innerHTML = value
      setLastValue(value)
    }
  }, [value, lastValue])

  // Focus management
  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus()
      // Ensure cursor is at the end
      const range = document.createRange()
      const selection = window.getSelection()
      if (selection && editorRef.current.lastChild) {
        range.selectNodeContents(editorRef.current.lastChild)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [])

  const applyFormat = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return

    // Save current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    
    // Apply formatting
    switch (command) {
      case 'bold':
        document.execCommand('bold', false)
        break
      case 'italic':
        document.execCommand('italic', false)
        break
      case 'underline':
        document.execCommand('underline', false)
        break
      case 'justifyLeft':
        document.execCommand('justifyLeft', false)
        break
      case 'justifyCenter':
        document.execCommand('justifyCenter', false)
        break
      case 'justifyRight':
        document.execCommand('justifyRight', false)
        break
      case 'insertUnorderedList':
        document.execCommand('insertUnorderedList', false)
        break
      case 'insertOrderedList':
        document.execCommand('insertOrderedList', false)
        break
    }

    // Restore focus and update state
    focusEditor()
    updateToolbarState()
    updateContent()
  }, [focusEditor])

  const updateToolbarState = useCallback(() => {
    if (editorRef.current) {
      setIsBold(document.queryCommandState('bold'))
      setIsItalic(document.queryCommandState('italic'))
      setIsUnderline(document.queryCommandState('underline'))
    }
  }, [])

  const updateContent = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      if (newContent !== lastValue) {
        setLastValue(newContent)
        onChange(newContent)
      }
    }
  }, [onChange, lastValue])

  const handleKeyUp = useCallback(() => {
    updateToolbarState()
    updateContent()
  }, [updateToolbarState, updateContent])

  const handleMouseUp = useCallback(() => {
    updateToolbarState()
  }, [updateToolbarState])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    
    // Insert text at cursor position
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    
    updateContent()
  }, [updateContent])

  const handleInput = useCallback(() => {
    updateContent()
  }, [updateContent])

  const handleFocus = useCallback(() => {
    updateToolbarState()
  }, [updateToolbarState])

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant={isBold ? "default" : "outline"}
          size="sm"
          onClick={() => applyFormat('bold')}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={isItalic ? "default" : "outline"}
          size="sm"
          onClick={() => applyFormat('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={isUnderline ? "default" : "outline"}
          size="sm"
          onClick={() => applyFormat('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('justifyLeft')}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('justifyCenter')}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('justifyRight')}
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('insertUnorderedList')}
          title="Lista não ordenada"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyFormat('insertOrderedList')}
          title="Lista ordenada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        contentEditable
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onPaste={handlePaste}
        onInput={handleInput}
        onFocus={handleFocus}
        data-placeholder={placeholder}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='smallGrid' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 8 0 L 0 0 0 8' fill='none' stroke='%23f0f0f0' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23smallGrid)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}