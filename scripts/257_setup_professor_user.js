const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupProfessorUser() {
  console.log('🔧 [CONFIGURAÇÃO] Configurando usuário professor...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Inserir/atualizar o usuário professor na tabela user_roles
    console.log('👨‍🏫 [CONFIGURAÇÃO] Configurando role de professor...')
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: 'professor@teste.com',
        role: 'teacher'
      }, {
        onConflict: 'user_uuid'
      })
      .select()
      .single()

    if (roleError) {
      console.error('❌ [CONFIGURAÇÃO] Erro ao configurar role:', roleError)
      return
    }

    console.log('✅ [CONFIGURAÇÃO] Role de professor configurado:', roleData)

    // 2. Verificar se o usuário existe na tabela members
    console.log('👤 [CONFIGURAÇÃO] Verificando usuário na tabela members...')
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', 'professor@teste.com')
      .single()

    if (memberError && memberError.code !== 'PGRST116') {
      console.error('❌ [CONFIGURAÇÃO] Erro ao buscar membro:', memberError)
    } else if (memberData) {
      console.log('✅ [CONFIGURAÇÃO] Membro encontrado:', memberData)
    } else {
      console.log('📝 [CONFIGURAÇÃO] Membro não encontrado, criando...')
      
      const { data: newMember, error: insertMemberError } = await supabase
        .from('members')
        .insert({
          full_name: 'Professor Teste',
          email: 'professor@teste.com',
          phone: '11999999999',
          status: 'active'
        })
        .select()
        .single()

      if (insertMemberError) {
        console.error('❌ [CONFIGURAÇÃO] Erro ao criar membro:', insertMemberError)
      } else {
        console.log('✅ [CONFIGURAÇÃO] Membro criado:', newMember)
      }
    }

    // 3. Verificar se o usuário tem perfil de estudante (para compatibilidade)
    console.log('📚 [CONFIGURAÇÃO] Verificando perfil de estudante...')
    const { data: profileData, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_uuid', 'professor@teste.com')
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ [CONFIGURAÇÃO] Erro ao buscar perfil:', profileError)
    } else if (profileData) {
      console.log('✅ [CONFIGURAÇÃO] Perfil encontrado:', profileData)
    } else {
      console.log('📝 [CONFIGURAÇÃO] Perfil não encontrado, criando...')
      
      const { data: newProfile, error: insertProfileError } = await supabase
        .from('student_profiles')
        .insert({
          user_uuid: 'professor@teste.com',
          nome_completo: 'Professor Teste',
          total_flashcards: 0,
          completed_flashcards: 0,
          total_quizzes: 0,
          completed_quizzes: 0,
          average_score: 0,
          current_streak: 0,
          longest_streak: 0,
          total_study_time: 0,
          total_xp: 0,
          current_level: 1,
          last_login_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertProfileError) {
        console.error('❌ [CONFIGURAÇÃO] Erro ao criar perfil:', insertProfileError)
      } else {
        console.log('✅ [CONFIGURAÇÃO] Perfil criado:', newProfile)
      }
    }

    // 4. Verificar configuração final
    console.log('🔍 [CONFIGURAÇÃO] Verificando configuração final...')
    const { data: finalRoleData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_uuid', 'professor@teste.com')
      .single()

    if (finalRoleData) {
      console.log('✅ [CONFIGURAÇÃO] Configuração final:')
      console.log(`   - Email: ${finalRoleData.user_uuid}`)
      console.log(`   - Role: ${finalRoleData.role}`)
      console.log(`   - ID: ${finalRoleData.id}`)
    }

    console.log('🎉 [CONFIGURAÇÃO] Usuário professor configurado com sucesso!')
    console.log('📋 [CONFIGURAÇÃO] Agora você pode fazer login com:')
    console.log('   - Email: professor@teste.com')
    console.log('   - Senha: (qualquer senha válida)')
    console.log('   - Role: Teacher (aparecerá no menu)')

  } catch (error) {
    console.error('❌ [CONFIGURAÇÃO] Erro geral:', error)
  }
}

setupProfessorUser() 