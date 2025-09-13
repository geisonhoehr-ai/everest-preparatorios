// Verificar dados nas tabelas de quiz existentes
const { createClient } = require('@supabase/supabase-js')

// Usar configurações hardcoded do projeto
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkQuizTables() {
  console.log('🔍 Verificando dados nas tabelas de quiz...\n')

  try {
    // Verificar subjects
    console.log('📚 Verificando tabela SUBJECTS:')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
    
    if (subjectsError) {
      console.error('❌ Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log(`✅ Subjects encontrados: ${subjects?.length || 0}`)
      if (subjects && subjects.length > 0) {
        console.log('📋 Primeiros subjects:', subjects.slice(0, 3))
      }
    }

    // Verificar topics
    console.log('\n📖 Verificando tabela TOPICS:')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
    
    if (topicsError) {
      console.error('❌ Erro ao buscar topics:', topicsError.message)
    } else {
      console.log(`✅ Topics encontrados: ${topics?.length || 0}`)
      if (topics && topics.length > 0) {
        console.log('📋 Primeiros topics:', topics.slice(0, 3))
      }
    }

    // Verificar quizzes
    console.log('\n🎯 Verificando tabela QUIZZES:')
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
    
    if (quizzesError) {
      console.error('❌ Erro ao buscar quizzes:', quizzesError.message)
    } else {
      console.log(`✅ Quizzes encontrados: ${quizzes?.length || 0}`)
      if (quizzes && quizzes.length > 0) {
        console.log('📋 Primeiros quizzes:', quizzes.slice(0, 3))
      }
    }

    // Verificar quiz_questions
    console.log('\n❓ Verificando tabela QUIZ_QUESTIONS:')
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
    
    if (questionsError) {
      console.error('❌ Erro ao buscar quiz_questions:', questionsError.message)
    } else {
      console.log(`✅ Questões encontradas: ${questions?.length || 0}`)
      if (questions && questions.length > 0) {
        console.log('📋 Primeiras questões:', questions.slice(0, 3))
      }
    }

    // Verificar estrutura das tabelas
    console.log('\n🔧 Verificando estrutura das tabelas:')
    
    // Verificar colunas de subjects
    const { data: subjectsStructure } = await supabase
      .from('subjects')
      .select('*')
      .limit(1)
    
    if (subjectsStructure && subjectsStructure.length > 0) {
      console.log('📋 Colunas de subjects:', Object.keys(subjectsStructure[0]))
    }

    // Verificar colunas de topics
    const { data: topicsStructure } = await supabase
      .from('topics')
      .select('*')
      .limit(1)
    
    if (topicsStructure && topicsStructure.length > 0) {
      console.log('📋 Colunas de topics:', Object.keys(topicsStructure[0]))
    }

    // Verificar colunas de quiz_questions
    const { data: questionsStructure } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(1)
    
    if (questionsStructure && questionsStructure.length > 0) {
      console.log('📋 Colunas de quiz_questions:', Object.keys(questionsStructure[0]))
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

checkQuizTables()
