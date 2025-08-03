import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    console.log('🎥 [OAuth Callback] Processando callback...')
    console.log('🎥 [OAuth Callback] Código:', code ? 'encontrado' : 'não encontrado')
    console.log('🎥 [OAuth Callback] State:', state)
    console.log('🎥 [OAuth Callback] Erro:', error)
    
    // Verificar se há erro
    if (error) {
      console.error('❌ [OAuth Callback] Erro no callback:', error)
      return NextResponse.redirect(
        `${request.nextUrl.origin}/cursos?error=oauth_error&message=${encodeURIComponent(error)}`
      )
    }
    
    // Verificar se há código
    if (!code) {
      console.error('❌ [OAuth Callback] Código não fornecido')
      return NextResponse.redirect(
        `${request.nextUrl.origin}/cursos?error=no_code&message=${encodeURIComponent('Código de autorização não fornecido')}`
      )
    }
    
    // Verificar state (opcional, mas recomendado)
    const savedState = request.cookies.get('pandavideo_oauth_state')?.value
    if (state && savedState && state !== savedState) {
      console.error('❌ [OAuth Callback] State inválido')
      return NextResponse.redirect(
        `${request.nextUrl.origin}/cursos?error=invalid_state&message=${encodeURIComponent('State inválido')}`
      )
    }
    
    // Determinar redirect URI baseado no ambiente
    const isDevelopment = request.headers.get('host')?.includes('localhost') || 
                        request.headers.get('host')?.includes('127.0.0.1')
    const redirectUri = isDevelopment 
      ? 'http://localhost:3000/api/pandavideo/callback'
      : 'https://everestpreparatorios.com.br/api/pandavideo/callback'
    
    console.log('🎥 [OAuth Callback] Ambiente:', isDevelopment ? 'Desenvolvimento' : 'Produção')
    console.log('🎥 [OAuth Callback] Redirect URI:', redirectUri)
    
    // Trocar código por token
    console.log('🎥 [OAuth Callback] Trocando código por token...')
    
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
        redirect_uri: redirectUri,
      }),
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ [OAuth Callback] Erro na troca de token:', tokenResponse.status, errorText)
      return NextResponse.redirect(
        `${request.nextUrl.origin}/cursos?error=token_error&message=${encodeURIComponent(`Erro na troca de token: ${tokenResponse.status}`)}`
      )
    }
    
    const tokenData = await tokenResponse.json()
    console.log('✅ [OAuth Callback] Token obtido com sucesso')
    
    // Redirecionar para a página de cursos com o token
    const redirectUrl = new URL(`${request.nextUrl.origin}/cursos`)
    redirectUrl.searchParams.set('token', tokenData.access_token)
    if (tokenData.expires_in) {
      redirectUrl.searchParams.set('expires_in', tokenData.expires_in.toString())
    }
    redirectUrl.searchParams.set('success', 'true')
    
    console.log('🎥 [OAuth Callback] Redirecionando para:', redirectUrl.toString())
    
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('❌ [OAuth Callback] Erro interno:', error)
    return NextResponse.redirect(
      `${request.nextUrl.origin}/cursos?error=internal_error&message=${encodeURIComponent('Erro interno do servidor')}`
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
} 