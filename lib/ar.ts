'use client'

interface ARConfig {
  enabled: boolean
  enableCamera: boolean
  enableSensors: boolean
  enableGestures: boolean
  enableVoice: boolean
  enableHaptic: boolean
  enableTracking: boolean
  enableOverlay: boolean
  enableInteraction: boolean
}

interface ARSession {
  id: string
  userId: string
  startTime: number
  endTime?: number
  duration: number
  interactions: ARInteraction[]
  gestures: ARGesture[]
  voiceCommands: ARVoiceCommand[]
  hapticFeedback: ARHapticFeedback[]
  trackingData: ARTrackingData[]
}

interface ARInteraction {
  id: string
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'voice' | 'gesture'
  target: string
  position: { x: number; y: number; z?: number }
  timestamp: number
  duration: number
  success: boolean
}

interface ARGesture {
  id: string
  type: 'wave' | 'point' | 'grab' | 'pinch' | 'rotate'
  confidence: number
  position: { x: number; y: number; z: number }
  orientation: { x: number; y: number; z: number; w: number }
  timestamp: number
}

interface ARVoiceCommand {
  id: string
  command: string
  confidence: number
  language: string
  timestamp: number
  processed: boolean
  result: any
}

interface ARHapticFeedback {
  id: string
  type: 'vibration' | 'pulse' | 'click' | 'buzz'
  intensity: number
  duration: number
  pattern: number[]
  timestamp: number
}

interface ARTrackingData {
  id: string
  type: 'face' | 'hand' | 'object' | 'plane' | 'marker'
  position: { x: number; y: number; z: number }
  orientation: { x: number; y: number; z: number; w: number }
  confidence: number
  timestamp: number
}

interface ARMarker {
  id: string
  name: string
  type: 'image' | 'qr' | 'barcode' | 'custom'
  data: string
  position: { x: number; y: number; z: number }
  orientation: { x: number; y: number; z: number; w: number }
  scale: { x: number; y: number; z: number }
  visible: boolean
  lastSeen: number
}

class ARService {
  private config: ARConfig
  private currentSession: ARSession | null = null
  private markers: Map<string, ARMarker> = new Map()
  private initialized: boolean = false
  private camera: MediaStream | null = null
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null

