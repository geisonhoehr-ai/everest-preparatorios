#!/usr/bin/env node

/**
 * Script de Backup Automatizado para Everest Preparatórios
 * 
 * Este script pode ser executado via cron job para backups automáticos
 * 
 * Uso:
 * node scripts/backup-automated.js
 * 
 * Para configurar no cron (backup diário às 2 AM):
 * 0 2 * * * cd /path/to/project && node scripts/backup-automated.js
 */

const { createBackup, listBackups } = require('../lib/backup-system')
const { logger } = require('../lib/logger')

async function runAutomatedBackup() {
  console.log('🔄 Iniciando backup automatizado...')
  
  try {
    // Verificar se já existe backup recente (últimas 24 horas)
    const existingBackups = await listBackups()
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentBackup = existingBackups.find(backup => 
      new Date(backup.timestamp) > oneDayAgo
    )
    
    if (recentBackup) {
      console.log('✅ Backup recente já existe, pulando...')
      console.log(`📅 Último backup: ${recentBackup.timestamp}`)
      return
    }
    
    // Criar novo backup
    console.log('📦 Criando novo backup...')
    const result = await createBackup()
    
    if (result.success) {
      console.log('✅ Backup criado com sucesso!')
      console.log(`🆔 ID: ${result.backupId}`)
      console.log(`📅 Timestamp: ${result.timestamp}`)
      console.log(`📊 Tamanho: ${(result.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`🗂️ Tabelas: ${result.tables.length}`)
      
      // Log para sistema de monitoramento
      logger.info('Backup automatizado concluído com sucesso', 'BACKUP', {
        backupId: result.backupId,
        size: result.size,
        tables: result.tables.length
      })
    } else {
      console.error('❌ Erro ao criar backup:', result.error)
      
      // Log de erro para sistema de monitoramento
      logger.error('Falha no backup automatizado', 'BACKUP', {
        error: result.error
      })
      
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    
    // Log de erro para sistema de monitoramento
    logger.error('Erro inesperado no backup automatizado', 'BACKUP', {
      error: error.message
    })
    
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAutomatedBackup()
}

module.exports = { runAutomatedBackup }
