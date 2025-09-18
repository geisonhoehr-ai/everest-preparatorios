import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface MonitoringEvent {
  type: 'error' | 'performance' | 'user_action' | 'api_call'
  message: string
  data?: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
  url: string
  userAgent: string
}

interface MonitoringRequest {
  events: MonitoringEvent[]
  sessionId: string
  userId?: string
  performance?: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay: number
    totalBlockingTime: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MonitoringRequest = await request.json()
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
      await saveMonitoringData(processedEvents, body.sessionId, body.userId, body.performance)
    } else {
      // Em desenvolvimento, apenas log
      console.log('[Monitoring] Events received:', {
        sessionId: body.sessionId,
        userId: body.userId,
        eventCount: processedEvents.length,
        events: processedEvents.map(e => ({ 
          type: e.type, 
          message: e.message, 
          data: e.data 
        })),
        performance: body.performance
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function saveMonitoringData(
  events: any[],
  sessionId: string,
  userId?: string,
  performance?: any
) {
  try {
    // Aqui você implementaria a lógica para salvar no banco de dados
    // Por exemplo, usando Supabase:
    
    // const supabase = createClient()
    
    // Salvar eventos
    // const { error: eventsError } = await supabase
    //   .from('monitoring_events')
    //   .insert(events.map(event => ({
    //     type: event.type,
    //     message: event.message,
    //     data: event.data,
    //     timestamp: new Date(event.timestamp),
    //     session_id: sessionId,
    //     user_id: userId,
    //     metadata: event.metadata
    //   })))

    // if (eventsError) {
    //   console.error('Error saving monitoring events:', eventsError)
    // }

    // Salvar métricas de performance
    // if (performance) {
    //   const { error: perfError } = await supabase
    //     .from('performance_metrics')
    //     .insert({
    //       session_id: sessionId,
    //       user_id: userId,
    //       load_time: performance.loadTime,
    //       first_contentful_paint: performance.firstContentfulPaint,
    //       largest_contentful_paint: performance.largestContentfulPaint,
    //       cumulative_layout_shift: performance.cumulativeLayoutShift,
    //       first_input_delay: performance.firstInputDelay,
    //       total_blocking_time: performance.totalBlockingTime,
    //       timestamp: new Date()
    //     })

    //   if (perfError) {
    //     console.error('Error saving performance metrics:', perfError)
    //   }
    // }

    console.log(`[Monitoring] Saved ${events.length} events for session ${sessionId}`)
  } catch (error) {
    console.error('Error in saveMonitoringData:', error)
  }
}

// Endpoint para obter estatísticas de monitoramento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    // Aqui você implementaria a lógica para buscar estatísticas
    // Por exemplo, erros mais comuns, performance média, etc.

    const stats = {
      totalEvents: 0,
      errorCount: 0,
      performanceMetrics: {
        averageLoadTime: 0,
        averageFCP: 0,
        averageLCP: 0,
        averageCLS: 0
      },
      topErrors: [],
      userSessions: 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Monitoring GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
