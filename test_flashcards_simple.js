// Script simples para testar flashcards
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://your-project.supabase.co' // Substitua pela sua URL
const supabaseKey = 'your-anon-key' // Substitua pela sua chave

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcards() {
  console.log('🔍 Testando busca de flashcards...')
  
  try {
    // 1. Verificar se há flashcards na tabela
    console.log('\n📊 Contando flashcards...')
    const { count, error: countError } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Erro ao contar flashcards:', countError)
      return
    }
    
    console.log(`✅ Total de flashcards: ${count}`)
    
    // 2. Buscar alguns flashcards
    console.log('\n📝 Buscando flashcards...')
    const { data: flashcards, error: flashError } = await supabase
      .from('flashcards')
      .select('id, topic_id, question, answer')
      .limit(5)
    
    if (flashError) {
      console.error('❌ Erro ao buscar flashcards:', flashError)
      return
    }
    
    console.log(`✅ Flashcards encontrados: ${flashcards.length}`)
    flashcards.forEach((card, index) => {
      console.log(`\n${index + 1}. Tópico: ${card.topic_id}`)
      console.log(`   Pergunta: ${card.question}`)
      console.log(`   Resposta: ${card.answer}`)
    })
    
    // 3. Testar busca por tópico específico
    console.log('\n🔍 Testando busca por tópico...')
    const { data: topicCards, error: topicError } = await supabase
      .from('flashcards')
      .select('id, topic_id, question, answer')
      .eq('topic_id', 'fonetica-fonologia')
      .limit(3)
    
    if (topicError) {
      console.error('❌ Erro ao buscar flashcards do tópico:', topicError)
      return
    }
    
    console.log(`✅ Flashcards do tópico 'fonetica-fonologia': ${topicCards.length}`)
    topicCards.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.question}`)
      console.log(`   R: ${card.answer}`)
    })
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testFlashcards()
  .then(() => {
    console.log('\n✅ Teste concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  }) 