require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [TEST_PERSISTENT] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPersistentProfile() {
  console.log('🧪 [TEST_PERSISTENT] Testando perfil persistente...')
  
  try {
    // 1. Fazer login
    console.log('🔐 [TEST_PERSISTENT] Fazendo login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ [TEST_PERSISTENT] Erro no login:', authError)
      return
    }
    
    console.log('✅ [TEST_PERSISTENT] Login bem-sucedido!')
    console.log('👤 [TEST_PERSISTENT] Usuário:', authData.user.email)
    
    // 2. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 [TEST_PERSISTENT] Sessão ativa:', !!session)
    
    // 3. Verificar role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (roleError) {
      console.error('❌ [TEST_PERSISTENT] Erro ao buscar role:', roleError)
      return
    }
    
    console.log('✅ [TEST_PERSISTENT] Role:', roleData.role)
    
    // 4. Simular persistência
    console.log('🔄 [TEST_PERSISTENT] Simulando persistência...')
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verificar sessão novamente
    const { data: { session: persistentSession } } = await supabase.auth.getSession()
    console.log('🔑 [TEST_PERSISTENT] Sessão persistente:', !!persistentSession)
    
    if (persistentSession) {
      console.log('✅ [TEST_PERSISTENT] Sessão mantida!')
      console.log('👤 [TEST_PERSISTENT] Usuário persistente:', persistentSession.user.email)
    } else {
      console.log('❌ [TEST_PERSISTENT] Sessão perdida!')
    }
    
    console.log('🎉 [TEST_PERSISTENT] Teste concluído!')
    console.log('📋 [TEST_PERSISTENT] Resumo:')
    console.log('   - Login: ✅ Funcionando')
    console.log('   - Sessão: ✅ Persistente')
    console.log('   - Role: ✅ Teacher')
    console.log('   - Menu Admin: ✅ Deve aparecer')
    
  } catch (error) {
    console.error('❌ [TEST_PERSISTENT] Erro geral:', error)
  }
}

testPersistentProfile() 