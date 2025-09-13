// Testar se a página de Flashcards está funcionando corretamente
const { createClient } = require('@supabase/supabase-js')

// Usar Service Role Key para testar
const supabaseUrl = 'https://hnhzindsfuqnaxosujay.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzNTk1MiwiZXhwIjoyMDY4NTExOTUyfQ.Fj2biXwZJNz-cqnma6_gJDMviVGo92ljDCIdFynojZ4'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testFlashcardsPage() {
  console.log('🔍 Testando funcionalidade da página de Flashcards...\n')

  try {
    // 1. Testar busca de subjects
    console.log('📚 1. Testando busca de subjects:')
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("*")
    
    if (subjectsError) {
      console.error('❌ Erro ao buscar subjects:', subjectsError.message)
    } else {
      console.log(`✅ Subjects encontrados: ${subjects?.length || 0}`)
      if (subjects && subjects.length > 0) {
        console.log('📋 Subjects:', subjects.map(s => s.name))
      }
    }

    // 2. Testar busca de topics
    console.log('\n📖 2. Testando busca de topics:')
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .limit(5)
    
    if (topicsError) {
      console.error('❌ Erro ao buscar topics:', topicsError.message)
    } else {
      console.log(`✅ Topics encontrados: ${topics?.length || 0}`)
      if (topics && topics.length > 0) {
        console.log('📋 Primeiros topics:', topics.map(t => `${t.name} (${t.id})`))
      }
    }

    // 3. Testar busca de flashcards
    console.log('\n🃏 3. Testando busca de flashcards:')
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("*")
      .limit(5)
    
    if (flashcardsError) {
      console.error('❌ Erro ao buscar flashcards:', flashcardsError.message)
    } else {
      console.log(`✅ Flashcards encontrados: ${flashcards?.length || 0}`)
      if (flashcards && flashcards.length > 0) {
        console.log('📋 Primeiros flashcards:')
        flashcards.forEach((f, i) => {
          console.log(`  ${i + 1}. ${f.question?.substring(0, 50)}...`)
        })
      }
    }

    // 4. Testar busca de flashcards por tópico
    console.log('\n🎯 4. Testando busca de flashcards por tópico:')
    const { data: topicFlashcards, error: topicFlashcardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("topic_id", "fonetica-fonologia")
      .limit(3)
    
    if (topicFlashcardsError) {
      console.error('❌ Erro ao buscar flashcards por tópico:', topicFlashcardsError.message)
    } else {
      console.log(`✅ Flashcards do tópico fonetica-fonologia: ${topicFlashcards?.length || 0}`)
      if (topicFlashcards && topicFlashcards.length > 0) {
        console.log('📋 Primeiro flashcard:')
        console.log('  Pergunta:', topicFlashcards[0].question)
        console.log('  Resposta:', topicFlashcards[0].answer)
      }
    }

    // 5. Testar fluxo completo (simular o que a página faz)
    console.log('\n🔄 5. Testando fluxo completo da página:')
    
    // Buscar um subject
    const { data: testSubject } = await supabase
      .from("subjects")
      .select("*")
      .limit(1)
      .single()
    
    if (testSubject) {
      console.log(`✅ Subject selecionado: ${testSubject.name}`)
      
      // Buscar topics deste subject
      const { data: testTopics } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", testSubject.id)
        .limit(1)
      
      if (testTopics && testTopics.length > 0) {
        const testTopic = testTopics[0]
        console.log(`✅ Topic selecionado: ${testTopic.name}`)
        
        // Buscar flashcards deste topic
        const { data: testFlashcards } = await supabase
          .from("flashcards")
          .select("*")
          .eq("topic_id", testTopic.id)
          .limit(3)
        
        if (testFlashcards && testFlashcards.length > 0) {
          console.log(`✅ Flashcards encontrados: ${testFlashcards.length}`)
          console.log('📋 Fluxo completo funcionando!')
        } else {
          console.log('⚠️ Nenhum flashcard encontrado para este tópico')
        }
      } else {
        console.log('⚠️ Nenhum tópico encontrado para este subject')
      }
    } else {
      console.log('⚠️ Nenhum subject encontrado')
    }

    // 6. Verificar estrutura da tabela flashcards
    console.log('\n🔧 6. Verificando estrutura da tabela flashcards:')
    const { data: flashcardStructure } = await supabase
      .from("flashcards")
      .select("*")
      .limit(1)
    
    if (flashcardStructure && flashcardStructure.length > 0) {
      console.log('📋 Colunas da tabela flashcards:', Object.keys(flashcardStructure[0]))
    }

    console.log('\n🎯 Teste concluído!')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testFlashcardsPage()
