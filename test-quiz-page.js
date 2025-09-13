// Testar se a página de Quiz está funcionando corretamente
const { createClient } = require('@supabase/supabase-js')

// Usar Service Role Key para testar
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testQuizPage() {
  console.log('🔍 Testando funcionalidade da página de Quiz...\n')

  try {
    // 1. Testar busca de subjects
    console.log('📚 1. Testando busca de subjects:')
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("*")
    
    if (subjectsError) {
      console.error('❌ Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log(`✅ Subjects encontrados: ${subjects?.length || 0}`)
      if (subjects && subjects.length > 0) {
        console.log('📋 Subjects:', subjects.map(s => s.name))
      }
    }

    // 2. Testar busca de topics
    console.log('\n📖 2. Testando busca de topics:')
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .limit(5)
    
    if (topicsError) {
      console.error('❌ Erro ao buscar topics:', topicsError.message)
    } else {
      console.log(`✅ Topics encontrados: ${topics?.length || 0}`)
      if (topics && topics.length > 0) {
        console.log('📋 Primeiros topics:', topics.map(t => `${t.name} (${t.id})`))
      }
    }

    // 3. Testar busca de quizzes
    console.log('\n🎯 3. Testando busca de quizzes:')
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
      .limit(5)
    
    if (quizzesError) {
      console.error('❌ Erro ao buscar quizzes:', quizzesError.message)
    } else {
      console.log(`✅ Quizzes encontrados: ${quizzes?.length || 0}`)
      if (quizzes && quizzes.length > 0) {
        console.log('📋 Primeiros quizzes:', quizzes.map(q => `${q.title} (ID: ${q.id})`))
      }
    }

    // 4. Testar busca de questões por quiz_id
    console.log('\n❓ 4. Testando busca de questões por quiz_id:')
    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", 1)
      .limit(3)
    
    if (questionsError) {
      console.error('❌ Erro ao buscar questões:', questionsError.message)
    } else {
      console.log(`✅ Questões do quiz 1: ${questions?.length || 0}`)
      if (questions && questions.length > 0) {
        console.log('📋 Primeira questão:')
        console.log('  Pergunta:', questions[0].question_text?.substring(0, 50) + '...')
        console.log('  Opções:', questions[0].options)
        console.log('  Resposta correta:', questions[0].correct_answer)
      }
    }

    // 5. Testar fluxo completo (simular o que a página faz)
    console.log('\n🔄 5. Testando fluxo completo da página:')
    
    // Buscar um subject
    const { data: testSubject } = await supabase
      .from("subjects")
      .select("*")
      .limit(1)
      .single()
    
    if (testSubject) {
      console.log(`✅ Subject selecionado: ${testSubject.name}`)
      
      // Buscar topics deste subject
      const { data: testTopics } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", testSubject.id)
        .limit(1)
      
      if (testTopics && testTopics.length > 0) {
        const testTopic = testTopics[0]
        console.log(`✅ Topic selecionado: ${testTopic.name}`)
        
        // Buscar quizzes deste topic
        const { data: testQuizzes } = await supabase
          .from("quizzes")
          .select("*")
          .eq("topic_id", testTopic.id)
          .limit(1)
        
        if (testQuizzes && testQuizzes.length > 0) {
          const testQuiz = testQuizzes[0]
          console.log(`✅ Quiz selecionado: ${testQuiz.title}`)
          
          // Buscar questões deste quiz
          const { data: testQuestions } = await supabase
            .from("quiz_questions")
            .select("*")
            .eq("quiz_id", testQuiz.id)
            .limit(3)
          
          if (testQuestions && testQuestions.length > 0) {
            console.log(`✅ Questões encontradas: ${testQuestions.length}`)
            console.log('📋 Fluxo completo funcionando!')
          } else {
            console.log('⚠️ Nenhuma questão encontrada para este quiz')
          }
        } else {
          console.log('⚠️ Nenhum quiz encontrado para este topic')
        }
      } else {
        console.log('⚠️ Nenhum topic encontrado para este subject')
      }
    } else {
      console.log('⚠️ Nenhum subject encontrado')
    }

    console.log('\n🎯 Teste concluído!')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testQuizPage()
