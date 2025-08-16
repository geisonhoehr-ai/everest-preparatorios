// Script para debugar o problema de busca de flashcards
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFlashcardsDebug() {
  console.log('🔍 Iniciando debug de flashcards...')
  
  try {
    // 1. Verificar se a tabela flashcards existe
    console.log('\n📋 1. Verificando estrutura da tabela flashcards...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('flashcards')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela flashcards:', tableError)
      return
    }
    
    console.log('✅ Tabela flashcards acessível')
    
    // 2. Contar total de flashcards
    console.log('\n📊 2. Contando total de flashcards...')
    const { count, error: countError } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Erro ao contar flashcards:', countError)
      return
    }
    
    console.log(`✅ Total de flashcards: ${count}`)
    
    // 3. Verificar tópicos disponíveis
    console.log('\n📚 3. Verificando tópicos disponíveis...')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id, name')
      .order('name')
    
    if (topicsError) {
      console.error('❌ Erro ao buscar tópicos:', topicsError)
      return
    }
    
    console.log('✅ Tópicos encontrados:')
    topics.forEach(topic => {
      console.log(`  - ${topic.id}: ${topic.name}`)
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
    
    // 5. Testar a função getFlashcardsForReview
    console.log('\n🧪 5. Testando função getFlashcardsForReview...')
    
    async function getFlashcardsForReview(topicId, limit = 10) {
      try {
        console.log(`🔍 Buscando flashcards para tópico: ${topicId}, limite: ${limit}`)
        
        const { data, error } = await supabase
          .from('flashcards')
          .select('id, topic_id, question, answer')
          .eq('topic_id', topicId)
          .limit(limit)
        
        if (error) {
          console.error('❌ Erro ao buscar flashcards:', error)
          return []
        }
        
        console.log(`✅ Flashcards encontrados: ${data?.length || 0}`)
        return data || []
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar flashcards:', error)
        return []
      }
    }
    
    // Testar com alguns tópicos
    const testTopics = ['fonetica-fonologia', 'ortografia', 'acentuacao-grafica']
    
    for (const topicId of testTopics) {
      console.log(`\n🧪 Testando tópico: ${topicId}`)
      const cards = await getFlashcardsForReview(topicId, 5)
      
      if (cards.length > 0) {
        console.log(`✅ ${cards.length} flashcards encontrados`)
        console.log('   Primeiro card:', cards[0].question)
      } else {
        console.log('❌ Nenhum flashcard encontrado')
      }
    }
    
    // 6. Verificar se há problemas de permissão
    console.log('\n🔐 6. Verificando permissões...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️  Usuário não autenticado (isso pode ser normal para testes)')
    } else {
      console.log('✅ Usuário autenticado:', user?.id)
    }
    
    console.log('\n✅ Debug concluído!')
    
  } catch (error) {
    console.error('❌ Erro geral no debug:', error)
  }
}

// Executar o debug
testFlashcardsDebug()
  .then(() => {
    console.log('\n🎉 Script de debug finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  }) 