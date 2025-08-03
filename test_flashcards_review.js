require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando função getFlashcardsForReview...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getFlashcardsForReview(topicId, limit = 10) {
  console.log(`📚 [Test] Buscando flashcards para revisão do tópico: ${topicId}, limite: ${limit}`)

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .order("id", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("❌ [Test] Erro ao buscar flashcards:", error)
    return []
  }

  console.log(`✅ [Test] Flashcards encontrados: ${data?.length}`)
  return data || []
}

async function testFlashcardsReview() {
  try {
    // 1. Testar com um tópico que sabemos que tem flashcards
    console.log("🔍 Testando tópico 'fonetica-fonologia'...")
    const topicId = "fonetica-fonologia"
    
    const cards = await getFlashcardsForReview(topicId, 5)
    
    if (cards && cards.length > 0) {
      console.log("✅ Flashcards encontrados:")
      cards.forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id}`)
        console.log(`     Question: "${card.question}"`)
        console.log(`     Answer: "${card.answer}"`)
        console.log("")
      })
    } else {
      console.log("❌ Nenhum flashcard encontrado")
    }
    
    // 2. Testar com limite maior
    console.log("\n🔍 Testando com limite maior (20)...")
    const moreCards = await getFlashcardsForReview(topicId, 20)
    console.log(`✅ Encontrados ${moreCards.length} flashcards com limite 20`)
    
    // 3. Testar com outro tópico
    console.log("\n🔍 Testando tópico 'ortografia'...")
    const ortografiaCards = await getFlashcardsForReview("ortografia", 5)
    console.log(`✅ Encontrados ${ortografiaCards.length} flashcards em ortografia`)
    
    // 4. Testar com tópico que não existe
    console.log("\n🔍 Testando tópico inexistente...")
    const invalidCards = await getFlashcardsForReview("topico-inexistente", 5)
    console.log(`✅ Encontrados ${invalidCards.length} flashcards em tópico inexistente`)
    
    // 5. Verificar se os dados estão completos
    console.log("\n🔍 Verificando integridade dos dados...")
    const allCards = await getFlashcardsForReview(topicId, 10)
    
    if (allCards && allCards.length > 0) {
      console.log("✅ Verificando campos obrigatórios:")
      allCards.forEach((card, index) => {
        const hasId = card.id !== null && card.id !== undefined
        const hasTopicId = card.topic_id !== null && card.topic_id !== undefined && card.topic_id !== ""
        const hasQuestion = card.question !== null && card.question !== undefined && card.question !== ""
        const hasAnswer = card.answer !== null && card.answer !== undefined && card.answer !== ""
        
        console.log(`  ${index + 1}. ID: ${hasId ? "✅" : "❌"} (${card.id})`)
        console.log(`     Topic ID: ${hasTopicId ? "✅" : "❌"} (${card.topic_id})`)
        console.log(`     Question: ${hasQuestion ? "✅" : "❌"} (${card.question?.substring(0, 50)}...)`)
        console.log(`     Answer: ${hasAnswer ? "✅" : "❌"} (${card.answer?.substring(0, 50)}...)`)
        console.log("")
      })
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

testFlashcardsReview() 