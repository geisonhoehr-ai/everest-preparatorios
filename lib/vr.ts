'use client'

interface VRConfig {
  enabled: boolean
  enableHandTracking: boolean
  enableEyeTracking: boolean
  enableHaptics: boolean
  enableSpatialAudio: boolean
  enableRoomScale: boolean
  enablePassthrough: boolean
  enableHands: boolean
  enableVoice: boolean
  enableGestures: boolean
  enablePhysics: boolean
  enableLighting: boolean
  enableShadows: boolean
  enableReflections: boolean
  enableParticles: boolean
  enableAnimations: boolean
  enableInteractions: boolean
  enableMultiplayer: boolean
  enableRecording: boolean
  enableStreaming: boolean
  updateInterval: number
  renderDistance: number
  fieldOfView: number
  refreshRate: number
}

interface VRDevice {
  id: string
  name: string
  type: 'headset' | 'controller' | 'tracker' | 'base_station' | 'camera'
  manufacturer: string
  model: string
  capabilities: string[]
  status: 'connected' | 'disconnected' | 'error' | 'calibrating'
  batteryLevel?: number
  firmwareVersion: string
  lastSeen: number
  createdAt: number
  updatedAt: number
}

interface VRScene {
  id: string
  name: string
  description: string
  type: 'environment' | 'game' | 'education' | 'training' | 'social' | 'entertainment'
  objects: VRObject[]
  lighting: VRLighting
  audio: VRAudio
  physics: VRPhysics
  interactions: VRInteraction[]
  users: string[]
  maxUsers: number
  status: 'active' | 'inactive' | 'loading' | 'error'
  createdAt: number
  updatedAt: number
}

interface VRObject {
  id: string
  name: string
  type: 'static' | 'dynamic' | 'interactive' | 'avatar' | 'ui' | 'particle'
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  mesh: string
  material: string
  texture: string
  physics: boolean
  collider: boolean
  interactive: boolean
  grabbable: boolean
  throwable: boolean
  properties: Record<string, any>
  animations: VRAnimation[]
  createdAt: number
  updatedAt: number
}

interface VRLighting {
  type: 'directional' | 'point' | 'spot' | 'ambient'
  color: { r: number; g: number; b: number; a: number }
  intensity: number
  position?: { x: number; y: number; z: number }
  direction?: { x: number; y: number; z: number }
  range?: number
  angle?: number
  shadows: boolean
  realtime: boolean
}

interface VRAudio {
  type: 'spatial' | 'ambient' | 'music' | 'sfx' | 'voice'
  source: string
  volume: number
  pitch: number
  loop: boolean
  spatial: boolean
  distance: number
  rolloff: number
  doppler: boolean
}

interface VRPhysics {
  gravity: { x: number; y: number; z: number }
  airResistance: number
  friction: number
  bounce: number
  mass: number
  drag: number
  angularDrag: number
  kinematic: boolean
  isTrigger: boolean
}

interface VRInteraction {
  id: string
  type: 'grab' | 'throw' | 'push' | 'pull' | 'rotate' | 'scale' | 'teleport' | 'point' | 'click' | 'voice' | 'gesture'
  objectId: string
  userId: string
  parameters: Record<string, any>
  timestamp: number
  duration: number
  success: boolean
}

interface VRAnimation {
  id: string
  name: string
  type: 'position' | 'rotation' | 'scale' | 'color' | 'opacity' | 'texture'
  duration: number
  loop: boolean
  pingPong: boolean
  easing: string
  keyframes: VRKeyframe[]
  playing: boolean
  paused: boolean
  speed: number
}

interface VRKeyframe {
  time: number
  value: any
  easing: string
}

