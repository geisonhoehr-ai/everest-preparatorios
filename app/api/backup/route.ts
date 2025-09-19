import { NextRequest, NextResponse } from 'next/server'
import { createBackup, restoreBackup, listBackups, verifyBackup } from '@/lib/backup-system'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const backupId = searchParams.get('backupId')

    logger.info('Requisição de backup recebida', 'API', { action, backupId })

    switch (action) {
      case 'list':
        const backups = await listBackups()
        return NextResponse.json({ success: true, backups })

      case 'verify':
        if (!backupId) {
          return NextResponse.json({ success: false, error: 'Backup ID é obrigatório' }, { status: 400 })
        }
        const isValid = await verifyBackup(backupId)
        return NextResponse.json({ success: true, valid: isValid })

      default:
        return NextResponse.json({ success: false, error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Erro na API de backup', 'API', { error: (error as Error).message })
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, backupId } = body

    logger.info('Requisição POST de backup recebida', 'API', { action, backupId })

    switch (action) {
      case 'create':
        const backupResult = await createBackup()
        return NextResponse.json(backupResult)

      case 'restore':
        if (!backupId) {
          return NextResponse.json({ success: false, error: 'Backup ID é obrigatório' }, { status: 400 })
        }
        const restoreResult = await restoreBackup(backupId)
        return NextResponse.json(restoreResult)

      default:
        return NextResponse.json({ success: false, error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Erro na API de backup', 'API', { error: (error as Error).message })
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}