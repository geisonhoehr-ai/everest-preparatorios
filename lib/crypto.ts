'use client'

interface CryptoConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  tagLength: number
  enableCompression: boolean
  enableHashing: boolean
  enableSigning: boolean
  enableKeyDerivation: boolean
}

interface EncryptionResult {
  encrypted: string
  iv: string
  tag: string
  algorithm: string
  keyId: string
}

interface DecryptionResult {
  decrypted: string
  algorithm: string
  keyId: string
}

interface KeyPair {
  publicKey: string
  privateKey: string
  keyId: string
  createdAt: number
  expiresAt?: number
}

interface HashResult {
  hash: string
  algorithm: string
  salt?: string
  iterations?: number
}

class CryptoService {
  private config: CryptoConfig
  private keyStore: Map<string, CryptoKey> = new Map()
  private keyPairs: Map<string, KeyPair> = new Map()

  constructor(config: Partial<CryptoConfig> = {}) {
    this.config = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12,
      tagLength: 128,
      enableCompression: true,
      enableHashing: true,
      enableSigning: true,
      enableKeyDerivation: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar chaves do localStorage
    this.loadKeys()

    // Gerar chave mestra se não existir
    this.ensureMasterKey()
  }

  // Gerar chave mestra
  private async ensureMasterKey(): Promise<void> {
    const masterKeyId = 'master_key'
    
    if (!this.keyStore.has(masterKeyId)) {
      const key = await this.generateKey()
      this.keyStore.set(masterKeyId, key)
      this.saveKeys()
    }
  }

  // Gerar chave
  async generateKey(keyId?: string): Promise<CryptoKey> {
    const key = await crypto.subtle.generateKey(
      {
        name: this.config.algorithm,
        length: this.config.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    )

    if (keyId) {
      this.keyStore.set(keyId, key)
      this.saveKeys()
    }

    return key
  }

  // Gerar par de chaves
  async generateKeyPair(keyId?: string): Promise<KeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    )

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

