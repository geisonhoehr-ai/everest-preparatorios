import { createBrowserClient } from '@supabase/ssr'

// Singleton para evitar múltiplas instâncias
let supabaseInstance: any = null

export function createClient() {
  // Se já existe uma instância, retorna ela
  if (supabaseInstance) {
    return supabaseInstance
  }

  console.log('🔧 [SUPABASE] Criando nova instância do cliente...')

  try {
    // Limpar cookies corrompidos antes de criar o cliente
    clearCorruptedCookies()

    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: 'sb-auth-token',
          maxAge: 60 * 60 * 24 * 30, // 30 dias
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
        // Configuração adicional para evitar problemas de cookie
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )

    console.log('✅ [SUPABASE] Cliente criado com sucesso')
    return supabaseInstance

  } catch (error) {
    console.error('❌ [SUPABASE] Erro ao criar cliente:', error)
    
    // Em caso de erro, tentar criar cliente básico
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    return supabaseInstance
  }
}

// Função para limpar cookies corrompidos
function clearCorruptedCookies() {
  try {
    console.log('🧹 [SUPABASE] Verificando cookies corrompidos...')
    
    // Verificar se estamos no browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log('🧹 [SUPABASE] Executando no servidor, pulando limpeza de cookies')
      return
    }
    
    // Lista de cookies do Supabase que podem estar corrompidos
    const supabaseCookies = [
      'sb-auth-token',
      'sb-auth-token-code-verifier',
      'supabase-auth-token',
      'supabase.auth.token'
    ]

    supabaseCookies.forEach(cookieName => {
      // Tentar ler o cookie
      const cookies = document.cookie.split(';')
      const targetCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${cookieName}=`)
      )

      if (targetCookie) {
        const cookieValue = targetCookie.split('=')[1]
        
        // Verificar se o cookie parece corrompido
        if (cookieValue && (
          cookieValue.startsWith('base64-') || 
          cookieValue.includes('base64-') ||
          cookieValue.length > 8000 // Cookies muito longos podem estar corrompidos
        )) {
          console.log(`🧹 [SUPABASE] Removendo cookie corrompido: ${cookieName}`)
          
          // Remover o cookie corrompido
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          
          // Para subdomínios
          const parts = window.location.hostname.split('.')
          if (parts.length > 1) {
            const domain = '.' + parts.slice(-2).join('.')
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`
          }
        }
      }
    })

    // Também limpar localStorage relacionado ao Supabase se houver problemas
    try {
      const authKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      const storedAuth = localStorage.getItem(authKey)
      
      if (storedAuth) {
        // Tentar fazer parse para verificar se está corrompido
        JSON.parse(storedAuth)
      }
    } catch (error) {
      console.log('🧹 [SUPABASE] Removendo localStorage corrompido...')
      
      // Remover todas as chaves relacionadas ao Supabase
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🧹 [SUPABASE] Removido localStorage: ${key}`)
      })
    }

  } catch (error) {
    console.warn('⚠️ [SUPABASE] Erro ao limpar cookies:', error)
  }
}

// Função para resetar completamente o cliente (usar em caso de problemas graves)
export function resetSupabaseClient() {
  console.log('🔄 [SUPABASE] Resetando cliente...')
  
  supabaseInstance = null
  clearCorruptedCookies()
  
  // Recriar o cliente
  return createClient()
}

// Função para verificar saúde do cliente
export async function checkClientHealth() {
  try {
    const client = createClient()
    const { data, error } = await client.auth.getSession()
    
    if (error) {
      console.warn('⚠️ [SUPABASE] Problema na sessão:', error.message)
      
      // Se for erro de cookie corrompido, resetar cliente
      if (error.message.includes('parse') || error.message.includes('JSON')) {
        console.log('🔄 [SUPABASE] Resetando cliente devido a erro de parsing...')
        return resetSupabaseClient()
      }
    }
    
    return client
  } catch (error) {
    console.error('❌ [SUPABASE] Erro na verificação de saúde:', error)
    return resetSupabaseClient()
  }
} 