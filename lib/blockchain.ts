'use client'

interface BlockchainConfig {
  enabled: boolean
  network: 'mainnet' | 'testnet' | 'local'
  enableSmartContracts: boolean
  enableNFTs: boolean
  enableTokens: boolean
  enableDeFi: boolean
  enableGovernance: boolean
  gasLimit: number
  gasPrice: number
  blockTime: number
}

interface Block {
  index: number
  timestamp: number
  previousHash: string
  hash: string
  nonce: number
  transactions: Transaction[]
  merkleRoot: string
  difficulty: number
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  gas: number
  gasPrice: number
  nonce: number
  signature: string
  timestamp: number
  blockIndex?: number
  status: 'pending' | 'confirmed' | 'failed'
}

interface SmartContract {
  id: string
  name: string
  address: string
  abi: any[]
  bytecode: string
  deployedAt: number
  creator: string
  functions: ContractFunction[]
  events: ContractEvent[]
}

interface ContractFunction {
  name: string
  inputs: ContractParameter[]
  outputs: ContractParameter[]
  payable: boolean
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable'
}

interface ContractParameter {
  name: string
  type: string
  indexed?: boolean
}

interface ContractEvent {
  name: string
  inputs: ContractParameter[]
  anonymous: boolean
}

interface NFT {
  id: string
  tokenId: string
  contractAddress: string
  owner: string
  metadata: NFTMetadata
  createdAt: number
  transferredAt: number
}

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
  externalUrl?: string
  animationUrl?: string
}

interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: string
}

interface Token {
  id: string
  symbol: string
  name: string
  decimals: number
  totalSupply: number
  contractAddress: string
  creator: string
  createdAt: number
}

interface Wallet {
  address: string
  privateKey: string
  publicKey: string
  balance: number
  nonce: number
  createdAt: number
}

class BlockchainService {
  private config: BlockchainConfig
  private blockchain: Block[] = []
  private pendingTransactions: Transaction[] = []
  private smartContracts: Map<string, SmartContract> = new Map()
  private nfts: Map<string, NFT> = new Map()
  private tokens: Map<string, Token> = new Map()
  private wallets: Map<string, Wallet> = new Map()
  private mining: boolean = false

  constructor(config: Partial<BlockchainConfig> = {}) {
    this.config = {
      enabled: true,
      network: 'testnet',
      enableSmartContracts: true,
      enableNFTs: true,
      enableTokens: true,
      enableDeFi: true,
      enableGovernance: true,
      gasLimit: 21000,
      gasPrice: 20,
      blockTime: 15000, // 15 segundos
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Carregar blockchain
    this.loadBlockchain()

    // Carregar contratos
    this.loadSmartContracts()

    // Carregar NFTs
    this.loadNFTs()

    // Carregar tokens
    this.loadTokens()

    // Carregar carteiras
    this.loadWallets()

    // Criar bloco gênese se necessário
    if (this.blockchain.length === 0) {
      this.createGenesisBlock()
    }

    // Iniciar mineração
    this.startMining()
  }

  // Criar bloco gênese
  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      previousHash: '0',
      hash: '0',
      nonce: 0,
      transactions: [],
      merkleRoot: '0',
      difficulty: 1
    }

