'use client'

interface CloudConfig {
  enabled: boolean
  enableAutoScaling: boolean
  enableLoadBalancing: boolean
  enableCDN: boolean
  enableDatabase: boolean
  enableStorage: boolean
  enableCompute: boolean
  enableNetworking: boolean
  enableSecurity: boolean
  enableMonitoring: boolean
  enableBackup: boolean
  enableDisasterRecovery: boolean
  enableMultiRegion: boolean
  enableHybridCloud: boolean
  enableServerless: boolean
  enableContainers: boolean
  enableKubernetes: boolean
  enableMicroservices: boolean
  enableAPIGateway: boolean
  enableMessageQueue: boolean
  maxInstances: number
  minInstances: number
  targetCPU: number
  targetMemory: number
  updateInterval: number
}

interface CloudInstance {
  id: string
  name: string
  type: 'compute' | 'database' | 'storage' | 'network' | 'security' | 'monitoring'
  provider: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'linode' | 'custom'
  region: string
  zone: string
  size: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'maintenance'
  resources: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  cost: {
    hourly: number
    monthly: number
    total: number
  }
  tags: string[]
  createdAt: number
  updatedAt: number
}

interface CloudService {
  id: string
  name: string
  type: 'api' | 'database' | 'storage' | 'cdn' | 'load_balancer' | 'monitoring' | 'security' | 'backup'
  provider: string
  region: string
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  configuration: Record<string, any>
  metrics: {
    requests: number
    latency: number
    errors: number
    availability: number
  }
  cost: {
    hourly: number
    monthly: number
    total: number
  }
  createdAt: number
  updatedAt: number
}

interface CloudDeployment {
  id: string
  name: string
  type: 'application' | 'database' | 'infrastructure' | 'container' | 'serverless'
  environment: 'development' | 'staging' | 'production'
  status: 'deploying' | 'deployed' | 'failed' | 'rolling_back' | 'rolled_back'
  version: string
  instances: string[]
  services: string[]
  configuration: Record<string, any>
  metrics: {
    deploymentTime: number
    successRate: number
    rollbackRate: number
    uptime: number
  }
  createdAt: number
  updatedAt: number
}

interface CloudMetric {
  id: string
  serviceId: string
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'requests' | 'latency' | 'errors' | 'cost'
  value: number
  unit: string
  timestamp: number
  tags: Record<string, string>
}

interface CloudAlert {
  id: string
  name: string
  type: 'threshold' | 'anomaly' | 'error' | 'cost' | 'security' | 'performance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  condition: string
  threshold: number
  currentValue: number
  status: 'active' | 'resolved' | 'acknowledged'
  triggeredAt: number
  resolvedAt?: number
  notifications: string[]
}