    const keyPairData: KeyPair = {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey),
      keyId: keyId || this.generateKeyId(),
      createdAt: Date.now()
    }

    if (keyId) {
      this.keyPairs.set(keyId, keyPairData)
      this.saveKeys()
    }

    return keyPairData
  }

  // Criptografar dados
  async encrypt(data: string, keyId?: string): Promise<EncryptionResult> {
    const key = keyId ? this.keyStore.get(keyId) : this.keyStore.get('master_key')
    if (!key) {
      throw new Error('Key not found')
    }

    // Comprimir se habilitado
    let dataToEncrypt = data
    if (this.config.enableCompression) {
      dataToEncrypt = await this.compress(data)
    }

    // Converter para ArrayBuffer
    const dataBuffer = new TextEncoder().encode(dataToEncrypt)

    // Gerar IV
    const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength))

    // Criptografar
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.config.algorithm,
        iv: iv,
        tagLength: this.config.tagLength
      },
      key,
      dataBuffer
    )

    // Extrair tag
    const tag = encrypted.slice(-this.config.tagLength / 8)
    const ciphertext = encrypted.slice(0, -this.config.tagLength / 8)

    return {
      encrypted: this.arrayBufferToBase64(ciphertext),
      iv: this.arrayBufferToBase64(iv.buffer),
      tag: this.arrayBufferToBase64(tag),
      algorithm: this.config.algorithm,
      keyId: keyId || 'master_key'
    }
  }

  // Descriptografar dados
  async decrypt(encryptionResult: EncryptionResult): Promise<DecryptionResult> {
    const key = this.keyStore.get(encryptionResult.keyId)
    if (!key) {
      throw new Error('Key not found')
    }

    // Converter de base64
    const encrypted = this.base64ToArrayBuffer(encryptionResult.encrypted)
    const iv = this.base64ToArrayBuffer(encryptionResult.iv)
    const tag = this.base64ToArrayBuffer(encryptionResult.tag)

    // Combinar ciphertext e tag
    const combined = new Uint8Array(encrypted.byteLength + tag.byteLength)
    combined.set(new Uint8Array(encrypted), 0)
    combined.set(new Uint8Array(tag), encrypted.byteLength)

    // Descriptografar
    const decrypted = await crypto.subtle.decrypt(
      {
        name: encryptionResult.algorithm,
        iv: iv,
        tagLength: this.config.tagLength
      },
      key,
      combined
    )

    // Converter para string
    let decryptedString = new TextDecoder().decode(decrypted)

    // Descomprimir se necessário
    if (this.config.enableCompression) {
      decryptedString = await this.decompress(decryptedString)
    }

    return {
      decrypted: decryptedString,
      algorithm: encryptionResult.algorithm,
      keyId: encryptionResult.keyId
    }
  }

  // Hash de dados
  async hash(data: string, algorithm: string = 'SHA-256', salt?: string): Promise<HashResult> {
    if (!this.config.enableHashing) {
      throw new Error('Hashing is disabled')
    }

    let dataToHash = data
    if (salt) {
      dataToHash = salt + data
    }

    const dataBuffer = new TextEncoder().encode(dataToHash)
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
    const hash = this.arrayBufferToBase64(hashBuffer)

    return {
      hash,
      algorithm,
      salt
    }
  }

  // Hash com salt aleatório
  async hashWithSalt(data: string, algorithm: string = 'SHA-256'): Promise<HashResult> {
    const saltArray = crypto.getRandomValues(new Uint8Array(16))
    const salt = this.arrayBufferToBase64(saltArray.buffer)
    return this.hash(data, algorithm, salt)
  }

  // Verificar hash
  async verifyHash(data: string, hashResult: HashResult): Promise<boolean> {
    const computedHash = await this.hash(data, hashResult.algorithm, hashResult.salt)
    return computedHash.hash === hashResult.hash
  }

  // Assinar dados
  async sign(data: string, privateKeyId: string): Promise<string> {
    if (!this.config.enableSigning) {
      throw new Error('Signing is disabled')
    }

    const keyPair = this.keyPairs.get(privateKeyId)
    if (!keyPair) {
      throw new Error('Private key not found')
    }

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      this.base64ToArrayBuffer(keyPair.privateKey),
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    const dataBuffer = new TextEncoder().encode(data)
    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      privateKey,
      dataBuffer
    )

    return this.arrayBufferToBase64(signature)
  }

  // Verificar assinatura
  async verifySignature(data: string, signature: string, publicKeyId: string): Promise<boolean> {
    if (!this.config.enableSigning) {
      throw new Error('Signing is disabled')
    }

    const keyPair = this.keyPairs.get(publicKeyId)
    if (!keyPair) {
      throw new Error('Public key not found')
    }

    const publicKey = await crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(keyPair.publicKey),
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    )

    const dataBuffer = new TextEncoder().encode(data)
    const signatureBuffer = this.base64ToArrayBuffer(signature)

    return crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    )
  }

  // Derivar chave
  async deriveKey(password: string, salt: string, iterations: number = 100000): Promise<CryptoKey> {
    if (!this.config.enableKeyDerivation) {
      throw new Error('Key derivation is disabled')
    }

    const passwordBuffer = new TextEncoder().encode(password)
    const saltBuffer = this.base64ToArrayBuffer(salt)

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.config.algorithm,
        length: this.config.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Comprimir dados
  private async compress(data: string): Promise<string> {
    const stream = new CompressionStream('gzip')
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    await writer.write(new TextEncoder().encode(data))
    await writer.close()

    const chunks: Uint8Array[] = []
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }

    const compressed = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      compressed.set(chunk, offset)
      offset += chunk.length
    }

    return this.arrayBufferToBase64(compressed.buffer)
  }

  // Descomprimir dados
  private async decompress(compressedData: string): Promise<string> {
    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    const compressedBuffer = this.base64ToArrayBuffer(compressedData)
    await writer.write(compressedBuffer)
    await writer.close()

    const chunks: Uint8Array[] = []
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }

    const decompressed = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      decompressed.set(chunk, offset)
      offset += chunk.length
    }

    return new TextDecoder().decode(decompressed)
  }

  // Métodos de utilidade
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

  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar chaves
  private saveKeys(): void {
    try {
      const keysData = {
        keyPairs: Array.from(this.keyPairs.entries()),
        timestamp: Date.now()
      }
      localStorage.setItem('everest-crypto-keys', JSON.stringify(keysData))
    } catch (error) {
      console.error('Failed to save keys:', error)
    }
  }

  // Carregar chaves
  private loadKeys(): void {
    try {
      const stored = localStorage.getItem('everest-crypto-keys')
      if (stored) {
        const keysData = JSON.parse(stored)
        this.keyPairs = new Map(keysData.keyPairs)
      }
    } catch (error) {
      console.error('Failed to load keys:', error)
    }
  }

  // Obter estatísticas
  getStats(): {
    totalKeys: number
    totalKeyPairs: number
    algorithm: string
    keyLength: number
    compressionEnabled: boolean
    hashingEnabled: boolean
    signingEnabled: boolean
    keyDerivationEnabled: boolean
  } {
    return {
      totalKeys: this.keyStore.size,
      totalKeyPairs: this.keyPairs.size,
      algorithm: this.config.algorithm,
      keyLength: this.config.keyLength,
      compressionEnabled: this.config.enableCompression,
      hashingEnabled: this.config.enableHashing,
      signingEnabled: this.config.enableSigning,
      keyDerivationEnabled: this.config.enableKeyDerivation
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<CryptoConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): CryptoConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return true
  }

  // Limpar chaves
  clearKeys(): void {
    this.keyStore.clear()
    this.keyPairs.clear()
    localStorage.removeItem('everest-crypto-keys')
  }
}

// Instância global
export const cryptoService = new CryptoService()

// Hook para usar criptografia
export function useCrypto() {
  return {
    generateKey: cryptoService.generateKey.bind(cryptoService),
    generateKeyPair: cryptoService.generateKeyPair.bind(cryptoService),
    encrypt: cryptoService.encrypt.bind(cryptoService),
    decrypt: cryptoService.decrypt.bind(cryptoService),
    hash: cryptoService.hash.bind(cryptoService),
    hashWithSalt: cryptoService.hashWithSalt.bind(cryptoService),
    verifyHash: cryptoService.verifyHash.bind(cryptoService),
    sign: cryptoService.sign.bind(cryptoService),
    verifySignature: cryptoService.verifySignature.bind(cryptoService),
    deriveKey: cryptoService.deriveKey.bind(cryptoService),
    getStats: cryptoService.getStats.bind(cryptoService),
    isEnabled: cryptoService.isEnabled.bind(cryptoService),
    clearKeys: cryptoService.clearKeys.bind(cryptoService),
    updateConfig: cryptoService.updateConfig.bind(cryptoService),
    getConfig: cryptoService.getConfig.bind(cryptoService)
  }
}
