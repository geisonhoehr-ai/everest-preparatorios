'use client'

interface CompressionConfig {
  enabled: boolean
  level: number // 1-9, onde 9 é máxima compressão
  threshold: number // Tamanho mínimo em bytes para comprimir
  algorithms: string[] // Algoritmos suportados
}

interface CompressionResult {
  compressed: boolean
  originalSize: number
  compressedSize: number
  ratio: number
  algorithm: string
  data: string | ArrayBuffer
}

class CompressionService {
  private config: CompressionConfig

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = {
      enabled: true,
      level: 6,
      threshold: 1024, // 1KB
      algorithms: ['gzip', 'deflate', 'brotli'],
      ...config
    }
  }

  // Verificar se compressão é suportada
  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    
    // Verificar suporte a CompressionStream
    return 'CompressionStream' in window
  }

  // Comprimir dados
  async compress(data: string | ArrayBuffer, algorithm: string = 'gzip'): Promise<CompressionResult> {
    if (!this.config.enabled || !this.isSupported()) {
      return {
        compressed: false,
        originalSize: this.getSize(data),
        compressedSize: this.getSize(data),
        ratio: 1,
        algorithm: 'none',
        data
      }
    }

    const originalSize = this.getSize(data)
    
    // Não comprimir se for menor que o threshold
    if (originalSize < this.config.threshold) {
      return {
        compressed: false,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        algorithm: 'none',
        data
      }
    }

    try {
      const compressedData = await this.performCompression(data, algorithm)
      const compressedSize = this.getSize(compressedData)
      const ratio = originalSize / compressedSize

      return {
        compressed: true,
        originalSize,
        compressedSize,
        ratio,
        algorithm,
        data: compressedData
      }
    } catch (error) {
      console.error('Compression failed:', error)
      return {
        compressed: false,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        algorithm: 'none',
        data
      }
    }
  }

  // Descomprimir dados
  async decompress(compressedData: string | ArrayBuffer, algorithm: string = 'gzip'): Promise<string | ArrayBuffer> {
    if (!this.isSupported()) {
      return compressedData
    }

    try {
      return await this.performDecompression(compressedData, algorithm)
    } catch (error) {
      console.error('Decompression failed:', error)
      return compressedData
    }
  }

  private async performCompression(data: string | ArrayBuffer, algorithm: string): Promise<ArrayBuffer> {
    const stream = new CompressionStream(algorithm as CompressionFormat)
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    // Converter dados para Uint8Array
    const input = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)

    // Escrever dados
    await writer.write(input)
    await writer.close()

    // Ler dados comprimidos
    const chunks: Uint8Array[] = []
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }

    // Combinar chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result.buffer
  }

  private async performDecompression(compressedData: string | ArrayBuffer, algorithm: string): Promise<ArrayBuffer> {
    const stream = new DecompressionStream(algorithm as CompressionFormat)
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    // Converter dados para Uint8Array
    const input = typeof compressedData === 'string' ? new TextEncoder().encode(compressedData) : new Uint8Array(compressedData)

    // Escrever dados
    await writer.write(input)
    await writer.close()

    // Ler dados descomprimidos
    const chunks: Uint8Array[] = []
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }

    // Combinar chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result.buffer
  }

  private getSize(data: string | ArrayBuffer): number {
    if (typeof data === 'string') {
      return new TextEncoder().encode(data).length
    }
    return data.byteLength
  }

  // Comprimir dados para localStorage
  async compressForStorage(data: any): Promise<string> {
    const jsonString = JSON.stringify(data)
    const result = await this.compress(jsonString, 'gzip')
    
    if (result.compressed) {
      // Converter ArrayBuffer para base64
      const base64 = this.arrayBufferToBase64(result.data as ArrayBuffer)
      return `compressed:${result.algorithm}:${base64}`
    }
    
    return jsonString
  }

  // Descomprimir dados do localStorage
  async decompressFromStorage(compressedString: string): Promise<any> {
    if (compressedString.startsWith('compressed:')) {
      const parts = compressedString.split(':')
      const algorithm = parts[1]
      const base64 = parts[2]
      
      const arrayBuffer = this.base64ToArrayBuffer(base64)
      const decompressed = await this.decompress(arrayBuffer, algorithm)
      const jsonString = new TextDecoder().decode(decompressed as ArrayBuffer)
      
      return JSON.parse(jsonString)
    }
    
    return JSON.parse(compressedString)
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Comprimir dados para API
  async compressForAPI(data: any): Promise<{ data: string; compressed: boolean; ratio: number }> {
    const jsonString = JSON.stringify(data)
    const result = await this.compress(jsonString, 'gzip')
    
    if (result.compressed) {
      const base64 = this.arrayBufferToBase64(result.data as ArrayBuffer)
      return {
        data: base64,
        compressed: true,
        ratio: result.ratio
      }
    }
    
    return {
      data: jsonString,
      compressed: false,
      ratio: 1
    }
  }

  // Descomprimir dados da API
  async decompressFromAPI(compressedData: string, compressed: boolean): Promise<any> {
    if (compressed) {
      const arrayBuffer = this.base64ToArrayBuffer(compressedData)
      const decompressed = await this.decompress(arrayBuffer, 'gzip')
      const jsonString = new TextDecoder().decode(decompressed as ArrayBuffer)
      return JSON.parse(jsonString)
    }
    
    return JSON.parse(compressedData)
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<CompressionConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): CompressionConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  getSupportedAlgorithms(): string[] {
    return this.config.algorithms
  }

  // Estatísticas de compressão
  getCompressionStats(): { enabled: boolean; supported: boolean; algorithms: string[] } {
    return {
      enabled: this.config.enabled,
      supported: this.isSupported(),
      algorithms: this.config.algorithms
    }
  }
}

// Instância global
export const compressionService = new CompressionService()

// Hook para usar compressão
export function useCompression() {
  return {
    compress: compressionService.compress.bind(compressionService),
    decompress: compressionService.decompress.bind(compressionService),
    compressForStorage: compressionService.compressForStorage.bind(compressionService),
    decompressFromStorage: compressionService.decompressFromStorage.bind(compressionService),
    compressForAPI: compressionService.compressForAPI.bind(compressionService),
    decompressFromAPI: compressionService.decompressFromAPI.bind(compressionService),
    isSupported: compressionService.isSupported.bind(compressionService),
    isEnabled: compressionService.isEnabled.bind(compressionService),
    getSupportedAlgorithms: compressionService.getSupportedAlgorithms.bind(compressionService),
    getCompressionStats: compressionService.getCompressionStats.bind(compressionService),
    updateConfig: compressionService.updateConfig.bind(compressionService),
    getConfig: compressionService.getConfig.bind(compressionService)
  }
}
