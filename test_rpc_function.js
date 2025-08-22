const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testRPCFunction() {
  try {
    console.log('🧪 [TESTE RPC] Testando função RPC...')
    
    // 1. Testar sem autenticação (deve retornar 'student')
    console.log('🔍 [TESTE] Testando sem autenticação...')
    const { data: noAuthData, error: noAuthError } = await supabase.rpc('get_role_for_current_user')
    
    if (noAuthError) {
      console.log('❌ [TESTE] Erro sem autenticação:', noAuthError.message)
    } else {
      console.log('✅ [TESTE] Sem autenticação retornou:', noAuthError)
    }
    
    // 2. Fazer login como professor
    console.log('🔍 [TESTE] Fazendo login como professor...')
    const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (userError) {
      console.error('❌ [TESTE] Erro no login:', userError.message)
      return
    }
    
    console.log('✅ [TESTE] Login realizado:', user.email)
    
    // 3. Testar RPC com autenticação
    console.log('🔍 [TESTE] Testando RPC com autenticação...')
    const { data: authData, error: authError } = await supabase.rpc('get_role_for_current_user')
    
    if (authError) {
      console.log('❌ [TESTE] Erro na RPC autenticada:', authError.message)
    } else {
      console.log('✅ [TESTE] RPC autenticada retornou:', authData)
    }
    
    // 4. Verificar se o role está correto
    if (authData === 'teacher') {
      console.log('🎉 [TESTE] SUCESSO! RPC retornou role correto: teacher')
    } else {
      console.log('❌ [TESTE] PROBLEMA! RPC retornou:', authData, 'esperado: teacher')
    }
    
  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error)
  }
}

testRPCFunction()
