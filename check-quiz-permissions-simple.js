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
    // 1. Verificar todas as permissões
    console.log('1️⃣ Verificando todas as permissões...');
    const { data: allPermissions, error: allError } = await supabase
      .from('page_permissions')
      .select('*');
    
    if (allError) {
      console.log('❌ Erro ao verificar permissões:', allError.message);
    } else {
      console.log(`✅ ${allPermissions.length} permissões encontradas:`);
      allPermissions.forEach(perm => {
        console.log(`  - User: ${perm.user_id}, Page: ${perm.page_name}, Access: ${perm.has_access}`);
      });
    }

    // 2. Verificar usuários
    console.log('\n2️⃣ Verificando usuários...');
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

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkQuizPermissions();
