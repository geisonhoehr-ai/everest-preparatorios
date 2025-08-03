import { createBrowserClient } from '@supabase/ssr'

// Singleton simples
let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  console.log('🔧 [SUPABASE] Criando cliente...')

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('✅ [SUPABASE] Cliente criado')
  return supabaseInstance
} 