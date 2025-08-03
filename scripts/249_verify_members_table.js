const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verifyMembersTable() {
  console.log('🔍 [VERIFICAÇÃO] Verificando estrutura da tabela members...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 [VERIFICAÇÃO] Verificando se a tabela members existe...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('members')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao acessar tabela members:', tableError)
      return
    }

    console.log('✅ [VERIFICAÇÃO] Tabela members existe')

    // 2. Verificar estrutura da tabela tentando inserir um registro de teste
    console.log('🧪 [VERIFICAÇÃO] Testando inserção com estrutura esperada...')
    const testData = {
      full_name: 'Teste Verificação',
      email: 'teste.verificacao@example.com',
      phone: '11999999999',
      status: 'active'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('members')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao inserir dados de teste:', insertError)
      console.error('❌ [VERIFICAÇÃO] Detalhes:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      })
      return
    }

    console.log('✅ [VERIFICAÇÃO] Inserção de teste bem-sucedida:', insertData)

    // 3. Limpar dados de teste
    console.log('🧹 [VERIFICAÇÃO] Limpando dados de teste...')
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('email', 'teste.verificacao@example.com')

    if (deleteError) {
      console.error('⚠️ [VERIFICAÇÃO] Erro ao limpar dados de teste:', deleteError)
    } else {
      console.log('✅ [VERIFICAÇÃO] Dados de teste removidos')
    }

    console.log('🎉 [VERIFICAÇÃO] Tabela members está funcionando corretamente!')
    console.log('📋 [VERIFICAÇÃO] Estrutura esperada:')
    console.log('   - full_name (text)')
    console.log('   - email (text)')
    console.log('   - phone (text, nullable)')
    console.log('   - status (text)')
    console.log('   - created_at (timestamp)')
    console.log('   - updated_at (timestamp)')

  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro geral:', error)
  }
}

verifyMembersTable() 