class CloudComputingService {
  private config: CloudConfig
  private instances: Map<string, CloudInstance> = new Map()
  private services: Map<string, CloudService> = new Map()
  private deployments: Map<string, CloudDeployment> = new Map()
  private metrics: CloudMetric[] = []
  private alerts: CloudAlert[] = []
  private updateTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CloudConfig> = {}) {
    this.config = {
      enabled: true,
      enableAutoScaling: true,
      enableLoadBalancing: true,
      enableCDN: true,
      enableDatabase: true,
      enableStorage: true,
      enableCompute: true,
      enableNetworking: true,
      enableSecurity: true,
      enableMonitoring: true,
      enableBackup: true,
      enableDisasterRecovery: true,
      enableMultiRegion: true,
      enableHybridCloud: true,
      enableServerless: true,
      enableContainers: true,
      enableKubernetes: true,
      enableMicroservices: true,
      enableAPIGateway: true,
      enableMessageQueue: true,
      maxInstances: 100,
      minInstances: 1,
      targetCPU: 70,
      targetMemory: 80,
      updateInterval: 5000, // 5 segundos
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar dados
    this.loadInstances()
    this.loadServices()
    this.loadDeployments()
    this.loadMetrics()
    this.loadAlerts()

    // Inicializar instâncias padrão
    this.initializeDefaultInstances()

    // Inicializar serviços padrão
    this.initializeDefaultServices()

    // Inicializar deployments padrão
    this.initializeDefaultDeployments()

    // Iniciar atualizações
    this.startUpdates()
  }

  // Inicializar instâncias padrão
  private initializeDefaultInstances(): void {
    const defaultInstances: CloudInstance[] = [
      {
        id: 'instance_1',
        name: 'Web Server 1',
        type: 'compute',
        provider: 'aws',
        region: 'us-east-1',
        zone: 'us-east-1a',
        size: 't3.medium',
        status: 'running',
        resources: { cpu: 2, memory: 4, storage: 20, network: 1000 },
        cost: { hourly: 0.0416, monthly: 30, total: 360 },
        tags: ['web', 'production', 'auto-scaling'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'instance_2',
        name: 'Database Server',
        type: 'database',
        provider: 'aws',
        region: 'us-east-1',
        zone: 'us-east-1b',
        size: 'r5.large',
        status: 'running',
        resources: { cpu: 2, memory: 16, storage: 100, network: 1000 },
        cost: { hourly: 0.126, monthly: 90, total: 1080 },
        tags: ['database', 'production', 'high-availability'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'instance_3',
        name: 'Storage Server',
        type: 'storage',
        provider: 'aws',
        region: 'us-east-1',
        zone: 'us-east-1c',
        size: 'i3.large',
        status: 'running',
        resources: { cpu: 2, memory: 15, storage: 500, network: 1000 },
        cost: { hourly: 0.156, monthly: 112, total: 1344 },
        tags: ['storage', 'production', 'backup'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const instance of defaultInstances) {
      this.instances.set(instance.id, instance)
    }
  }

  // Inicializar serviços padrão
  private initializeDefaultServices(): void {
    const defaultServices: CloudService[] = [
      {
        id: 'service_1',
        name: 'Load Balancer',
        type: 'load_balancer',
        provider: 'aws',
        region: 'us-east-1',
        status: 'active',
        configuration: { algorithm: 'round_robin', health_check: true },
        metrics: { requests: 1000, latency: 50, errors: 5, availability: 99.9 },
        cost: { hourly: 0.0225, monthly: 16, total: 192 },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'service_2',
        name: 'CDN',
        type: 'cdn',
        provider: 'aws',
        region: 'global',
        status: 'active',
        configuration: { edge_locations: 200, cache_ttl: 3600 },
        metrics: { requests: 10000, latency: 20, errors: 2, availability: 99.99 },
        cost: { hourly: 0.05, monthly: 36, total: 432 },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'service_3',
        name: 'Monitoring',
        type: 'monitoring',
        provider: 'aws',
        region: 'us-east-1',
        status: 'active',
        configuration: { metrics_retention: 30, alerting: true },
        metrics: { requests: 500, latency: 10, errors: 1, availability: 99.95 },
        cost: { hourly: 0.01, monthly: 7, total: 84 },
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const service of defaultServices) {
      this.services.set(service.id, service)
    }
  }

  // Inicializar deployments padrão
  private initializeDefaultDeployments(): void {
    const defaultDeployments: CloudDeployment[] = [
      {
        id: 'deployment_1',
        name: 'Web Application',
        type: 'application',
        environment: 'production',
        status: 'deployed',
        version: '1.2.3',
        instances: ['instance_1'],
        services: ['service_1', 'service_2'],
        configuration: { replicas: 3, auto_scaling: true },
        metrics: { deploymentTime: 300, successRate: 99.5, rollbackRate: 0.5, uptime: 99.9 },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'deployment_2',
        name: 'Database Cluster',
        type: 'database',
        environment: 'production',
        status: 'deployed',
        version: '2.1.0',
        instances: ['instance_2'],
        services: ['service_3'],
        configuration: { replicas: 2, backup: true },
        metrics: { deploymentTime: 600, successRate: 99.8, rollbackRate: 0.2, uptime: 99.95 },
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]

    for (const deployment of defaultDeployments) {
      this.deployments.set(deployment.id, deployment)
    }
  }

  // Iniciar atualizações
  private startUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    this.updateTimer = setInterval(() => {
      this.updateInstances()
      this.updateServices()
      this.updateDeployments()
      this.collectMetrics()
      this.checkAlerts()
      this.autoScale()
    }, this.config.updateInterval)
  }

  // Parar atualizações
  private stopUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // Atualizar instâncias
  private updateInstances(): void {
    for (const instance of this.instances.values()) {
      // Simular mudança de status
      if (Math.random() < 0.01) { // 1% chance de mudança
        const statuses: CloudInstance['status'][] = ['running', 'stopped', 'starting', 'stopping', 'error', 'maintenance']
        instance.status = statuses[Math.floor(Math.random() * statuses.length)]
      }

      // Atualizar recursos
      instance.resources.cpu = Math.max(0, Math.min(100, instance.resources.cpu + (Math.random() - 0.5) * 10))
      instance.resources.memory = Math.max(0, Math.min(100, instance.resources.memory + (Math.random() - 0.5) * 5))
      instance.resources.storage = Math.max(0, Math.min(100, instance.resources.storage + (Math.random() - 0.5) * 2))
      instance.resources.network = Math.max(0, Math.min(100, instance.resources.network + (Math.random() - 0.5) * 15))

      // Atualizar custo
      instance.cost.total += instance.cost.hourly / 3600 // Incremento por segundo

      instance.updatedAt = Date.now()
    }

    this.saveInstances()
  }

  // Atualizar serviços
  private updateServices(): void {
    for (const service of this.services.values()) {
      // Atualizar métricas
      service.metrics.requests += Math.floor(Math.random() * 100)
      service.metrics.latency = Math.max(10, service.metrics.latency + (Math.random() - 0.5) * 20)
      service.metrics.errors += Math.floor(Math.random() * 5)
      service.metrics.availability = Math.max(95, Math.min(100, service.metrics.availability + (Math.random() - 0.5) * 2))

      // Atualizar custo
      service.cost.total += service.cost.hourly / 3600

      service.updatedAt = Date.now()
    }

    this.saveServices()
  }

  // Atualizar deployments
  private updateDeployments(): void {
    for (const deployment of this.deployments.values()) {
      // Atualizar métricas
      deployment.metrics.uptime = Math.max(95, Math.min(100, deployment.metrics.uptime + (Math.random() - 0.5) * 1))
      deployment.metrics.successRate = Math.max(95, Math.min(100, deployment.metrics.successRate + (Math.random() - 0.5) * 2))

      deployment.updatedAt = Date.now()
    }

    this.saveDeployments()
  }

  // Coletar métricas
  private collectMetrics(): void {
    for (const instance of this.instances.values()) {
      // CPU
      this.addMetric({
        serviceId: instance.id,
        type: 'cpu',
        value: instance.resources.cpu,
        unit: 'percent',
        timestamp: Date.now(),
        tags: { instance: instance.name, type: instance.type }
      })

      // Memory
      this.addMetric({
        serviceId: instance.id,
        type: 'memory',
        value: instance.resources.memory,
        unit: 'percent',
        timestamp: Date.now(),
        tags: { instance: instance.name, type: instance.type }
      })

      // Network
      this.addMetric({
        serviceId: instance.id,
        type: 'network',
        value: instance.resources.network,
        unit: 'mbps',
        timestamp: Date.now(),
        tags: { instance: instance.name, type: instance.type }
      })
    }

    for (const service of this.services.values()) {
      // Requests
      this.addMetric({
        serviceId: service.id,
        type: 'requests',
        value: service.metrics.requests,
        unit: 'requests_per_second',
        timestamp: Date.now(),
        tags: { service: service.name, type: service.type }
      })

      // Latency
      this.addMetric({
        serviceId: service.id,
        type: 'latency',
        value: service.metrics.latency,
        unit: 'milliseconds',
        timestamp: Date.now(),
        tags: { service: service.name, type: service.type }
      })

      // Errors
      this.addMetric({
        serviceId: service.id,
        type: 'errors',
        value: service.metrics.errors,
        unit: 'errors_per_second',
        timestamp: Date.now(),
        tags: { service: service.name, type: service.type }
      })
    }
  }

  // Verificar alertas
  private checkAlerts(): void {
    for (const instance of this.instances.values()) {
      // CPU alto
      if (instance.resources.cpu > 90) {
        this.createAlert({
          name: `High CPU on ${instance.name}`,
          type: 'threshold',
          severity: 'high',
          condition: 'cpu > 90%',
          threshold: 90,
          currentValue: instance.resources.cpu,
          status: 'active',
          triggeredAt: Date.now(),
          notifications: ['email', 'slack']
        })
      }

      // Memory alto
      if (instance.resources.memory > 95) {
        this.createAlert({
          name: `High Memory on ${instance.name}`,
          type: 'threshold',
          severity: 'critical',
          condition: 'memory > 95%',
          threshold: 95,
          currentValue: instance.resources.memory,
          status: 'active',
          triggeredAt: Date.now(),
          notifications: ['email', 'slack', 'sms']
        })
      }
    }

    for (const service of this.services.values()) {
      // Latência alta
      if (service.metrics.latency > 1000) {
        this.createAlert({
          name: `High Latency on ${service.name}`,
          type: 'performance',
          severity: 'medium',
          condition: 'latency > 1000ms',
          threshold: 1000,
          currentValue: service.metrics.latency,
          status: 'active',
          triggeredAt: Date.now(),
          notifications: ['email']
        })
      }

      // Muitos erros
      if (service.metrics.errors > 100) {
        this.createAlert({
          name: `High Error Rate on ${service.name}`,
          type: 'error',
          severity: 'high',
          condition: 'errors > 100/s',
          threshold: 100,
          currentValue: service.metrics.errors,
          status: 'active',
          triggeredAt: Date.now(),
          notifications: ['email', 'slack']
        })
      }
    }
  }

  // Auto scaling
  private autoScale(): void {
    if (!this.config.enableAutoScaling) return

    const runningInstances = Array.from(this.instances.values()).filter(i => i.status === 'running')
    const totalCPU = runningInstances.reduce((sum, i) => sum + i.resources.cpu, 0) / runningInstances.length
    const totalMemory = runningInstances.reduce((sum, i) => sum + i.resources.memory, 0) / runningInstances.length

    // Scale up
    if ((totalCPU > this.config.targetCPU || totalMemory > this.config.targetMemory) && 
        runningInstances.length < this.config.maxInstances) {
      this.createInstance({
        name: `Auto-scaled Instance ${Date.now()}`,
        type: 'compute',
        provider: 'aws',
        region: 'us-east-1',
        zone: 'us-east-1a',
        size: 't3.medium',
        status: 'starting',
        resources: { cpu: 0, memory: 0, storage: 20, network: 1000 },
        cost: { hourly: 0.0416, monthly: 30, total: 0 },
        tags: ['auto-scaled', 'production']
      })
    }

    // Scale down
    if ((totalCPU < this.config.targetCPU * 0.5 && totalMemory < this.config.targetMemory * 0.5) && 
        runningInstances.length > this.config.minInstances) {
      const instanceToStop = runningInstances[Math.floor(Math.random() * runningInstances.length)]
      if (instanceToStop && instanceToStop.tags.includes('auto-scaled')) {
        instanceToStop.status = 'stopping'
        this.instances.set(instanceToStop.id, instanceToStop)
      }
    }
  }

  // Criar instância
  createInstance(instance: Omit<CloudInstance, 'id' | 'createdAt' | 'updatedAt'>): CloudInstance {
    const newInstance: CloudInstance = {
      ...instance,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.instances.set(newInstance.id, newInstance)
    this.saveInstances()

    return newInstance
  }

  // Criar serviço
  createService(service: Omit<CloudService, 'id' | 'createdAt' | 'updatedAt'>): CloudService {
    const newService: CloudService = {
      ...service,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.services.set(newService.id, newService)
    this.saveServices()

    return newService
  }

  // Criar deployment
  createDeployment(deployment: Omit<CloudDeployment, 'id' | 'createdAt' | 'updatedAt'>): CloudDeployment {
    const newDeployment: CloudDeployment = {
      ...deployment,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.deployments.set(newDeployment.id, newDeployment)
    this.saveDeployments()

    return newDeployment
  }

  // Adicionar métrica
  addMetric(metric: Omit<CloudMetric, 'id'>): CloudMetric {
    const newMetric: CloudMetric = {
      ...metric,
      id: this.generateId()
    }

    this.metrics.unshift(newMetric)
    
    // Manter apenas os últimos 1000 registros
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(0, 1000)
    }

    this.saveMetrics()
    return newMetric
  }

  // Criar alerta
  createAlert(alert: Omit<CloudAlert, 'id'>): CloudAlert {
    const newAlert: CloudAlert = {
      ...alert,
      id: this.generateId()
    }

    this.alerts.unshift(newAlert)
    
    // Manter apenas os últimos 1000 registros
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000)
    }

    this.saveAlerts()
    return newAlert
  }

  // Obter instâncias
  getInstances(type?: string, status?: string): CloudInstance[] {
    let instances = Array.from(this.instances.values())

    if (type) {
      instances = instances.filter(instance => instance.type === type)
    }

    if (status) {
      instances = instances.filter(instance => instance.status === status)
    }

    return instances
  }

  // Obter serviços
  getServices(type?: string, status?: string): CloudService[] {
    let services = Array.from(this.services.values())

    if (type) {
      services = services.filter(service => service.type === type)
    }

    if (status) {
      services = services.filter(service => service.status === status)
    }

    return services
  }

  // Obter deployments
  getDeployments(environment?: string, status?: string): CloudDeployment[] {
    let deployments = Array.from(this.deployments.values())

    if (environment) {
      deployments = deployments.filter(deployment => deployment.environment === environment)
    }

    if (status) {
      deployments = deployments.filter(deployment => deployment.status === status)
    }

    return deployments
  }

  // Obter métricas
  getMetrics(serviceId?: string, type?: string, limit?: number): CloudMetric[] {
    let metrics = [...this.metrics]

    if (serviceId) {
      metrics = metrics.filter(metric => metric.serviceId === serviceId)
    }

    if (type) {
      metrics = metrics.filter(metric => metric.type === type)
    }

    if (limit) {
      metrics = metrics.slice(0, limit)
    }

    return metrics
  }

  // Obter alertas
  getAlerts(severity?: string, status?: string, limit?: number): CloudAlert[] {
    let alerts = [...this.alerts]

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity)
    }

    if (status) {
      alerts = alerts.filter(alert => alert.status === status)
    }

    if (limit) {
      alerts = alerts.slice(0, limit)
    }

    return alerts
  }

  // Obter estatísticas
  getStats(): {
    totalInstances: number
    runningInstances: number
    totalServices: number
    activeServices: number
    totalDeployments: number
    deployedDeployments: number
    totalMetrics: number
    totalAlerts: number
    activeAlerts: number
    totalCost: number
    averageCPU: number
    averageMemory: number
    averageLatency: number
    averageAvailability: number
  } {
    const totalInstances = this.instances.size
    const runningInstances = Array.from(this.instances.values()).filter(i => i.status === 'running').length
    const totalServices = this.services.size
    const activeServices = Array.from(this.services.values()).filter(s => s.status === 'active').length
    const totalDeployments = this.deployments.size
    const deployedDeployments = Array.from(this.deployments.values()).filter(d => d.status === 'deployed').length
    const totalMetrics = this.metrics.length
    const totalAlerts = this.alerts.length
    const activeAlerts = this.alerts.filter(a => a.status === 'active').length

    const totalCost = Array.from(this.instances.values()).reduce((sum, i) => sum + i.cost.total, 0) +
                     Array.from(this.services.values()).reduce((sum, s) => sum + s.cost.total, 0)

    const runningInstancesList = Array.from(this.instances.values()).filter(i => i.status === 'running')
    const averageCPU = runningInstancesList.length > 0
      ? runningInstancesList.reduce((sum, i) => sum + i.resources.cpu, 0) / runningInstancesList.length
      : 0

    const averageMemory = runningInstancesList.length > 0
      ? runningInstancesList.reduce((sum, i) => sum + i.resources.memory, 0) / runningInstancesList.length
      : 0

    const activeServicesList = Array.from(this.services.values()).filter(s => s.status === 'active')
    const averageLatency = activeServicesList.length > 0
      ? activeServicesList.reduce((sum, s) => sum + s.metrics.latency, 0) / activeServicesList.length
      : 0

    const averageAvailability = activeServicesList.length > 0
      ? activeServicesList.reduce((sum, s) => sum + s.metrics.availability, 0) / activeServicesList.length
      : 0

    return {
      totalInstances,
      runningInstances,
      totalServices,
      activeServices,
      totalDeployments,
      deployedDeployments,
      totalMetrics,
      totalAlerts,
      activeAlerts,
      totalCost,
      averageCPU,
      averageMemory,
      averageLatency,
      averageAvailability
    }
  }

  // Métodos de utilidade
  private generateId(): string {
    return `cloud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar dados
  private saveInstances(): void {
    try {
      const instances = Array.from(this.instances.values())
      localStorage.setItem('everest-cloud-instances', JSON.stringify(instances))
    } catch (error) {
      console.error('Failed to save instances:', error)
    }
  }

  private loadInstances(): void {
    try {
      const stored = localStorage.getItem('everest-cloud-instances')
      if (stored) {
        const instances = JSON.parse(stored)
        for (const instance of instances) {
          this.instances.set(instance.id, instance)
        }
      }
    } catch (error) {
      console.error('Failed to load instances:', error)
    }
  }

  private saveServices(): void {
    try {
      const services = Array.from(this.services.values())
      localStorage.setItem('everest-cloud-services', JSON.stringify(services))
    } catch (error) {
      console.error('Failed to save services:', error)
    }
  }

  private loadServices(): void {
    try {
      const stored = localStorage.getItem('everest-cloud-services')
      if (stored) {
        const services = JSON.parse(stored)
        for (const service of services) {
          this.services.set(service.id, service)
        }
      }
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }

  private saveDeployments(): void {
    try {
      const deployments = Array.from(this.deployments.values())
      localStorage.setItem('everest-cloud-deployments', JSON.stringify(deployments))
    } catch (error) {
      console.error('Failed to save deployments:', error)
    }
  }

  private loadDeployments(): void {
    try {
      const stored = localStorage.getItem('everest-cloud-deployments')
      if (stored) {
        const deployments = JSON.parse(stored)
        for (const deployment of deployments) {
          this.deployments.set(deployment.id, deployment)
        }
      }
    } catch (error) {
      console.error('Failed to load deployments:', error)
    }
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('everest-cloud-metrics', JSON.stringify(this.metrics))
    } catch (error) {
      console.error('Failed to save metrics:', error)
    }
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem('everest-cloud-metrics')
      if (stored) {
        this.metrics = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  private saveAlerts(): void {
    try {
      localStorage.setItem('everest-cloud-alerts', JSON.stringify(this.alerts))
    } catch (error) {
      console.error('Failed to save alerts:', error)
    }
  }

  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem('everest-cloud-alerts')
      if (stored) {
        this.alerts = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<CloudConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.updateInterval) {
      this.startUpdates()
    }
  }

  getConfig(): CloudConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  // Limpar dados
  clearData(): void {
    this.instances.clear()
    this.services.clear()
    this.deployments.clear()
    this.metrics = []
    this.alerts = []
    
    localStorage.removeItem('everest-cloud-instances')
    localStorage.removeItem('everest-cloud-services')
    localStorage.removeItem('everest-cloud-deployments')
    localStorage.removeItem('everest-cloud-metrics')
    localStorage.removeItem('everest-cloud-alerts')
  }
}

// Instância global
export const cloudComputingService = new CloudComputingService()

// Hook para usar cloud computing
export function useCloudComputing() {
  return {
    createInstance: cloudComputingService.createInstance.bind(cloudComputingService),
    createService: cloudComputingService.createService.bind(cloudComputingService),
    createDeployment: cloudComputingService.createDeployment.bind(cloudComputingService),
    addMetric: cloudComputingService.addMetric.bind(cloudComputingService),
    createAlert: cloudComputingService.createAlert.bind(cloudComputingService),
    getInstances: cloudComputingService.getInstances.bind(cloudComputingService),
    getServices: cloudComputingService.getServices.bind(cloudComputingService),
    getDeployments: cloudComputingService.getDeployments.bind(cloudComputingService),
    getMetrics: cloudComputingService.getMetrics.bind(cloudComputingService),
    getAlerts: cloudComputingService.getAlerts.bind(cloudComputingService),
    getStats: cloudComputingService.getStats.bind(cloudComputingService),
    isEnabled: cloudComputingService.isEnabled.bind(cloudComputingService),
    clearData: cloudComputingService.clearData.bind(cloudComputingService),
    updateConfig: cloudComputingService.updateConfig.bind(cloudComputingService),
    getConfig: cloudComputingService.getConfig.bind(cloudComputingService)
  }
}

