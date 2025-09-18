'use client'

// Serviço para gerenciar áudio em background
export class BackgroundAudioService {
  private static instance: BackgroundAudioService
  private audioContext: AudioContext | null = null
  private mediaSession: MediaSession | null = null
  private wakeLock: WakeLockSentinel | null = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): BackgroundAudioService {
    if (!BackgroundAudioService.instance) {
      BackgroundAudioService.instance = new BackgroundAudioService()
    }
    return BackgroundAudioService.instance
  }

  // Inicializar o serviço
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      // Verificar suporte ao Media Session API
      if ('mediaSession' in navigator) {
        this.mediaSession = navigator.mediaSession
        console.log('✅ Media Session API suportada')
      }

      // Verificar suporte ao Wake Lock API
      if ('wakeLock' in navigator) {
        console.log('✅ Wake Lock API suportada')
      }

      // Verificar suporte ao Audio Context
      if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
        this.audioContext = new (AudioContext || (window as any).webkitAudioContext)()
        console.log('✅ Audio Context suportado')
      }

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('❌ Erro ao inicializar Background Audio Service:', error)
      return false
    }
  }

  // Configurar metadados da música
  public setMetadata(metadata: {
    title: string
    artist: string
    album: string
    artwork?: MediaImage[]
  }): void {
    if (!this.mediaSession) return

    try {
      this.mediaSession.metadata = new MediaMetadata(metadata)
      console.log('✅ Metadados configurados:', metadata.title)
    } catch (error) {
      console.error('❌ Erro ao configurar metadados:', error)
    }
  }

  // Configurar ações de controle
  public setActionHandlers(handlers: {
    play?: () => void
    pause?: () => void
    stop?: () => void
    seekbackward?: (details: MediaSessionActionDetails) => void
    seekforward?: (details: MediaSessionActionDetails) => void
    seekto?: (details: MediaSessionActionDetails) => void
    previoustrack?: () => void
    nexttrack?: () => void
  }): void {
    if (!this.mediaSession) return

    try {
      // Configurar handlers
      if (handlers.play) {
        this.mediaSession.setActionHandler('play', handlers.play)
      }
      if (handlers.pause) {
        this.mediaSession.setActionHandler('pause', handlers.pause)
      }
      if (handlers.stop) {
        this.mediaSession.setActionHandler('stop', handlers.stop)
      }
      if (handlers.seekbackward) {
        this.mediaSession.setActionHandler('seekbackward', handlers.seekbackward)
      }
      if (handlers.seekforward) {
        this.mediaSession.setActionHandler('seekforward', handlers.seekforward)
      }
      if (handlers.seekto) {
        this.mediaSession.setActionHandler('seekto', handlers.seekto)
      }
      if (handlers.previoustrack) {
        this.mediaSession.setActionHandler('previoustrack', handlers.previoustrack)
      }
      if (handlers.nexttrack) {
        this.mediaSession.setActionHandler('nexttrack', handlers.nexttrack)
      }

      console.log('✅ Action handlers configurados')
    } catch (error) {
      console.error('❌ Erro ao configurar action handlers:', error)
    }
  }

  // Atualizar estado de reprodução
  public setPlaybackState(state: 'none' | 'paused' | 'playing'): void {
    if (!this.mediaSession) return

    try {
      this.mediaSession.playbackState = state
      console.log('✅ Estado de reprodução atualizado:', state)
    } catch (error) {
      console.error('❌ Erro ao atualizar estado de reprodução:', error)
    }
  }

  // Atualizar posição de reprodução
  public setPositionState(position: {
    duration: number
    playbackRate: number
    position: number
  }): void {
    if (!this.mediaSession) return

    try {
      this.mediaSession.setPositionState(position)
    } catch (error) {
      console.error('❌ Erro ao atualizar posição:', error)
    }
  }

  // Ativar Wake Lock
  public async requestWakeLock(): Promise<boolean> {
    if (!('wakeLock' in navigator)) {
      console.log('⚠️ Wake Lock API não suportada')
      return false
    }

    try {
      if (this.wakeLock) {
        await this.releaseWakeLock()
      }

      this.wakeLock = await navigator.wakeLock.request('screen')
      console.log('🔒 Wake Lock ativado')

      // Listener para quando o Wake Lock é liberado
      this.wakeLock.addEventListener('release', () => {
        console.log('🔓 Wake Lock liberado automaticamente')
        this.wakeLock = null
      })

      return true
    } catch (error) {
      console.error('❌ Erro ao ativar Wake Lock:', error)
      return false
    }
  }

  // Liberar Wake Lock
  public async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release()
        this.wakeLock = null
        console.log('🔓 Wake Lock liberado manualmente')
      } catch (error) {
        console.error('❌ Erro ao liberar Wake Lock:', error)
      }
    }
  }

  // Verificar se está em modo background
  public isInBackground(): boolean {
    return document.hidden
  }

  // Verificar suporte a funcionalidades
  public getSupportInfo(): {
    mediaSession: boolean
    wakeLock: boolean
    audioContext: boolean
    hasFullSupport: boolean
  } {
    return {
      mediaSession: 'mediaSession' in navigator,
      wakeLock: 'wakeLock' in navigator,
      audioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      hasFullSupport: 'mediaSession' in navigator && 'wakeLock' in navigator
    }
  }

  // Limpar recursos
  public cleanup(): void {
    this.releaseWakeLock()
    this.mediaSession = null
    this.audioContext = null
    this.isInitialized = false
    console.log('🧹 Background Audio Service limpo')
  }
}

// Hook para usar o serviço
export function useBackgroundAudioService() {
  const service = BackgroundAudioService.getInstance()
  
  return {
    service,
    initialize: () => service.initialize(),
    setMetadata: (metadata: any) => service.setMetadata(metadata),
    setActionHandlers: (handlers: any) => service.setActionHandlers(handlers),
    setPlaybackState: (state: any) => service.setPlaybackState(state),
    setPositionState: (position: any) => service.setPositionState(position),
    requestWakeLock: () => service.requestWakeLock(),
    releaseWakeLock: () => service.releaseWakeLock(),
    isInBackground: () => service.isInBackground(),
    getSupportInfo: () => service.getSupportInfo(),
    cleanup: () => service.cleanup()
  }
}
