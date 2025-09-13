const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkQuizPermissions() {
  console.log('🔍 Verificando permissões do quiz...\n');

  try {
    // 1. Verificar permissões para quiz
    console.log('1️⃣ Verificando permissões para quiz...');
    const { data: quizPermissions, error: quizError } = await supabase
      .from('page_permissions')
      .select('*')
      .eq('page_name', 'quiz');
    
    if (quizError) {
      console.log('❌ Erro ao verificar permissões de quiz:', quizError.message);
    } else {
      console.log(`✅ ${quizPermissions.length} permissões para quiz:`);
      quizPermissions.forEach(perm => {
        console.log(`  - User: ${perm.user_id}, Access: ${perm.has_access}, Expires: ${perm.expires_at || 'Nunca'}`);
      });
    }

    // 2. Verificar todas as permissões
    console.log('\n2️⃣ Verificando todas as permissões...');
    const { data: allPermissions, error: allError } = await supabase
      .from('page_permissions')
      .select('*');
    
    if (allError) {
      console.log('❌ Erro ao verificar todas as permissões:', allError.message);
    } else {
      console.log(`✅ ${allPermissions.length} permissões totais:`);
      allPermissions.forEach(perm => {
        console.log(`  - User: ${perm.user_id}, Page: ${perm.page_name}, Access: ${perm.has_access}`);
      });
    }

    // 3. Verificar se há usuários
    console.log('\n3️⃣ Verificando usuários...');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (usersError) {
      console.log('❌ Erro ao verificar usuários:', usersError.message);
    } else {
      console.log(`✅ ${users.length} usuários encontrados:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, User ID: ${user.user_id}, Role: ${user.role}`);
      });
    }

    // 4. Verificar se há dados de quiz
    console.log('\n4️⃣ Verificando dados de quiz...');
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(5);
    
    if (quizzesError) {
      console.log('❌ Erro ao verificar quizzes:', quizzesError.message);
    } else {
      console.log(`✅ ${quizzes.length} quizzes encontrados:`);
      quizzes.forEach(quiz => {
        console.log(`  - ID: ${quiz.id}, Título: ${quiz.title}, Tópico: ${quiz.topic_id}`);
      });
    }

    // 5. Verificar se há questões de quiz
    console.log('\n5️⃣ Verificando questões de quiz...');
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(5);
    
    if (questionsError) {
      console.log('❌ Erro ao verificar questões:', questionsError.message);
    } else {
      console.log(`✅ ${questions.length} questões encontradas:`);
      questions.forEach(q => {
        console.log(`  - ID: ${q.id}, Quiz: ${q.quiz_id}, Pergunta: ${q.question_text?.substring(0, 50)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkQuizPermissions();
