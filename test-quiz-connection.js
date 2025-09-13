// Testar conexão da página de Quiz com Supabase
const { createClient } = require('@supabase/supabase-js')

// Usar configurações do projeto
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuizConnection() {
  console.log('🔍 Testando conexão da página de Quiz...\n')

  try {
    // Testar busca por tópico específico (como a página faz)
    console.log('📚 Testando busca por tópico "fonetica-fonologia":')
    const { data: questions1, error: error1 } = await supabase
      .from("quiz_questions")
      .select("id, topic_id, quiz_id, question_text, options, correct_answer, explanation")
      .eq("topic_id", "fonetica-fonologia")
      .order("id")

    if (error1) {
      console.error('❌ Erro ao buscar questões:', error1.message)
    } else {
      console.log(`✅ Questões encontradas: ${questions1?.length || 0}`)
      if (questions1 && questions1.length > 0) {
        console.log('📋 Primeira questão:', questions1[0])
      }
    }

    // Testar busca por quiz_id específico
    console.log('\n🎯 Testando busca por quiz_id = 1:')
    const { data: questions2, error: error2 } = await supabase
      .from("quiz_questions")
      .select("id, topic_id, quiz_id, question_text, options, correct_answer, explanation")
      .eq("quiz_id", 1)
      .order("id")

    if (error2) {
      console.error('❌ Erro ao buscar questões:', error2.message)
    } else {
      console.log(`✅ Questões encontradas: ${questions2?.length || 0}`)
      if (questions2 && questions2.length > 0) {
        console.log('📋 Primeira questão:', questions2[0])
      }
    }

    // Testar busca geral (sem filtros)
    console.log('\n🌐 Testando busca geral:')
    const { data: questions3, error: error3 } = await supabase
      .from("quiz_questions")
      .select("id, topic_id, quiz_id, question_text, options, correct_answer, explanation")
      .limit(5)

    if (error3) {
      console.error('❌ Erro ao buscar questões:', error3.message)
    } else {
      console.log(`✅ Questões encontradas: ${questions3?.length || 0}`)
      if (questions3 && questions3.length > 0) {
        console.log('📋 Primeiras questões:', questions3)
      }
    }

    // Verificar se há problemas de permissão
    console.log('\n🔐 Testando permissões:')
    const { data: testData, error: testError } = await supabase
      .from("quiz_questions")
      .select("count")
      .limit(1)

    if (testError) {
      console.error('❌ Erro de permissão:', testError.message)
    } else {
      console.log('✅ Permissões OK')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testQuizConnection()
