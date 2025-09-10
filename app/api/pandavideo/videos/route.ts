import { NextRequest, NextResponse } from 'next/server'

const PANDAVIDEO_API_KEY = process.env.PANDAVIDEO_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    if (!PANDAVIDEO_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'API Key do PandaVideo não configurada' 
      }, { status: 500 })
    }

    // Construir URL da API
    const apiUrl = new URL('https://api-v2.pandavideo.com.br/videos')
    if (title) apiUrl.searchParams.set('title', title)
    apiUrl.searchParams.set('page', page)
    apiUrl.searchParams.set('limit', limit)

    console.log('🎵 [Videos API] Buscando vídeos:', apiUrl.toString())
    console.log('🔑 [Videos API] Usando API Key:', PANDAVIDEO_API_KEY?.substring(0, 20) + '...')

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${PANDAVIDEO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 [Videos API] Status da resposta:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Videos API] Erro na API do PandaVideo:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `Erro na API do PandaVideo (${response.status})` 
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [Videos API] Vídeos encontrados:', data.data?.length || 0)

    // Filtrar apenas vídeos com HLS disponível
    const videosWithHLS = data.data?.filter((video: any) => 
      video.hls_url || video.playlist_url
    ) || []

    return NextResponse.json({
      success: true,
      videos: videosWithHLS,
      total: data.total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    })

  } catch (error) {
    console.error('❌ [Videos API] Erro interno:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
