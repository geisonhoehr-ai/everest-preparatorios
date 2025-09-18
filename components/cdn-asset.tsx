'use client'

import React, { useState, useEffect } from 'react'
import { cdnService } from '@/lib/cdn'

interface CDNAssetProps {
  src: string
  alt?: string
  type?: 'image' | 'video' | 'audio' | 'document' | 'font' | 'script' | 'style'
  className?: string
  onLoad?: () => void
  onError?: () => void
  [key: string]: any
}

export function CDNAsset({
  src,
  alt,
  type = 'image',
  className = '',
  onLoad,
  onError,
  ...props
}: CDNAssetProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [cdnUrl, setCdnUrl] = useState<string>('')

  useEffect(() => {
    const loadAsset = async () => {
      try {
        const url = await cdnService.loadAsset(src, type)
        setCdnUrl(url)
        setLoaded(true)
        onLoad?.()
      } catch (err) {
        console.error('Failed to load CDN asset:', err)
        setError(true)
        onError?.()
      }
    }

    loadAsset()
  }, [src, type, onLoad, onError])

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500">Failed to load</span>
      </div>
    )
  }

  if (!loaded) {
    return <div className={`${className} bg-gray-100 animate-pulse`} />
  }

  if (type === 'image') {
    return <img src={cdnUrl} alt={alt} className={className} {...props} />
  }

  if (type === 'video') {
    return <video src={cdnUrl} className={className} {...props} />
  }

  if (type === 'audio') {
    return <audio src={cdnUrl} className={className} {...props} />
  }

  return <div className={className} {...props} />
}
