const { createClient } = require('@supabase/supabase-js');

// Usar service role key para bypass RLS
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE0NDcxOCwiZXhwIjoyMDY4NzIwNzE4fQ.8QZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQ'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testFlashcards() {
  console.log('🔍 Testando flashcards com service role...');
  
  // Testar flashcards
  const { data: flashcards, error: flashcardsError } = await supabase
    .from('flashcards')
    .select('*')
    .limit(5);
    
  if (flashcardsError) {
    console.log('❌ Erro ao buscar flashcards:', flashcardsError.message);
  } else {
    console.log(`✅ Flashcards encontrados: ${flashcards.length}`);
    flashcards.forEach((card, i) => {
      console.log(`  ${i+1}. ID: ${card.id}, Tópico: ${card.topic_id}`);
      console.log(`     Pergunta: ${card.question?.substring(0, 50)}...`);
    });
  }
  
  // Verificar topic_ids únicos
  const { data: uniqueTopics, error: topicsError } = await supabase
    .from('flashcards')
    .select('topic_id')
    .limit(20);
    
  if (topicsError) {
    console.log('❌ Erro ao buscar topic_ids:', topicsError.message);
  } else {
    const unique = [...new Set(uniqueTopics.map(f => f.topic_id))];
    console.log(`📊 Topic IDs únicos encontrados: ${unique.length}`);
    unique.slice(0, 10).forEach(t => console.log(`  - ${t}`));
  }
  
  // Verificar se existem subjects e topics
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*');
    
  if (subjectsError) {
    console.log('❌ Tabela subjects não existe:', subjectsError.message);
  } else {
    console.log(`✅ Tabela subjects existe com ${subjects.length} registros`);
  }
  
  const { data: topics, error: topicsError2 } = await supabase
    .from('topics')
    .select('*');
    
  if (topicsError2) {
    console.log('❌ Tabela topics não existe:', topicsError2.message);
  } else {
    console.log(`✅ Tabela topics existe com ${topics.length} registros`);
  }
}

testFlashcards().catch(console.error);
