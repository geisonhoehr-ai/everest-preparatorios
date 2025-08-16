const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkQuizzesDB() {
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variáveis de ambiente do Supabase não encontradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("🔍 [DEBUG] Verificando tabela de quizzes...")

  try {
    // Verificar se a tabela quizzes existe
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(10)

    if (quizzesError) {
      console.error("❌ [DEBUG] Erro ao buscar quizzes:", quizzesError)
      return
    }

    console.log("✅ [DEBUG] Quizzes encontrados:", quizzes?.length || 0)
    if (quizzes && quizzes.length > 0) {
      console.log("✅ [DEBUG] Primeiro quiz:", quizzes[0])
    }

    // Verificar se a tabela quiz_questions existe
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(10)

    if (questionsError) {
      console.error("❌ [DEBUG] Erro ao buscar questões:", questionsError)
      return
    }

    console.log("✅ [DEBUG] Questões encontradas:", questions?.length || 0)
    if (questions && questions.length > 0) {
      console.log("✅ [DEBUG] Primeira questão:", questions[0])
    }

    // Verificar quizzes por tópico
    const { data: quizzesByTopic, error: topicError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('topic_id', 'acentuacao-grafica')
      .limit(5)

    if (topicError) {
      console.error("❌ [DEBUG] Erro ao buscar quizzes por tópico:", topicError)
      return
    }

    console.log("✅ [DEBUG] Quizzes no tópico 'acentuacao-grafica':", quizzesByTopic?.length || 0)

  } catch (error) {
    console.error("❌ [DEBUG] Erro inesperado:", error)
  }
}

checkQuizzesDB() 