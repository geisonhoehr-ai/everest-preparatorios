const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('🔍 Verificando tabelas necessárias para a página de membros...');

  const requiredTables = [
    'user_profiles',
    'classes', 
    'access_plans',
    'student_subscriptions',
    'page_permissions'
  ];

  console.log('📋 Verificando tabelas necessárias:', requiredTables);

  // Verificar dados nas tabelas
  console.log('\n🔍 Verificando dados...');
  
  // Verificar user_profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(5);
    
  if (profilesError) {
    console.error('❌ Erro ao verificar user_profiles:', profilesError);
  } else {
    console.log(`📊 user_profiles: ${profiles?.length || 0} registros`);
    if (profiles && profiles.length > 0) {
      console.log('👤 Primeiro perfil:', profiles[0]);
    }
  }

  // Verificar classes
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*')
    .limit(5);
    
  if (classesError) {
    console.error('❌ Erro ao verificar classes:', classesError);
  } else {
    console.log(`📊 classes: ${classes?.length || 0} registros`);
  }

  // Verificar access_plans
  const { data: plans, error: plansError } = await supabase
    .from('access_plans')
    .select('*')
    .limit(5);
    
  if (plansError) {
    console.error('❌ Erro ao verificar access_plans:', plansError);
  } else {
    console.log(`📊 access_plans: ${plans?.length || 0} registros`);
  }
}

checkAndCreateTables().catch(console.error);