interface VRUser {
  id: string
  username: string
  avatar: VRAvatar
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  handPositions: {
    left: { x: number; y: number; z: number }
    right: { x: number; y: number; z: number }
  }
  handRotations: {
    left: { x: number; y: number; z: number }
    right: { x: number; y: number; z: number }
  }
  eyeTracking: {
    left: { x: number; y: number; z: number }
    right: { x: number; y: number; z: number }
    convergence: number
  }
  voice: {
    enabled: boolean
    volume: number
    pitch: number
    spatial: boolean
  }
  gestures: string[]
  interactions: string[]
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: number
  createdAt: number
  updatedAt: number
}

interface VRAvatar {
  id: string
  name: string
  appearance: {
    skin: string
    hair: string
    eyes: string
    clothing: string
    accessories: string[]
  }
  animations: {
    idle: string
    walk: string
    run: string
    jump: string
    wave: string
    point: string
    grab: string
    throw: string
  }
  voice: {
    enabled: boolean
    volume: number
    pitch: number
    spatial: boolean
  }
  gestures: string[]
  interactions: string[]
}

interface VREvent {
  id: string
  name: string
  description: string
  type: 'social' | 'gaming' | 'education' | 'training' | 'entertainment'
  sceneId: string
  hostId: string
  startTime: number
  endTime: number
  maxAttendees: number
  attendees: string[]
  status: 'scheduled' | 'active' | 'ended' | 'cancelled'
  requirements: {
    devices?: string[]
    experience?: number
    permissions?: string[]
  }
  rewards: {
    currency?: number
    items?: string[]
    achievements?: string[]
  }
  createdAt: number
  updatedAt: number
}

