// Script para inserir flashcards de teste
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertTestFlashcards() {
  console.log('🔍 Iniciando inserção de flashcards de teste...')
  
  try {
    // 1. Primeiro, verificar se os tópicos existem
    console.log('\n📚 1. Verificando tópicos...')
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
    
    if (topics.length === 0) {
      console.log('❌ Nenhum tópico encontrado. Execute o script de seed primeiro.')
      return
    }
    
    // 2. Inserir flashcards de teste
    console.log('\n📝 2. Inserindo flashcards de teste...')
    
    const testFlashcards = [
      {
        topic_id: 'fonetica-fonologia',
        question: 'O que é um fonema?',
        answer: 'Menor unidade sonora da fala que distingue significados.'
      },
      {
        topic_id: 'fonetica-fonologia',
        question: 'O que é um ditongo?',
        answer: 'Encontro de duas vogais em uma mesma sílaba.'
      },
      {
        topic_id: 'ortografia',
        question: 'Qual a diferença entre "mas" e "mais"?',
        answer: '"Mas" é conjunção adversativa; "mais" é advérbio de intensidade.'
      },
      {
        topic_id: 'ortografia',
        question: 'Quando usar "por que" separado?',
        answer: 'Em perguntas diretas ou indiretas, ou quando "que" é pronome relativo.'
      },
      {
        topic_id: 'acentuacao-grafica',
        question: 'Quando acentuar oxítonas?',
        answer: 'Terminadas em A(s), E(s), O(s), EM, ENS.'
      },
      {
        topic_id: 'morfologia-classes',
        question: 'O que é um substantivo?',
        answer: 'Palavra que nomeia seres, objetos, lugares, sentimentos, etc.'
      },
      {
        topic_id: 'sintaxe-termos-essenciais',
        question: 'O que é sujeito simples?',
        answer: 'Apresenta apenas um núcleo.'
      },
      {
        topic_id: 'sintaxe-termos-integrantes',
        question: 'O que é objeto direto?',
        answer: 'Complemento verbal sem preposição.'
      }
    ]
    
    let insertedCount = 0
    let errorCount = 0
    
    for (const flashcard of testFlashcards) {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .insert(flashcard)
          .select()
        
        if (error) {
          console.error(`❌ Erro ao inserir flashcard "${flashcard.question}":`, error.message)
          errorCount++
        } else {
          console.log(`✅ Inserido: ${flashcard.question}`)
          insertedCount++
        }
      } catch (error) {
        console.error(`❌ Erro inesperado ao inserir flashcard:`, error)
        errorCount++
      }
    }
    
    console.log(`\n📊 Resultado da inserção:`)
    console.log(`   ✅ Inseridos com sucesso: ${insertedCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    
    // 3. Verificar se os flashcards foram inseridos
    console.log('\n🔍 3. Verificando flashcards inseridos...')
    const { data: allFlashcards, error: checkError } = await supabase
      .from('flashcards')
      .select('id, topic_id, question, answer')
      .order('id')
    
    if (checkError) {
      console.error('❌ Erro ao verificar flashcards:', checkError)
      return
    }
    
    console.log(`✅ Total de flashcards na base: ${allFlashcards.length}`)
    
    // Agrupar por tópico
    const flashcardsByTopic = {}
    allFlashcards.forEach(card => {
      if (!flashcardsByTopic[card.topic_id]) {
        flashcardsByTopic[card.topic_id] = []
      }
      flashcardsByTopic[card.topic_id].push(card)
    })
    
    console.log('\n📝 Flashcards por tópico:')
    Object.entries(flashcardsByTopic).forEach(([topicId, cards]) => {
      console.log(`   ${topicId}: ${cards.length} flashcards`)
    })
    
    console.log('\n✅ Inserção de flashcards de teste concluída!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

insertTestFlashcards()
  .then(() => {
    console.log('\n🎉 Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  }) 