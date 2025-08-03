require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando getAllFlashcardsByTopic...")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simular a função getAllFlashcardsByTopic
async function getAllFlashcardsByTopic(userUuid, topicId, page = 1, limit = 20) {
  console.log(`📚 [Server Action] Buscando flashcards do tópico: ${topicId} para usuário: ${userUuid}`)

  // Verificar se o usuário tem acesso (simulado)
  console.log("🔐 Verificando acesso...")
  
  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, topic_id, question, answer")
    .eq("topic_id", topicId)
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("❌ [Server Action] Erro ao buscar flashcards:", error)
    return { success: false, error: error.message }
  }

  console.log(`✅ [Server Action] Flashcards encontrados: ${data?.length}`)
  return { 
    success: true, 
    data: { 
      flashcards: data || [],
      page,
      limit,
      total: data?.length || 0,
      hasMore: data && data.length === limit
    }
  }
}

async function testGetAllFlashcardsByTopic() {
  console.log("🔍 Testando getAllFlashcardsByTopic...")
  
  try {
    // Testar com um tópico que sabemos que tem flashcards
    const topicId = "fonetica-fonologia"
    const userUuid = "test-user"
    
    console.log(`📋 Testando tópico: ${topicId}`)
    
    const result = await getAllFlashcardsByTopic(userUuid, topicId, 1, 5)
    
    console.log("📊 Resultado:")
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log(`✅ Sucesso! ${result.data.flashcards.length} flashcards encontrados`)
      result.data.flashcards.forEach((card, index) => {
        console.log(`  ${index + 1}. ID: ${card.id} - ${card.question.substring(0, 50)}...`)
      })
    } else {
      console.log(`❌ Erro: ${result.error}`)
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  }
}

// Executar o teste
testGetAllFlashcardsByTopic() 