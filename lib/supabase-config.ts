// Configuração do Supabase - usar apenas variáveis de ambiente
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
}

// Verificar se as configurações estão disponíveis
export const isSupabaseConfigured = () => {
  return supabaseConfig.url && supabaseConfig.anonKey
}