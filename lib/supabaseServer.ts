import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de variáveis de ambiente obrigatórias
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL é obrigatória')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY é obrigatória')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória')
}

// ---------------------------------------------
//  Admin client ‒ full privileges (server only)
// ---------------------------------------------
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ---------------------------------------------------
//  Helper to create scoped clients inside server code
// ---------------------------------------------------
export function createClient() {
  return supabaseAdmin
}
