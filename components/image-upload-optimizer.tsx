'use client'

import React, { useState, useCallback } from 'react'
import { useImageOptimization, OptimizedImage } from '@/lib/image-optimization'

interface ImageUploadOptimizerProps {
  onImageOptimized: (images: {
    original: OptimizedImage
    thumbnail: OptimizedImage
    responsive: OptimizedImage[]
  }) => void
  maxSizeKB?: number
  thumbnailSize?: number
  className?: string
}

export function ImageUploadOptimizer({
  onImageOptimized,
  maxSizeKB = 500,
  thumbnailSize = 150,
  className = ''
}: ImageUploadOptimizerProps) {
  const {
    optimizeImage,
    generateThumbnail,
    generateResponsiveImages,
    isProcessing,
    progress,
    formatFileSize,
    isImageFile
  } = useImageOptimization()

  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!isImageFile(file)) {
      alert('Por favor, selecione uma imagem válida')
      return
    }

    try {
      const [original, thumbnail, responsive] = await Promise.all([
        optimizeImage(file, { maxWidth: 1920, quality: 0.8 }),
        generateThumbnail(file, thumbnailSize),
        generateResponsiveImages(file)
      ])

      onImageOptimized({
        original,
        thumbnail,
        responsive
      })
    } catch (error) {
      console.error('Erro ao otimizar imagem:', error)
      alert('Erro ao processar imagem')
    }
  }, [optimizeImage, generateThumbnail, generateResponsiveImages, onImageOptimized, thumbnailSize, isImageFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isProcessing ? (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Processando imagem...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-4xl">📷</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Arraste uma imagem aqui
            </p>
            <p className="text-sm text-gray-600">
              ou clique para selecionar
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Selecionar Imagem
          </label>
          <p className="text-xs text-gray-500">
            Formatos suportados: JPEG, PNG, WebP, GIF
          </p>
        </div>
      )}
    </div>
  )
}
