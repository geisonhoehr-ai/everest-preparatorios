import { createBrowserClient } from "@supabase/ssr"

/**
 * Singleton do Supabase Client para uso no browser (Client Components).
 * A instância é criada uma única vez e reutilizada por todo o app.
 */
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

/**
 * Retorna a instância singleton já criada.
 * É exposta para compatibilidade com importações que esperam `createClient()`.
 */
export function createClient() {
  return supabaseClient
}

export type SupabaseClient = typeof supabaseClient
