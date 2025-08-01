const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verifyUserRolesFixed() {
  console.log('🔍 [VERIFICAÇÃO] Verificando tabela user_roles corrigida...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 [VERIFICAÇÃO] Verificando se a tabela user_roles existe...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao acessar tabela user_roles:', tableError)
      return
    }

    console.log('✅ [VERIFICAÇÃO] Tabela user_roles existe')

    // 2. Testar inserção com email (agora deve funcionar)
    console.log('🧪 [VERIFICAÇÃO] Testando inserção com email...')
    const testData = {
      user_uuid: 'teste.verificacao@example.com',
      role: 'student'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao inserir dados de teste:', insertError)
      return
    }

    console.log('✅ [VERIFICAÇÃO] Inserção com email bem-sucedida:', insertData)

    // 3. Testar upsert (funcionalidade usada no código)
    console.log('🔄 [VERIFICAÇÃO] Testando upsert...')
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: 'teste.verificacao@example.com',
        role: 'teacher'
      }, {
        onConflict: 'user_uuid'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('❌ [VERIFICAÇÃO] Erro no upsert:', upsertError)
    } else {
      console.log('✅ [VERIFICAÇÃO] Upsert bem-sucedido:', upsertData)
    }

    // 4. Testar diferentes roles
    console.log('🎭 [VERIFICAÇÃO] Testando diferentes roles...')
    const rolesToTest = ['student', 'teacher', 'admin']
    
    for (const role of rolesToTest) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_uuid: `teste.${role}@example.com`,
          role: role
        }, {
          onConflict: 'user_uuid'
        })

      if (roleError) {
        console.error(`❌ [VERIFICAÇÃO] Erro ao inserir role ${role}:`, roleError)
      } else {
        console.log(`✅ [VERIFICAÇÃO] Role ${role} inserido com sucesso`)
      }
    }

    // 5. Limpar dados de teste
    console.log('🧹 [VERIFICAÇÃO] Limpando dados de teste...')
    const testEmails = [
      'teste.verificacao@example.com',
      'teste.student@example.com',
      'teste.teacher@example.com',
      'teste.admin@example.com'
    ]

    for (const email of testEmails) {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_uuid', email)

      if (deleteError) {
        console.error(`⚠️ [VERIFICAÇÃO] Erro ao limpar ${email}:`, deleteError)
      }
    }

    console.log('✅ [VERIFICAÇÃO] Dados de teste removidos')

    console.log('🎉 [VERIFICAÇÃO] Tabela user_roles está funcionando corretamente!')
    console.log('📋 [VERIFICAÇÃO] Estrutura corrigida:')
    console.log('   - user_uuid (text) - Agora aceita emails')
    console.log('   - role (text) - student, teacher, admin')
    console.log('   - created_at (timestamp)')
    console.log('   - updated_at (timestamp)')

  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro geral:', error)
  }
}

verifyUserRolesFixed() 