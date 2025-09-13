// Testar a correção da página de Quiz
const { createClient } = require('@supabase/supabase-js')

// Usar Service Role Key para testar
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testQuizFix() {
  console.log('🔍 Testando correção da página de Quiz...\n')

  try {
    // 1. Simular o fluxo da página: buscar tópicos
    console.log('📚 1. Buscando tópicos disponíveis:')
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .limit(5)
    
    if (topicsError) {
      console.error('❌ Erro ao buscar tópicos:', topicsError.message)
      return
    }
    
    console.log(`✅ Tópicos encontrados: ${topics?.length || 0}`)
    if (topics && topics.length > 0) {
      console.log('📋 Primeiros tópicos:')
      topics.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} (ID: ${t.id})`)
      })
    }

    // 2. Para cada tópico, simular o que a função startQuiz faria
    console.log('\n🎯 2. Simulando função startQuiz para cada tópico:')
    
    for (const topic of topics || []) {
      console.log(`\n🔍 Processando tópico: ${topic.name} (${topic.id})`)
      
      // Simular loadQuizzesForTopic
      console.log('  📚 Buscando quizzes para este tópico...')
      const { data: quizzes, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("topic_id", topic.id)
        .order("id")
      
      if (quizzesError) {
        console.error(`  ❌ Erro ao buscar quizzes:`, quizzesError.message)
        continue
      }
      
      console.log(`  ✅ Quizzes encontrados: ${quizzes?.length || 0}`)
      
      if (!quizzes || quizzes.length === 0) {
        console.log('  ⚠️ Nenhum quiz encontrado - tela preta seria mostrada')
        continue
      }
      
      // Simular busca do primeiro quiz com questões
      console.log('  🔍 Procurando quiz com questões...')
      let selectedQuiz = null
      
      for (const quiz of quizzes) {
        const { data: questions, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
          .limit(1)
        
        if (questionsError) {
          console.error(`    ❌ Erro ao verificar questões do quiz ${quiz.id}:`, questionsError.message)
          continue
        }
        
        if (questions && questions.length > 0) {
          selectedQuiz = quiz
          console.log(`    ✅ Quiz selecionado: ${quiz.title} (ID: ${quiz.id}) com questões`)
          break
        } else {
          console.log(`    ⚠️ Quiz ${quiz.id} não tem questões`)
        }
      }
      
      if (selectedQuiz) {
        console.log(`  🎉 Tópico ${topic.name} funcionará corretamente!`)
        
        // Verificar quantas questões tem
        const { data: allQuestions } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", selectedQuiz.id)
        
        console.log(`  📊 Total de questões: ${allQuestions?.length || 0}`)
      } else {
        console.log(`  ❌ Tópico ${topic.name} causaria tela preta (nenhum quiz com questões)`)
      }
    }

    // 3. Resumo dos tópicos que funcionam vs que causam tela preta
    console.log('\n📊 3. Resumo dos resultados:')
    
    let workingTopics = 0
    let brokenTopics = 0
    
    for (const topic of topics || []) {
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("*")
        .eq("topic_id", topic.id)
      
      if (!quizzes || quizzes.length === 0) {
        brokenTopics++
        continue
      }
      
      let hasQuestions = false
      for (const quiz of quizzes) {
        const { data: questions } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
          .limit(1)
        
        if (questions && questions.length > 0) {
          hasQuestions = true
          break
        }
      }
      
      if (hasQuestions) {
        workingTopics++
      } else {
        brokenTopics++
      }
    }
    
    console.log(`✅ Tópicos que funcionam: ${workingTopics}`)
    console.log(`❌ Tópicos que causam tela preta: ${brokenTopics}`)
    console.log(`📊 Taxa de sucesso: ${((workingTopics / (workingTopics + brokenTopics)) * 100).toFixed(1)}%`)

    console.log('\n🎯 Teste concluído!')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testQuizFix()
