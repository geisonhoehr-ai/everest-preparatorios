require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [FORCE_LOGIN] Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function forceProfessorLogin() {
  console.log('🔧 [FORCE_LOGIN] Forçando login do professor...')
  
  try {
    // 1. Verificar se o usuário existe
    console.log('🔍 [FORCE_LOGIN] Verificando usuário...')
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ [FORCE_LOGIN] Erro ao listar usuários:', userError)
      return
    }
    
    const professorUser = users.find(u => u.email === 'professor@teste.com')
    
    if (!professorUser) {
      console.log('⚠️ [FORCE_LOGIN] Usuário não encontrado, criando...')
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'professor@teste.com',
        password: '123456',
        email_confirm: true
      })
      
      if (createError) {
        console.error('❌ [FORCE_LOGIN] Erro ao criar usuário:', createError)
        return
      }
      
      console.log('✅ [FORCE_LOGIN] Usuário criado:', newUser.user.email)
    } else {
      console.log('✅ [FORCE_LOGIN] Usuário encontrado:', professorUser.email)
    }
    
    // 2. Garantir que o role está correto
    console.log('🔧 [FORCE_LOGIN] Configurando role...')
    const { error: upsertError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: 'professor@teste.com',
        role: 'teacher'
      }, {
        onConflict: 'user_uuid'
      })
    
    if (upsertError) {
      console.error('❌ [FORCE_LOGIN] Erro ao configurar role:', upsertError)
      return
    }
    
    console.log('✅ [FORCE_LOGIN] Role configurado como teacher')
    
    // 3. Garantir que está na tabela members
    console.log('👤 [FORCE_LOGIN] Configurando membro...')
    const { error: memberError } = await supabase
      .from('members')
      .upsert({
        email: 'professor@teste.com',
        full_name: 'Professor Teste',
        phone: '11999999999',
        status: 'active'
      }, {
        onConflict: 'email'
      })
    
    if (memberError) {
      console.error('❌ [FORCE_LOGIN] Erro ao configurar membro:', memberError)
      return
    }
    
    console.log('✅ [FORCE_LOGIN] Membro configurado')
    
    // 4. Garantir que está na tabela student_profiles
    console.log('📚 [FORCE_LOGIN] Configurando perfil...')
    const { error: profileError } = await supabase
      .from('student_profiles')
      .upsert({
        user_uuid: 'professor@teste.com',
        nome_completo: 'Professor Teste'
      }, {
        onConflict: 'user_uuid'
      })
    
    if (profileError) {
      console.error('❌ [FORCE_LOGIN] Erro ao configurar perfil:', profileError)
      return
    }
    
    console.log('✅ [FORCE_LOGIN] Perfil configurado')
    
    // 5. Testar login
    console.log('🔐 [FORCE_LOGIN] Testando login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'professor@teste.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ [FORCE_LOGIN] Erro no login:', authError)
      return
    }
    
    console.log('✅ [FORCE_LOGIN] Login bem-sucedido!')
    console.log('👤 [FORCE_LOGIN] Usuário:', authData.user.email)
    console.log('🆔 [FORCE_LOGIN] ID:', authData.user.id)
    
    // 6. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 [FORCE_LOGIN] Sessão ativa:', !!session)
    
    // 7. Verificar role com sessão
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', 'professor@teste.com')
      .single()
    
    if (roleError) {
      console.error('❌ [FORCE_LOGIN] Erro ao verificar role:', roleError)
    } else {
      console.log('✅ [FORCE_LOGIN] Role confirmado:', roleData.role)
    }
    
    console.log('🎉 [FORCE_LOGIN] Configuração concluída!')
    console.log('📋 [FORCE_LOGIN] Dados para teste:')
    console.log('   - Email: professor@teste.com')
    console.log('   - Senha: 123456')
    console.log('   - Role: teacher')
    console.log('   - Menu: Deve mostrar opções de admin')
    console.log('')
    console.log('🌐 [FORCE_LOGIN] Agora acesse: http://localhost:3001')
    console.log('🔐 [FORCE_LOGIN] Faça login com os dados acima')
    console.log('👨‍🏫 [FORCE_LOGIN] O menu deve mostrar opções de professor/admin')
    
  } catch (error) {
    console.error('❌ [FORCE_LOGIN] Erro geral:', error)
  }
}

forceProfessorLogin() 