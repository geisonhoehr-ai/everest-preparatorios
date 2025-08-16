const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkUserRolesTable() {
  console.log('🔍 [USER_ROLES] Verificando tabela user_roles...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 [USER_ROLES] Verificando se a tabela user_roles existe...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ [USER_ROLES] Erro ao acessar tabela user_roles:', tableError)
      console.log('📝 [USER_ROLES] A tabela user_roles não existe ou não está acessível')
      return
    }

    console.log('✅ [USER_ROLES] Tabela user_roles existe')

    // 2. Verificar estrutura da tabela tentando inserir um registro de teste
    console.log('🧪 [USER_ROLES] Testando inserção com estrutura esperada...')
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
      console.error('❌ [USER_ROLES] Erro ao inserir dados de teste:', insertError)
      console.error('❌ [USER_ROLES] Detalhes:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      })
      return
    }

    console.log('✅ [USER_ROLES] Inserção de teste bem-sucedida:', insertData)

    // 3. Testar upsert
    console.log('🔄 [USER_ROLES] Testando upsert...')
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
      console.error('❌ [USER_ROLES] Erro no upsert:', upsertError)
    } else {
      console.log('✅ [USER_ROLES] Upsert bem-sucedido:', upsertData)
    }

    // 4. Limpar dados de teste
    console.log('🧹 [USER_ROLES] Limpando dados de teste...')
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_uuid', 'teste.verificacao@example.com')

    if (deleteError) {
      console.error('⚠️ [USER_ROLES] Erro ao limpar dados de teste:', deleteError)
    } else {
      console.log('✅ [USER_ROLES] Dados de teste removidos')
    }

    console.log('🎉 [USER_ROLES] Tabela user_roles está funcionando corretamente!')

  } catch (error) {
    console.error('❌ [USER_ROLES] Erro geral:', error)
  }
}

checkUserRolesTable() 