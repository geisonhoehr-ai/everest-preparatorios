const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixQuizAndAuth() {
  try {
    console.log('🔧 [CORREÇÃO] Corrigindo problemas de quiz e autenticação...')
    
    // 1. Verificar se há subjects na tabela
    console.log('🔍 [CORREÇÃO] Verificando subjects...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
    
    if (subjectsError) {
      console.error('❌ [CORREÇÃO] Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log('✅ [CORREÇÃO] Subjects encontrados:', subjects?.length || 0)
      if (subjects && subjects.length > 0) {
        console.log('📋 [CORREÇÃO] Subjects:', subjects.map(s => ({ id: s.id, name: s.name })))
      }
    }
    
    // 2. Verificar se há topics na tabela
    console.log('🔍 [CORREÇÃO] Verificando topics...')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
    
    if (topicsError) {
      console.error('❌ [CORREÇÃO] Erro ao buscar topics:', topicsError.message)
    } else {
      console.log('✅ [CORREÇÃO] Topics encontrados:', topics?.length || 0)
      if (topics && topics.length > 0) {
        console.log('📋 [CORREÇÃO] Topics:', topics.map(t => ({ id: t.id, name: t.name, subject_id: t.subject_id })))
      }
    }
    
    // 3. Verificar se há quizzes na tabela
    console.log('🔍 [CORREÇÃO] Verificando quizzes...')
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
    
    if (quizzesError) {
      console.error('❌ [CORREÇÃO] Erro ao buscar quizzes:', quizzesError.message)
    } else {
      console.log('✅ [CORREÇÃO] Quizzes encontrados:', quizzes?.length || 0)
      if (quizzes && quizzes.length > 0) {
        console.log('📋 [CORREÇÃO] Quizzes:', quizzes.map(q => ({ id: q.id, title: q.title, topic_id: q.topic_id })))
      }
    }
    
    // 4. Verificar se há questões na tabela
    console.log('🔍 [CORREÇÃO] Verificando questões...')
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
    
    if (questionsError) {
      console.error('❌ [CORREÇÃO] Erro ao buscar questões:', questionsError.message)
    } else {
      console.log('✅ [CORREÇÃO] Questões encontradas:', questions?.length || 0)
    }
    
    // 5. Verificar se há dados de teste
    if (!subjects || subjects.length === 0) {
      console.log('🔄 [CORREÇÃO] Inserindo dados de teste...')
      
      // Inserir subjects de teste
      const { data: newSubjects, error: insertSubjectsError } = await supabase
        .from('subjects')
        .insert([
          { name: 'Português' },
          { name: 'Regulamentos' }
        ])
        .select()
      
      if (insertSubjectsError) {
        console.error('❌ [CORREÇÃO] Erro ao inserir subjects:', insertSubjectsError.message)
      } else {
        console.log('✅ [CORREÇÃO] Subjects inseridos:', newSubjects)
      }
    }
    
    // 6. Verificar se há topics de teste
    if (!topics || topics.length === 0) {
      console.log('🔄 [CORREÇÃO] Inserindo topics de teste...')
      
      // Buscar subjects primeiro
      const { data: currentSubjects } = await supabase
        .from('subjects')
        .select('id, name')
      
      if (currentSubjects && currentSubjects.length > 0) {
        const portuguesId = currentSubjects.find(s => s.name === 'Português')?.id
        const regulamentosId = currentSubjects.find(s => s.name === 'Regulamentos')?.id
        
        if (portuguesId) {
          const { data: newTopics, error: insertTopicsError } = await supabase
            .from('topics')
            .insert([
              { name: 'Gramática', subject_id: portuguesId },
              { name: 'Literatura', subject_id: portuguesId },
              { name: 'Redação', subject_id: portuguesId }
            ])
            .select()
          
          if (insertTopicsError) {
            console.error('❌ [CORREÇÃO] Erro ao inserir topics:', insertTopicsError.message)
          } else {
            console.log('✅ [CORREÇÃO] Topics inseridos:', newTopics)
          }
        }
        
        if (regulamentosId) {
          const { data: newTopics, error: insertTopicsError } = await supabase
            .from('topics')
            .insert([
              { name: 'Regulamentos Militares', subject_id: regulamentosId },
              { name: 'Legislação', subject_id: regulamentosId }
            ])
            .select()
          
          if (insertTopicsError) {
            console.error('❌ [CORREÇÃO] Erro ao inserir topics:', insertTopicsError.message)
          } else {
            console.log('✅ [CORREÇÃO] Topics inseridos:', newTopics)
          }
        }
      }
    }
    
    // 7. Verificar se há quizzes de teste
    if (!quizzes || quizzes.length === 0) {
      console.log('🔄 [CORREÇÃO] Inserindo quizzes de teste...')
      
      // Buscar topics primeiro
      const { data: currentTopics } = await supabase
        .from('topics')
        .select('id, name, subject_id')
      
      if (currentTopics && currentTopics.length > 0) {
        const gramaticaTopic = currentTopics.find(t => t.name === 'Gramática')
        
        if (gramaticaTopic) {
          const { data: newQuiz, error: insertQuizError } = await supabase
            .from('quizzes')
            .insert({
              title: 'Quiz de Gramática Básica',
              description: 'Teste seus conhecimentos em gramática portuguesa',
              topic_id: gramaticaTopic.id
            })
            .select()
          
          if (insertQuizError) {
            console.error('❌ [CORREÇÃO] Erro ao inserir quiz:', insertQuizError.message)
          } else {
            console.log('✅ [CORREÇÃO] Quiz inserido:', newQuiz)
            
            // Inserir questão de teste
            if (newQuiz && newQuiz[0]) {
              const { data: newQuestion, error: insertQuestionError } = await supabase
                .from('quiz_questions')
                .insert({
                  quiz_id: newQuiz[0].id,
                  question_text: 'Qual é a classe gramatical da palavra "rapidamente"?',
                  options: ['Substantivo', 'Adjetivo', 'Advérbio', 'Verbo'],
                  correct_answer: 'Advérbio',
                  explanation: 'Rapidamente é um advérbio de modo, pois modifica o verbo.'
                })
                .select()
              
              if (insertQuestionError) {
                console.error('❌ [CORREÇÃO] Erro ao inserir questão:', insertQuestionError.message)
              } else {
                console.log('✅ [CORREÇÃO] Questão inserida:', newQuestion)
              }
            }
          }
        }
      }
    }
    
    console.log('🎯 [CORREÇÃO] Verificação final...')
    
    // Verificação final
    const { data: finalSubjects } = await supabase.from('subjects').select('*')
    const { data: finalTopics } = await supabase.from('topics').select('*')
    const { data: finalQuizzes } = await supabase.from('quizzes').select('*')
    const { data: finalQuestions } = await supabase.from('quiz_questions').select('*')
    
    console.log('📊 [CORREÇÃO] RESUMO FINAL:')
    console.log(`   - Subjects: ${finalSubjects?.length || 0}`)
    console.log(`   - Topics: ${finalTopics?.length || 0}`)
    console.log(`   - Quizzes: ${finalQuizzes?.length || 0}`)
    console.log(`   - Questões: ${finalQuestions?.length || 0}`)
    
    if ((finalSubjects?.length || 0) > 0 && (finalTopics?.length || 0) > 0) {
      console.log('🎉 [CORREÇÃO] SUCESSO! Dados de quiz configurados')
      console.log('💡 [SOLUÇÃO] Agora teste a página de quiz no navegador')
    } else {
      console.log('❌ [CORREÇÃO] PROBLEMA! Dados insuficientes para quiz')
    }
    
  } catch (error) {
    console.error('❌ [CORREÇÃO] Erro geral:', error)
  }
}

fixQuizAndAuth()
