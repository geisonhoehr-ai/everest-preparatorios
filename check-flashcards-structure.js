const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFlashcardsStructure() {
  console.log('🔍 Verificando estrutura das tabelas...\n');

  try {
    // Verificar estrutura da tabela flashcard_progress
    console.log('📋 Estrutura da tabela flashcard_progress:');
    const { data: progressStructure, error: progressError } = await supabase
      .from('flashcard_progress')
      .select('*')
      .limit(1);
    
    if (progressError) {
      console.log('❌ Erro ao verificar flashcard_progress:', progressError.message);
    } else {
      console.log('✅ Tabela flashcard_progress existe');
      if (progressStructure && progressStructure.length > 0) {
        console.log('📊 Exemplo de registro:', progressStructure[0]);
      } else {
        console.log('📊 Tabela vazia');
      }
    }

    // Verificar usuários existentes
    console.log('\n👥 Usuários existentes:');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, user_id, role, full_name')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Erro ao verificar user_profiles:', usersError.message);
    } else {
      console.log(`✅ ${users.length} usuários encontrados:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, User ID: ${user.user_id}, Role: ${user.role}, Nome: ${user.full_name || 'N/A'}`);
      });
    }

    // Verificar flashcards existentes
    console.log('\n🃏 Flashcards existentes:');
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('id, question, answer, topic_id')
      .limit(5);
    
    if (flashcardsError) {
      console.log('❌ Erro ao verificar flashcards:', flashcardsError.message);
    } else {
      console.log(`✅ ${flashcards.length} flashcards encontrados:`);
      flashcards.forEach(card => {
        console.log(`  - ID: ${card.id}, Tópico: ${card.topic_id}, Pergunta: ${card.question?.substring(0, 50)}...`);
      });
    }

    // Verificar progresso existente
    console.log('\n📈 Progresso existente:');
    const { data: progress, error: progressError2 } = await supabase
      .from('flashcard_progress')
      .select('user_id, flashcard_id, ease_factor, repetitions')
      .limit(5);
    
    if (progressError2) {
      console.log('❌ Erro ao verificar progresso:', progressError2.message);
    } else {
      console.log(`✅ ${progress.length} registros de progresso encontrados:`);
      progress.forEach(p => {
        console.log(`  - User: ${p.user_id}, Card: ${p.flashcard_id}, Repetições: ${p.repetitions}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkFlashcardsStructure();
