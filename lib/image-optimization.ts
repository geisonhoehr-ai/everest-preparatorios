'use client'

import React, { useState, useCallback } from 'react'

interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  progressive?: boolean
}

export interface OptimizedImage {
  url: string
  width: number
  height: number
  size: number
  format: string
}

class ImageOptimizer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp',
      progressive = true
    } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          if (!this.canvas || !this.ctx) {
            reject(new Error('Canvas not available'))
            return
          }

          this.canvas.width = width
          this.canvas.height = height

          // Desenhar imagem redimensionada
          this.ctx.drawImage(img, 0, 0, width, height)

          // Converter para blob
          this.canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'))
                return
              }

              const optimizedUrl = URL.createObjectURL(blob)
              
              resolve({
                url: optimizedUrl,
                width,
                height,
                size: blob.size,
                format: blob.type
              })

              // Limpar URL temporária
              URL.revokeObjectURL(url)
            },
            `image/${format}`,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
        URL.revokeObjectURL(url)
      }

      img.src = url
    })
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // Calcular proporção
    const aspectRatio = originalWidth / originalHeight

    // Redimensionar se necessário
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    }
  }

  async compressImage(
    file: File,
    targetSizeKB: number = 500
  ): Promise<OptimizedImage> {
    let quality = 0.9
    let result: OptimizedImage

    // Tentar diferentes qualidades até atingir o tamanho desejado
    while (quality > 0.1) {
      result = await this.optimizeImage(file, { quality })
      
      if (result.size <= targetSizeKB * 1024) {
        break
      }
      
      quality -= 0.1
    }

    return result!
  }

  async generateThumbnail(
    file: File,
    size: number = 150
  ): Promise<OptimizedImage> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    })
  }

  async generateResponsiveImages(
    file: File,
    sizes: number[] = [320, 640, 1024, 1920]
  ): Promise<OptimizedImage[]> {
    const promises = sizes.map(size =>
      this.optimizeImage(file, {
        maxWidth: size,
        quality: 0.8,
        format: 'webp'
      })
    )

    return Promise.all(promises)
  }

  // Utilitários
  getImageInfo(file: File): Promise<{
    width: number
    height: number
    size: number
    type: string
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        })
        URL.revokeObjectURL(url)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
        URL.revokeObjectURL(url)
      }

      img.src = url
    })
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }

  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
}

// Instância global
export const imageOptimizer = new ImageOptimizer()

// Hook para usar otimização de imagens
export function useImageOptimization() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const optimizeImage = useCallback(async (
    file: File,
    options: ImageOptimizationOptions = {}
  ) => {
    if (!imageOptimizer.isImageFile(file)) {
      throw new Error('File is not an image')
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await imageOptimizer.optimizeImage(file, options)
      setProgress(100)
      return result
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const compressImage = useCallback(async (
    file: File,
    targetSizeKB: number = 500
  ) => {
    if (!imageOptimizer.isImageFile(file)) {
      throw new Error('File is not an image')
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await imageOptimizer.compressImage(file, targetSizeKB)
      setProgress(100)
      return result
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const generateThumbnail = useCallback(async (
    file: File,
    size: number = 150
  ) => {
    if (!imageOptimizer.isImageFile(file)) {
      throw new Error('File is not an image')
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await imageOptimizer.generateThumbnail(file, size)
      setProgress(100)
      return result
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const generateResponsiveImages = useCallback(async (
    file: File,
    sizes: number[] = [320, 640, 1024, 1920]
  ) => {
    if (!imageOptimizer.isImageFile(file)) {
      throw new Error('File is not an image')
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const results = await imageOptimizer.generateResponsiveImages(file, sizes)
      setProgress(100)
      return results
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    optimizeImage,
    compressImage,
    generateThumbnail,
    generateResponsiveImages,
    isProcessing,
    progress,
    formatFileSize: imageOptimizer.formatFileSize,
    isImageFile: imageOptimizer.isImageFile,
    getSupportedFormats: imageOptimizer.getSupportedFormats
  }
}

// Componente movido para components/image-upload-optimizer.tsx
