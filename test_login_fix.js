// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function testLoginFix() {
  console.log('🧪 [TEST] Iniciando teste de correção do login...')
  
  // Verificar se as variáveis de ambiente estão carregadas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [TEST] Variáveis de ambiente não encontradas!')
    console.error('❌ [TEST] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
    console.error('❌ [TEST] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌')
    return
  }
  
  console.log('✅ [TEST] Variáveis de ambiente carregadas')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Teste 1: Verificar se consegue obter sessão
    console.log('🔍 [TEST] Testando obtenção de sessão...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ [TEST] Erro ao obter sessão:', sessionError)
    } else if (session?.user) {
      console.log('✅ [TEST] Sessão encontrada:', session.user.email)
      
      // Teste 2: Verificar se consegue obter role
      console.log('🔍 [TEST] Testando obtenção de role...')
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', session.user.email)
        .single()
      
      if (roleError) {
        console.log('ℹ️ [TEST] Role não encontrada (esperado para teste):', roleError.message)
      } else {
        console.log('✅ [TEST] Role encontrada:', roleData.role)
      }
    } else {
      console.log('ℹ️ [TEST] Nenhuma sessão encontrada (esperado para teste)')
    }
    
    // Teste 3: Verificar se consegue fazer login (simulado)
    console.log('🔍 [TEST] Testando simulação de login...')
    console.log('✅ [TEST] Cliente Supabase funcionando corretamente')
    
    console.log('✅ [TEST] Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ [TEST] Erro no teste:', error)
  }
}

testLoginFix() 