require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando estrutura da tabela flashcards...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcardsStructure() {
  console.log("🔍 Testando estrutura da tabela flashcards...")
  
  try {
    // 1. Verificar estrutura da tabela flashcards
    console.log("📋 Verificando estrutura da tabela flashcards...")
    const { data: flashcardsStructure, error: structureError } = await supabase
      .from("flashcards")
      .select("*")
      .limit(1)
    
    if (structureError) {
      console.error("❌ Erro ao verificar estrutura:", structureError)
      return
    }
    
    console.log("✅ Estrutura da tabela flashcards:")
    if (flashcardsStructure && flashcardsStructure.length > 0) {
      const sample = flashcardsStructure[0]
      console.log("📊 Campos disponíveis:")
      Object.keys(sample).forEach(key => {
        console.log(`  - ${key}: ${typeof sample[key]} (${sample[key]})`)
      })
    }
    
    // 2. Verificar estrutura da tabela topics
    console.log("\n📋 Verificando estrutura da tabela topics...")
    const { data: topicsStructure, error: topicsStructureError } = await supabase
      .from("topics")
      .select("*")
      .limit(1)
    
    if (topicsStructureError) {
      console.error("❌ Erro ao verificar estrutura de topics:", topicsStructureError)
      return
    }
    
    console.log("✅ Estrutura da tabela topics:")
    if (topicsStructure && topicsStructure.length > 0) {
      const sample = topicsStructure[0]
      console.log("📊 Campos disponíveis:")
      Object.keys(sample).forEach(key => {
        console.log(`  - ${key}: ${typeof sample[key]} (${sample[key]})`)
      })
    }
    
    // 3. Verificar se há flashcards com topic_id que não existem em topics
    console.log("\n🔍 Verificando integridade referencial...")
    const { data: allFlashcards, error: allFlashcardsError } = await supabase
      .from("flashcards")
      .select("id, topic_id")
      .limit(10)
    
    if (allFlashcardsError) {
      console.error("❌ Erro ao buscar flashcards:", allFlashcardsError)
      return
    }
    
    console.log("📚 Flashcards encontrados:")
    allFlashcards.forEach((card, index) => {
      console.log(`  ${index + 1}. ID: ${card.id}, Topic: ${card.topic_id} (tipo: ${typeof card.topic_id})`)
    })
    
    // 4. Verificar se os topic_ids existem em topics
    console.log("\n🔍 Verificando se topic_ids existem em topics...")
    const { data: allTopics, error: allTopicsError } = await supabase
      .from("topics")
      .select("id")
      .limit(10)
    
    if (allTopicsError) {
      console.error("❌ Erro ao buscar topics:", allTopicsError)
      return
    }
    
    console.log("📋 Topics encontrados:")
    allTopics.forEach((topic, index) => {
      console.log(`  ${index + 1}. ID: ${topic.id} (tipo: ${typeof topic.id})`)
    })
    
    // 5. Testar query com JOIN para verificar compatibilidade
    console.log("\n🔍 Testando query com JOIN...")
    const { data: joinTest, error: joinError } = await supabase
      .from("flashcards")
      .select(`
        id,
        topic_id,
        question,
        topics!inner(id, name)
      `)
      .limit(5)
    
    if (joinError) {
      console.error("❌ Erro no JOIN:", joinError)
      console.log("💡 Isso pode indicar problema de tipos entre topic_id e topics.id")
    } else {
      console.log("✅ JOIN funcionando corretamente:")
      joinTest.forEach((item, index) => {
        console.log(`  ${index + 1}. Flashcard ID: ${item.id}, Topic: ${item.topic_id}, Topic Name: ${item.topics?.name}`)
      })
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testFlashcardsStructure() 