    genesisBlock.hash = this.calculateHash(genesisBlock)
    this.blockchain.push(genesisBlock)
    this.saveBlockchain()
  }

  // Criar carteira
  createWallet(): Wallet {
    const privateKey = this.generatePrivateKey()
    const publicKey = this.generatePublicKey(privateKey)
    const address = this.generateAddress(publicKey)

    const wallet: Wallet = {
      address,
      privateKey,
      publicKey,
      balance: 0,
      nonce: 0,
      createdAt: Date.now()
    }

    this.wallets.set(address, wallet)
    this.saveWallets()

    return wallet
  }

  // Gerar chave privada
  private generatePrivateKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Gerar chave pública
  private generatePublicKey(privateKey: string): string {
    // Simulação simples - em produção usar biblioteca de criptografia
    return this.hashString(privateKey + 'public')
  }

  // Gerar endereço
  private generateAddress(publicKey: string): string {
    const hash = this.hashString(publicKey)
    return '0x' + hash.substring(0, 40)
  }

  // Criar transação
  createTransaction(from: string, to: string, amount: number, privateKey: string): Transaction | null {
    const wallet = this.wallets.get(from)
    if (!wallet) {
      console.error('Wallet not found')
      return null
    }

    if (wallet.balance < amount) {
      console.error('Insufficient balance')
      return null
    }

    const transaction: Transaction = {
      id: this.generateId(),
      from,
      to,
      amount,
      gas: this.config.gasLimit,
      gasPrice: this.config.gasPrice,
      nonce: wallet.nonce,
      signature: '',
      timestamp: Date.now(),
      status: 'pending'
    }

    // Assinar transação
    transaction.signature = this.signTransaction(transaction, privateKey)

    // Adicionar à lista de transações pendentes
    this.pendingTransactions.push(transaction)

    // Atualizar nonce
    wallet.nonce++

    return transaction
  }

  // Assinar transação
  private signTransaction(transaction: Transaction, privateKey: string): string {
    // Simulação simples - em produção usar biblioteca de assinatura
    const data = JSON.stringify(transaction)
    return this.hashString(data + privateKey)
  }

  // Verificar transação
  verifyTransaction(transaction: Transaction): boolean {
    const wallet = this.wallets.get(transaction.from)
    if (!wallet) return false

    // Verificar assinatura
    const expectedSignature = this.signTransaction(transaction, wallet.privateKey)
    if (transaction.signature !== expectedSignature) return false

    // Verificar saldo
    if (wallet.balance < transaction.amount) return false

    // Verificar nonce
    if (transaction.nonce !== wallet.nonce) return false

    return true
  }

  // Minerar bloco
  private mineBlock(): void {
    if (this.pendingTransactions.length === 0) return

    const previousBlock = this.blockchain[this.blockchain.length - 1]
    const block: Block = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0,
      transactions: this.pendingTransactions.slice(0, 10), // Limitar transações por bloco
      merkleRoot: '',
      difficulty: this.calculateDifficulty()
    }

    // Calcular merkle root
    block.merkleRoot = this.calculateMerkleRoot(block.transactions)

    // Minerar bloco (Proof of Work)
    while (!this.isValidHash(block.hash, block.difficulty)) {
      block.nonce++
      block.hash = this.calculateHash(block)
    }

    // Adicionar bloco à blockchain
    this.blockchain.push(block)

    // Processar transações
    this.processTransactions(block.transactions)

    // Limpar transações pendentes
    this.pendingTransactions = this.pendingTransactions.slice(10)

    // Salvar blockchain
    this.saveBlockchain()
  }

  // Calcular hash
  private calculateHash(block: Block): string {
    const data = block.index + block.timestamp + block.previousHash + block.nonce + block.merkleRoot
    return this.hashString(data)
  }

  // Verificar se hash é válido
  private isValidHash(hash: string, difficulty: number): boolean {
    const target = '0'.repeat(difficulty)
    return hash.startsWith(target)
  }

  // Calcular dificuldade
  private calculateDifficulty(): number {
    if (this.blockchain.length < 10) return 1

    const lastBlock = this.blockchain[this.blockchain.length - 1]
    const targetTime = this.config.blockTime
    const actualTime = lastBlock.timestamp - this.blockchain[this.blockchain.length - 2].timestamp

    if (actualTime < targetTime / 2) {
      return Math.min(lastBlock.difficulty + 1, 10)
    } else if (actualTime > targetTime * 2) {
      return Math.max(lastBlock.difficulty - 1, 1)
    }

    return lastBlock.difficulty
  }

  // Calcular merkle root
  private calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) return '0'

    const hashes = transactions.map(tx => this.hashString(tx.id))
    
    while (hashes.length > 1) {
      const newHashes: string[] = []
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i]
        const right = hashes[i + 1] || left
        newHashes.push(this.hashString(left + right))
      }
      hashes.splice(0, hashes.length, ...newHashes)
    }

    return hashes[0]
  }

  // Processar transações
  private processTransactions(transactions: Transaction[]): void {
    for (const transaction of transactions) {
      if (this.verifyTransaction(transaction)) {
        // Atualizar saldos
        const fromWallet = this.wallets.get(transaction.from)
        const toWallet = this.wallets.get(transaction.to)

        if (fromWallet) {
          fromWallet.balance -= transaction.amount
        }

        if (toWallet) {
          toWallet.balance += transaction.amount
        } else {
          // Criar nova carteira se não existir
          const newWallet: Wallet = {
            address: transaction.to,
            privateKey: '',
            publicKey: '',
            balance: transaction.amount,
            nonce: 0,
            createdAt: Date.now()
          }
          this.wallets.set(transaction.to, newWallet)
        }

        transaction.status = 'confirmed'
        transaction.blockIndex = this.blockchain.length - 1
      } else {
        transaction.status = 'failed'
      }
    }

    this.saveWallets()
  }

  // Iniciar mineração
  private startMining(): void {
    if (this.mining) return

    this.mining = true
    const mine = () => {
      if (this.mining) {
        this.mineBlock()
        setTimeout(mine, this.config.blockTime)
      }
    }
    mine()
  }

  // Parar mineração
  private stopMining(): void {
    this.mining = false
  }

  // Deploy smart contract
  deploySmartContract(
    name: string,
    abi: any[],
    bytecode: string,
    creator: string
  ): SmartContract | null {
    if (!this.config.enableSmartContracts) return null

    const contract: SmartContract = {
      id: this.generateId(),
      name,
      address: this.generateAddress(this.generateId()),
      abi,
      bytecode,
      deployedAt: Date.now(),
      creator,
      functions: this.extractFunctions(abi),
      events: this.extractEvents(abi)
    }

    this.smartContracts.set(contract.address, contract)
    this.saveSmartContracts()

    return contract
  }

  // Extrair funções do ABI
  private extractFunctions(abi: any[]): ContractFunction[] {
    return abi
      .filter(item => item.type === 'function')
      .map(item => ({
        name: item.name,
        inputs: item.inputs || [],
        outputs: item.outputs || [],
        payable: item.payable || false,
        stateMutability: item.stateMutability || 'nonpayable'
      }))
  }

  // Extrair eventos do ABI
  private extractEvents(abi: any[]): ContractEvent[] {
    return abi
      .filter(item => item.type === 'event')
      .map(item => ({
        name: item.name,
        inputs: item.inputs || [],
        anonymous: item.anonymous || false
      }))
  }

  // Criar NFT
  createNFT(
    contractAddress: string,
    tokenId: string,
    owner: string,
    metadata: NFTMetadata
  ): NFT | null {
    if (!this.config.enableNFTs) return null

    const nft: NFT = {
      id: this.generateId(),
      tokenId,
      contractAddress,
      owner,
      metadata,
      createdAt: Date.now(),
      transferredAt: Date.now()
    }

    this.nfts.set(nft.id, nft)
    this.saveNFTs()

    return nft
  }

  // Transferir NFT
  transferNFT(nftId: string, from: string, to: string): boolean {
    const nft = this.nfts.get(nftId)
    if (!nft || nft.owner !== from) return false

    nft.owner = to
    nft.transferredAt = Date.now()

    this.saveNFTs()
    return true
  }

  // Criar token
  createToken(
    symbol: string,
    name: string,
    decimals: number,
    totalSupply: number,
    creator: string
  ): Token | null {
    if (!this.config.enableTokens) return null

    const token: Token = {
      id: this.generateId(),
      symbol,
      name,
      decimals,
      totalSupply,
      contractAddress: this.generateAddress(this.generateId()),
      creator,
      createdAt: Date.now()
    }

    this.tokens.set(token.id, token)
    this.saveTokens()

    return token
  }

  // Obter blockchain
  getBlockchain(): Block[] {
    return [...this.blockchain]
  }

  // Obter bloco
  getBlock(index: number): Block | null {
    return this.blockchain[index] || null
  }

  // Obter transação
  getTransaction(transactionId: string): Transaction | null {
    for (const block of this.blockchain) {
      const transaction = block.transactions.find(tx => tx.id === transactionId)
      if (transaction) return transaction
    }
    return null
  }

  // Obter carteira
  getWallet(address: string): Wallet | null {
    return this.wallets.get(address) || null
  }

  // Obter smart contract
  getSmartContract(address: string): SmartContract | null {
    return this.smartContracts.get(address) || null
  }

  // Obter NFT
  getNFT(nftId: string): NFT | null {
    return this.nfts.get(nftId) || null
  }

  // Obter token
  getToken(tokenId: string): Token | null {
    return this.tokens.get(tokenId) || null
  }

  // Obter estatísticas
  getStats(): {
    blockCount: number
    transactionCount: number
    walletCount: number
    smartContractCount: number
    nftCount: number
    tokenCount: number
    totalSupply: number
    averageBlockTime: number
  } {
    const blockCount = this.blockchain.length
    const transactionCount = this.blockchain.reduce((sum, block) => sum + block.transactions.length, 0)
    const walletCount = this.wallets.size
    const smartContractCount = this.smartContracts.size
    const nftCount = this.nfts.size
    const tokenCount = this.tokens.size
    const totalSupply = Array.from(this.tokens.values()).reduce((sum, token) => sum + token.totalSupply, 0)
    
    const averageBlockTime = blockCount > 1 
      ? (this.blockchain[blockCount - 1].timestamp - this.blockchain[0].timestamp) / (blockCount - 1)
      : 0

    return {
      blockCount,
      transactionCount,
      walletCount,
      smartContractCount,
      nftCount,
      tokenCount,
      totalSupply,
      averageBlockTime
    }
  }

  // Métodos de utilidade
  private generateId(): string {
    return `bc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }

  // Salvar blockchain
  private saveBlockchain(): void {
    try {
      localStorage.setItem('everest-blockchain', JSON.stringify(this.blockchain))
    } catch (error) {
      console.error('Failed to save blockchain:', error)
    }
  }

  // Carregar blockchain
  private loadBlockchain(): void {
    try {
      const stored = localStorage.getItem('everest-blockchain')
      if (stored) {
        this.blockchain = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load blockchain:', error)
    }
  }

  // Salvar smart contracts
  private saveSmartContracts(): void {
    try {
      const contracts = Array.from(this.smartContracts.values())
      localStorage.setItem('everest-smart-contracts', JSON.stringify(contracts))
    } catch (error) {
      console.error('Failed to save smart contracts:', error)
    }
  }

  // Carregar smart contracts
  private loadSmartContracts(): void {
    try {
      const stored = localStorage.getItem('everest-smart-contracts')
      if (stored) {
        const contracts = JSON.parse(stored)
        for (const contract of contracts) {
          this.smartContracts.set(contract.address, contract)
        }
      }
    } catch (error) {
      console.error('Failed to load smart contracts:', error)
    }
  }

  // Salvar NFTs
  private saveNFTs(): void {
    try {
      const nfts = Array.from(this.nfts.values())
      localStorage.setItem('everest-nfts', JSON.stringify(nfts))
    } catch (error) {
      console.error('Failed to save NFTs:', error)
    }
  }

  // Carregar NFTs
  private loadNFTs(): void {
    try {
      const stored = localStorage.getItem('everest-nfts')
      if (stored) {
        const nfts = JSON.parse(stored)
        for (const nft of nfts) {
          this.nfts.set(nft.id, nft)
        }
      }
    } catch (error) {
      console.error('Failed to load NFTs:', error)
    }
  }

  // Salvar tokens
  private saveTokens(): void {
    try {
      const tokens = Array.from(this.tokens.values())
      localStorage.setItem('everest-tokens', JSON.stringify(tokens))
    } catch (error) {
      console.error('Failed to save tokens:', error)
    }
  }

  // Carregar tokens
  private loadTokens(): void {
    try {
      const stored = localStorage.getItem('everest-tokens')
      if (stored) {
        const tokens = JSON.parse(stored)
        for (const token of tokens) {
          this.tokens.set(token.id, token)
        }
      }
    } catch (error) {
      console.error('Failed to load tokens:', error)
    }
  }

  // Salvar carteiras
  private saveWallets(): void {
    try {
      const wallets = Array.from(this.wallets.values())
      localStorage.setItem('everest-wallets', JSON.stringify(wallets))
    } catch (error) {
      console.error('Failed to save wallets:', error)
    }
  }

  // Carregar carteiras
  private loadWallets(): void {
    try {
      const stored = localStorage.getItem('everest-wallets')
      if (stored) {
        const wallets = JSON.parse(stored)
        for (const wallet of wallets) {
          this.wallets.set(wallet.address, wallet)
        }
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
    }
  }

  // Métodos de configuração
  updateConfig(newConfig: Partial<BlockchainConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): BlockchainConfig {
    return { ...this.config }
  }

  // Métodos de utilidade
  isEnabled(): boolean {
    return this.config.enabled
  }

  isMining(): boolean {
    return this.mining
  }
}

// Instância global
export const blockchainService = new BlockchainService()

// Hook para usar blockchain
export function useBlockchain() {
  return {
    createWallet: blockchainService.createWallet.bind(blockchainService),
    createTransaction: blockchainService.createTransaction.bind(blockchainService),
    verifyTransaction: blockchainService.verifyTransaction.bind(blockchainService),
    deploySmartContract: blockchainService.deploySmartContract.bind(blockchainService),
    createNFT: blockchainService.createNFT.bind(blockchainService),
    transferNFT: blockchainService.transferNFT.bind(blockchainService),
    createToken: blockchainService.createToken.bind(blockchainService),
    getBlockchain: blockchainService.getBlockchain.bind(blockchainService),
    getBlock: blockchainService.getBlock.bind(blockchainService),
    getTransaction: blockchainService.getTransaction.bind(blockchainService),
    getWallet: blockchainService.getWallet.bind(blockchainService),
    getSmartContract: blockchainService.getSmartContract.bind(blockchainService),
    getNFT: blockchainService.getNFT.bind(blockchainService),
    getToken: blockchainService.getToken.bind(blockchainService),
    getStats: blockchainService.getStats.bind(blockchainService),
    isEnabled: blockchainService.isEnabled.bind(blockchainService),
    isMining: blockchainService.isMining.bind(blockchainService),
    updateConfig: blockchainService.updateConfig.bind(blockchainService),
    getConfig: blockchainService.getConfig.bind(blockchainService)
  }
}
