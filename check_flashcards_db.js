// Script para verificar se os flashcards estão na base de dados
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase - você precisa substituir pelas suas credenciais
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('🔍 Verificando configuração do Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada')

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Configure as variáveis de ambiente do Supabase primeiro!')
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkFlashcardsDatabase() {
  console.log('\n🔍 Iniciando verificação da base de dados...')
  
  try {
    // 1. Verificar se conseguimos conectar
    console.log('\n📋 1. Testando conexão...')
    const { data: testData, error: testError } = await supabase
      .from('flashcards')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError)
      return
    }
    
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // 2. Contar flashcards
    console.log('\n📊 2. Contando flashcards...')
    const { count, error: countError } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Erro ao contar flashcards:', countError)
      return
    }
    
    console.log(`✅ Total de flashcards na base: ${count}`)
    
    if (count === 0) {
      console.log('⚠️  Nenhum flashcard encontrado!')
      console.log('💡 Execute o script de seed para inserir flashcards:')
      console.log('   node scripts/003_insert_all_flashcards.sql')
      return
    }
    
    // 3. Verificar tópicos
    console.log('\n📚 3. Verificando tópicos...')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id, name')
      .order('name')
    
    if (topicsError) {
      console.error('❌ Erro ao buscar tópicos:', topicsError)
      return
    }
    
    console.log(`✅ Tópicos encontrados: ${topics.length}`)
    topics.forEach(topic => {
      console.log(`   - ${topic.id}: ${topic.name}`)
    })
    
    // 4. Verificar flashcards por tópico
    console.log('\n🔍 4. Verificando flashcards por tópico...')
    for (const topic of topics) {
      const { data: flashcards, error: flashError } = await supabase
        .from('flashcards')
        .select('id, topic_id, question, answer')
        .eq('topic_id', topic.id)
        .limit(5)
      
      if (flashError) {
        console.error(`❌ Erro ao buscar flashcards do tópico ${topic.id}:`, flashError)
        continue
      }
      
      console.log(`\n📝 Tópico: ${topic.name} (${topic.id})`)
      console.log(`   Flashcards encontrados: ${flashcards.length}`)
      
      if (flashcards.length > 0) {
        console.log('   Exemplos:')
        flashcards.slice(0, 3).forEach((card, index) => {
          console.log(`     ${index + 1}. ${card.question}`)
          console.log(`        R: ${card.answer}`)
        })
      } else {
        console.log('   ⚠️  Nenhum flashcard encontrado para este tópico')
      }
    }
    
    // 5. Testar busca específica
    console.log('\n🧪 5. Testando busca específica...')
    const testTopics = ['fonetica-fonologia', 'ortografia', 'acentuacao-grafica']
    
    for (const topicId of testTopics) {
      const { data: cards, error: cardError } = await supabase
        .from('flashcards')
        .select('id, topic_id, question, answer')
        .eq('topic_id', topicId)
        .limit(3)
      
      if (cardError) {
        console.error(`❌ Erro ao buscar ${topicId}:`, cardError)
        continue
      }
      
      console.log(`\n✅ ${topicId}: ${cards.length} flashcards`)
      if (cards.length > 0) {
        console.log(`   Primeiro: ${cards[0].question}`)
      }
    }
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkFlashcardsDatabase()
  .then(() => {
    console.log('\n🎉 Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  }) 