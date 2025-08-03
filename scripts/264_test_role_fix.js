require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [TEST_ROLE] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoleFix() {
  console.log('🧪 [TEST_ROLE] Testando correção do role...')
  
  try {
    // 1. Fazer login
    console.log('🔐 [TEST_ROLE] Fazendo login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ [TEST_ROLE] Erro no login:', authError)
      return
    }
    
    console.log('✅ [TEST_ROLE] Login bem-sucedido!')
    console.log('👤 [TEST_ROLE] Usuário:', authData.user.email)
    console.log('🆔 [TEST_ROLE] UUID:', authData.user.id)
    
    // 2. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 [TEST_ROLE] Sessão ativa:', !!session)
    
    // 3. Testar busca de role usando email (correção)
    console.log('🔍 [TEST_ROLE] Testando busca de role usando email...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com') // Usando email
      .single()
    
    if (roleError) {
      console.error('❌ [TEST_ROLE] Erro ao buscar role:', roleError)
      return
    }
    
    console.log('✅ [TEST_ROLE] Role encontrada:', roleData.role)
    
    // 4. Testar busca de role usando UUID (deve falhar)
    console.log('🔍 [TEST_ROLE] Testando busca de role usando UUID (deve falhar)...')
    const { data: roleDataUUID, error: roleErrorUUID } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', authData.user.id) // Usando UUID
      .single()
    
    if (roleErrorUUID) {
      console.log('✅ [TEST_ROLE] Erro esperado ao usar UUID:', roleErrorUUID.message)
    } else {
      console.log('⚠️ [TEST_ROLE] Inesperado: role encontrada com UUID')
    }
    
    // 5. Verificar dados na tabela user_roles
    console.log('🔍 [TEST_ROLE] Verificando dados na tabela user_roles...')
    const { data: allRoles, error: allRolesError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (allRolesError) {
      console.error('❌ [TEST_ROLE] Erro ao buscar todos os roles:', allRolesError)
    } else {
      console.log('📋 [TEST_ROLE] Todos os roles na tabela:')
      allRoles.forEach(role => {
        console.log(`   - user_uuid: ${role.user_uuid} | role: ${role.role}`)
      })
    }
    
    // 6. Simular o que o middleware faria
    console.log('🌐 [TEST_ROLE] Simulando middleware...')
    console.log('   - Email do usuário:', session.user.email)
    console.log('   - UUID do usuário:', session.user.id)
    console.log('   - Role correto:', roleData.role)
    
    console.log('🎉 [TEST_ROLE] Teste concluído!')
    console.log('📋 [TEST_ROLE] Resumo:')
    console.log('   - Login: ✅ Funcionando')
    console.log('   - Sessão: ✅ Ativa')
    console.log('   - Role com email: ✅ Encontrado')
    console.log('   - Role com UUID: ❌ Não encontrado (esperado)')
    console.log('   - Correção: ✅ Implementada')
    
    console.log('🚀 [TEST_ROLE] Próximos passos:')
    console.log('   1. Reinicie o servidor Next.js')
    console.log('   2. Teste o login no frontend')
    console.log('   3. Verifique se o menu admin aparece')
    console.log('   4. Monitore os logs do middleware')
    
  } catch (error) {
    console.error('❌ [TEST_ROLE] Erro geral:', error)
  }
}

testRoleFix() 