/**
 * Utilitários para compressão de áudio
 */

export interface AudioCompressionOptions {
  quality: 'low' | 'medium' | 'high' | 'original'
  maxSizeMB: number
  targetBitrate?: number
}

export interface CompressionResult {
  compressedBlob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  quality: string
}

/**
 * Comprime um arquivo de áudio usando Web Audio API
 */
export async function compressAudio(
  file: File, 
  options: AudioCompressionOptions = { quality: 'medium', maxSizeMB: 10 }
): Promise<CompressionResult> {
  console.log('🎵 [Compressão] Iniciando compressão de áudio...')
  console.log('📊 [Compressão] Arquivo original:', {
    name: file.name,
    size: file.size,
    type: file.type
  })

  const originalSize = file.size
  const maxSizeBytes = options.maxSizeMB * 1024 * 1024

  // Se o arquivo já é menor que o tamanho máximo, retornar sem compressão
  if (originalSize <= maxSizeBytes && options.quality === 'original') {
    console.log('✅ [Compressão] Arquivo já está no tamanho adequado')
    return {
      compressedBlob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 'original'
    }
  }

  try {
    // Carregar o arquivo de áudio
    const arrayBuffer = await file.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    console.log('🔊 [Compressão] Áudio carregado:', {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels
    })

    // Configurações de compressão baseadas na qualidade
    const compressionSettings = getCompressionSettings(options.quality, audioBuffer.sampleRate)
    
    console.log('⚙️ [Compressão] Configurações:', compressionSettings)

    // Converter de volta para blob com compressão
    const compressedBlob = await audioBufferToCompressedBlob(audioBuffer, compressionSettings)
    
    const compressedSize = compressedBlob.size
    const compressionRatio = originalSize / compressedSize

    console.log('📈 [Compressão] Resultado:', {
      originalSize: formatBytes(originalSize),
      compressedSize: formatBytes(compressedSize),
      compressionRatio: compressionRatio.toFixed(2) + 'x',
      savings: `${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`
    })

    // Se ainda estiver muito grande, tentar compressão mais agressiva
    if (compressedSize > maxSizeBytes && options.quality !== 'low') {
      console.log('⚠️ [Compressão] Ainda muito grande, tentando compressão mais agressiva...')
      const aggressiveOptions = { ...options, quality: 'low' as const }
      return compressAudio(file, aggressiveOptions)
    }

    return {
      compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
      quality: options.quality
    }

  } catch (error) {
    console.error('❌ [Compressão] Erro na compressão:', error)
    
    // Fallback: retornar arquivo original se a compressão falhar
    console.log('🔄 [Compressão] Usando arquivo original como fallback')
    return {
      compressedBlob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      quality: 'original'
    }
  }
}

/**
 * Configurações de compressão baseadas na qualidade
 */
function getCompressionSettings(quality: string, sampleRate: number) {
  const baseSettings = {
    sampleRate: Math.min(sampleRate, 44100), // Limitar a 44.1kHz
    channels: 1, // Mono para economizar espaço
    bitDepth: 16
  }

  switch (quality) {
    case 'low':
      return {
        ...baseSettings,
        sampleRate: 22050, // 22.05kHz
        bitrate: 64 // 64kbps
      }
    case 'medium':
      return {
        ...baseSettings,
        sampleRate: 32000, // 32kHz
        bitrate: 96 // 96kbps
      }
    case 'high':
      return {
        ...baseSettings,
        sampleRate: 44100, // 44.1kHz
        bitrate: 128 // 128kbps
      }
    default:
      return {
        ...baseSettings,
        sampleRate: 44100,
        bitrate: 128
      }
  }
}

/**
 * Converte AudioBuffer para Blob comprimido
 */
async function audioBufferToCompressedBlob(
  audioBuffer: AudioBuffer, 
  settings: any
): Promise<Blob> {
  const { sampleRate, channels, bitDepth } = settings
  
  // Reduzir taxa de amostragem se necessário
  let processedBuffer = audioBuffer
  if (audioBuffer.sampleRate !== sampleRate) {
    processedBuffer = await resampleAudioBuffer(audioBuffer, sampleRate)
  }

  // Converter para mono se necessário
  if (audioBuffer.numberOfChannels > channels) {
    processedBuffer = await convertToMono(processedBuffer)
  }

  // Converter para WAV comprimido
  const wavBlob = await audioBufferToWav(processedBuffer, bitDepth)
  
  return wavBlob
}

/**
 * Reduz a taxa de amostragem do áudio
 */
async function resampleAudioBuffer(
  audioBuffer: AudioBuffer, 
  targetSampleRate: number
): Promise<AudioBuffer> {
  const ratio = targetSampleRate / audioBuffer.sampleRate
  const newLength = Math.floor(audioBuffer.length * ratio)
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const newBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    newLength,
    targetSampleRate
  )

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const originalData = audioBuffer.getChannelData(channel)
    const newData = newBuffer.getChannelData(channel)
    
    for (let i = 0; i < newLength; i++) {
      const index = Math.floor(i / ratio)
      newData[i] = originalData[index] || 0
    }
  }

  return newBuffer
}

/**
 * Converte áudio estéreo para mono
 */
async function convertToMono(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const monoBuffer = audioContext.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate)
  
  const leftChannel = audioBuffer.getChannelData(0)
  const rightChannel = audioBuffer.getChannelData(1)
  const monoData = monoBuffer.getChannelData(0)
  
  for (let i = 0; i < audioBuffer.length; i++) {
    monoData[i] = (leftChannel[i] + rightChannel[i]) / 2
  }
  
  return monoBuffer
}

/**
 * Converte AudioBuffer para WAV
 */
async function audioBufferToWav(audioBuffer: AudioBuffer, bitDepth: number = 16): Promise<Blob> {
  const length = audioBuffer.length
  const sampleRate = audioBuffer.sampleRate
  const channels = audioBuffer.numberOfChannels
  const bytesPerSample = bitDepth / 8
  const blockAlign = channels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = length * blockAlign
  const bufferSize = 44 + dataSize

  const buffer = new ArrayBuffer(bufferSize)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, bufferSize - 8, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // audio format (PCM)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  // Convert audio data
  const channelData = []
  for (let channel = 0; channel < channels; channel++) {
    channelData.push(audioBuffer.getChannelData(channel))
  }

  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]))
      const intSample = Math.floor(sample * (Math.pow(2, bitDepth - 1) - 1))
      
      if (bitDepth === 16) {
        view.setInt16(offset, intSample, true)
        offset += 2
      } else if (bitDepth === 8) {
        view.setInt8(offset, intSample)
        offset += 1
      }
    }
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Formata bytes para string legível
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Estima o tamanho final após compressão
 */
export function estimateCompressedSize(originalSize: number, quality: string): number {
  const ratios = {
    'original': 1,
    'high': 0.7,
    'medium': 0.5,
    'low': 0.3
  }
  
  return Math.floor(originalSize * (ratios[quality as keyof typeof ratios] || 0.5))
}
