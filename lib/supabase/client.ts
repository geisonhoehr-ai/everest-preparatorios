import { createBrowserClient } from '@supabase/ssr'

// Singleton simples
let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  console.log('🔧 [SUPABASE] Criando cliente...')

  // Usar apenas variáveis de ambiente - SEM FALLBACKS HARDCODED
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log('🌐 [DEBUG] URL do Supabase:', supabaseUrl)
  console.log('🔑 [DEBUG] Chave anônima (primeiros 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)

  console.log('✅ [SUPABASE] Cliente criado')
  return supabaseInstance
} 