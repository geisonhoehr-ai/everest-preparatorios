const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testCurrentUser() {
  console.log('🧪 [TESTE] Testando usuário atual...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar se há algum usuário logado
    console.log('🔍 [TESTE] Verificando sessão atual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ [TESTE] Erro ao verificar sessão:', sessionError)
      return
    }

    if (!session) {
      console.log('❌ [TESTE] Nenhuma sessão encontrada')
      console.log('💡 [TESTE] Dica: Faça login com professor@teste.com para testar')
      return
    }

    console.log('✅ [TESTE] Sessão encontrada:')
    console.log(`   - Email: ${session.user.email}`)
    console.log(`   - ID: ${session.user.id}`)

    // 2. Buscar role do usuário
    console.log('👤 [TESTE] Buscando role do usuário...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', session.user.email)
      .single()

    if (roleError) {
      console.error('❌ [TESTE] Erro ao buscar role:', roleError)
      console.log('💡 [TESTE] Tentando buscar com UUID...')
      
      const { data: roleDataUUID, error: roleErrorUUID } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', session.user.id)
        .single()

      if (roleErrorUUID) {
        console.error('❌ [TESTE] Erro ao buscar role com UUID:', roleErrorUUID)
        console.log('📝 [TESTE] Usuário não tem role definido')
      } else {
        console.log('✅ [TESTE] Role encontrado com UUID:', roleDataUUID)
      }
    } else {
      console.log('✅ [TESTE] Role encontrado com email:', roleData)
    }

    // 3. Verificar se o usuário existe na tabela members
    console.log('👥 [TESTE] Verificando se usuário existe na tabela members...')
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (memberError && memberError.code !== 'PGRST116') {
      console.error('❌ [TESTE] Erro ao buscar membro:', memberError)
    } else if (memberData) {
      console.log('✅ [TESTE] Membro encontrado:', memberData)
    } else {
      console.log('❌ [TESTE] Membro não encontrado')
    }

    // 4. Verificar se o usuário tem perfil de estudante
    console.log('📚 [TESTE] Verificando perfil de estudante...')
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_uuid', session.user.email)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ [TESTE] Erro ao buscar perfil:', profileError)
    } else if (profileData) {
      console.log('✅ [TESTE] Perfil encontrado:', profileData)
    } else {
      console.log('❌ [TESTE] Perfil não encontrado')
    }

    // 5. Simular a função getRoleDisplay
    const getRoleDisplay = (role) => {
      switch (role) {
        case "teacher":
          return "Professor"
        case "admin":
          return "Administrador"
        case "student":
        default:
          return "Estudante"
      }
    }

    const finalRole = roleData?.role || 'student'
    console.log('🎭 [TESTE] Role final detectado:', finalRole)
    console.log('📋 [TESTE] Display do role:', getRoleDisplay(finalRole))

    // 6. Verificar se é professor
    const isTeacher = finalRole === 'teacher' || finalRole === 'admin'
    console.log(`👨‍🏫 [TESTE] É professor? ${isTeacher}`)

    if (isTeacher) {
      console.log('✅ [TESTE] Usuário é professor - deve ver menu completo')
    } else {
      console.log('❌ [TESTE] Usuário é estudante - menu limitado')
    }

  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error)
  }
}

testCurrentUser() 