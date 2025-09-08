// Testar CRUD com a chave de service role correta
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCRUDWithServiceRole() {
  console.log('🔧 Testando CRUD com service role key...')
  
  const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
  
  // 1. Verificar acesso às tabelas
  console.log('\n=== VERIFICANDO ACESSO ÀS TABELAS ===')
  
  const tables = ['subjects', 'topics', 'flashcards', 'quizzes', 'user_profiles']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Acessível (${data?.length || 0} registros)`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }
  
  // 2. Inserir usuário professor
  console.log('\n=== INSERINDO USUÁRIO PROFESSOR ===')
  
  const { data: insertData, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      user_id: testUserUuid,
      role: 'teacher',
      display_name: 'Professor Teste',
      created_at: new Date().toISOString()
    })
    .select()
  
  console.log('Usuário inserido:', insertData ? '✅ Sucesso' : '❌ Falhou', insertError?.message)
  
  if (insertData) {
    console.log('Dados do usuário:', insertData[0])
  }
  
  // 3. Testar CRUD de flashcards
  console.log('\n=== TESTANDO CRUD DE FLASHCARDS ===')
  
  // Buscar um tópico para testar
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, name")
    .limit(1)
  
  if (topicsError) {
    console.log('❌ Erro ao buscar tópicos:', topicsError.message)
    return
  }
  
  if (!topics || topics.length === 0) {
    console.log('❌ Nenhum tópico encontrado')
    return
  }
  
  const testTopicId = topics[0].id
  console.log(`✅ Tópico encontrado: ${topics[0].name} (ID: ${testTopicId})`)
  
  // Criar flashcard
  const { data: flashcardData, error: flashcardError } = await supabase
    .from("flashcards")
    .insert({
      topic_id: testTopicId,
      question: "Pergunta de teste CRUD",
      answer: "Resposta de teste CRUD"
    })
    .select()
  
  console.log('Flashcard criado:', flashcardData ? '✅ Sucesso' : '❌ Falhou', flashcardError?.message)
  
  if (flashcardData) {
    const flashcardId = flashcardData[0].id
    console.log('ID do flashcard criado:', flashcardId)
    
    // Atualizar flashcard
    const { data: updateData, error: updateError } = await supabase
      .from("flashcards")
      .update({
        question: "Pergunta atualizada",
        answer: "Resposta atualizada"
      })
      .eq("id", flashcardId)
      .select()
    
    console.log('Flashcard atualizado:', updateData ? '✅ Sucesso' : '❌ Falhou', updateError?.message)
    
    // Deletar flashcard
    const { error: deleteError } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", flashcardId)
    
    console.log('Flashcard deletado:', deleteError ? '❌ Falhou' : '✅ Sucesso', deleteError?.message)
  }
  
  // 4. Testar CRUD de quizzes
  console.log('\n=== TESTANDO CRUD DE QUIZZES ===')
  
  // Criar quiz
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      topic_id: testTopicId,
      title: "Quiz de Teste CRUD",
      description: "Descrição do quiz de teste"
    })
    .select()
  
  console.log('Quiz criado:', quizData ? '✅ Sucesso' : '❌ Falhou', quizError?.message)
  
  if (quizData) {
    const quizId = quizData[0].id
    console.log('ID do quiz criado:', quizId)
    
    // Atualizar quiz
    const { data: updateQuizData, error: updateQuizError } = await supabase
      .from("quizzes")
      .update({
        title: "Quiz Atualizado",
        description: "Descrição atualizada"
      })
      .eq("id", quizId)
      .select()
    
    console.log('Quiz atualizado:', updateQuizData ? '✅ Sucesso' : '❌ Falhou', updateQuizError?.message)
    
    // Deletar quiz
    const { error: deleteQuizError } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId)
    
    console.log('Quiz deletado:', deleteQuizError ? '❌ Falhou' : '✅ Sucesso', deleteQuizError?.message)
  }
  
  console.log('\n🏁 Teste CRUD concluído!')
}

testCRUDWithServiceRole().catch(console.error)
