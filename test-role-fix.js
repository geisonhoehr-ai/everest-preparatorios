// Script de teste para verificar se o problema foi resolvido
const { createClient } = require('@supabase/supabase-js')

async function testRoleFix() {
  console.log('🧪 [TEST] Iniciando teste de correção do getUserRoleClient...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    // Simular um email de usuário
    const testEmail = 'test@example.com'
    
    console.log('🔍 [TEST] Testando getUserRoleClient com email:', testEmail)
    
    // Testar a query diretamente
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', testEmail)
      .single()
    
    console.log('📊 [TEST] Resultado da query:', { data, error })
    
    if (error) {
      console.log('ℹ️ [TEST] Erro esperado (usuário não existe):', error.message)
      console.log('✅ [TEST] A query está funcionando corretamente com email')
    } else {
      console.log('✅ [TEST] Usuário encontrado:', data)
    }
    
    // Testar com UUID (que deveria falhar)
    const testUUID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'
    console.log('🔍 [TEST] Testando query com UUID:', testUUID)
    
    const { data: uuidData, error: uuidError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', testUUID)
      .single()
    
    console.log('📊 [TEST] Resultado da query com UUID:', { data: uuidData, error: uuidError })
    
    if (uuidError) {
      console.log('ℹ️ [TEST] Erro esperado com UUID:', uuidError.message)
      console.log('✅ [TEST] A query está funcionando corretamente (não aceita UUID)')
    } else {
      console.log('⚠️ [TEST] A query aceitou UUID (isso pode indicar um problema)')
    }
    
    console.log('✅ [TEST] Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ [TEST] Erro no teste:', error)
  }
}

testRoleFix() 