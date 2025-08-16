const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkUserRolesData() {
  console.log('🔍 [VERIFICAÇÃO] Verificando dados na tabela user_roles...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar todos os dados na tabela user_roles
    console.log('📋 [VERIFICAÇÃO] Buscando todos os registros...')
    const { data: allRoles, error: selectError } = await supabase
      .from('user_roles')
      .select('*')

    if (selectError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao buscar dados:', selectError)
      return
    }

    console.log('📊 [VERIFICAÇÃO] Dados encontrados:')
    console.log(JSON.stringify(allRoles, null, 2))

    // 2. Verificar se há algum usuário com role de professor
    const teachers = allRoles.filter(role => role.role === 'teacher' || role.role === 'admin')
    console.log(`👨‍🏫 [VERIFICAÇÃO] Professores/Admins encontrados: ${teachers.length}`)
    
    if (teachers.length > 0) {
      console.log('📋 [VERIFICAÇÃO] Lista de professores:')
      teachers.forEach(teacher => {
        console.log(`   - ${teacher.user_uuid} (${teacher.role})`)
      })
    }

    // 3. Verificar se há algum usuário com email específico
    const testEmails = ['professor@teste.com', 'admin@teste.com', 'teacher@teste.com']
    for (const email of testEmails) {
      const { data: userRole, error: userError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_uuid', email)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.error(`❌ [VERIFICAÇÃO] Erro ao buscar ${email}:`, userError)
      } else if (userRole) {
        console.log(`✅ [VERIFICAÇÃO] ${email} encontrado:`, userRole)
      } else {
        console.log(`❌ [VERIFICAÇÃO] ${email} não encontrado`)
      }
    }

    // 4. Inserir um usuário de teste com role de professor se não existir
    console.log('🧪 [VERIFICAÇÃO] Inserindo usuário de teste (professor)...')
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: 'professor@teste.com',
        role: 'teacher'
      }, {
        onConflict: 'user_uuid'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao inserir professor de teste:', insertError)
    } else {
      console.log('✅ [VERIFICAÇÃO] Professor de teste inserido/atualizado:', insertData)
    }

    // 5. Verificar novamente todos os dados
    const { data: updatedRoles, error: updatedError } = await supabase
      .from('user_roles')
      .select('*')

    if (updatedError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao buscar dados atualizados:', updatedError)
    } else {
      console.log('📊 [VERIFICAÇÃO] Dados atualizados:')
      console.log(JSON.stringify(updatedRoles, null, 2))
    }

  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro geral:', error)
  }
}

checkUserRolesData() 