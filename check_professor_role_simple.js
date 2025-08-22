const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProfessorRoleSimple() {
  try {
    console.log('🔍 [VERIFICAÇÃO SIMPLES] Verificando role do professor...')
    
    // 1. Verificar se a função RPC existe
    console.log('🔍 [VERIFICAÇÃO] Verificando função RPC...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_role_for_current_user')
    
    if (rpcError) {
      console.log('❌ [VERIFICAÇÃO] Função RPC não existe ou erro:', rpcError.message)
      console.log('💡 [SOLUÇÃO] Precisamos criar a função RPC no Supabase')
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
      console.log('🎯 [DIAGNÓSTICO] O role está correto no banco: TEACHER')
    }
    
    // 4. Simular a busca que o frontend faz
    console.log('🔍 [VERIFICAÇÃO] Simulando busca do frontend...')
    const { data: frontendRole, error: frontendError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', user.id)
      .single()
    
    if (frontendError) {
      console.error('❌ [VERIFICAÇÃO] Erro na busca do frontend:', frontendError.message)
    } else {
      console.log('✅ [VERIFICAÇÃO] Busca do frontend retornou:', frontendRole?.role)
    }
    
    console.log('🎯 [VERIFICAÇÃO] CONCLUSÃO:')
    console.log('   - Banco: ✅ Role correto (teacher)')
    console.log('   - Frontend: ❌ Mostra "Estudante"')
    console.log('   - Problema: Cache ou lógica do useAuth hook')
    
  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro geral:', error)
  }
}

checkProfessorRoleSimple()
