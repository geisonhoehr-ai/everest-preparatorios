'use client'

interface IoTConfig {
  enabled: boolean
  enableSensors: boolean
  enableActuators: boolean
  enableGateways: boolean
  enableEdgeComputing: boolean
  enableRealTime: boolean
  enableSecurity: boolean
  enableAnalytics: boolean
  enableAutomation: boolean
  updateInterval: number
  maxDevices: number
}

interface IoTDevice {
  id: string
  name: string
  type: 'sensor' | 'actuator' | 'gateway' | 'edge'
  category: 'environmental' | 'security' | 'health' | 'automation' | 'energy'
  status: 'online' | 'offline' | 'error' | 'maintenance'
  location: {
    room: string
    building: string
    coordinates?: { x: number; y: number; z: number }
  }
  capabilities: string[]
  lastSeen: number
  batteryLevel?: number
  signalStrength?: number
  firmwareVersion: string
  createdAt: number
  updatedAt: number
}

interface SensorData {
  id: string
  deviceId: string
  sensorType: string
  value: number
  unit: string
  timestamp: number
  quality: 'good' | 'fair' | 'poor'
  metadata?: Record<string, any>
}

interface ActuatorCommand {
  id: string
  deviceId: string
  command: string
  parameters: Record<string, any>
  timestamp: number
  status: 'pending' | 'executing' | 'completed' | 'failed'
  result?: any
}

interface IoTAlert {
  id: string
  deviceId: string
  type: 'threshold' | 'anomaly' | 'offline' | 'battery' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value?: number
  threshold?: number
  timestamp: number
  acknowledged: boolean
  resolved: boolean
}

interface IoTScene {
  id: string
  name: string
  description: string
  triggers: SceneTrigger[]
  actions: SceneAction[]
  enabled: boolean
  createdAt: number
  lastExecuted?: number
}

interface SceneTrigger {
  id: string
  type: 'time' | 'sensor' | 'device' | 'manual'
  condition: string
  parameters: Record<string, any>
}

interface SceneAction {
  id: string
  deviceId: string
  command: string
  parameters: Record<string, any>
  delay?: number
}

