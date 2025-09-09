// Debug helper para verificar configuração do Supabase
export function debugSupabaseConfig() {
  console.log('🔍 [DEBUG] Verificando configuração do Supabase...')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('📋 [DEBUG] NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Definida' : '❌ Não definida')
  console.log('📋 [DEBUG] NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅ Definida' : '❌ Não definida')
  
  if (url) {
    console.log('🌐 [DEBUG] URL do Supabase:', url)
  }
  
  if (key) {
    console.log('🔑 [DEBUG] Chave anônima (primeiros 20 chars):', key.substring(0, 20) + '...')
  }
  
  // Verificar se estamos em produção
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = process.env.VERCEL === '1'
  
  console.log('🏗️ [DEBUG] NODE_ENV:', process.env.NODE_ENV)
  console.log('🚀 [DEBUG] Vercel:', isVercel ? '✅ Sim' : '❌ Não')
  console.log('🌍 [DEBUG] Produção:', isProduction ? '✅ Sim' : '❌ Não')
  
  return {
    hasUrl: !!url,
    hasKey: !!key,
    isProduction,
    isVercel
  }
}

// Função para verificar conectividade com Supabase
export async function testSupabaseConnection() {
  try {
    console.log('🔗 [DEBUG] Testando conexão com Supabase...')
    
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ [DEBUG] Erro na conexão:', error)
      return false
    }
    
    console.log('✅ [DEBUG] Conexão com Supabase funcionando')
    return true
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao testar conexão:', error)
    return false
  }
}
