import { NextRequest, NextResponse } from 'next/server'

const PANDAVIDEO_API_KEY = process.env.PANDAVIDEO_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { video_id, title } = await request.json()
    
    if (!video_id && !title) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID do vídeo ou título são obrigatórios' 
      }, { status: 400 })
    }

    if (!PANDAVIDEO_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'API Key do PandaVideo não configurada' 
      }, { status: 500 })
    }

    let video = null

    // Se tem ID, buscar vídeo específico
    if (video_id) {
      console.log('🎵 [Audio API] Buscando vídeo por ID:', video_id)
      
      const response = await fetch(`https://api-v2.pandavideo.com.br/videos/${video_id}`, {
        headers: {
          'Authorization': `Bearer ${PANDAVIDEO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        video = await response.json()
      }
    }

    // Se não encontrou por ID ou tem título, buscar por título
    if (!video && title) {
      console.log('🎵 [Audio API] Buscando vídeo por título:', title)
      
      const searchUrl = new URL('https://api-v2.pandavideo.com.br/videos')
      searchUrl.searchParams.set('title', title)
      searchUrl.searchParams.set('limit', '1')

      const response = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${PANDAVIDEO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        video = data.data?.[0] || null
      }
    }

    if (!video) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vídeo não encontrado' 
      }, { status: 404 })
    }

    // Verificar se tem HLS disponível
    if (!video.hls_url && !video.playlist_url) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vídeo não possui stream HLS disponível' 
      }, { status: 400 })
    }

    // Retornar dados de áudio
    const audioData = {
      video_id: video.id,
      hls_url: video.hls_url || video.playlist_url,
      title: video.title,
      duration: video.duration,
      status: video.status,
      thumbnail: video.thumbnail_url,
      created_at: video.created_at
    }

    console.log('✅ [Audio API] Áudio encontrado:', audioData.title)

    return NextResponse.json({
      success: true,
      audio: audioData
    })

  } catch (error) {
    console.error('❌ [Audio API] Erro interno:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
