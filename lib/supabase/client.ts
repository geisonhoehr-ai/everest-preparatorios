import { createBrowserClient } from '@supabase/ssr'

// Singleton simples
let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  console.log('🔧 [SUPABASE] Criando cliente...')

  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ [SUPABASE] Variáveis de ambiente não definidas')
    // Retornar um cliente mock para evitar erros durante o build
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        delete: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    }
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('✅ [SUPABASE] Cliente criado')
  return supabaseInstance
} 