class VRService {
  private config: VRConfig
  private devices: Map<string, VRDevice> = new Map()
  private scenes: Map<string, VRScene> = new Map()
  private objects: Map<string, VRObject> = new Map()
  private users: Map<string, VRUser> = new Map()
  private interactions: VRInteraction[] = []
  private events: Map<string, VREvent> = new Map()
  private updateTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<VRConfig> = {}) {
    this.config = {
      enabled: true,
      enableHandTracking: true,
      enableEyeTracking: true,
      enableHaptics: true,
      enableSpatialAudio: true,
      enableRoomScale: true,
      enablePassthrough: true,
      enableHands: true,
      enableVoice: true,
      enableGestures: true,
      enablePhysics: true,
      enableLighting: true,
      enableShadows: true,
      enableReflections: true,
      enableParticles: true,
      enableAnimations: true,
      enableInteractions: true,
      enableMultiplayer: true,
      enableRecording: true,
      enableStreaming: true,
      updateInterval: 1000, // 1 segundo
      renderDistance: 1000,
      fieldOfView: 110,
      refreshRate: 90,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar dados
    this.loadDevices()
    this.loadScenes()
    this.loadObjects()
    this.loadUsers()
    this.loadInteractions()
    this.loadEvents()

    // Inicializar dispositivos padrão
    this.initializeDefaultDevices()

    // Inicializar cenas padrão
    this.initializeDefaultScenes()

    // Inicializar usuários padrão
    this.initializeDefaultUsers()

    // Inicializar eventos padrão
    this.initializeDefaultEvents()

    // Iniciar atualizações
    this.startUpdates()
  }

  // Inicializar dispositivos padrão
  private initializeDefaultDevices(): void {
    const defaultDevices: VRDevice[] = [
      {
        id: 'vr_headset_1',
        name: 'VR Headset',
        type: 'headset',
        manufacturer: 'Meta',
        model: 'Quest 3',
        capabilities: ['hand_tracking', 'eye_tracking', 'passthrough', 'spatial_audio', 'haptics'],
        status: 'connected',
        batteryLevel: 85,
        firmwareVersion: 'v60.0.0',
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'vr_controller_left',
        name: 'Left Controller',
        type: 'controller',
        manufacturer: 'Meta',
        model: 'Quest 3 Controller',
        capabilities: ['tracking', 'haptics', 'buttons', 'triggers', 'grip'],
        status: 'connected',
        batteryLevel: 92,
        firmwareVersion: 'v60.0.0',
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'vr_controller_right',
        name: 'Right Controller',
        type: 'controller',
        manufacturer: 'Meta',
        model: 'Quest 3 Controller',
        capabilities: ['tracking', 'haptics', 'buttons', 'triggers', 'grip'],
        status: 'connected',
        batteryLevel: 88,
        firmwareVersion: 'v60.0.0',
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const device of defaultDevices) {
      this.devices.set(device.id, device)
    }
  }

  // Inicializar cenas padrão
  private initializeDefaultScenes(): void {
    const defaultScenes: VRScene[] = [
      {
        id: 'vr_scene_1',
        name: 'Virtual Office',
        description: 'Um escritório virtual para reuniões e colaboração',
        type: 'social',
        objects: [],
        lighting: {
          type: 'directional',
          color: { r: 1, g: 1, b: 1, a: 1 },
          intensity: 1.0,
          direction: { x: 0, y: -1, z: 0 },
          shadows: true,
          realtime: true
        },
        audio: {
          type: 'ambient',
          source: 'office_ambient.mp3',
          volume: 0.3,
          pitch: 1.0,
          loop: true,
          spatial: true,
          distance: 100,
          rolloff: 1.0,
          doppler: false
        },
        physics: {
          gravity: { x: 0, y: -9.81, z: 0 },
          airResistance: 0.1,
          friction: 0.8,
          bounce: 0.3,
          mass: 1.0,
          drag: 0.1,
          angularDrag: 0.1,
          kinematic: false,
          isTrigger: false
        },
        interactions: [],
        users: [],
        maxUsers: 20,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'vr_scene_2',
        name: 'Gaming Arena',
        description: 'Arena virtual para jogos e competições',
        type: 'game',
        objects: [],
        lighting: {
          type: 'point',
          color: { r: 1, g: 0.5, b: 0.5, a: 1 },
          intensity: 2.0,
          position: { x: 0, y: 5, z: 0 },
          range: 50,
          shadows: true,
          realtime: true
        },
        audio: {
          type: 'music',
          source: 'gaming_music.mp3',
          volume: 0.7,
          pitch: 1.0,
          loop: true,
          spatial: false,
          distance: 0,
          rolloff: 0,
          doppler: false
        },
        physics: {
          gravity: { x: 0, y: -9.81, z: 0 },
          airResistance: 0.05,
          friction: 0.6,
          bounce: 0.5,
          mass: 1.0,
          drag: 0.05,
          angularDrag: 0.05,
          kinematic: false,
          isTrigger: false
        },
        interactions: [],
        users: [],
        maxUsers: 10,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const scene of defaultScenes) {
      this.scenes.set(scene.id, scene)
    }
  }

  // Inicializar usuários padrão
  private initializeDefaultUsers(): void {
    const defaultUsers: VRUser[] = [
      {
        id: 'vr_user_1',
        username: 'AliceVR',
        avatar: {
          id: 'vr_avatar_1',
          name: 'Alice Avatar',
          appearance: {
            skin: 'light',
            hair: 'blonde',
            eyes: 'blue',
            clothing: 'casual',
            accessories: ['glasses']
          },
          animations: {
            idle: 'idle_1',
            walk: 'walk_1',
            run: 'run_1',
            jump: 'jump_1',
            wave: 'wave_1',
            point: 'point_1',
            grab: 'grab_1',
            throw: 'throw_1'
          },
          voice: {
            enabled: true,
            volume: 0.8,
            pitch: 1.0,
            spatial: true
          },
          gestures: ['wave', 'point', 'thumbs_up'],
          interactions: ['grab', 'throw', 'push', 'pull']
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        handPositions: {
          left: { x: -0.3, y: 0, z: 0 },
          right: { x: 0.3, y: 0, z: 0 }
        },
        handRotations: {
          left: { x: 0, y: 0, z: 0 },
          right: { x: 0, y: 0, z: 0 }
        },
        eyeTracking: {
          left: { x: 0, y: 0, z: 0 },
          right: { x: 0, y: 0, z: 0 },
          convergence: 0.06
        },
        voice: {
          enabled: true,
          volume: 0.8,
          pitch: 1.0,
          spatial: true
        },
        gestures: [],
        interactions: [],
        status: 'online',
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const user of defaultUsers) {
      this.users.set(user.id, user)
    }
  }

  // Inicializar eventos padrão
  private initializeDefaultEvents(): void {
    const defaultEvents: VREvent[] = [
      {
        id: 'vr_event_1',
        name: 'VR Meetup',
        description: 'Encontro virtual para networking e socialização',
        type: 'social',
        sceneId: 'vr_scene_1',
        hostId: 'vr_user_1',
        startTime: Date.now() + 3600000, // 1 hora
        endTime: Date.now() + 7200000, // 2 horas
        maxAttendees: 20,
        attendees: [],
        status: 'scheduled',
        requirements: {
          devices: ['vr_headset'],
          experience: 1,
          permissions: ['voice', 'hand_tracking']
        },
        rewards: {
          currency: 100,
          items: ['vr_badge'],
          achievements: ['first_vr_event']
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const event of defaultEvents) {
      this.events.set(event.id, event)
    }
  }

  // Iniciar atualizações
  private startUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    this.updateTimer = setInterval(() => {
      this.updateDevices()
      this.updateScenes()
      this.updateUsers()
      this.updateInteractions()
      this.updateEvents()
    }, this.config.updateInterval)
  }

  // Parar atualizações
  private stopUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // Atualizar dispositivos
  private updateDevices(): void {
    for (const device of this.devices.values()) {
      // Simular mudança de status
      if (Math.random() < 0.01) { // 1% chance de mudança
        const statuses: VRDevice['status'][] = ['connected', 'disconnected', 'error', 'calibrating']
        device.status = statuses[Math.floor(Math.random() * statuses.length)]
      }

      // Atualizar bateria
      if (device.batteryLevel !== undefined) {
        device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 0.1)
      }

      device.lastSeen = Date.now()
      device.updatedAt = Date.now()
    }

    this.saveDevices()
  }

  // Atualizar cenas
  private updateScenes(): void {
    for (const scene of this.scenes.values()) {
      // Atualizar física
      this.updateScenePhysics(scene)
      
      scene.updatedAt = Date.now()
    }

    this.saveScenes()
  }

  // Atualizar física da cena
  private updateScenePhysics(scene: VRScene): void {
    for (const object of scene.objects) {
      if (object.type === 'dynamic') {
        // Simular física básica
        object.position.y -= scene.physics.gravity.y * 0.016 // 60 FPS
        object.rotation.y += 0.01
      }
    }
  }

  // Atualizar usuários
  private updateUsers(): void {
    for (const user of this.users.values()) {
      // Simular movimento
      if (Math.random() < 0.1) { // 10% chance de movimento
        user.position.x += (Math.random() - 0.5) * 0.1
        user.position.z += (Math.random() - 0.5) * 0.1
        user.rotation.y += (Math.random() - 0.5) * 0.01
      }

      // Simular movimento das mãos
      if (Math.random() < 0.2) { // 20% chance de movimento das mãos
        user.handPositions.left.x += (Math.random() - 0.5) * 0.05
        user.handPositions.left.y += (Math.random() - 0.5) * 0.05
        user.handPositions.left.z += (Math.random() - 0.5) * 0.05
        
        user.handPositions.right.x += (Math.random() - 0.5) * 0.05
        user.handPositions.right.y += (Math.random() - 0.5) * 0.05
        user.handPositions.right.z += (Math.random() - 0.5) * 0.05
      }

      // Simular rastreamento ocular
      if (Math.random() < 0.3) { // 30% chance de movimento ocular
        user.eyeTracking.left.x += (Math.random() - 0.5) * 0.01
        user.eyeTracking.left.y += (Math.random() - 0.5) * 0.01
        user.eyeTracking.left.z += (Math.random() - 0.5) * 0.01
        
        user.eyeTracking.right.x += (Math.random() - 0.5) * 0.01
        user.eyeTracking.right.y += (Math.random() - 0.5) * 0.01
        user.eyeTracking.right.z += (Math.random() - 0.5) * 0.01
      }

      user.lastSeen = Date.now()
      user.updatedAt = Date.now()
    }

    this.saveUsers()
  }

  // Atualizar interações
  private updateInteractions(): void {
    // Simular interações
    if (Math.random() < 0.1) { // 10% chance de interação
      const users = Array.from(this.users.values())
      if (users.length > 0) {
        const user = users[Math.floor(Math.random() * users.length)]
        const objects = Array.from(this.objects.values())
        if (objects.length > 0) {
          const object = objects[Math.floor(Math.random() * objects.length)]
          
          this.addInteraction({
            type: 'grab',
            objectId: object.id,
            userId: user.id,
            parameters: { force: Math.random() * 10 },
            timestamp: Date.now(),
            duration: 1000,
            success: Math.random() > 0.1
          })
        }
      }
    }
  }

  // Atualizar eventos
  private updateEvents(): void {
    const now = Date.now()

    for (const event of this.events.values()) {
      if (event.status === 'scheduled' && now >= event.startTime) {
        event.status = 'active'
      } else if (event.status === 'active' && now >= event.endTime) {
        event.status = 'ended'
      }

      event.updatedAt = Date.now()
    }

    this.saveEvents()
  }

  // Criar cena VR
  createScene(scene: Omit<VRScene, 'id' | 'createdAt' | 'updatedAt'>): VRScene {
    const newScene: VRScene = {
      ...scene,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.scenes.set(newScene.id, newScene)
    this.saveScenes()

    return newScene
  }

  // Criar objeto VR
  createObject(name: string, type: VRObject['type'], position: { x: number; y: number; z: number }): VRObject {
    const object: VRObject = {
      id: this.generateId(),
      name,
      type,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      mesh: 'default_mesh',
      material: 'default_material',
      texture: 'default_texture',
      physics: type === 'dynamic',
      collider: true,
      interactive: type === 'interactive',
      grabbable: type === 'interactive',
      throwable: type === 'interactive',
      properties: {},
      animations: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.objects.set(object.id, object)
    this.saveObjects()

    return object
  }

  // Adicionar interação
  addInteraction(interaction: Omit<VRInteraction, 'id'>): VRInteraction {
    const newInteraction: VRInteraction = {
      ...interaction,
      id: this.generateId()
    }

    this.interactions.unshift(newInteraction)
    
    // Manter apenas os últimos 1000 registros
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(0, 1000)
    }

    this.saveInteractions()
    return newInteraction
  }

  // Obter dispositivos
  getDevices(type?: string, status?: string): VRDevice[] {
    let devices = Array.from(this.devices.values())

    if (type) {
      devices = devices.filter(device => device.type === type)
    }

    if (status) {
      devices = devices.filter(device => device.status === status)
    }

    return devices
  }

  // Obter cenas
  getScenes(type?: string, status?: string): VRScene[] {
    let scenes = Array.from(this.scenes.values())

    if (type) {
      scenes = scenes.filter(scene => scene.type === type)
    }

    if (status) {
      scenes = scenes.filter(scene => scene.status === status)
    }

    return scenes
  }

  // Obter objetos
  getObjects(type?: string): VRObject[] {
    let objects = Array.from(this.objects.values())

    if (type) {
      objects = objects.filter(object => object.type === type)
    }

    return objects
  }

  // Obter usuários
  getUsers(status?: string): VRUser[] {
    let users = Array.from(this.users.values())

    if (status) {
      users = users.filter(user => user.status === status)
    }

    return users
  }

  // Obter interações
  getInteractions(type?: string, userId?: string, limit?: number): VRInteraction[] {
    let interactions = [...this.interactions]

    if (type) {
      interactions = interactions.filter(interaction => interaction.type === type)
    }

    if (userId) {
      interactions = interactions.filter(interaction => interaction.userId === userId)
    }

    if (limit) {
      interactions = interactions.slice(0, limit)
    }

    return interactions
  }

  // Obter eventos
  getEvents(type?: string, status?: string): VREvent[] {
    let events = Array.from(this.events.values())

    if (type) {
      events = events.filter(event => event.type === type)
    }

    if (status) {
      events = events.filter(event => event.status === status)
    }

    return events
  }

  // Obter estatísticas
  getStats(): {
    totalDevices: number
    connectedDevices: number
    totalScenes: number
    activeScenes: number
    totalObjects: number
    totalUsers: number
    onlineUsers: number
    totalInteractions: number
    totalEvents: number
    activeEvents: number
    averageBatteryLevel: number
    averageHandTracking: number
    averageEyeTracking: number
  } {
    const totalDevices = this.devices.size
    const connectedDevices = Array.from(this.devices.values()).filter(d => d.status === 'connected').length
    const totalScenes = this.scenes.size
    const activeScenes = Array.from(this.scenes.values()).filter(s => s.status === 'active').length
    const totalObjects = this.objects.size
    const totalUsers = this.users.size
    const onlineUsers = Array.from(this.users.values()).filter(u => u.status === 'online').length
    const totalInteractions = this.interactions.length
    const totalEvents = this.events.size
    const activeEvents = Array.from(this.events.values()).filter(e => e.status === 'active').length

    const devicesWithBattery = Array.from(this.devices.values()).filter(d => d.batteryLevel !== undefined)
    const averageBatteryLevel = devicesWithBattery.length > 0
      ? devicesWithBattery.reduce((sum, d) => sum + (d.batteryLevel || 0), 0) / devicesWithBattery.length
      : 0

    const averageHandTracking = Array.from(this.users.values()).reduce((sum, u) => {
      const leftHand = Math.sqrt(u.handPositions.left.x ** 2 + u.handPositions.left.y ** 2 + u.handPositions.left.z ** 2)
      const rightHand = Math.sqrt(u.handPositions.right.x ** 2 + u.handPositions.right.y ** 2 + u.handPositions.right.z ** 2)
      return sum + (leftHand + rightHand) / 2
    }, 0) / Math.max(1, this.users.size)

    const averageEyeTracking = Array.from(this.users.values()).reduce((sum, u) => {
      const leftEye = Math.sqrt(u.eyeTracking.left.x ** 2 + u.eyeTracking.left.y ** 2 + u.eyeTracking.left.z ** 2)
      const rightEye = Math.sqrt(u.eyeTracking.right.x ** 2 + u.eyeTracking.right.y ** 2 + u.eyeTracking.right.z ** 2)
      return sum + (leftEye + rightEye) / 2
    }, 0) / Math.max(1, this.users.size)

    return {
      totalDevices,
      connectedDevices,
      totalScenes,
      activeScenes,
      totalObjects,
      totalUsers,
      onlineUsers,
      totalInteractions,
      totalEvents,
      activeEvents,
      averageBatteryLevel,
      averageHandTracking,
      averageEyeTracking
    }
  }

  // Métodos de utilidade
  private generateId(): string {
    return `vr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar dados
  private saveDevices(): void {
    try {
      const devices = Array.from(this.devices.values())
      localStorage.setItem('everest-vr-devices', JSON.stringify(devices))
    } catch (error) {
      console.error('Failed to save devices:', error)
    }
  }

  private loadDevices(): void {
    try {
      const stored = localStorage.getItem('everest-vr-devices')
      if (stored) {
        const devices = JSON.parse(stored)
        for (const device of devices) {
          this.devices.set(device.id, device)
        }
      }
    } catch (error) {
      console.error('Failed to load devices:', error)
    }
  }

  private saveScenes(): void {
    try {
      const scenes = Array.from(this.scenes.values())
      localStorage.setItem('everest-vr-scenes', JSON.stringify(scenes))
    } catch (error) {
      console.error('Failed to save scenes:', error)
    }
  }

  private loadScenes(): void {
    try {
      const stored = localStorage.getItem('everest-vr-scenes')
      if (stored) {
        const scenes = JSON.parse(stored)
        for (const scene of scenes) {
          this.scenes.set(scene.id, scene)
        }
      }
    } catch (error) {
      console.error('Failed to load scenes:', error)
    }
  }

  private saveObjects(): void {
    try {
      const objects = Array.from(this.objects.values())
      localStorage.setItem('everest-vr-objects', JSON.stringify(objects))
    } catch (error) {
      console.error('Failed to save objects:', error)
    }
  }

  private loadObjects(): void {
    try {
      const stored = localStorage.getItem('everest-vr-objects')
      if (stored) {
        const objects = JSON.parse(stored)
        for (const object of objects) {
          this.objects.set(object.id, object)
        }
      }
    } catch (error) {
      console.error('Failed to load objects:', error)
    }
  }

  private saveUsers(): void {
    try {
      const users = Array.from(this.users.values())
      localStorage.setItem('everest-vr-users', JSON.stringify(users))
    } catch (error) {
      console.error('Failed to save users:', error)
    }
  }

  private loadUsers(): void {
    try {
      const stored = localStorage.getItem('everest-vr-users')
      if (stored) {
        const users = JSON.parse(stored)
        for (const user of users) {
          this.users.set(user.id, user)
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  private saveInteractions(): void {
    try {
      localStorage.setItem('everest-vr-interactions', JSON.stringify(this.interactions))
    } catch (error) {
      console.error('Failed to save interactions:', error)
    }
  }

  private loadInteractions(): void {
    try {
      const stored = localStorage.getItem('everest-vr-interactions')
      if (stored) {
        this.interactions = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load interactions:', error)
    }
  }

  private saveEvents(): void {
    try {
      const events = Array.from(this.events.values())
      localStorage.setItem('everest-vr-events', JSON.stringify(events))
    } catch (error) {
      console.error('Failed to save events:', error)
    }
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem('everest-vr-events')
      if (stored) {
        const events = JSON.parse(stored)
        for (const event of events) {
          this.events.set(event.id, event)
        }
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<VRConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.updateInterval) {
      this.startUpdates()
    }
  }

  getConfig(): VRConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  // Limpar dados
  clearData(): void {
    this.devices.clear()
    this.scenes.clear()
    this.objects.clear()
    this.users.clear()
    this.interactions = []
    this.events.clear()
    
    localStorage.removeItem('everest-vr-devices')
    localStorage.removeItem('everest-vr-scenes')
    localStorage.removeItem('everest-vr-objects')
    localStorage.removeItem('everest-vr-users')
    localStorage.removeItem('everest-vr-interactions')
    localStorage.removeItem('everest-vr-events')
  }
}

// Instância global
export const vrService = new VRService()

// Hook para usar VR
export function useVR() {
  return {
    createScene: vrService.createScene.bind(vrService),
    createObject: vrService.createObject.bind(vrService),
    addInteraction: vrService.addInteraction.bind(vrService),
    getDevices: vrService.getDevices.bind(vrService),
    getScenes: vrService.getScenes.bind(vrService),
    getObjects: vrService.getObjects.bind(vrService),
    getUsers: vrService.getUsers.bind(vrService),
    getInteractions: vrService.getInteractions.bind(vrService),
    getEvents: vrService.getEvents.bind(vrService),
    getStats: vrService.getStats.bind(vrService),
    isEnabled: vrService.isEnabled.bind(vrService),
    clearData: vrService.clearData.bind(vrService),
    updateConfig: vrService.updateConfig.bind(vrService),
    getConfig: vrService.getConfig.bind(vrService)
  }
}
