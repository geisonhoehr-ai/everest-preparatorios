// Verificar estrutura real da tabela quiz_questions
const { createClient } = require('@supabase/supabase-js')

// Usar configurações do projeto
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkQuizQuestionsStructure() {
  console.log('🔍 Verificando estrutura real da tabela quiz_questions...\n')

  try {
    // Buscar uma questão para ver a estrutura real
    console.log('📋 Buscando estrutura da tabela:')
    const { data: questions, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .limit(1)

    if (error) {
      console.error('❌ Erro ao buscar questões:', error.message)
    } else {
      console.log(`✅ Questões encontradas: ${questions?.length || 0}`)
      if (questions && questions.length > 0) {
        console.log('📋 Estrutura real da tabela:')
        console.log('Colunas:', Object.keys(questions[0]))
        console.log('Exemplo de dados:', questions[0])
      }
    }

    // Tentar buscar sem especificar colunas
    console.log('\n🌐 Buscando todas as colunas:')
    const { data: allQuestions, error: allError } = await supabase
      .from("quiz_questions")
      .select("*")
      .limit(3)

    if (allError) {
      console.error('❌ Erro ao buscar todas as questões:', allError.message)
    } else {
      console.log(`✅ Total de questões: ${allQuestions?.length || 0}`)
      if (allQuestions && allQuestions.length > 0) {
        console.log('📋 Primeiras questões:')
        allQuestions.forEach((q, i) => {
          console.log(`\nQuestão ${i + 1}:`)
          console.log('Colunas:', Object.keys(q))
          console.log('Dados:', q)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

checkQuizQuestionsStructure()
