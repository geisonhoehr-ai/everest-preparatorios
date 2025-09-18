import { createBrowserClient } from '@supabase/ssr'

// Singleton simples
let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  console.log('🔧 [SUPABASE] Criando cliente...')

  // Usar configurações hardcoded do next.config.js como fallback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnhzindsfuqnaxosujay.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

  console.log('🌐 [DEBUG] URL do Supabase:', supabaseUrl)
  console.log('🔑 [DEBUG] Chave anônima (primeiros 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)

  console.log('✅ [SUPABASE] Cliente criado')
  return supabaseInstance
} 