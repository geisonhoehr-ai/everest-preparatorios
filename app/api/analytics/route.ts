import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

interface AnalyticsRequest {
  events: AnalyticsEvent[]
  sessionId: string
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsRequest = await request.json()
    const headersList = await headers()
    
    // Validar dados
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      )
    }

    // Extrair informações da requisição
    const userAgent = headersList.get('user-agent') || ''
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown'
    const referer = headersList.get('referer') || ''

    // Processar eventos
    const processedEvents = body.events.map(event => ({
      ...event,
      metadata: {
        userAgent,
        ip,
        referer,
        timestamp: new Date().toISOString()
      }
    }))

    // Em produção, salvar no banco de dados
    if (process.env.NODE_ENV === 'production') {
      await saveAnalyticsEvents(processedEvents, body.sessionId, body.userId)
    } else {
      // Em desenvolvimento, apenas log
      console.log('[Analytics] Events received:', {
        sessionId: body.sessionId,
        userId: body.userId,
        eventCount: processedEvents.length,
        events: processedEvents.map(e => ({ name: e.name, properties: e.properties }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function saveAnalyticsEvents(
  events: any[],
  sessionId: string,
  userId?: string
) {
  try {
    // Aqui você implementaria a lógica para salvar no banco de dados
    // Por exemplo, usando Supabase:
    
    // const supabase = createClient()
    // const { error } = await supabase
    //   .from('analytics_events')
    //   .insert(events.map(event => ({
    //     name: event.name,
    //     properties: event.properties,
    //     timestamp: new Date(event.timestamp),
    //     session_id: sessionId,
    //     user_id: userId,
    //     metadata: event.metadata
    //   })))

    // if (error) {
    //   console.error('Error saving analytics events:', error)
    // }

    console.log(`[Analytics] Saved ${events.length} events for session ${sessionId}`)
  } catch (error) {
    console.error('Error in saveAnalyticsEvents:', error)
  }
}

// Endpoint para obter estatísticas (opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    // Aqui você implementaria a lógica para buscar estatísticas
    // Por exemplo, eventos mais comuns, usuários ativos, etc.

    const stats = {
      totalEvents: 0,
      uniqueUsers: 0,
      topEvents: [],
      lastActivity: null
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
