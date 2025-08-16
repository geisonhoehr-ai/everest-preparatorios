import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json()
    
    console.log('🎥 [OAuth API] Processando código OAuth:', code ? 'encontrado' : 'não encontrado')
    
    if (!code) {
      return NextResponse.json({ error: 'Código OAuth não fornecido' }, { status: 400 })
    }

    // Determinar redirect URI baseado no ambiente
    const isDevelopment = request.headers.get('host')?.includes('localhost') || 
                        request.headers.get('host')?.includes('127.0.0.1')
    const defaultRedirectUri = isDevelopment 
      ? 'http://localhost:3000/api/pandavideo/callback'
      : 'https://everestpreparatorios.com.br/api/pandavideo/callback'
    
    const finalRedirectUri = redirect_uri || defaultRedirectUri
    
    console.log('🎥 [OAuth API] Ambiente:', isDevelopment ? 'Desenvolvimento' : 'Produção')
    console.log('🎥 [OAuth API] Redirect URI:', finalRedirectUri)

    // Trocar código por token
    const tokenResponse = await fetch('https://app.pandavideo.com.br/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: '28444mbcl1t9570i0gfnod8l7i',
        client_secret: 'huvj3e0rqra9uu1vfm99olqk2hvi3f9na370fdeb32lbh9nhttb',
        code,
        redirect_uri: finalRedirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ [OAuth API] Erro na troca de token:', tokenResponse.status, errorText)
      return NextResponse.json({ 
        error: `Erro na troca de token: ${tokenResponse.status} - ${errorText}` 
      }, { status: tokenResponse.status })
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ [OAuth API] Token obtido com sucesso')

    return NextResponse.json(tokenData)
  } catch (error) {
    console.error('❌ [OAuth API] Erro interno:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 