import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface BackupData {
  timestamp: number
  version: string
  userData?: any
  settings?: any
  cache?: any
  metadata: {
    userAgent: string
    url: string
    sessionId: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BackupData = await request.json()
    const headersList = await headers()
    
    // Validar dados
    if (!body.timestamp || !body.version) {
      return NextResponse.json(
        { error: 'Invalid backup data' },
        { status: 400 }
      )
    }

    // Extrair informações da requisição
    const userAgent = headersList.get('user-agent') || ''
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'

    // Processar backup
    const processedBackup = {
      ...body,
      id: generateBackupId(),
      metadata: {
        ...body.metadata,
        userAgent,
        ip,
        timestamp: new Date().toISOString()
      }
    }

    // Em produção, salvar no banco de dados
    if (process.env.NODE_ENV === 'production') {
      await saveBackup(processedBackup)
    } else {
      // Em desenvolvimento, apenas log
      console.log('[Backup] Backup received:', {
        id: processedBackup.id,
        timestamp: processedBackup.timestamp,
        version: processedBackup.version,
        hasUserData: !!processedBackup.userData,
        hasSettings: !!processedBackup.settings,
        hasCache: !!processedBackup.cache
      })
    }

    return NextResponse.json({ 
      success: true, 
      backupId: processedBackup.id 
    })
  } catch (error) {
    console.error('Backup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Aqui você implementaria a lógica para buscar backups
    // Por exemplo, usando Supabase:
    
    // const supabase = createClient()
    // const { data, error } = await supabase
    //   .from('backups')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('timestamp', { ascending: false })
    //   .limit(limit)

    // Mock data para desenvolvimento
    const backups = [
      {
        id: 'backup-1',
        timestamp: Date.now() - 86400000, // 1 dia atrás
        version: '1.0.0',
        size: 1024,
        hasUserData: true,
        hasSettings: true,
        hasCache: false
      },
      {
        id: 'backup-2',
        timestamp: Date.now() - 172800000, // 2 dias atrás
        version: '1.0.0',
        size: 2048,
        hasUserData: true,
        hasSettings: true,
        hasCache: true
      }
    ]

    return NextResponse.json({ backups })
  } catch (error) {
    console.error('Backup GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateBackupId(): string {
  return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function saveBackup(backup: any) {
  try {
    // Aqui você implementaria a lógica para salvar no banco de dados
    // Por exemplo, usando Supabase:
    
    // const supabase = createClient()
    // const { error } = await supabase
    //   .from('backups')
    //   .insert({
    //     id: backup.id,
    //     user_id: backup.metadata.sessionId, // ou userId se disponível
    //     timestamp: new Date(backup.timestamp),
    //     version: backup.version,
    //     user_data: backup.userData,
    //     settings: backup.settings,
    //     cache: backup.cache,
    //     metadata: backup.metadata
    //   })

    // if (error) {
    //   console.error('Error saving backup:', error)
    // }

    console.log(`[Backup] Saved backup ${backup.id}`)
  } catch (error) {
    console.error('Error in saveBackup:', error)
  }
}
