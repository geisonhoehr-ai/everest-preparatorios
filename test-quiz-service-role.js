// Testar acesso à tabela quiz_questions com Service Role
const { createClient } = require('@supabase/supabase-js')

// Usar Service Role Key (tem permissões administrativas)
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testQuizWithServiceRole() {
  console.log('🔍 Testando acesso à quiz_questions com Service Role...\n')

  try {
    // Testar busca geral
    console.log('🌐 Buscando todas as questões:')
    const { data: allQuestions, error: allError } = await supabase
      .from("quiz_questions")
      .select("*")
      .limit(5)

    if (allError) {
      console.error('❌ Erro ao buscar questões:', allError.message)
    } else {
      console.log(`✅ Total de questões encontradas: ${allQuestions?.length || 0}`)
      if (allQuestions && allQuestions.length > 0) {
        console.log('📋 Estrutura da tabela:')
        console.log('Colunas:', Object.keys(allQuestions[0]))
        console.log('\n📋 Primeiras questões:')
        allQuestions.forEach((q, i) => {
          console.log(`\nQuestão ${i + 1}:`)
          console.log('ID:', q.id)
          console.log('Quiz ID:', q.quiz_id)
          console.log('Pergunta:', q.question_text?.substring(0, 50) + '...')
          console.log('Resposta correta:', q.correct_answer)
        })
      }
    }

    // Testar busca por quiz_id específico
    console.log('\n🎯 Testando busca por quiz_id = 1:')
    const { data: quiz1Questions, error: quiz1Error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", 1)
      .limit(3)

    if (quiz1Error) {
      console.error('❌ Erro ao buscar questões do quiz 1:', quiz1Error.message)
    } else {
      console.log(`✅ Questões do quiz 1: ${quiz1Questions?.length || 0}`)
      if (quiz1Questions && quiz1Questions.length > 0) {
        console.log('📋 Primeira questão do quiz 1:')
        console.log('Pergunta:', quiz1Questions[0].question_text)
        console.log('Opções:', quiz1Questions[0].options)
        console.log('Resposta:', quiz1Questions[0].correct_answer)
      }
    }

    // Verificar se há coluna topic_id
    console.log('\n🔍 Verificando se existe coluna topic_id:')
    const { data: testTopic, error: topicError } = await supabase
      .from("quiz_questions")
      .select("topic_id")
      .limit(1)

    if (topicError) {
      console.error('❌ Coluna topic_id não existe:', topicError.message)
    } else {
      console.log('✅ Coluna topic_id existe!')
    }

    // Contar total de questões
    console.log('\n📊 Contando total de questões:')
    const { count, error: countError } = await supabase
      .from("quiz_questions")
      .select("*", { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao contar questões:', countError.message)
    } else {
      console.log(`✅ Total de questões na tabela: ${count}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testQuizWithServiceRole()
