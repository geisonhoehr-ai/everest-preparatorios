const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProfessorRole() {
  try {
    console.log('🔍 [VERIFICAÇÃO] Verificando role do professor...')
    
    // 1. Verificar se a função RPC existe
    console.log('🔍 [VERIFICAÇÃO] Verificando função RPC...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_role_for_current_user')
    
    if (rpcError) {
      console.log('❌ [VERIFICAÇÃO] Função RPC não existe ou erro:', rpcError.message)
    } else {
      console.log('✅ [VERIFICAÇÃO] Função RPC existe e retornou:', rpcData)
    }
    
    // 2. Verificar usuário professor@teste.com
    console.log('🔍 [VERIFICAÇÃO] Verificando usuário professor@teste.com...')
    const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (userError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao fazer login:', userError.message)
      return
    }
    
    if (!user) {
      console.error('❌ [VERIFICAÇÃO] Usuário não encontrado')
      return
    }
    
    console.log('✅ [VERIFICAÇÃO] Login realizado com sucesso')
    console.log('   - ID:', user.id)
    console.log('   - Email:', user.email)
    
    // 3. Verificar role na tabela user_roles
    console.log('🔍 [VERIFICAÇÃO] Verificando role na tabela user_roles...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_uuid', user.id)
      .single()
    
    if (roleError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao buscar role:', roleError.message)
    } else {
      console.log('✅ [VERIFICAÇÃO] Role encontrado:', roleData)
    }
    
    // 4. Verificar perfil de professor
    console.log('🔍 [VERIFICAÇÃO] Verificando perfil de professor...')
    const { data: profileData, error: profileError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_uuid', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao buscar perfil:', profileError.message)
    } else {
      console.log('✅ [VERIFICAÇÃO] Perfil encontrado:', profileData)
    }
    
    // 5. Testar a função getUserRoleClient
    console.log('🔍 [VERIFICAÇÃO] Testando getUserRoleClient...')
    const { getUserRoleClient } = require('./lib/get-user-role.ts')
    
    try {
      const role = await getUserRoleClient(user.id)
      console.log('✅ [VERIFICAÇÃO] getUserRoleClient retornou:', role)
    } catch (error) {
      console.error('❌ [VERIFICAÇÃO] Erro em getUserRoleClient:', error.message)
    }
    
    // 6. Verificar se está em paid_users
    console.log('🔍 [VERIFICAÇÃO] Verificando paid_users...')
    const { data: paidData, error: paidError } = await supabase
      .from('paid_users')
      .select('*')
      .eq('email', 'professor@teste.com')
      .single()
    
    if (paidError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao verificar paid_users:', paidError.message)
    } else {
      console.log('✅ [VERIFICAÇÃO] Status em paid_users:', paidData)
    }
    
    console.log('🎯 [VERIFICAÇÃO] Verificação concluída!')
    
  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro geral:', error)
  }
}

checkProfessorRole()
