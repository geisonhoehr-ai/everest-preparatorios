const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableRelationships() {
  console.log('🔍 Verificando relacionamentos entre tabelas...');

  try {
    // Verificar user_profiles
    console.log('\n1. Verificando user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);

    if (profilesError) {
      console.error('❌ Erro ao verificar user_profiles:', profilesError);
    } else {
      console.log(`✅ user_profiles: ${profiles?.length || 0} registros`);
      if (profiles && profiles.length > 0) {
        console.log('👤 Primeiro perfil:', {
          id: profiles[0].id,
          user_id: profiles[0].user_id,
          display_name: profiles[0].display_name,
          role: profiles[0].role
        });
      }
    }

    // Verificar student_subscriptions
    console.log('\n2. Verificando student_subscriptions...');
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('student_subscriptions')
      .select('*')
      .limit(3);

    if (subscriptionsError) {
      console.error('❌ Erro ao verificar student_subscriptions:', subscriptionsError);
    } else {
      console.log(`✅ student_subscriptions: ${subscriptions?.length || 0} registros`);
      if (subscriptions && subscriptions.length > 0) {
        console.log('📋 Primeira subscription:', subscriptions[0]);
      }
    }

    // Verificar classes
    console.log('\n3. Verificando classes...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .limit(3);

    if (classesError) {
      console.error('❌ Erro ao verificar classes:', classesError);
    } else {
      console.log(`✅ classes: ${classes?.length || 0} registros`);
      if (classes && classes.length > 0) {
        console.log('🏫 Primeira classe:', classes[0]);
      }
    }

    // Testar query simples sem relacionamento
    console.log('\n4. Testando query simples...');
    const { data: simpleMembers, error: simpleError } = await supabase
      .from('user_profiles')
      .select('id, user_id, display_name, role, email');

    if (simpleError) {
      console.error('❌ Erro na query simples:', simpleError);
    } else {
      console.log(`✅ Query simples funcionou: ${simpleMembers?.length || 0} membros`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableRelationships().catch(console.error);
