// Corrigir RLS e inserir usuário
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRLSAndUser() {
  console.log('🔧 Corrigindo RLS e inserindo usuário...')
  
  const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
  
  // 1. Verificar se o usuário já existe
  console.log('\n=== VERIFICANDO USUÁRIO ===')
  const { data: existingUser, error: checkError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", testUserUuid)
  
  console.log('Usuário existente:', existingUser)
  
  if (existingUser && existingUser.length > 0) {
    console.log('✅ Usuário já existe!')
    return
  }
  
  // 2. Tentar inserir o usuário (pode falhar por RLS)
  console.log('\n=== TENTANDO INSERIR USUÁRIO ===')
  const { data: insertData, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      user_id: testUserUuid,
      role: 'teacher',
      display_name: 'Professor Teste',
      created_at: new Date().toISOString()
    })
    .select()
  
  console.log('Dados inseridos:', insertData)
  console.log('Erro na inserção:', insertError)
  
  // 3. Testar acesso às tabelas principais
  console.log('\n=== TESTANDO ACESSO ÀS TABELAS ===')
  
  // Testar subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("*")
    .limit(1)
  
  console.log('Subjects:', subjects ? '✅ Acessível' : '❌ Bloqueado', subjectsError?.message)
  
  // Testar topics
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .limit(1)
  
  console.log('Topics:', topics ? '✅ Acessível' : '❌ Bloqueado', topicsError?.message)
  
  // Testar flashcards
  const { data: flashcards, error: flashcardsError } = await supabase
    .from("flashcards")
    .select("*")
    .limit(1)
  
  console.log('Flashcards:', flashcards ? '✅ Acessível' : '❌ Bloqueado', flashcardsError?.message)
  
  // Testar quizzes
  const { data: quizzes, error: quizzesError } = await supabase
    .from("quizzes")
    .select("*")
    .limit(1)
  
  console.log('Quizzes:', quizzes ? '✅ Acessível' : '❌ Bloqueado', quizzesError?.message)
  
  // 4. Se o usuário foi inserido, testar CRUD
  if (insertData && insertData.length > 0) {
    console.log('\n=== TESTANDO CRUD ===')
    
    // Testar criação de flashcard
    if (topics && topics.length > 0) {
      const testTopicId = topics[0].id
      console.log(`Testando criação de flashcard para tópico: ${testTopicId}`)
      
      const { data: flashcardData, error: flashcardError } = await supabase
        .from("flashcards")
        .insert({
          topic_id: testTopicId,
          question: "Pergunta de teste",
          answer: "Resposta de teste"
        })
        .select()
      
      console.log('Flashcard criado:', flashcardData ? '✅ Sucesso' : '❌ Falhou', flashcardError?.message)
    }
  }
}

fixRLSAndUser().catch(console.error)
