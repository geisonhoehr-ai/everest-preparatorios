const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMembrosSimple() {
  console.log('🧪 Testando página de membros (versão simples)...');

  try {
    // Testar user_profiles simples
    console.log('\n1. Testando user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, user_id, display_name, role');

    if (profilesError) {
      console.error('❌ Erro ao buscar user_profiles:', profilesError);
    } else {
      console.log(`✅ user_profiles: ${profiles?.length || 0} registros`);
      if (profiles && profiles.length > 0) {
        console.log('👤 Primeiro perfil:', profiles[0]);
      }
    }

    // Testar classes simples
    console.log('\n2. Testando classes...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, nome, status');

    if (classesError) {
      console.error('❌ Erro ao buscar classes:', classesError);
    } else {
      console.log(`✅ classes: ${classes?.length || 0} registros`);
      if (classes && classes.length > 0) {
        console.log('🏫 Primeira classe:', classes[0]);
      }
    }

    // Testar access_plans simples
    console.log('\n3. Testando access_plans...');
    const { data: plans, error: plansError } = await supabase
      .from('access_plans')
      .select('id, name, description');

    if (plansError) {
      console.error('❌ Erro ao buscar access_plans:', plansError);
    } else {
      console.log(`✅ access_plans: ${plans?.length || 0} registros`);
      if (plans && plans.length > 0) {
        console.log('📋 Primeiro plano:', plans[0]);
      }
    }

    // Testar student_subscriptions simples
    console.log('\n4. Testando student_subscriptions...');
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('student_subscriptions')
      .select('id, user_id, class_id, access_plan_id, status');

    if (subscriptionsError) {
      console.error('❌ Erro ao buscar student_subscriptions:', subscriptionsError);
    } else {
      console.log(`✅ student_subscriptions: ${subscriptions?.length || 0} registros`);
      if (subscriptions && subscriptions.length > 0) {
        console.log('📋 Primeira subscription:', subscriptions[0]);
      }
    }

    // Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`- user_profiles: ${profiles?.length || 0}`);
    console.log(`- classes: ${classes?.length || 0}`);
    console.log(`- access_plans: ${plans?.length || 0}`);
    console.log(`- student_subscriptions: ${subscriptions?.length || 0}`);

    if ((profiles?.length || 0) > 0 && (classes?.length || 0) > 0 && (plans?.length || 0) > 0) {
      console.log('\n✅ PÁGINA DE MEMBROS DEVE ESTAR FUNCIONANDO!');
      console.log('🎯 Acesse a página de membros no sistema');
    } else {
      console.log('\n❌ Ainda há problemas. Execute o SQL: fix-membros-final.sql');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testMembrosSimple().catch(console.error);
