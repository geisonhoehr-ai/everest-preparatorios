'use client'

interface MetaverseConfig {
  enabled: boolean
  enableVR: boolean
  enableAR: boolean
  enableMR: boolean
  enableAvatars: boolean
  enableVirtualWorlds: boolean
  enableSocialFeatures: boolean
  enableEconomy: boolean
  enableNFTs: boolean
  enableBlockchain: boolean
  enableAI: boolean
  enablePhysics: boolean
  enableAudio: boolean
  enableHaptics: boolean
  maxUsers: number
  worldSize: number
  updateInterval: number
}

interface VirtualWorld {
  id: string
  name: string
  description: string
  type: 'social' | 'gaming' | 'education' | 'business' | 'entertainment' | 'custom'
  size: {
    width: number
    height: number
    depth: number
  }
  environment: {
    skybox: string
    lighting: string
    weather: string
    timeOfDay: number
  }
  physics: {
    gravity: number
    friction: number
    bounce: number
    airResistance: number
  }
  objects: VirtualObject[]
  users: string[]
  maxUsers: number
  status: 'active' | 'inactive' | 'maintenance' | 'error'
  createdAt: number
  updatedAt: number
}

interface VirtualObject {
  id: string
  name: string
  type: 'static' | 'dynamic' | 'interactive' | 'avatar' | 'nft'
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  mesh: string
  texture: string
  material: string
  physics: boolean
  collider: boolean
  interactive: boolean
  properties: Record<string, any>
  ownerId?: string
  nftId?: string
  createdAt: number
  updatedAt: number
}

interface Avatar {
  id: string
  userId: string
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
    dance: string
  }
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  worldId: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: number
  createdAt: number
  updatedAt: number
}

interface MetaverseUser {
  id: string
  username: string
  email: string
  avatar: Avatar
  inventory: VirtualObject[]
  wallet: {
    currency: number
    nfts: string[]
    tokens: Record<string, number>
  }
  achievements: Achievement[]
  social: {
    friends: string[]
    followers: string[]
    following: string[]
    blocked: string[]
  }
  preferences: {
    voice: boolean
    haptics: boolean
    motionSickness: boolean
    accessibility: string[]
  }
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: number
  createdAt: number
  updatedAt: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: number
  progress: number
  maxProgress: number
}

