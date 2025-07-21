import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

// ---------------------------------------------------
//  Optional client-side instance with anon privileges
// ---------------------------------------------------
export const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})
