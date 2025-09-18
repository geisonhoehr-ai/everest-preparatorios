'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
  id?: string
}

interface WebSocketOptions {
  url: string
  protocols?: string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onMessage?: (message: WebSocketMessage) => void
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private options: WebSocketOptions
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []
  private isConnected = false
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.options.url, this.options.protocols)

        this.ws.onopen = () => {
          console.log('[WebSocket] Conectado')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.flushMessageQueue()
          this.options.onOpen?.()
          resolve()
        }

        this.ws.onclose = () => {
          console.log('[WebSocket] Desconectado')
          this.isConnected = false
          this.stopHeartbeat()
          this.options.onClose?.()
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Erro:', error)
          this.options.onError?.(error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('[WebSocket] Erro ao processar mensagem:', error)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    // Notificar listeners específicos
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message.data)
        } catch (error) {
          console.error('[WebSocket] Erro no listener:', error)
        }
      })
    }

    // Notificar listener geral
    this.options.onMessage?.(message)
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
      console.error('[WebSocket] Máximo de tentativas de reconexão atingido')
      return
    }

    this.reconnectAttempts++
    console.log(`[WebSocket] Tentativa de reconexão ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`)

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error)
    }, this.options.reconnectInterval)
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift()
      if (message) {
        this.sendRaw(message)
      }
    }
  }

  send(type: string, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    }

    if (this.isConnected) {
      this.sendRaw(message)
    } else {
      this.messageQueue.push(message)
    }
  }

  private sendRaw(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Sistema de listeners
  on(type: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)

    // Retornar função para remover listener
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(listener)
        if (listeners.size === 0) {
          this.listeners.delete(type)
        }
      }
    }
  }

  off(type: string, listener: (data: any) => void): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(type)
      }
    }
  }

  // Métodos específicos do app
  joinRoom(roomId: string): void {
    this.send('join_room', { roomId })
  }

  leaveRoom(roomId: string): void {
    this.send('leave_room', { roomId })
  }

  sendToRoom(roomId: string, type: string, data: any): void {
    this.send('room_message', { roomId, type, data })
  }

  // Notificações em tempo real
  notifyFlashcardStudied(topicId: string, score: number): void {
    this.send('flashcard_studied', { topicId, score })
  }

  notifyQuizCompleted(quizId: string, score: number): void {
    this.send('quiz_completed', { quizId, score })
  }

  notifyUserOnline(userId: string): void {
    this.send('user_online', { userId })
  }

  notifyUserOffline(userId: string): void {
    this.send('user_offline', { userId })
  }

  // Chat em tempo real
  sendChatMessage(roomId: string, message: string): void {
    this.send('chat_message', { roomId, message })
  }

  // Colaboração em tempo real
  shareScreen(roomId: string): void {
    this.send('share_screen', { roomId })
  }

  stopScreenShare(roomId: string): void {
    this.send('stop_screen_share', { roomId })
  }

  // Status
  getConnectionState(): number {
    return this.ws?.readyState || WebSocket.CLOSED
  }

  isReady(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  // Limpar recursos
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
    this.listeners.clear()
    this.messageQueue = []
  }

  destroy(): void {
    this.disconnect()
  }
}

// Instância global
let wsManager: WebSocketManager | null = null

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager
}

export function createWebSocketManager(options: WebSocketOptions): WebSocketManager {
  if (wsManager) {
    wsManager.destroy()
  }

  wsManager = new WebSocketManager(options)
  return wsManager
}

// Hook para usar WebSocket
export function useWebSocket(options: Partial<WebSocketOptions> = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<number>(WebSocket.CLOSED)
  const [error, setError] = useState<Event | null>(null)

  const manager = useRef<WebSocketManager | null>(null)

  useEffect(() => {
    const wsOptions: WebSocketOptions = {
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
      onOpen: () => {
        setIsConnected(true)
        setConnectionState(WebSocket.OPEN)
        setError(null)
      },
      onClose: () => {
        setIsConnected(false)
        setConnectionState(WebSocket.CLOSED)
      },
      onError: (err) => {
        setError(err)
        setIsConnected(false)
        setConnectionState(WebSocket.CLOSED)
      },
      ...options
    }

    manager.current = createWebSocketManager(wsOptions)

    return () => {
      manager.current?.destroy()
    }
  }, [])

  const connect = useCallback(async () => {
    if (manager.current) {
      try {
        await manager.current.connect()
      } catch (err) {
        setError(err as Event)
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    manager.current?.disconnect()
  }, [])

  const send = useCallback((type: string, data: any) => {
    manager.current?.send(type, data)
  }, [])

  const on = useCallback((type: string, listener: (data: any) => void) => {
    return manager.current?.on(type, listener) || (() => {})
  }, [])

  return {
    isConnected,
    connectionState,
    error,
    connect,
    disconnect,
    send,
    on,
    manager: manager.current
  }
}

// Hook para chat em tempo real
export function useRealtimeChat(roomId: string) {
  const { send, on, isConnected } = useWebSocket()
  const [messages, setMessages] = useState<Array<{
    id: string
    userId: string
    message: string
    timestamp: number
  }>>([])
  const [users, setUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isConnected) {
      send('join_room', { roomId })
    }
  }, [isConnected, roomId, send])

  useEffect(() => {
    const unsubscribe = on('chat_message', (data: any) => {
      if (data.roomId === roomId) {
        setMessages(prev => [...prev, {
          id: data.id,
          userId: data.userId,
          message: data.message,
          timestamp: data.timestamp
        }])
      }
    })

    return unsubscribe
  }, [on, roomId])

  useEffect(() => {
    const unsubscribe = on('user_joined', (data: any) => {
      if (data.roomId === roomId) {
        setUsers(prev => new Set([...prev, data.userId]))
      }
    })

    return unsubscribe
  }, [on, roomId])

  useEffect(() => {
    const unsubscribe = on('user_left', (data: any) => {
      if (data.roomId === roomId) {
        setUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    })

    return unsubscribe
  }, [on, roomId])

  const sendMessage = useCallback((message: string) => {
    send('chat_message', { roomId, message })
  }, [send, roomId])

  return {
    messages,
    users: Array.from(users),
    sendMessage,
    isConnected
  }
}
