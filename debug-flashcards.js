const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugFlashcards() {
  console.log('🔍 Debugando flashcards...\n');

  try {
    // 1. Verificar subjects
    console.log('📚 Verificando subjects...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(5);
    
    if (subjectsError) {
      console.log('❌ Erro ao buscar subjects:', subjectsError.message);
    } else {
      console.log(`✅ ${subjects.length} subjects encontrados:`);
      subjects.forEach(subject => {
        console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`);
      });
    }

    // 2. Verificar topics
    console.log('\n📖 Verificando topics...');
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(10);
    
    if (topicsError) {
      console.log('❌ Erro ao buscar topics:', topicsError.message);
    } else {
      console.log(`✅ ${topics.length} topics encontrados:`);
      topics.forEach(topic => {
        console.log(`  - ID: ${topic.id}, Nome: ${topic.name}, Subject: ${topic.subject_id}`);
      });
    }

    // 3. Verificar flashcards
    console.log('\n🃏 Verificando flashcards...');
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('id, topic_id, question, answer')
      .limit(10);
    
    if (flashcardsError) {
      console.log('❌ Erro ao buscar flashcards:', flashcardsError.message);
    } else {
      console.log(`✅ ${flashcards.length} flashcards encontrados:`);
      flashcards.forEach(card => {
        console.log(`  - ID: ${card.id}, Tópico: ${card.topic_id}, Pergunta: ${card.question?.substring(0, 50)}...`);
      });
    }

    // 4. Verificar flashcards por tópico específico
    if (topics && topics.length > 0) {
      const firstTopic = topics[0];
      console.log(`\n🔍 Verificando flashcards do tópico "${firstTopic.name}" (ID: ${firstTopic.id})...`);
      
      const { data: topicFlashcards, error: topicError } = await supabase
        .from('flashcards')
        .select('id, topic_id, question, answer')
        .eq('topic_id', firstTopic.id);
      
      if (topicError) {
        console.log('❌ Erro ao buscar flashcards do tópico:', topicError.message);
      } else {
        console.log(`✅ ${topicFlashcards.length} flashcards encontrados para este tópico:`);
        topicFlashcards.forEach(card => {
          console.log(`  - ID: ${card.id}, Pergunta: ${card.question?.substring(0, 50)}...`);
        });
      }
    }

    // 5. Verificar se há dados de quiz para comparação
    console.log('\n❓ Verificando quiz_questions para comparação...');
    const { data: quizQuestions, error: quizError } = await supabase
      .from('quiz_questions')
      .select('id, quiz_id, question_text')
      .limit(5);
    
    if (quizError) {
      console.log('❌ Erro ao buscar quiz_questions:', quizError.message);
    } else {
      console.log(`✅ ${quizQuestions.length} quiz_questions encontradas:`);
      quizQuestions.forEach(q => {
        console.log(`  - ID: ${q.id}, Quiz: ${q.quiz_id}, Pergunta: ${q.question_text?.substring(0, 50)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugFlashcards();
