import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            try {
              const item = localStorage.getItem(key)
              if (!item) return null
              
              // Tentar fazer parse do item
              const parsed = JSON.parse(item)
              return parsed
            } catch (error) {
              console.warn('Error parsing localStorage item:', key, error)
              // Remover item corrompido
              localStorage.removeItem(key)
              return null
            }
          },
          setItem: (key: string, value: string) => {
            try {
              // Validar se o valor é JSON válido antes de salvar
              JSON.parse(value)
              localStorage.setItem(key, value)
            } catch (error) {
              console.warn('Error setting localStorage item:', key, error)
              // Não salvar valores inválidos
            }
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key)
            } catch (error) {
              console.warn('Error removing localStorage item:', key, error)
            }
          }
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
  return supabaseClient
} 