class IoTService {
  private config: IoTConfig
  private devices: Map<string, IoTDevice> = new Map()
  private sensorData: SensorData[] = []
  private actuatorCommands: ActuatorCommand[] = []
  private alerts: IoTAlert[] = []
  private scenes: Map<string, IoTScene> = new Map()
  private updateTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<IoTConfig> = {}) {
    this.config = {
      enabled: true,
      enableSensors: true,
      enableActuators: true,
      enableGateways: true,
      enableEdgeComputing: true,
      enableRealTime: true,
      enableSecurity: true,
      enableAnalytics: true,
      enableAutomation: true,
      updateInterval: 5000, // 5 segundos
      maxDevices: 100,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar dispositivos
    this.loadDevices()

    // Carregar dados de sensores
    this.loadSensorData()

    // Carregar comandos de atuadores
    this.loadActuatorCommands()

    // Carregar alertas
    this.loadAlerts()

    // Carregar cenas
    this.loadScenes()

    // Inicializar dispositivos padrão
    this.initializeDefaultDevices()

    // Iniciar atualizações
    this.startUpdates()

    // Inicializar WebSocket para tempo real
    if (this.config.enableRealTime) {
      this.initializeWebSocket()
    }
  }

  // Inicializar dispositivos padrão
  private initializeDefaultDevices(): void {
    const defaultDevices: IoTDevice[] = [
      {
        id: 'temp_sensor_1',
        name: 'Sensor de Temperatura - Sala 1',
        type: 'sensor',
        category: 'environmental',
        status: 'online',
        location: { room: 'Sala 1', building: 'Prédio A' },
        capabilities: ['temperature', 'humidity'],
        lastSeen: Date.now(),
        batteryLevel: 85,
        signalStrength: -45,
        firmwareVersion: '1.2.3',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'light_switch_1',
        name: 'Interruptor Inteligente - Sala 1',
        type: 'actuator',
        category: 'automation',
        status: 'online',
        location: { room: 'Sala 1', building: 'Prédio A' },
        capabilities: ['on', 'off', 'dim'],
        lastSeen: Date.now(),
        signalStrength: -50,
        firmwareVersion: '2.1.0',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'motion_sensor_1',
        name: 'Sensor de Movimento - Corredor',
        type: 'sensor',
        category: 'security',
        status: 'online',
        location: { room: 'Corredor', building: 'Prédio A' },
        capabilities: ['motion', 'light'],
        lastSeen: Date.now(),
        batteryLevel: 92,
        signalStrength: -40,
        firmwareVersion: '1.5.2',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'gateway_1',
        name: 'Gateway Principal',
        type: 'gateway',
        category: 'automation',
        status: 'online',
        location: { room: 'Sala de Servidores', building: 'Prédio A' },
        capabilities: ['routing', 'protocol_conversion', 'data_aggregation'],
        lastSeen: Date.now(),
        signalStrength: -30,
        firmwareVersion: '3.0.1',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const device of defaultDevices) {
      this.devices.set(device.id, device)
    }
  }

  // Inicializar WebSocket
  private initializeWebSocket(): void {
    try {
      const ws = new WebSocket('ws://localhost:8080/iot')
      
      ws.onopen = () => {
        console.log('IoT WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleWebSocketMessage(data)
      }

      ws.onclose = () => {
        console.log('IoT WebSocket disconnected')
        // Tentar reconectar após 5 segundos
        setTimeout(() => this.initializeWebSocket(), 5000)
      }

      ws.onerror = (error) => {
        console.error('IoT WebSocket error:', error)
      }

      // Armazenar WebSocket para uso posterior
      ;(this as any).websocket = ws
    } catch (error) {
      console.error('Failed to initialize IoT WebSocket:', error)
    }
  }

  // Manipular mensagem WebSocket
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'sensor_data':
        this.addSensorData(data.data)
        break
      case 'device_status':
        this.updateDeviceStatus(data.deviceId, data.status)
        break
      case 'alert':
        this.addAlert(data.alert)
        break
      case 'command_result':
        this.updateActuatorCommand(data.commandId, data.result)
        break
    }
  }

  // Iniciar atualizações
  private startUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    this.updateTimer = setInterval(() => {
      this.updateDevices()
      this.generateSensorData()
      this.checkAlerts()
      this.executeScenes()
    }, this.config.updateInterval)
  }

  // Parar atualizações
  private stopUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // Atualizar status do dispositivo
  updateDeviceStatus(deviceId: string, status: IoTDevice['status']): boolean {
    const device = this.devices.get(deviceId)
    if (!device) return false

    device.status = status
    device.updatedAt = Date.now()
    this.saveDevices()
    return true
  }

  // Atualizar dispositivos
  private updateDevices(): void {
    for (const device of this.devices.values()) {
      // Simular atualização de status
      if (Math.random() < 0.1) { // 10% chance de mudança de status
        const statuses: IoTDevice['status'][] = ['online', 'offline', 'error']
        device.status = statuses[Math.floor(Math.random() * statuses.length)]
      }

      // Atualizar lastSeen
      device.lastSeen = Date.now()
      device.updatedAt = Date.now()

      // Simular mudança de bateria
      if (device.batteryLevel !== undefined) {
        device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 0.1)
      }

      // Simular mudança de sinal
      if (device.signalStrength !== undefined) {
        device.signalStrength = -30 - Math.random() * 50
      }
    }

    this.saveDevices()
  }

  // Gerar dados de sensores
  private generateSensorData(): void {
    if (!this.config.enableSensors) return

    for (const device of this.devices.values()) {
      if (device.type === 'sensor' && device.status === 'online') {
        for (const capability of device.capabilities) {
          const sensorData = this.generateSensorReading(device.id, capability)
          if (sensorData) {
            this.addSensorData(sensorData)
          }
        }
      }
    }
  }

  // Gerar leitura de sensor
  private generateSensorReading(deviceId: string, sensorType: string): SensorData | null {
    let value: number
    let unit: string
    let quality: SensorData['quality'] = 'good'

    switch (sensorType) {
      case 'temperature':
        value = 20 + Math.random() * 15 // 20-35°C
        unit = '°C'
        break
      case 'humidity':
        value = 40 + Math.random() * 40 // 40-80%
        unit = '%'
        break
      case 'motion':
        value = Math.random() < 0.1 ? 1 : 0 // 10% chance de movimento
        unit = 'boolean'
        break
      case 'light':
        value = Math.random() * 1000 // 0-1000 lux
        unit = 'lux'
        break
      case 'pressure':
        value = 1000 + Math.random() * 100 // 1000-1100 hPa
        unit = 'hPa'
        break
      default:
        return null
    }

    // Simular qualidade dos dados
    if (Math.random() < 0.05) { // 5% chance de qualidade ruim
      quality = Math.random() < 0.5 ? 'fair' : 'poor'
    }

    return {
      id: this.generateId(),
      deviceId,
      sensorType,
      value,
      unit,
      timestamp: Date.now(),
      quality,
      metadata: {
        generated: true,
        algorithm: 'simulation'
      }
    }
  }

  // Adicionar dados de sensor
  addSensorData(data: SensorData): void {
    this.sensorData.unshift(data)
    
    // Manter apenas os últimos 1000 registros
    if (this.sensorData.length > 1000) {
      this.sensorData = this.sensorData.slice(0, 1000)
    }

    this.saveSensorData()

    // Verificar alertas
    this.checkSensorAlerts(data)
  }

  // Verificar alertas de sensor
  private checkSensorAlerts(data: SensorData): void {
    const device = this.devices.get(data.deviceId)
    if (!device) return

    // Definir thresholds baseados no tipo de sensor
    const thresholds = this.getSensorThresholds(data.sensorType)
    
    if (thresholds) {
      if (data.value < thresholds.min || data.value > thresholds.max) {
        this.addAlert({
          deviceId: data.deviceId,
          type: 'threshold',
          severity: data.value < thresholds.criticalMin || data.value > thresholds.criticalMax ? 'critical' : 'high',
          message: `${data.sensorType} está fora do range normal: ${data.value}${data.unit}`,
          value: data.value,
          threshold: data.value < thresholds.min ? thresholds.min : thresholds.max,
          timestamp: Date.now(),
          acknowledged: false,
          resolved: false
        })
      }
    }
  }

  // Obter thresholds de sensor
  private getSensorThresholds(sensorType: string): { min: number; max: number; criticalMin: number; criticalMax: number } | null {
    const thresholds: Record<string, { min: number; max: number; criticalMin: number; criticalMax: number }> = {
      temperature: { min: 18, max: 30, criticalMin: 10, criticalMax: 40 },
      humidity: { min: 30, max: 70, criticalMin: 20, criticalMax: 90 },
      light: { min: 100, max: 800, criticalMin: 50, criticalMax: 1000 },
      pressure: { min: 950, max: 1050, criticalMin: 900, criticalMax: 1100 }
    }

    return thresholds[sensorType] || null
  }

  // Enviar comando para atuador
  sendActuatorCommand(deviceId: string, command: string, parameters: Record<string, any> = {}): ActuatorCommand | null {
    if (!this.config.enableActuators) return null

    const device = this.devices.get(deviceId)
    if (!device || device.type !== 'actuator') {
      console.error('Device not found or not an actuator')
      return null
    }

    const actuatorCommand: ActuatorCommand = {
      id: this.generateId(),
      deviceId,
      command,
      parameters,
      timestamp: Date.now(),
      status: 'pending'
    }

    this.actuatorCommands.unshift(actuatorCommand)
    this.saveActuatorCommands()

    // Simular execução do comando
    setTimeout(() => {
      this.executeActuatorCommand(actuatorCommand)
    }, 1000)

    return actuatorCommand
  }

  // Executar comando de atuador
  private executeActuatorCommand(command: ActuatorCommand): void {
    command.status = 'executing'

    // Simular execução
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% de sucesso
      
      if (success) {
        command.status = 'completed'
        command.result = { success: true, message: 'Command executed successfully' }
      } else {
        command.status = 'failed'
        command.result = { success: false, message: 'Command execution failed' }
      }

      this.saveActuatorCommands()
    }, 2000)
  }

  // Atualizar comando de atuador
  updateActuatorCommand(commandId: string, result: any): boolean {
    const command = this.actuatorCommands.find(cmd => cmd.id === commandId)
    if (!command) return false

    command.result = result
    command.status = 'completed'
    this.saveActuatorCommands()

    return true
  }

  // Adicionar alerta
  addAlert(alert: Omit<IoTAlert, 'id'>): IoTAlert {
    const newAlert: IoTAlert = {
      ...alert,
      id: this.generateId()
    }

    this.alerts.unshift(newAlert)
    this.saveAlerts()

    return newAlert
  }

  // Verificar alertas
  private checkAlerts(): void {
    // Verificar dispositivos offline
    for (const device of this.devices.values()) {
      if (device.status === 'offline' && Date.now() - device.lastSeen > 60000) { // 1 minuto
        const existingAlert = this.alerts.find(alert => 
          alert.deviceId === device.id && 
          alert.type === 'offline' && 
          !alert.resolved
        )

        if (!existingAlert) {
          this.addAlert({
            deviceId: device.id,
            type: 'offline',
            severity: 'high',
            message: `Dispositivo ${device.name} está offline`,
            timestamp: Date.now(),
            acknowledged: false,
            resolved: false
          })
        }
      }
    }

    // Verificar bateria baixa
    for (const device of this.devices.values()) {
      if (device.batteryLevel !== undefined && device.batteryLevel < 20) {
        const existingAlert = this.alerts.find(alert => 
          alert.deviceId === device.id && 
          alert.type === 'battery' && 
          !alert.resolved
        )

        if (!existingAlert) {
          this.addAlert({
            deviceId: device.id,
            type: 'battery',
            severity: device.batteryLevel < 10 ? 'critical' : 'medium',
            message: `Bateria baixa no dispositivo ${device.name}: ${device.batteryLevel.toFixed(1)}%`,
            value: device.batteryLevel,
            timestamp: Date.now(),
            acknowledged: false,
            resolved: false
          })
        }
      }
    }
  }

  // Criar cena
  createScene(scene: Omit<IoTScene, 'id' | 'createdAt'>): IoTScene {
    const newScene: IoTScene = {
      ...scene,
      id: this.generateId(),
      createdAt: Date.now()
    }

    this.scenes.set(newScene.id, newScene)
    this.saveScenes()

    return newScene
  }

  // Executar cena
  executeScene(sceneId: string): boolean {
    const scene = this.scenes.get(sceneId)
    if (!scene || !scene.enabled) return false

    // Verificar triggers
    const shouldExecute = this.checkSceneTriggers(scene)
    if (!shouldExecute) return false

    // Executar ações
    for (const action of scene.actions) {
      setTimeout(() => {
        this.sendActuatorCommand(action.deviceId, action.command, action.parameters)
      }, action.delay || 0)
    }

    scene.lastExecuted = Date.now()
    this.saveScenes()

    return true
  }

  // Verificar triggers da cena
  private checkSceneTriggers(scene: IoTScene): boolean {
    for (const trigger of scene.triggers) {
      switch (trigger.type) {
        case 'time':
          return this.checkTimeTrigger(trigger)
        case 'sensor':
          return this.checkSensorTrigger(trigger)
        case 'device':
          return this.checkDeviceTrigger(trigger)
        case 'manual':
          return true // Manual triggers são sempre verdadeiros
        default:
          return false
      }
    }
    return true
  }

  // Verificar trigger de tempo
  private checkTimeTrigger(trigger: SceneTrigger): boolean {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()

    // Simulação simples - verificar se é hora específica
    if (trigger.parameters.hour === hour && trigger.parameters.minute === minute) {
      return true
    }

    return false
  }

  // Verificar trigger de sensor
  private checkSensorTrigger(trigger: SceneTrigger): boolean {
    const deviceId = trigger.parameters.deviceId
    const sensorType = trigger.parameters.sensorType
    const condition = trigger.parameters.condition
    const value = trigger.parameters.value

    const latestData = this.sensorData.find(data => 
      data.deviceId === deviceId && 
      data.sensorType === sensorType
    )

    if (!latestData) return false

    switch (condition) {
      case 'greater_than':
        return latestData.value > value
      case 'less_than':
        return latestData.value < value
      case 'equals':
        return latestData.value === value
      default:
        return false
    }
  }

  // Verificar trigger de dispositivo
  private checkDeviceTrigger(trigger: SceneTrigger): boolean {
    const deviceId = trigger.parameters.deviceId
    const status = trigger.parameters.status

    const device = this.devices.get(deviceId)
    if (!device) return false

    return device.status === status
  }

  // Executar cenas
  private executeScenes(): void {
    if (!this.config.enableAutomation) return

    for (const scene of this.scenes.values()) {
      if (scene.enabled) {
        this.executeScene(scene.id)
      }
    }
  }

  // Obter dispositivos
  getDevices(category?: string, status?: string): IoTDevice[] {
    let devices = Array.from(this.devices.values())

    if (category) {
      devices = devices.filter(device => device.category === category)
    }

    if (status) {
      devices = devices.filter(device => device.status === status)
    }

    return devices
  }

  // Obter dados de sensores
  getSensorData(deviceId?: string, sensorType?: string, limit?: number): SensorData[] {
    let data = [...this.sensorData]

    if (deviceId) {
      data = data.filter(d => d.deviceId === deviceId)
    }

    if (sensorType) {
      data = data.filter(d => d.sensorType === sensorType)
    }

    if (limit) {
      data = data.slice(0, limit)
    }

    return data
  }

  // Obter comandos de atuadores
  getActuatorCommands(deviceId?: string, status?: string, limit?: number): ActuatorCommand[] {
    let commands = [...this.actuatorCommands]

    if (deviceId) {
      commands = commands.filter(cmd => cmd.deviceId === deviceId)
    }

    if (status) {
      commands = commands.filter(cmd => cmd.status === status)
    }

    if (limit) {
      commands = commands.slice(0, limit)
    }

    return commands
  }

  // Obter alertas
  getAlerts(severity?: string, resolved?: boolean, limit?: number): IoTAlert[] {
    let alerts = [...this.alerts]

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity)
    }

    if (resolved !== undefined) {
      alerts = alerts.filter(alert => alert.resolved === resolved)
    }

    if (limit) {
      alerts = alerts.slice(0, limit)
    }

    return alerts
  }

  // Obter cenas
  getScenes(enabled?: boolean): IoTScene[] {
    let scenes = Array.from(this.scenes.values())

    if (enabled !== undefined) {
      scenes = scenes.filter(scene => scene.enabled === enabled)
    }

    return scenes
  }

  // Obter estatísticas
  getStats(): {
    totalDevices: number
    onlineDevices: number
    offlineDevices: number
    totalSensorData: number
    totalCommands: number
    totalAlerts: number
    unresolvedAlerts: number
    totalScenes: number
    enabledScenes: number
    averageBatteryLevel: number
    averageSignalStrength: number
  } {
    const totalDevices = this.devices.size
    const onlineDevices = Array.from(this.devices.values()).filter(d => d.status === 'online').length
    const offlineDevices = Array.from(this.devices.values()).filter(d => d.status === 'offline').length
    const totalSensorData = this.sensorData.length
    const totalCommands = this.actuatorCommands.length
    const totalAlerts = this.alerts.length
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved).length
    const totalScenes = this.scenes.size
    const enabledScenes = Array.from(this.scenes.values()).filter(s => s.enabled).length

    const devicesWithBattery = Array.from(this.devices.values()).filter(d => d.batteryLevel !== undefined)
    const averageBatteryLevel = devicesWithBattery.length > 0 
      ? devicesWithBattery.reduce((sum, d) => sum + (d.batteryLevel || 0), 0) / devicesWithBattery.length
      : 0

    const devicesWithSignal = Array.from(this.devices.values()).filter(d => d.signalStrength !== undefined)
    const averageSignalStrength = devicesWithSignal.length > 0
      ? devicesWithSignal.reduce((sum, d) => sum + (d.signalStrength || 0), 0) / devicesWithSignal.length
      : 0

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      totalSensorData,
      totalCommands,
      totalAlerts,
      unresolvedAlerts,
      totalScenes,
      enabledScenes,
      averageBatteryLevel,
      averageSignalStrength
    }
  }

  // Métodos de utilidade
  private generateId(): string {
    return `iot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar dispositivos
  private saveDevices(): void {
    try {
      const devices = Array.from(this.devices.values())
      localStorage.setItem('everest-iot-devices', JSON.stringify(devices))
    } catch (error) {
      console.error('Failed to save devices:', error)
    }
  }

  // Carregar dispositivos
  private loadDevices(): void {
    try {
      const stored = localStorage.getItem('everest-iot-devices')
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

  // Salvar dados de sensores
  private saveSensorData(): void {
    try {
      localStorage.setItem('everest-iot-sensor-data', JSON.stringify(this.sensorData))
    } catch (error) {
      console.error('Failed to save sensor data:', error)
    }
  }

  // Carregar dados de sensores
  private loadSensorData(): void {
    try {
      const stored = localStorage.getItem('everest-iot-sensor-data')
      if (stored) {
        this.sensorData = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load sensor data:', error)
    }
  }

  // Salvar comandos de atuadores
  private saveActuatorCommands(): void {
    try {
      localStorage.setItem('everest-iot-actuator-commands', JSON.stringify(this.actuatorCommands))
    } catch (error) {
      console.error('Failed to save actuator commands:', error)
    }
  }

  // Carregar comandos de atuadores
  private loadActuatorCommands(): void {
    try {
      const stored = localStorage.getItem('everest-iot-actuator-commands')
      if (stored) {
        this.actuatorCommands = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load actuator commands:', error)
    }
  }

  // Salvar alertas
  private saveAlerts(): void {
    try {
      localStorage.setItem('everest-iot-alerts', JSON.stringify(this.alerts))
    } catch (error) {
      console.error('Failed to save alerts:', error)
    }
  }

  // Carregar alertas
  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem('everest-iot-alerts')
      if (stored) {
        this.alerts = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  // Salvar cenas
  private saveScenes(): void {
    try {
      const scenes = Array.from(this.scenes.values())
      localStorage.setItem('everest-iot-scenes', JSON.stringify(scenes))
    } catch (error) {
      console.error('Failed to save scenes:', error)
    }
  }

  // Carregar cenas
  private loadScenes(): void {
    try {
      const stored = localStorage.getItem('everest-iot-scenes')
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

  // Métodos de configuração
  updateConfig(newConfig: Partial<IoTConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.updateInterval) {
      this.startUpdates()
    }
  }

  getConfig(): IoTConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  // Limpar dados
  clearData(): void {
    this.devices.clear()
    this.sensorData = []
    this.actuatorCommands = []
    this.alerts = []
    this.scenes.clear()
    
    localStorage.removeItem('everest-iot-devices')
    localStorage.removeItem('everest-iot-sensor-data')
    localStorage.removeItem('everest-iot-actuator-commands')
    localStorage.removeItem('everest-iot-alerts')
    localStorage.removeItem('everest-iot-scenes')
  }
}

// Instância global
export const iotService = new IoTService()

// Hook para usar IoT
export function useIoT() {
  return {
    addSensorData: iotService.addSensorData.bind(iotService),
    sendActuatorCommand: iotService.sendActuatorCommand.bind(iotService),
    updateActuatorCommand: iotService.updateActuatorCommand.bind(iotService),
    addAlert: iotService.addAlert.bind(iotService),
    createScene: iotService.createScene.bind(iotService),
    executeScene: iotService.executeScene.bind(iotService),
    getDevices: iotService.getDevices.bind(iotService),
    getSensorData: iotService.getSensorData.bind(iotService),
    getActuatorCommands: iotService.getActuatorCommands.bind(iotService),
    getAlerts: iotService.getAlerts.bind(iotService),
    getScenes: iotService.getScenes.bind(iotService),
    getStats: iotService.getStats.bind(iotService),
    isEnabled: iotService.isEnabled.bind(iotService),
    clearData: iotService.clearData.bind(iotService),
    updateConfig: iotService.updateConfig.bind(iotService),
    getConfig: iotService.getConfig.bind(iotService)
  }
}
