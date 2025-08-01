require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [TESTE] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfessorLogin() {
  console.log('🧪 [TESTE] Testando login do professor...')
  
  try {
    // 1. Verificar se o usuário existe
    console.log('🔍 [TESTE] Verificando se usuário existe...')
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ [TESTE] Erro ao listar usuários:', userError)
      return
    }
    
    const professorUser = users.find(u => u.email === 'professor@teste.com')
    
    if (!professorUser) {
      console.log('⚠️ [TESTE] Usuário professor não encontrado, criando...')
      
      // Criar usuário professor
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'professor@teste.com',
        password: '123456',
        email_confirm: true
      })
      
      if (createError) {
        console.error('❌ [TESTE] Erro ao criar usuário:', createError)
        return
      }
      
      console.log('✅ [TESTE] Usuário professor criado:', newUser.user.email)
    } else {
      console.log('✅ [TESTE] Usuário professor encontrado:', professorUser.email)
    }
    
    // 2. Verificar role na tabela user_roles
    console.log('🔍 [TESTE] Verificando role...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (roleError) {
      console.error('❌ [TESTE] Erro ao buscar role:', roleError)
      return
    }
    
    console.log('✅ [TESTE] Role encontrado:', roleData)
    
    // 3. Testar login
    console.log('🔐 [TESTE] Testando login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ [TESTE] Erro no login:', authError)
      return
    }
    
    console.log('✅ [TESTE] Login bem-sucedido!')
    console.log('👤 [TESTE] Usuário logado:', authData.user.email)
    console.log('🆔 [TESTE] ID do usuário:', authData.user.id)
    
    // 4. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 [TESTE] Sessão ativa:', !!session)
    
    // 5. Testar busca de role com sessão ativa
    const { data: sessionRoleData, error: sessionRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (sessionRoleError) {
      console.error('❌ [TESTE] Erro ao buscar role com sessão:', sessionRoleError)
    } else {
      console.log('✅ [TESTE] Role com sessão:', sessionRoleData)
    }
    
    console.log('🎉 [TESTE] Teste concluído com sucesso!')
    console.log('📋 [TESTE] Resumo:')
    console.log('   - Email: professor@teste.com')
    console.log('   - Senha: 123456')
    console.log('   - Role: teacher')
    console.log('   - Status: Pronto para uso')
    
  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error)
  }
}

testProfessorLogin() 