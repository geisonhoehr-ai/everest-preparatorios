require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando flashcards por tópico...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função getFlashcardsForReview
async function getFlashcardsForReview(topicId, limit = 10) {
  console.log(`📚 [Server Action] Buscando flashcards para revisão do tópico: ${topicId}, limite: ${limit}`)

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer, created_at")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
    return []
  }

  console.log(`✅ [Server Action] Flashcards encontrados: ${data?.length}`)
  console.log(`📋 [Server Action] IDs dos flashcards:`, data?.map(f => f.id))
  return data || []
}

async function testFlashcardsByTopic() {
  console.log("🔍 Testando flashcards por tópico...")
  
  try {
    // 1. Verificar todos os tópicos
    console.log("📋 Verificando tópicos...")
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("id, name, subject_id")
      .order("name")
    
    if (topicsError) {
      console.error("❌ Erro ao buscar tópicos:", topicsError)
      return
    }
    
    console.log("📊 Tópicos encontrados:")
    topics.forEach(topic => {
      console.log(`  - ID: ${topic.id}, Nome: ${topic.name}, Subject: ${topic.subject_id}`)
    })
    
    // 2. Verificar flashcards por tópico
    console.log("\n📚 Verificando flashcards por tópico...")
    for (const topic of topics) {
      console.log(`\n🔍 Tópico: ${topic.name} (ID: ${topic.id})`)
      
      const flashcards = await getFlashcardsForReview(topic.id, 5)
      
      if (flashcards && flashcards.length > 0) {
        console.log(`✅ ${flashcards.length} flashcards encontrados`)
        flashcards.forEach((card, index) => {
          console.log(`  ${index + 1}. ID: ${card.id} - ${card.question.substring(0, 50)}...`)
        })
      } else {
        console.log("❌ Nenhum flashcard encontrado")
      }
    }
    
    // 3. Verificar total de flashcards na tabela
    console.log("\n📊 Verificando total de flashcards...")
    const { data: allFlashcards, error: allError } = await supabase
      .from("flashcards")
      .select("id, topic_id, question")
      .limit(10)
    
    if (allError) {
      console.error("❌ Erro ao buscar todos os flashcards:", allError)
      return
    }
    
    console.log(`📚 Total de flashcards na tabela: ${allFlashcards?.length || 0}`)
    if (allFlashcards && allFlashcards.length > 0) {
      console.log("📋 Primeiros flashcards:")
      allFlashcards.forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id}, Topic: ${card.topic_id} - ${card.question.substring(0, 50)}...`)
      })
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testFlashcardsByTopic() 