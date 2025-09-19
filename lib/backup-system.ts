/**
 * Sistema de Backup Automatizado para Everest Preparatórios
 * 
 * Este sistema garante:
 * - Backup automático diário dos dados críticos
 * - Backup antes de operações sensíveis
 * - Restauração rápida em caso de falhas
 * - Verificação de integridade dos backups
 * - Armazenamento seguro dos backups
 */

import { createClient } from '@/lib/supabaseServer'
import { logger } from './logger'
import fs from 'fs'
import path from 'path'

interface BackupConfig {
  enabled: boolean
  schedule: string // Cron expression
  retentionDays: number
  storageLocation: string
  tables: string[]
  encryptBackups: boolean
}

interface BackupResult {
  success: boolean
  backupId: string
  timestamp: string
  size: number
  tables: string[]
  error?: string
}

interface RestoreResult {
  success: boolean
  restoredTables: string[]
  error?: string
}

class BackupSystem {
  private config: BackupConfig = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 2 AM daily
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    storageLocation: process.env.BACKUP_STORAGE_LOCATION || './backups',
    tables: [
      'user_profiles',
      'subjects',
      'topics',
      'flashcards',
      'quiz_questions',
      'quiz_attempts',
      'flashcard_progress',
      'study_sessions',
      'audio_courses',
      'audio_lessons',
      'calendar_events',
      'member_classes'
    ],
    encryptBackups: process.env.BACKUP_ENCRYPT === 'true'
  }

  private supabase = createClient()

  constructor() {
    this.ensureBackupDirectory()
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.config.storageLocation)) {
      fs.mkdirSync(this.config.storageLocation, { recursive: true })
      logger.info('Diretório de backup criado', 'BACKUP', { location: this.config.storageLocation })
    }
  }

  /**
   * Executa backup completo do banco de dados
   */
  async createFullBackup(): Promise<BackupResult> {
    if (!this.config.enabled) {
      logger.warn('Sistema de backup desabilitado', 'BACKUP')
      return {
        success: false,
        backupId: '',
        timestamp: new Date().toISOString(),
        size: 0,
        tables: [],
        error: 'Sistema de backup desabilitado'
      }
    }

    const backupId = `backup_${Date.now()}`
    const timestamp = new Date().toISOString()
    
    logger.info('Iniciando backup completo', 'BACKUP', { backupId, timestamp })

    try {
      const backupData: any = {}
      let totalSize = 0

      // Backup de cada tabela
      for (const table of this.config.tables) {
        logger.debug(`Fazendo backup da tabela: ${table}`, 'BACKUP', { backupId })
        
        const { data, error } = await this.supabase
          .from(table)
          .select('*')

        if (error) {
          logger.error(`Erro ao fazer backup da tabela ${table}`, 'BACKUP', { 
            error: error.message, 
            backupId, 
            table 
          })
          continue
        }

        backupData[table] = data
        totalSize += JSON.stringify(data).length
        
        logger.debug(`Backup da tabela ${table} concluído`, 'BACKUP', { 
          backupId, 
          table, 
          records: data?.length || 0 
        })
      }

      // Salvar backup em arquivo
      const backupFile = path.join(this.config.storageLocation, `${backupId}.json`)
      const backupContent = {
        id: backupId,
        timestamp,
        version: '1.0',
        tables: this.config.tables,
        data: backupData,
        metadata: {
          totalRecords: Object.values(backupData).reduce((sum: number, table: any) => sum + (table?.length || 0), 0),
          totalSize,
          environment: process.env.NODE_ENV
        }
      }

      fs.writeFileSync(backupFile, JSON.stringify(backupContent, null, 2))
      
      // Limpar backups antigos
      await this.cleanupOldBackups()

      logger.info('Backup completo realizado com sucesso', 'BACKUP', { 
        backupId, 
        size: totalSize, 
        tables: this.config.tables.length 
      })

      return {
        success: true,
        backupId,
        timestamp,
        size: totalSize,
        tables: this.config.tables
      }

    } catch (error) {
      logger.error('Erro durante backup completo', 'BACKUP', { 
        error: (error as Error).message, 
        backupId 
      })
      
      return {
        success: false,
        backupId,
        timestamp,
        size: 0,
        tables: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Restaura dados de um backup
   */
  async restoreFromBackup(backupId: string): Promise<RestoreResult> {
    logger.info('Iniciando restauração de backup', 'BACKUP', { backupId })

    try {
      const backupFile = path.join(this.config.storageLocation, `${backupId}.json`)
      
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Arquivo de backup não encontrado: ${backupId}`)
      }

      const backupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
      const restoredTables: string[] = []

      // Restaurar cada tabela
      for (const table of backupContent.tables) {
        if (!backupContent.data[table]) continue

        logger.debug(`Restaurando tabela: ${table}`, 'BACKUP', { backupId, table })

        // Limpar tabela existente (cuidado em produção!)
        if (process.env.NODE_ENV === 'development') {
          await this.supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        }

        // Inserir dados do backup
        const { error } = await this.supabase
          .from(table)
          .insert(backupContent.data[table])

        if (error) {
          logger.error(`Erro ao restaurar tabela ${table}`, 'BACKUP', { 
            error: error.message, 
            backupId, 
            table 
          })
          continue
        }

        restoredTables.push(table)
        logger.debug(`Tabela ${table} restaurada com sucesso`, 'BACKUP', { 
          backupId, 
          table, 
          records: backupContent.data[table]?.length || 0 
        })
      }

      logger.info('Restauração de backup concluída', 'BACKUP', { 
        backupId, 
        restoredTables: restoredTables.length 
      })

      return {
        success: true,
        restoredTables
      }

    } catch (error) {
      logger.error('Erro durante restauração de backup', 'BACKUP', { 
        error: (error as Error).message, 
        backupId 
      })
      
      return {
        success: false,
        restoredTables: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Lista backups disponíveis
   */
  async listBackups(): Promise<any[]> {
    try {
      const files = fs.readdirSync(this.config.storageLocation)
      const backups = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.config.storageLocation, file)
          const stats = fs.statSync(filePath)
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          
          return {
            id: content.id,
            timestamp: content.timestamp,
            size: stats.size,
            tables: content.tables,
            records: content.metadata?.totalRecords || 0
          }
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return backups
    } catch (error) {
      logger.error('Erro ao listar backups', 'BACKUP', { error: (error as Error).message })
      return []
    }
  }

  /**
   * Remove backups antigos
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

      for (const backup of backups) {
        if (new Date(backup.timestamp) < cutoffDate) {
          const backupFile = path.join(this.config.storageLocation, `${backup.id}.json`)
          fs.unlinkSync(backupFile)
          logger.info('Backup antigo removido', 'BACKUP', { 
            backupId: backup.id, 
            timestamp: backup.timestamp 
          })
        }
      }
    } catch (error) {
      logger.error('Erro ao limpar backups antigos', 'BACKUP', { error: (error as Error).message })
    }
  }

  /**
   * Verifica integridade de um backup
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const backupFile = path.join(this.config.storageLocation, `${backupId}.json`)
      
      if (!fs.existsSync(backupFile)) {
        return false
      }

      const content = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
      
      // Verificar estrutura básica
      if (!content.id || !content.timestamp || !content.data) {
        return false
      }

      // Verificar se todas as tabelas esperadas estão presentes
      for (const table of this.config.tables) {
        if (!content.data[table]) {
          logger.warn(`Tabela ${table} não encontrada no backup`, 'BACKUP', { backupId })
        }
      }

      return true
    } catch (error) {
      logger.error('Erro ao verificar integridade do backup', 'BACKUP', { 
        error: (error as Error).message, 
        backupId 
      })
      return false
    }
  }

  /**
   * Backup antes de operação sensível
   */
  async createPreOperationBackup(operation: string): Promise<BackupResult> {
    logger.info('Criando backup pré-operação', 'BACKUP', { operation })
    
    const result = await this.createFullBackup()
    
    if (result.success) {
      logger.info('Backup pré-operação criado com sucesso', 'BACKUP', { 
        operation, 
        backupId: result.backupId 
      })
    }
    
    return result
  }
}

// Instância global do sistema de backup
export const backupSystem = new BackupSystem()

// Funções utilitárias
export async function createBackup(): Promise<BackupResult> {
  return await backupSystem.createFullBackup()
}

export async function restoreBackup(backupId: string): Promise<RestoreResult> {
  return await backupSystem.restoreFromBackup(backupId)
}

export async function listBackups(): Promise<any[]> {
  return await backupSystem.listBackups()
}

export async function verifyBackup(backupId: string): Promise<boolean> {
  return await backupSystem.verifyBackup(backupId)
}

export async function createPreOperationBackup(operation: string): Promise<BackupResult> {
  return await backupSystem.createPreOperationBackup(operation)
}
