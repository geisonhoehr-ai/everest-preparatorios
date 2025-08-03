const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkStudentProfilesTable() {
  console.log('🔍 [STUDENT_PROFILES] Verificando tabela student_profiles...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 [STUDENT_PROFILES] Verificando se a tabela student_profiles existe...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ [STUDENT_PROFILES] Erro ao acessar tabela student_profiles:', tableError)
      console.log('📝 [STUDENT_PROFILES] A tabela student_profiles não existe ou não está acessível')
      return
    }

    console.log('✅ [STUDENT_PROFILES] Tabela student_profiles existe')

    // 2. Verificar estrutura da tabela tentando inserir um registro de teste
    console.log('🧪 [STUDENT_PROFILES] Testando inserção com estrutura esperada...')
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
      console.error('❌ [STUDENT_PROFILES] Erro ao inserir dados de teste:', insertError)
      console.error('❌ [STUDENT_PROFILES] Detalhes:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      })
      return
    }

    console.log('✅ [STUDENT_PROFILES] Inserção de teste bem-sucedida:', insertData)

    // 3. Testar atualização
    console.log('🔄 [STUDENT_PROFILES] Testando atualização...')
    const { data: updateData, error: updateError } = await supabase
      .from('student_profiles')
      .update({
        nome_completo: 'Teste Atualizado',
        total_xp: 100,
        current_level: 2
      })
      .eq('user_uuid', 'teste.verificacao@example.com')
      .select()
      .single()

    if (updateError) {
      console.error('❌ [STUDENT_PROFILES] Erro na atualização:', updateError)
    } else {
      console.log('✅ [STUDENT_PROFILES] Atualização bem-sucedida:', updateData)
    }

    // 4. Limpar dados de teste
    console.log('🧹 [STUDENT_PROFILES] Limpando dados de teste...')
    const { error: deleteError } = await supabase
      .from('student_profiles')
      .delete()
      .eq('user_uuid', 'teste.verificacao@example.com')

    if (deleteError) {
      console.error('⚠️ [STUDENT_PROFILES] Erro ao limpar dados de teste:', deleteError)
    } else {
      console.log('✅ [STUDENT_PROFILES] Dados de teste removidos')
    }

    console.log('🎉 [STUDENT_PROFILES] Tabela student_profiles está funcionando corretamente!')

  } catch (error) {
    console.error('❌ [STUDENT_PROFILES] Erro geral:', error)
  }
}

checkStudentProfilesTable() 