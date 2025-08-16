import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de variáveis de ambiente obrigatórias apenas em runtime
// Não falhar durante o build
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  if (!supabaseUrl) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL não está definida')
  }
  if (!supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não está definida')
  }
  if (!supabaseAnonKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida')
  }
}

// ---------------------------------------------
//  Admin client ‒ full privileges (server only)
// ---------------------------------------------
export const supabaseAdmin = supabaseUrl && supabaseServiceKey ? 
  createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) : null

// ---------------------------------------------------
//  Helper to create scoped clients inside server code
// ---------------------------------------------------
export function createClient() {
  if (!supabaseAdmin) {
    throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.')
  }
  return supabaseAdmin
}