  constructor(config: Partial<ARConfig> = {}) {
    this.config = {
      enabled: true,
      enableCamera: true,
      enableSensors: true,
      enableGestures: true,
      enableVoice: true,
      enableHaptic: true,
      enableTracking: true,
      enableOverlay: true,
      enableInteraction: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Verificar suporte a AR
    this.checkARSupport()

    // Inicializar canvas
    this.initializeCanvas()

    // Carregar marcadores
    this.loadMarkers()

    // Inicializar sensores
    if (this.config.enableSensors) {
      this.initializeSensors()
    }

    // Inicializar reconhecimento de voz
    if (this.config.enableVoice) {
      this.initializeVoiceRecognition()
    }

    // Inicializar reconhecimento de gestos
    if (this.config.enableGestures) {
      this.initializeGestureRecognition()
    }
  }

  // Verificar suporte a AR
  private checkARSupport(): boolean {
    const hasWebGL = !!window.WebGLRenderingContext
    const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window
    const hasDeviceMotion = 'DeviceMotionEvent' in window

    const isSupported = hasWebGL && hasWebRTC && hasDeviceOrientation && hasDeviceMotion

    if (!isSupported) {
      console.warn('AR features are not fully supported on this device')
    }

    return isSupported
  }

  // Inicializar canvas
  private initializeCanvas(): void {
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.zIndex = '1000'
    this.canvas.style.pointerEvents = 'none'
    
    this.context = this.canvas.getContext('2d')
    document.body.appendChild(this.canvas)
  }

  // Inicializar sensores
  private initializeSensors(): void {
    // Device orientation
    window.addEventListener('deviceorientation', (event) => {
      this.handleDeviceOrientation(event)
    })

    // Device motion
    window.addEventListener('devicemotion', (event) => {
      this.handleDeviceMotion(event)
    })

    // Resize
    window.addEventListener('resize', () => {
      this.handleResize()
    })
  }

  // Inicializar reconhecimento de voz
  private initializeVoiceRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'pt-BR'

      recognition.onresult = (event: any) => {
        this.handleVoiceResult(event)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }

      // Armazenar recognition para uso posterior
      ;(this as any).speechRecognition = recognition
    }
  }

  // Inicializar reconhecimento de gestos
  private initializeGestureRecognition(): void {
    // Touch events
    this.canvas?.addEventListener('touchstart', (event) => {
      this.handleTouchStart(event)
    })

    this.canvas?.addEventListener('touchmove', (event) => {
      this.handleTouchMove(event)
    })

    this.canvas?.addEventListener('touchend', (event) => {
      this.handleTouchEnd(event)
    })

    // Mouse events
    this.canvas?.addEventListener('mousedown', (event) => {
      this.handleMouseDown(event)
    })

    this.canvas?.addEventListener('mousemove', (event) => {
      this.handleMouseMove(event)
    })

    this.canvas?.addEventListener('mouseup', (event) => {
      this.handleMouseUp(event)
    })
  }

  // Iniciar sessão AR
  async startSession(userId: string): Promise<ARSession | null> {
    if (!this.config.enabled) return null

    try {
      // Iniciar câmera
      if (this.config.enableCamera) {
        await this.startCamera()
      }

      // Criar sessão
      const session: ARSession = {
        id: this.generateId(),
        userId,
        startTime: Date.now(),
        duration: 0,
        interactions: [],
        gestures: [],
        voiceCommands: [],
        hapticFeedback: [],
        trackingData: []
      }

      this.currentSession = session
      this.initialized = true

      // Iniciar loop de renderização
      this.startRenderLoop()

      return session
    } catch (error) {
      console.error('Failed to start AR session:', error)
      return null
    }
  }

  // Encerrar sessão AR
  endSession(): ARSession | null {
    if (!this.currentSession) return null

    this.currentSession.endTime = Date.now()
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime

    // Parar câmera
    if (this.camera) {
      this.camera.getTracks().forEach(track => track.stop())
      this.camera = null
    }

    // Parar loop de renderização
    this.stopRenderLoop()

    const session = this.currentSession
    this.currentSession = null
    this.initialized = false

    return session
  }

  // Iniciar câmera
  private async startCamera(): Promise<void> {
    try {
      this.camera = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      })

      // Criar elemento de vídeo
      const video = document.createElement('video')
      video.srcObject = this.camera
      video.play()

      // Armazenar vídeo para uso posterior
      ;(this as any).video = video
    } catch (error) {
      console.error('Failed to start camera:', error)
    }
  }

  // Iniciar loop de renderização
  private startRenderLoop(): void {
    const render = () => {
      if (this.initialized && this.context) {
        this.render()
        requestAnimationFrame(render)
      }
    }
    render()
  }

  // Parar loop de renderização
  private stopRenderLoop(): void {
    this.initialized = false
  }

  // Renderizar
  private render(): void {
    if (!this.context || !this.canvas) return

    // Limpar canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Desenhar vídeo da câmera
    const video = (this as any).video
    if (video && this.config.enableCamera) {
      this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)
    }

    // Desenhar marcadores
    this.renderMarkers()

    // Desenhar overlay
    if (this.config.enableOverlay) {
      this.renderOverlay()
    }
  }

  // Renderizar marcadores
  private renderMarkers(): void {
    if (!this.context) return

    for (const marker of this.markers.values()) {
      if (marker.visible) {
        this.renderMarker(marker)
      }
    }
  }

  // Renderizar marcador
  private renderMarker(marker: ARMarker): void {
    if (!this.context) return

    const { x, y, z } = marker.position
    const { x: scaleX, y: scaleY } = marker.scale

    // Converter coordenadas 3D para 2D (simulação simples)
    const screenX = (x + 1) * this.canvas!.width / 2
    const screenY = (y + 1) * this.canvas!.height / 2

    // Desenhar marcador
    this.context.fillStyle = 'rgba(0, 255, 0, 0.5)'
    this.context.fillRect(
      screenX - scaleX * 50,
      screenY - scaleY * 50,
      scaleX * 100,
      scaleY * 100
    )

    // Desenhar texto
    this.context.fillStyle = 'white'
    this.context.font = '16px Arial'
    this.context.fillText(marker.name, screenX, screenY)
  }

  // Renderizar overlay
  private renderOverlay(): void {
    if (!this.context) return

    // Desenhar informações da sessão
    if (this.currentSession) {
      this.context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      this.context.fillRect(10, 10, 200, 100)

      this.context.fillStyle = 'white'
      this.context.font = '14px Arial'
      this.context.fillText(`Session: ${this.currentSession.id}`, 20, 30)
      this.context.fillText(`Duration: ${Math.floor(this.currentSession.duration / 1000)}s`, 20, 50)
      this.context.fillText(`Interactions: ${this.currentSession.interactions.length}`, 20, 70)
      this.context.fillText(`Markers: ${this.markers.size}`, 20, 90)
    }
  }

  // Adicionar marcador
  addMarker(marker: Omit<ARMarker, 'id' | 'visible' | 'lastSeen'>): ARMarker {
    const newMarker: ARMarker = {
      ...marker,
      id: this.generateId(),
      visible: true,
      lastSeen: Date.now()
    }

    this.markers.set(newMarker.id, newMarker)
    return newMarker
  }

  // Remover marcador
  removeMarker(markerId: string): boolean {
    return this.markers.delete(markerId)
  }

  // Obter marcador
  getMarker(markerId: string): ARMarker | null {
    return this.markers.get(markerId) || null
  }

  // Obter marcadores
  getMarkers(): ARMarker[] {
    return Array.from(this.markers.values())
  }

  // Atualizar marcador
  updateMarker(markerId: string, updates: Partial<ARMarker>): boolean {
    const marker = this.markers.get(markerId)
    if (!marker) return false

    Object.assign(marker, updates)
    this.markers.set(markerId, marker)
    return true
  }

  // Detectar marcador
  detectMarker(data: string): ARMarker | null {
    for (const marker of this.markers.values()) {
      if (marker.data === data) {
        marker.visible = true
        marker.lastSeen = Date.now()
        return marker
      }
    }
    return null
  }

  // Adicionar interação
  addInteraction(interaction: Omit<ARInteraction, 'id' | 'timestamp'>): ARInteraction {
    const newInteraction: ARInteraction = {
      ...interaction,
      id: this.generateId(),
      timestamp: Date.now()
    }

    if (this.currentSession) {
      this.currentSession.interactions.push(newInteraction)
    }

    return newInteraction
  }

  // Adicionar gesto
  addGesture(gesture: Omit<ARGesture, 'id' | 'timestamp'>): ARGesture {
    const newGesture: ARGesture = {
      ...gesture,
      id: this.generateId(),
      timestamp: Date.now()
    }

    if (this.currentSession) {
      this.currentSession.gestures.push(newGesture)
    }

    return newGesture
  }

  // Adicionar comando de voz
  addVoiceCommand(command: Omit<ARVoiceCommand, 'id' | 'timestamp'>): ARVoiceCommand {
    const newCommand: ARVoiceCommand = {
      ...command,
      id: this.generateId(),
      timestamp: Date.now()
    }

    if (this.currentSession) {
      this.currentSession.voiceCommands.push(newCommand)
    }

    return newCommand
  }

  // Adicionar feedback háptico
  addHapticFeedback(feedback: Omit<ARHapticFeedback, 'id' | 'timestamp'>): ARHapticFeedback {
    const newFeedback: ARHapticFeedback = {
      ...feedback,
      id: this.generateId(),
      timestamp: Date.now()
    }

    if (this.currentSession) {
      this.currentSession.hapticFeedback.push(newFeedback)
    }

    // Executar feedback háptico
    this.executeHapticFeedback(newFeedback)

    return newFeedback
  }

  // Executar feedback háptico
  private executeHapticFeedback(feedback: ARHapticFeedback): void {
    if (!this.config.enableHaptic) return

    if ('vibrate' in navigator) {
      navigator.vibrate(feedback.pattern)
    }
  }

  // Event handlers
  private handleDeviceOrientation(event: DeviceOrientationEvent): void {
    if (!this.currentSession) return

    const trackingData: ARTrackingData = {
      id: this.generateId(),
      type: 'object',
      position: { x: 0, y: 0, z: 0 },
      orientation: {
        x: event.alpha || 0,
        y: event.beta || 0,
        z: event.gamma || 0,
        w: 1
      },
      confidence: 0.8,
      timestamp: Date.now()
    }

    this.currentSession.trackingData.push(trackingData)
  }

  private handleDeviceMotion(event: DeviceMotionEvent): void {
    if (!this.currentSession) return

    const acceleration = event.acceleration
    if (acceleration) {
      const trackingData: ARTrackingData = {
        id: this.generateId(),
        type: 'object',
        position: {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0
        },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
        confidence: 0.7,
        timestamp: Date.now()
      }

      this.currentSession.trackingData.push(trackingData)
    }
  }

  private handleResize(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }
  }

  private handleVoiceResult(event: any): void {
    const result = event.results[event.results.length - 1]
    if (result.isFinal) {
      const command = result[0].transcript
      const confidence = result[0].confidence

      this.addVoiceCommand({
        command,
        confidence,
        language: 'pt-BR',
        processed: false,
        result: null
      })
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    // Implementar detecção de gestos
  }

  private handleTouchMove(event: TouchEvent): void {
    // Implementar detecção de gestos
  }

  private handleTouchEnd(event: TouchEvent): void {
    // Implementar detecção de gestos
  }

  private handleMouseDown(event: MouseEvent): void {
    // Implementar detecção de gestos
  }

  private handleMouseMove(event: MouseEvent): void {
    // Implementar detecção de gestos
  }

  private handleMouseUp(event: MouseEvent): void {
    // Implementar detecção de gestos
  }

  // Obter estatísticas
  getStats(): {
    isInitialized: boolean
    hasActiveSession: boolean
    totalMarkers: number
    visibleMarkers: number
    totalInteractions: number
    totalGestures: number
    totalVoiceCommands: number
    totalHapticFeedback: number
  } {
    const visibleMarkers = Array.from(this.markers.values()).filter(m => m.visible).length
    const totalInteractions = this.currentSession?.interactions.length || 0
    const totalGestures = this.currentSession?.gestures.length || 0
    const totalVoiceCommands = this.currentSession?.voiceCommands.length || 0
    const totalHapticFeedback = this.currentSession?.hapticFeedback.length || 0

    return {
      isInitialized: this.initialized,
      hasActiveSession: !!this.currentSession,
      totalMarkers: this.markers.size,
      visibleMarkers,
      totalInteractions,
      totalGestures,
      totalVoiceCommands,
      totalHapticFeedback
    }
  }

  // Métodos de utilidade
  private generateId(): string {
    return `ar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar marcadores
  private saveMarkers(): void {
    try {
      const markers = Array.from(this.markers.values())
      localStorage.setItem('everest-ar-markers', JSON.stringify(markers))
    } catch (error) {
      console.error('Failed to save markers:', error)
    }
  }

  // Carregar marcadores
  private loadMarkers(): void {
    try {
      const stored = localStorage.getItem('everest-ar-markers')
      if (stored) {
        const markers = JSON.parse(stored)
        for (const marker of markers) {
          this.markers.set(marker.id, marker)
        }
      }
    } catch (error) {
      console.error('Failed to load markers:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<ARConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): ARConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  isInitialized(): boolean {
    return this.initialized
  }

  getCurrentSession(): ARSession | null {
    return this.currentSession
  }
}

// Instância global
export const arService = new ARService()

// Hook para usar AR
export function useAR() {
  return {
    startSession: arService.startSession.bind(arService),
    endSession: arService.endSession.bind(arService),
    addMarker: arService.addMarker.bind(arService),
    removeMarker: arService.removeMarker.bind(arService),
    getMarker: arService.getMarker.bind(arService),
    getMarkers: arService.getMarkers.bind(arService),
    updateMarker: arService.updateMarker.bind(arService),
    detectMarker: arService.detectMarker.bind(arService),
    addInteraction: arService.addInteraction.bind(arService),
    addGesture: arService.addGesture.bind(arService),
    addVoiceCommand: arService.addVoiceCommand.bind(arService),
    addHapticFeedback: arService.addHapticFeedback.bind(arService),
    getStats: arService.getStats.bind(arService),
    isEnabled: arService.isEnabled.bind(arService),
    isInitialized: arService.isInitialized.bind(arService),
    getCurrentSession: arService.getCurrentSession.bind(arService),
    updateConfig: arService.updateConfig.bind(arService),
    getConfig: arService.getConfig.bind(arService)
  }
}
