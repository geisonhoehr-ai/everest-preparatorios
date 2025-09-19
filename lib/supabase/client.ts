import { createBrowserClient } from '@supabase/ssr'
import { logger } from '../logger'

// Singleton simples
let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  logger.debug('Criando cliente Supabase', 'SUPABASE')

  // Usar apenas variáveis de ambiente - SEM FALLBACKS HARDCODED
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  logger.debug('URL do Supabase configurada', 'SUPABASE', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length
  })

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)

  logger.debug('Cliente Supabase criado com sucesso', 'SUPABASE')
  return supabaseInstance
} 