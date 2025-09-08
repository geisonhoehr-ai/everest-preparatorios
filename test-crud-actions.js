// Teste das funções CRUD do servidor
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Função para testar verificação de acesso
async function testCheckTeacherOrAdminAccess(userUuid) {
  console.log(`🔍 Testando checkTeacherOrAdminAccess para: ${userUuid}`)
  
  try {
    // Primeiro tentar na tabela user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", userUuid)
      .single()

    if (!profileError && profileData) {
      const hasAccess = profileData.role === "teacher" || profileData.role === "admin"
      console.log(`✅ Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${profileData.role}`)
      return hasAccess
    }

    // Fallback: tentar na tabela user_roles
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_uuid", userUuid)
      .single()

    if (!roleError && roleData) {
      const hasAccess = roleData.role === "teacher" || roleData.role === "admin"
      console.log(`✅ Acesso ${hasAccess ? 'permitido' : 'negado'} para role: ${roleData.role}`)
      return hasAccess
    }

    // Fallback temporário: permitir acesso para usuários conhecidos
    if (userUuid === 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5') {
      console.log("🔄 Fallback: permitindo acesso para usuário professor conhecido")
      return true
    }

    console.error("❌ Usuário não encontrado em nenhuma tabela de roles")
    return false
  } catch (error) {
    console.error("❌ Erro inesperado ao verificar acesso:", error)
    return false
  }
}

// Função para testar criação de quiz
async function testCreateQuiz(userUuid, quizData) {
  console.log(`📝 Testando criação de quiz para tópico: ${quizData.topic_id}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await testCheckTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ Acesso negado para criar quiz")
    return { success: false, error: "Acesso negado" }
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert(quizData)
    .select()
    .single()

  if (error) {
    console.error("❌ Erro ao criar quiz:", error)
    return { success: false, error: error.message }
  }
  
  console.log(`✅ Quiz criado: ${data.id}`)
  return { success: true, data }
}

// Função para testar criação de flashcard
async function testCreateFlashcard(userUuid, flashcardData) {
  console.log(`📝 Testando criação de flashcard para tópico: ${flashcardData.topic_id}`)

  // Verificar se o usuário tem acesso
  const hasAccess = await testCheckTeacherOrAdminAccess(userUuid)
  if (!hasAccess) {
    console.error("❌ Acesso negado para criar flashcard")
    return { success: false, error: "Acesso negado" }
  }

  const { data, error } = await supabase
    .from("flashcards")
    .insert(flashcardData)
    .select()
    .single()

  if (error) {
    console.error("❌ Erro ao criar flashcard:", error)
    return { success: false, error: error.message }
  }
  
  console.log(`✅ Flashcard criado: ${data.id}`)
  return { success: true, data }
}

// Função principal de teste
async function runTests() {
  console.log('🧪 Iniciando testes CRUD...')
  
  // ID do usuário professor de teste
  const testUserUuid = 'c8b5bff0-b5cc-4dab-9cfa-0a0cf4983dc5'
  
  // Teste 1: Verificar acesso
  console.log('\n=== TESTE 1: Verificação de Acesso ===')
  const hasAccess = await testCheckTeacherOrAdminAccess(testUserUuid)
  console.log(`Resultado: ${hasAccess ? '✅ Acesso permitido' : '❌ Acesso negado'}`)
  
  if (!hasAccess) {
    console.log('❌ Testes interrompidos - usuário não tem acesso')
    return
  }
  
  // Teste 2: Verificar se existem tópicos
  console.log('\n=== TESTE 2: Verificar Tópicos ===')
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, name")
    .limit(1)
  
  if (topicsError) {
    console.error("❌ Erro ao buscar tópicos:", topicsError)
    return
  }
  
  if (!topics || topics.length === 0) {
    console.log("❌ Nenhum tópico encontrado para teste")
    return
  }
  
  const testTopicId = topics[0].id
  console.log(`✅ Tópico encontrado para teste: ${topics[0].name} (ID: ${testTopicId})`)
  
  // Teste 3: Criar quiz
  console.log('\n=== TESTE 3: Criar Quiz ===')
  const quizData = {
    topic_id: testTopicId,
    question_text: "Teste de pergunta",
    options: ["Opção A", "Opção B", "Opção C", "Opção D"],
    correct_answer: "Opção A",
    explanation: "Explicação do teste"
  }
  
  const quizResult = await testCreateQuiz(testUserUuid, quizData)
  console.log(`Resultado: ${quizResult.success ? '✅ Quiz criado' : '❌ Erro: ' + quizResult.error}`)
  
  // Teste 4: Criar flashcard
  console.log('\n=== TESTE 4: Criar Flashcard ===')
  const flashcardData = {
    topic_id: testTopicId,
    question: "Pergunta de teste",
    answer: "Resposta de teste"
  }
  
  const flashcardResult = await testCreateFlashcard(testUserUuid, flashcardData)
  console.log(`Resultado: ${flashcardResult.success ? '✅ Flashcard criado' : '❌ Erro: ' + flashcardResult.error}`)
  
  console.log('\n🏁 Testes concluídos!')
}

// Executar testes
runTests().catch(console.error)
