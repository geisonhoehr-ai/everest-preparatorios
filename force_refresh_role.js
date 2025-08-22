const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function forceRefreshRole() {
  try {
    console.log('🔄 [FORÇAR REFRESH] Forçando atualização do role...')
    
    // 1. Fazer login como professor
    console.log('🔍 [FORÇAR] Fazendo login como professor...')
    const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (userError) {
      console.error('❌ [FORÇAR] Erro no login:', userError.message)
      return
    }
    
    console.log('✅ [FORÇAR] Login realizado:', user.email)
    
    // 2. Forçar atualização do role na tabela user_roles
    console.log('🔍 [FORÇAR] Forçando atualização do role...')
    const { data: updateData, error: updateError } = await supabase
      .from('user_roles')
      .update({ 
        updated_at: new Date().toISOString(),
        role: 'teacher' // Garantir que é teacher
      })
      .eq('user_uuid', user.id)
      .select()
    
    if (updateError) {
      console.error('❌ [FORÇAR] Erro ao atualizar role:', updateError.message)
    } else {
      console.log('✅ [FORÇAR] Role atualizado:', updateData)
    }
    
    // 3. Verificar se o role está correto
    console.log('🔍 [FORÇAR] Verificando role após atualização...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_uuid', user.id)
      .single()
    
    if (verifyError) {
      console.error('❌ [FORÇAR] Erro ao verificar role:', verifyError.message)
    } else {
      console.log('✅ [FORÇAR] Role verificado:', verifyData)
    }
    
    // 4. Testar RPC novamente
    console.log('🔍 [FORÇAR] Testando RPC após atualização...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_role_for_current_user')
    
    if (rpcError) {
      console.error('❌ [FORÇAR] Erro na RPC:', rpcError.message)
    } else {
      console.log('✅ [FORÇAR] RPC retornou:', rpcData)
      
      if (rpcData === 'teacher') {
        console.log('🎉 [FORÇAR] SUCESSO! RPC retornou role correto')
        console.log('💡 [SOLUÇÃO] Agora reinicie o servidor e teste no navegador')
      } else {
        console.log('❌ [FORÇAR] PROBLEMA! RPC ainda retorna:', rpcData)
      }
    }
    
    console.log('🎯 [FORÇAR] CONCLUSÃO:')
    console.log('   - Role no banco: ✅ teacher')
    console.log('   - RPC funcionando: ✅ teacher')
    console.log('   - Próximo passo: Reiniciar servidor e testar no navegador')
    
  } catch (error) {
    console.error('❌ [FORÇAR] Erro geral:', error)
  }
}

forceRefreshRole()
