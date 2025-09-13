// Testar carregamento de questões de quiz para identificar o problema
const { createClient } = require('@supabase/supabase-js')

// Usar Service Role Key para testar
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testQuizQuestionsLoading() {
  console.log('🔍 Testando carregamento de questões de quiz...\n')

  try {
    // 1. Verificar todos os quizzes disponíveis
    console.log('📚 1. Verificando quizzes disponíveis:')
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
    
    if (quizzesError) {
      console.error('❌ Erro ao buscar quizzes:', quizzesError.message)
    } else {
      console.log(`✅ Quizzes encontrados: ${quizzes?.length || 0}`)
      if (quizzes && quizzes.length > 0) {
        console.log('📋 Quizzes disponíveis:')
        quizzes.forEach((q, i) => {
          console.log(`  ${i + 1}. ${q.title} (ID: ${q.id}, Topic: ${q.topic_id})`)
        })
      }
    }

    // 2. Verificar questões para cada quiz
    console.log('\n📖 2. Verificando questões para cada quiz:')
    if (quizzes && quizzes.length > 0) {
      for (const quiz of quizzes) {
        console.log(`\n🔍 Quiz: ${quiz.title} (ID: ${quiz.id})`)
        
        const { data: questions, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
        
        if (questionsError) {
          console.error(`❌ Erro ao buscar questões do quiz ${quiz.id}:`, questionsError.message)
        } else {
          console.log(`✅ Questões encontradas: ${questions?.length || 0}`)
          if (questions && questions.length > 0) {
            console.log('📋 Primeiras questões:')
            questions.slice(0, 2).forEach((q, i) => {
              console.log(`  ${i + 1}. ${q.question_text?.substring(0, 50)}...`)
              console.log(`     Opções: ${q.options?.length || 0}`)
              console.log(`     Resposta correta: ${q.correct_answer}`)
            })
          }
        }
      }
    }

    // 3. Testar a função getAllQuizzesByTopic simulando o que a página faz
    console.log('\n🎯 3. Testando getAllQuizzesByTopic para diferentes IDs:')
    
    // Testar com IDs de quizzes reais
    if (quizzes && quizzes.length > 0) {
      for (const quiz of quizzes.slice(0, 3)) { // Testar apenas os primeiros 3
        console.log(`\n🔍 Testando getAllQuizzesByTopic(${quiz.id}):`)
        
        const { data: result, error } = await supabase
          .from("quiz_questions")
          .select("id, quiz_id, question_text, options, correct_answer, explanation")
          .eq("quiz_id", quiz.id)
          .order("id")
        
        if (error) {
          console.error(`❌ Erro:`, error.message)
        } else {
          console.log(`✅ Resultado: ${result?.length || 0} questões`)
          if (result && result.length > 0) {
            console.log('📋 Primeira questão:')
            const first = result[0]
            console.log(`  ID: ${first.id}`)
            console.log(`  Quiz ID: ${first.quiz_id}`)
            console.log(`  Pergunta: ${first.question_text?.substring(0, 50)}...`)
            console.log(`  Opções: ${Array.isArray(first.options) ? first.options.length : 'N/A'}`)
            console.log(`  Resposta correta: ${first.correct_answer}`)
            console.log(`  Explicação: ${first.explanation?.substring(0, 30)}...`)
          }
        }
      }
    }

    // 4. Verificar se há algum problema com a estrutura dos dados
    console.log('\n🔧 4. Verificando estrutura dos dados:')
    const { data: sampleQuestion } = await supabase
      .from("quiz_questions")
      .select("*")
      .limit(1)
      .single()
    
    if (sampleQuestion) {
      console.log('📋 Estrutura de uma questão:')
      console.log('  Colunas:', Object.keys(sampleQuestion))
      console.log('  Tipos:')
      Object.entries(sampleQuestion).forEach(([key, value]) => {
        console.log(`    ${key}: ${typeof value} (${Array.isArray(value) ? 'array' : 'not array'})`)
      })
    }

    console.log('\n🎯 Teste concluído!')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testQuizQuestionsLoading()
