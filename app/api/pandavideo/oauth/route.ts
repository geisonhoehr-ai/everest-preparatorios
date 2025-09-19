import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json()
    
    logger.debug('Processando código OAuth', 'API', { codePresent: !!code })
    
    if (!code) {
      return NextResponse.json({ error: 'Código OAuth não fornecido' }, { status: 400 })
    }

    // Verificar se as credenciais do PandaVideo estão configuradas
    const clientId = process.env.PANDAVIDEO_CLIENT_ID
    const clientSecret = process.env.PANDAVIDEO_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      logger.error('Credenciais do PandaVideo não configuradas', 'API')
      return NextResponse.json({ error: 'Configuração de API não encontrada' }, { status: 500 })
    }

    // Determinar redirect URI baseado no ambiente
    const isDevelopment = request.headers.get('host')?.includes('localhost') || 
                        request.headers.get('host')?.includes('127.0.0.1')
    const defaultRedirectUri = isDevelopment 
      ? 'http://localhost:3000/api/pandavideo/callback'
      : 'https://everestpreparatorios.com.br/api/pandavideo/callback'
    
    const finalRedirectUri = redirect_uri || defaultRedirectUri
    
    logger.debug('Configuração OAuth', 'API', { 
      environment: isDevelopment ? 'development' : 'production',
      redirectUri: finalRedirectUri
    })

    // Trocar código por token
    const tokenResponse = await fetch('https://app.pandavideo.com.br/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: finalRedirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      logger.error('Erro na troca de token OAuth', 'API', { 
        status: tokenResponse.status, 
        error: errorText 
      })
      return NextResponse.json({ 
        error: `Erro na troca de token: ${tokenResponse.status} - ${errorText}` 
      }, { status: tokenResponse.status })
    }

    const tokenData = await tokenResponse.json()
    logger.info('Token OAuth obtido com sucesso', 'API')

    return NextResponse.json(tokenData)
  } catch (error) {
    logger.error('Erro interno na API OAuth', 'API', { error: (error as Error).message })
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 