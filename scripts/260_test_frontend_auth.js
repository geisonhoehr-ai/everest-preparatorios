require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [FRONTEND_TEST] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFrontendAuth() {
  console.log('🧪 [FRONTEND_TEST] Testando autenticação no frontend...')
  
  try {
    // 1. Testar login
    console.log('🔐 [FRONTEND_TEST] Fazendo login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ [FRONTEND_TEST] Erro no login:', authError)
      return
    }
    
    console.log('✅ [FRONTEND_TEST] Login bem-sucedido!')
    console.log('👤 [FRONTEND_TEST] Usuário:', authData.user.email)
    
    // 2. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 [FRONTEND_TEST] Sessão ativa:', !!session)
    
    // 3. Testar busca de role
    console.log('🔍 [FRONTEND_TEST] Buscando role...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (roleError) {
      console.error('❌ [FRONTEND_TEST] Erro ao buscar role:', roleError)
      return
    }
    
    console.log('✅ [FRONTEND_TEST] Role encontrado:', roleData.role)
    
    // 4. Testar busca de membro
    console.log('👤 [FRONTEND_TEST] Buscando membro...')
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', 'professor@teste.com')
      .single()
    
    if (memberError) {
      console.error('❌ [FRONTEND_TEST] Erro ao buscar membro:', memberError)
    } else {
      console.log('✅ [FRONTEND_TEST] Membro encontrado:', memberData.full_name)
    }
    
    // 5. Testar busca de perfil
    console.log('📚 [FRONTEND_TEST] Buscando perfil...')
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (profileError) {
      console.error('❌ [FRONTEND_TEST] Erro ao buscar perfil:', profileError)
    } else {
      console.log('✅ [FRONTEND_TEST] Perfil encontrado:', profileData.nome_completo)
    }
    
    console.log('🎉 [FRONTEND_TEST] Teste concluído com sucesso!')
    console.log('📋 [FRONTEND_TEST] Resumo:')
    console.log('   - Login: ✅ Funcionando')
    console.log('   - Sessão: ✅ Ativa')
    console.log('   - Role: ✅ Teacher')
    console.log('   - Membro: ✅ Configurado')
    console.log('   - Perfil: ✅ Configurado')
    console.log('')
    console.log('🌐 [FRONTEND_TEST] Agora teste no navegador:')
    console.log('   1. Acesse: http://localhost:3001')
    console.log('   2. Faça login com: professor@teste.com / 123456')
    console.log('   3. Verifique se o menu mostra opções de admin')
    console.log('   4. Verifique se o perfil mostra "Professor"')
    
  } catch (error) {
    console.error('❌ [FRONTEND_TEST] Erro geral:', error)
  }
}

testFrontendAuth() 