interface MetaverseEvent {
  id: string
  name: string
  description: string
  type: 'social' | 'gaming' | 'education' | 'business' | 'entertainment'
  worldId: string
  hostId: string
  startTime: number
  endTime: number
  maxAttendees: number
  attendees: string[]
  status: 'scheduled' | 'active' | 'ended' | 'cancelled'
  requirements: {
    level?: number
    items?: string[]
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

interface MetaverseInteraction {
  id: string
  type: 'chat' | 'voice' | 'gesture' | 'object_interaction' | 'world_interaction'
  fromUserId: string
  toUserId?: string
  worldId: string
  data: any
  timestamp: number
  position?: { x: number; y: number; z: number }
}

interface MetaverseEconomy {
  id: string
  type: 'purchase' | 'sale' | 'trade' | 'reward' | 'auction'
  fromUserId: string
  toUserId?: string
  itemId?: string
  nftId?: string
  amount: number
  currency: string
  worldId: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
}

class MetaverseService {
  private config: MetaverseConfig
  private worlds: Map<string, VirtualWorld> = new Map()
  private users: Map<string, MetaverseUser> = new Map()
  private avatars: Map<string, Avatar> = new Map()
  private objects: Map<string, VirtualObject> = new Map()
  private events: Map<string, MetaverseEvent> = new Map()
  private interactions: MetaverseInteraction[] = []
  private economy: MetaverseEconomy[] = []
  private updateTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<MetaverseConfig> = {}) {
    this.config = {
      enabled: true,
      enableVR: true,
      enableAR: true,
      enableMR: true,
      enableAvatars: true,
      enableVirtualWorlds: true,
      enableSocialFeatures: true,
      enableEconomy: true,
      enableNFTs: true,
      enableBlockchain: true,
      enableAI: true,
      enablePhysics: true,
      enableAudio: true,
      enableHaptics: true,
      maxUsers: 1000,
      worldSize: 1000,
      updateInterval: 1000, // 1 segundo
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar dados
    this.loadWorlds()
    this.loadUsers()
    this.loadAvatars()
    this.loadObjects()
    this.loadEvents()
    this.loadInteractions()
    this.loadEconomy()

    // Inicializar mundos padrão
    this.initializeDefaultWorlds()

    // Inicializar usuários padrão
    this.initializeDefaultUsers()

    // Inicializar eventos padrão
    this.initializeDefaultEvents()

    // Iniciar atualizações
    this.startUpdates()
  }

  // Inicializar mundos padrão
  private initializeDefaultWorlds(): void {
    const defaultWorlds: VirtualWorld[] = [
      {
        id: 'world_social_hub',
        name: 'Social Hub',
        description: 'Um mundo social para interação e networking',
        type: 'social',
        size: { width: 500, height: 100, depth: 500 },
        environment: {
          skybox: 'sunset',
          lighting: 'warm',
          weather: 'clear',
          timeOfDay: 0.5
        },
        physics: {
          gravity: 9.81,
          friction: 0.8,
          bounce: 0.3,
          airResistance: 0.1
        },
        objects: [],
        users: [],
        maxUsers: 100,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'world_gaming_arena',
        name: 'Gaming Arena',
        description: 'Arena para jogos e competições',
        type: 'gaming',
        size: { width: 1000, height: 200, depth: 1000 },
        environment: {
          skybox: 'space',
          lighting: 'neon',
          weather: 'clear',
          timeOfDay: 0.8
        },
        physics: {
          gravity: 9.81,
          friction: 0.6,
          bounce: 0.5,
          airResistance: 0.05
        },
        objects: [],
        users: [],
        maxUsers: 50,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'world_education_campus',
        name: 'Education Campus',
        description: 'Campus virtual para educação e aprendizado',
        type: 'education',
        size: { width: 800, height: 150, depth: 800 },
        environment: {
          skybox: 'day',
          lighting: 'bright',
          weather: 'clear',
          timeOfDay: 0.3
        },
        physics: {
          gravity: 9.81,
          friction: 0.9,
          bounce: 0.1,
          airResistance: 0.2
        },
        objects: [],
        users: [],
        maxUsers: 200,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const world of defaultWorlds) {
      this.worlds.set(world.id, world)
    }
  }

  // Inicializar usuários padrão
  private initializeDefaultUsers(): void {
    const defaultUsers: MetaverseUser[] = [
      {
        id: 'user_1',
        username: 'Alice',
        email: 'alice@metaverse.com',
        avatar: {
          id: 'avatar_1',
          userId: 'user_1',
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
            dance: 'dance_1'
          },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          worldId: 'world_social_hub',
          status: 'online',
          lastSeen: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        inventory: [],
        wallet: {
          currency: 1000,
          nfts: [],
          tokens: { 'METAVERSE_TOKEN': 100 }
        },
        achievements: [],
        social: {
          friends: [],
          followers: [],
          following: [],
          blocked: []
        },
        preferences: {
          voice: true,
          haptics: true,
          motionSickness: false,
          accessibility: []
        },
        status: 'online',
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'user_2',
        username: 'Bob',
        email: 'bob@metaverse.com',
        avatar: {
          id: 'avatar_2',
          userId: 'user_2',
          name: 'Bob Avatar',
          appearance: {
            skin: 'medium',
            hair: 'brown',
            eyes: 'brown',
            clothing: 'formal',
            accessories: ['watch']
          },
          animations: {
            idle: 'idle_2',
            walk: 'walk_2',
            run: 'run_2',
            jump: 'jump_2',
            wave: 'wave_2',
            dance: 'dance_2'
          },
          position: { x: 10, y: 0, z: 10 },
          rotation: { x: 0, y: 0, z: 0 },
          worldId: 'world_social_hub',
          status: 'online',
          lastSeen: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        inventory: [],
        wallet: {
          currency: 500,
          nfts: [],
          tokens: { 'METAVERSE_TOKEN': 50 }
        },
        achievements: [],
        social: {
          friends: [],
          followers: [],
          following: [],
          blocked: []
        },
        preferences: {
          voice: true,
          haptics: false,
          motionSickness: true,
          accessibility: ['subtitles']
        },
        status: 'online',
        lastSeen: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const user of defaultUsers) {
      this.users.set(user.id, user)
      this.avatars.set(user.avatar.id, user.avatar)
    }
  }

  // Inicializar eventos padrão
  private initializeDefaultEvents(): void {
    const defaultEvents: MetaverseEvent[] = [
      {
        id: 'event_1',
        name: 'Welcome Party',
        description: 'Festa de boas-vindas para novos usuários',
        type: 'social',
        worldId: 'world_social_hub',
        hostId: 'user_1',
        startTime: Date.now() + 3600000, // 1 hora
        endTime: Date.now() + 7200000, // 2 horas
        maxAttendees: 50,
        attendees: [],
        status: 'scheduled',
        requirements: {},
        rewards: {
          currency: 100,
          items: ['welcome_hat'],
          achievements: ['first_event']
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'event_2',
        name: 'Gaming Tournament',
        description: 'Torneio de jogos com prêmios',
        type: 'gaming',
        worldId: 'world_gaming_arena',
        hostId: 'user_2',
        startTime: Date.now() + 86400000, // 1 dia
        endTime: Date.now() + 90000000, // 1 dia + 1 hora
        maxAttendees: 20,
        attendees: [],
        status: 'scheduled',
        requirements: {
          level: 5,
          items: ['gaming_controller']
        },
        rewards: {
          currency: 500,
          items: ['champion_trophy'],
          achievements: ['tournament_winner']
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
      this.updateWorlds()
      this.updateUsers()
      this.updateAvatars()
      this.updateEvents()
      this.processInteractions()
      this.processEconomy()
    }, this.config.updateInterval)
  }

  // Parar atualizações
  private stopUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // Atualizar mundos
  private updateWorlds(): void {
    for (const world of this.worlds.values()) {
      // Atualizar ambiente
      world.environment.timeOfDay = (world.environment.timeOfDay + 0.001) % 1
      
      // Atualizar física
      this.updateWorldPhysics(world)
      
      world.updatedAt = Date.now()
    }

    this.saveWorlds()
  }

  // Atualizar física do mundo
  private updateWorldPhysics(world: VirtualWorld): void {
    for (const object of world.objects) {
      if (object.type === 'dynamic' && object.physics) {
        // Simular física básica
        object.position.y -= world.physics.gravity * 0.016 // 60 FPS
        object.rotation.y += 0.01
      }
    }
  }

  // Atualizar usuários
  private updateUsers(): void {
    for (const user of this.users.values()) {
      // Atualizar status
      if (Math.random() < 0.01) { // 1% chance de mudança de status
        const statuses: MetaverseUser['status'][] = ['online', 'away', 'busy']
        user.status = statuses[Math.floor(Math.random() * statuses.length)]
      }

      user.lastSeen = Date.now()
      user.updatedAt = Date.now()
    }

    this.saveUsers()
  }

  // Atualizar avatares
  private updateAvatars(): void {
    for (const avatar of this.avatars.values()) {
      // Simular movimento
      if (Math.random() < 0.1) { // 10% chance de movimento
        avatar.position.x += (Math.random() - 0.5) * 2
        avatar.position.z += (Math.random() - 0.5) * 2
        avatar.rotation.y += (Math.random() - 0.5) * 0.1
      }

      avatar.lastSeen = Date.now()
      avatar.updatedAt = Date.now()
    }

    this.saveAvatars()
  }

  // Atualizar eventos
  private updateEvents(): void {
    const now = Date.now()

    for (const event of this.events.values()) {
      if (event.status === 'scheduled' && now >= event.startTime) {
        event.status = 'active'
      } else if (event.status === 'active' && now >= event.endTime) {
        event.status = 'ended'
        this.processEventRewards(event)
      }

      event.updatedAt = Date.now()
    }

    this.saveEvents()
  }

  // Processar recompensas do evento
  private processEventRewards(event: MetaverseEvent): void {
    for (const userId of event.attendees) {
      const user = this.users.get(userId)
      if (!user) continue

      // Adicionar moeda
      if (event.rewards.currency) {
        user.wallet.currency += event.rewards.currency
      }

      // Adicionar itens
      if (event.rewards.items) {
        for (const itemId of event.rewards.items) {
          const item = this.createVirtualObject(itemId, 'interactive', { x: 0, y: 0, z: 0 })
          if (item) {
            user.inventory.push(item)
          }
        }
      }

      // Adicionar conquistas
      if (event.rewards.achievements) {
        for (const achievementId of event.rewards.achievements) {
          const achievement: Achievement = {
            id: achievementId,
            name: `Achievement: ${achievementId}`,
            description: `Unlocked by attending ${event.name}`,
            icon: 'achievement_icon',
            rarity: 'common',
            unlockedAt: Date.now(),
            progress: 1,
            maxProgress: 1
          }
          user.achievements.push(achievement)
        }
      }

      this.users.set(userId, user)
    }
  }

  // Processar interações
  private processInteractions(): void {
    // Simular interações
    if (Math.random() < 0.1) { // 10% chance de interação
      const users = Array.from(this.users.values())
      if (users.length >= 2) {
        const fromUser = users[Math.floor(Math.random() * users.length)]
        const toUser = users[Math.floor(Math.random() * users.length)]
        
        if (fromUser.id !== toUser.id) {
          this.addInteraction({
            type: 'chat',
            fromUserId: fromUser.id,
            toUserId: toUser.id,
            worldId: fromUser.avatar.worldId,
            data: { message: 'Hello!' },
            timestamp: Date.now()
          })
        }
      }
    }
  }

  // Processar economia
  private processEconomy(): void {
    // Simular transações econômicas
    if (Math.random() < 0.05) { // 5% chance de transação
      const users = Array.from(this.users.values())
      if (users.length >= 2) {
        const fromUser = users[Math.floor(Math.random() * users.length)]
        const toUser = users[Math.floor(Math.random() * users.length)]
        
        if (fromUser.id !== toUser.id) {
          const amount = Math.floor(Math.random() * 100) + 1
          
          this.addEconomyTransaction({
            type: 'trade',
            fromUserId: fromUser.id,
            toUserId: toUser.id,
            amount,
            currency: 'METAVERSE_TOKEN',
            worldId: fromUser.avatar.worldId,
            timestamp: Date.now(),
            status: 'completed'
          })
        }
      }
    }
  }

  // Criar mundo virtual
  createWorld(world: Omit<VirtualWorld, 'id' | 'createdAt' | 'updatedAt'>): VirtualWorld {
    const newWorld: VirtualWorld = {
      ...world,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.worlds.set(newWorld.id, newWorld)
    this.saveWorlds()

    return newWorld
  }

  // Criar objeto virtual
  createVirtualObject(name: string, type: VirtualObject['type'], position: { x: number; y: number; z: number }): VirtualObject | null {
    const object: VirtualObject = {
      id: this.generateId(),
      name,
      type,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      mesh: 'default_mesh',
      texture: 'default_texture',
      material: 'default_material',
      physics: type === 'dynamic',
      collider: true,
      interactive: type === 'interactive',
      properties: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.objects.set(object.id, object)
    this.saveObjects()

    return object
  }

  // Criar evento
  createEvent(event: Omit<MetaverseEvent, 'id' | 'createdAt' | 'updatedAt'>): MetaverseEvent {
    const newEvent: MetaverseEvent = {
      ...event,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.events.set(newEvent.id, newEvent)
    this.saveEvents()

    return newEvent
  }

  // Adicionar interação
  addInteraction(interaction: Omit<MetaverseInteraction, 'id'>): MetaverseInteraction {
    const newInteraction: MetaverseInteraction = {
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

  // Adicionar transação econômica
  addEconomyTransaction(transaction: Omit<MetaverseEconomy, 'id'>): MetaverseEconomy {
    const newTransaction: MetaverseEconomy = {
      ...transaction,
      id: this.generateId()
    }

    this.economy.unshift(newTransaction)
    
    // Manter apenas os últimos 1000 registros
    if (this.economy.length > 1000) {
      this.economy = this.economy.slice(0, 1000)
    }

    this.saveEconomy()
    return newTransaction
  }

  // Obter mundos
  getWorlds(type?: string, status?: string): VirtualWorld[] {
    let worlds = Array.from(this.worlds.values())

    if (type) {
      worlds = worlds.filter(world => world.type === type)
    }

    if (status) {
      worlds = worlds.filter(world => world.status === status)
    }

    return worlds
  }

  // Obter usuários
  getUsers(status?: string): MetaverseUser[] {
    let users = Array.from(this.users.values())

    if (status) {
      users = users.filter(user => user.status === status)
    }

    return users
  }

  // Obter avatares
  getAvatars(worldId?: string, status?: string): Avatar[] {
    let avatars = Array.from(this.avatars.values())

    if (worldId) {
      avatars = avatars.filter(avatar => avatar.worldId === worldId)
    }

    if (status) {
      avatars = avatars.filter(avatar => avatar.status === status)
    }

    return avatars
  }

  // Obter objetos
  getObjects(type?: string, worldId?: string): VirtualObject[] {
    let objects = Array.from(this.objects.values())

    if (type) {
      objects = objects.filter(object => object.type === type)
    }

    if (worldId) {
      // Filtrar por mundo (implementar lógica específica)
    }

    return objects
  }

  // Obter eventos
  getEvents(type?: string, status?: string): MetaverseEvent[] {
    let events = Array.from(this.events.values())

    if (type) {
      events = events.filter(event => event.type === type)
    }

    if (status) {
      events = events.filter(event => event.status === status)
    }

    return events
  }

  // Obter interações
  getInteractions(type?: string, worldId?: string, limit?: number): MetaverseInteraction[] {
    let interactions = [...this.interactions]

    if (type) {
      interactions = interactions.filter(interaction => interaction.type === type)
    }

    if (worldId) {
      interactions = interactions.filter(interaction => interaction.worldId === worldId)
    }

    if (limit) {
      interactions = interactions.slice(0, limit)
    }

    return interactions
  }

  // Obter transações econômicas
  getEconomyTransactions(type?: string, worldId?: string, limit?: number): MetaverseEconomy[] {
    let transactions = [...this.economy]

    if (type) {
      transactions = transactions.filter(transaction => transaction.type === type)
    }

    if (worldId) {
      transactions = transactions.filter(transaction => transaction.worldId === worldId)
    }

    if (limit) {
      transactions = transactions.slice(0, limit)
    }

    return transactions
  }

  // Obter estatísticas
  getStats(): {
    totalWorlds: number
    activeWorlds: number
    totalUsers: number
    onlineUsers: number
    totalAvatars: number
    onlineAvatars: number
    totalObjects: number
    totalEvents: number
    activeEvents: number
    totalInteractions: number
    totalEconomyTransactions: number
    averageUsersPerWorld: number
    averageInteractionsPerMinute: number
    totalCurrency: number
  } {
    const totalWorlds = this.worlds.size
    const activeWorlds = Array.from(this.worlds.values()).filter(w => w.status === 'active').length
    const totalUsers = this.users.size
    const onlineUsers = Array.from(this.users.values()).filter(u => u.status === 'online').length
    const totalAvatars = this.avatars.size
    const onlineAvatars = Array.from(this.avatars.values()).filter(a => a.status === 'online').length
    const totalObjects = this.objects.size
    const totalEvents = this.events.size
    const activeEvents = Array.from(this.events.values()).filter(e => e.status === 'active').length
    const totalInteractions = this.interactions.length
    const totalEconomyTransactions = this.economy.length

    const averageUsersPerWorld = totalWorlds > 0 ? totalUsers / totalWorlds : 0
    const averageInteractionsPerMinute = totalInteractions / 60 // Simplificado

    const totalCurrency = Array.from(this.users.values()).reduce((sum, user) => sum + user.wallet.currency, 0)

    return {
      totalWorlds,
      activeWorlds,
      totalUsers,
      onlineUsers,
      totalAvatars,
      onlineAvatars,
      totalObjects,
      totalEvents,
      activeEvents,
      totalInteractions,
      totalEconomyTransactions,
      averageUsersPerWorld,
      averageInteractionsPerMinute,
      totalCurrency
    }
  }

  // Métodos de utilidade
  private generateId(): string {
    return `meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar dados
  private saveWorlds(): void {
    try {
      const worlds = Array.from(this.worlds.values())
      localStorage.setItem('everest-metaverse-worlds', JSON.stringify(worlds))
    } catch (error) {
      console.error('Failed to save worlds:', error)
    }
  }

  private loadWorlds(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-worlds')
      if (stored) {
        const worlds = JSON.parse(stored)
        for (const world of worlds) {
          this.worlds.set(world.id, world)
        }
      }
    } catch (error) {
      console.error('Failed to load worlds:', error)
    }
  }

  private saveUsers(): void {
    try {
      const users = Array.from(this.users.values())
      localStorage.setItem('everest-metaverse-users', JSON.stringify(users))
    } catch (error) {
      console.error('Failed to save users:', error)
    }
  }

  private loadUsers(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-users')
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

  private saveAvatars(): void {
    try {
      const avatars = Array.from(this.avatars.values())
      localStorage.setItem('everest-metaverse-avatars', JSON.stringify(avatars))
    } catch (error) {
      console.error('Failed to save avatars:', error)
    }
  }

  private loadAvatars(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-avatars')
      if (stored) {
        const avatars = JSON.parse(stored)
        for (const avatar of avatars) {
          this.avatars.set(avatar.id, avatar)
        }
      }
    } catch (error) {
      console.error('Failed to load avatars:', error)
    }
  }

  private saveObjects(): void {
    try {
      const objects = Array.from(this.objects.values())
      localStorage.setItem('everest-metaverse-objects', JSON.stringify(objects))
    } catch (error) {
      console.error('Failed to save objects:', error)
    }
  }

  private loadObjects(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-objects')
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

  private saveEvents(): void {
    try {
      const events = Array.from(this.events.values())
      localStorage.setItem('everest-metaverse-events', JSON.stringify(events))
    } catch (error) {
      console.error('Failed to save events:', error)
    }
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-events')
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

  private saveInteractions(): void {
    try {
      localStorage.setItem('everest-metaverse-interactions', JSON.stringify(this.interactions))
    } catch (error) {
      console.error('Failed to save interactions:', error)
    }
  }

  private loadInteractions(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-interactions')
      if (stored) {
        this.interactions = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load interactions:', error)
    }
  }

  private saveEconomy(): void {
    try {
      localStorage.setItem('everest-metaverse-economy', JSON.stringify(this.economy))
    } catch (error) {
      console.error('Failed to save economy:', error)
    }
  }

  private loadEconomy(): void {
    try {
      const stored = localStorage.getItem('everest-metaverse-economy')
      if (stored) {
        this.economy = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load economy:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<MetaverseConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.updateInterval) {
      this.startUpdates()
    }
  }

  getConfig(): MetaverseConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  // Limpar dados
  clearData(): void {
    this.worlds.clear()
    this.users.clear()
    this.avatars.clear()
    this.objects.clear()
    this.events.clear()
    this.interactions = []
    this.economy = []
    
    localStorage.removeItem('everest-metaverse-worlds')
    localStorage.removeItem('everest-metaverse-users')
    localStorage.removeItem('everest-metaverse-avatars')
    localStorage.removeItem('everest-metaverse-objects')
    localStorage.removeItem('everest-metaverse-events')
    localStorage.removeItem('everest-metaverse-interactions')
    localStorage.removeItem('everest-metaverse-economy')
  }
}

// Instância global
export const metaverseService = new MetaverseService()

// Hook para usar metaverso
export function useMetaverse() {
  return {
    createWorld: metaverseService.createWorld.bind(metaverseService),
    createVirtualObject: metaverseService.createVirtualObject.bind(metaverseService),
    createEvent: metaverseService.createEvent.bind(metaverseService),
    addInteraction: metaverseService.addInteraction.bind(metaverseService),
    addEconomyTransaction: metaverseService.addEconomyTransaction.bind(metaverseService),
    getWorlds: metaverseService.getWorlds.bind(metaverseService),
    getUsers: metaverseService.getUsers.bind(metaverseService),
    getAvatars: metaverseService.getAvatars.bind(metaverseService),
    getObjects: metaverseService.getObjects.bind(metaverseService),
    getEvents: metaverseService.getEvents.bind(metaverseService),
    getInteractions: metaverseService.getInteractions.bind(metaverseService),
    getEconomyTransactions: metaverseService.getEconomyTransactions.bind(metaverseService),
    getStats: metaverseService.getStats.bind(metaverseService),
    isEnabled: metaverseService.isEnabled.bind(metaverseService),
    clearData: metaverseService.clearData.bind(metaverseService),
    updateConfig: metaverseService.updateConfig.bind(metaverseService),
    getConfig: metaverseService.getConfig.bind(metaverseService)
  }
}
