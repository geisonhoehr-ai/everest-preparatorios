const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wruvehhfzkvmfyhxzmwo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ');

async function checkTables() {
  console.log('🔍 Verificando tabelas necessárias...');
  
  // Verificar subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*')
    .limit(5);
    
  if (subjectsError) {
    console.log('❌ Tabela subjects não existe ou erro:', subjectsError.message);
  } else {
    console.log(`✅ Tabela subjects existe com ${subjects.length} registros`);
    subjects.forEach(s => console.log(`  - ${s.id}: ${s.name}`));
  }
  
  // Verificar topics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .limit(5);
    
  if (topicsError) {
    console.log('❌ Tabela topics não existe ou erro:', topicsError.message);
  } else {
    console.log(`✅ Tabela topics existe com ${topics.length} registros`);
    topics.forEach(t => console.log(`  - ${t.id}: ${t.name} (subject_id: ${t.subject_id})`));
  }
  
  // Verificar topic_ids únicos nos flashcards
  const { data: uniqueTopics, error: topicsError2 } = await supabase
    .from('flashcards')
    .select('topic_id')
    .limit(10);
    
  if (topicsError2) {
    console.log('❌ Erro ao buscar topic_ids:', topicsError2.message);
  } else {
    const unique = [...new Set(uniqueTopics.map(f => f.topic_id))];
    console.log(`📊 Topic IDs únicos nos flashcards: ${unique.length}`);
    unique.slice(0, 10).forEach(t => console.log(`  - ${t}`));
  }
}

checkTables().catch(console.error);
