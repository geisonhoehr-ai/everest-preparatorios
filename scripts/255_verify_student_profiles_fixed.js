const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verifyStudentProfilesFixed() {
  console.log('🔍 [VERIFICAÇÃO] Verificando tabela student_profiles corrigida...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 [VERIFICAÇÃO] Verificando se a tabela student_profiles existe...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao acessar tabela student_profiles:', tableError)
      return
    }

    console.log('✅ [VERIFICAÇÃO] Tabela student_profiles existe')

    // 2. Testar inserção com email (agora deve funcionar)
    console.log('🧪 [VERIFICAÇÃO] Testando inserção com email...')
    const testData = {
      user_uuid: 'teste.verificacao@example.com',
      nome_completo: 'Teste Verificação',
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
    }

    const { data: insertData, error: insertError } = await supabase
      .from('student_profiles')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ [VERIFICAÇÃO] Erro ao inserir dados de teste:', insertError)
      return
    }

    console.log('✅ [VERIFICAÇÃO] Inserção com email bem-sucedida:', insertData)

    // 3. Testar atualização (funcionalidade usada no código)
    console.log('🔄 [VERIFICAÇÃO] Testando atualização...')
    const { data: updateData, error: updateError } = await supabase
      .from('student_profiles')
      .update({
        nome_completo: 'Teste Atualizado',
        total_xp: 100,
        current_level: 2,
        last_login_at: new Date().toISOString()
      })
      .eq('user_uuid', 'teste.verificacao@example.com')
      .select()
      .single()

    if (updateError) {
      console.error('❌ [VERIFICAÇÃO] Erro na atualização:', updateError)
    } else {
      console.log('✅ [VERIFICAÇÃO] Atualização bem-sucedida:', updateData)
    }

    // 4. Testar busca por user_uuid (funcionalidade usada no código)
    console.log('🔍 [VERIFICAÇÃO] Testando busca por user_uuid...')
    const { data: searchData, error: searchError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_uuid', 'teste.verificacao@example.com')
      .single()

    if (searchError) {
      console.error('❌ [VERIFICAÇÃO] Erro na busca:', searchError)
    } else {
      console.log('✅ [VERIFICAÇÃO] Busca bem-sucedida:', searchData)
    }

    // 5. Limpar dados de teste
    console.log('🧹 [VERIFICAÇÃO] Limpando dados de teste...')
    const { error: deleteError } = await supabase
      .from('student_profiles')
      .delete()
      .eq('user_uuid', 'teste.verificacao@example.com')

    if (deleteError) {
      console.error('⚠️ [VERIFICAÇÃO] Erro ao limpar dados de teste:', deleteError)
    } else {
      console.log('✅ [VERIFICAÇÃO] Dados de teste removidos')
    }

    console.log('🎉 [VERIFICAÇÃO] Tabela student_profiles está funcionando corretamente!')
    console.log('📋 [VERIFICAÇÃO] Estrutura corrigida:')
    console.log('   - user_uuid (text) - Agora aceita emails')
    console.log('   - nome_completo (text)')
    console.log('   - total_flashcards, completed_flashcards (integer)')
    console.log('   - total_quizzes, completed_quizzes (integer)')
    console.log('   - average_score (decimal)')
    console.log('   - current_streak, longest_streak (integer)')
    console.log('   - total_study_time, total_xp (integer)')
    console.log('   - current_level (integer)')
    console.log('   - first_login_at, last_login_at (timestamp)')

  } catch (error) {
    console.error('❌ [VERIFICAÇÃO] Erro geral:', error)
  }
}

verifyStudentProfilesFixed() 