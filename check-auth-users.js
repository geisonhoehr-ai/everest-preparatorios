const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthUsers() {
  console.log('🔍 Verificando usuários de autenticação...\n');

  try {
    // 1. Verificar se há usuários na tabela auth.users
    console.log('1️⃣ Verificando auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Erro ao verificar auth.users:', authError.message);
    } else {
      console.log('✅ Usuário atual:', authUsers.user ? 'Logado' : 'Não logado');
      if (authUsers.user) {
        console.log(`  - ID: ${authUsers.user.id}`);
        console.log(`  - Email: ${authUsers.user.email}`);
        console.log(`  - Role: ${authUsers.user.role || 'N/A'}`);
      }
    }

    // 2. Verificar se há usuários na tabela user_profiles
    console.log('\n2️⃣ Verificando user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profilesError) {
      console.log('❌ Erro ao verificar user_profiles:', profilesError.message);
    } else {
      console.log(`✅ ${profiles.length} perfis encontrados:`);
      profiles.forEach(profile => {
        console.log(`  - ID: ${profile.id}, User ID: ${profile.user_id}, Role: ${profile.role}`);
      });
    }

    // 3. Verificar se há usuários na tabela auth.users (via RPC)
    console.log('\n3️⃣ Verificando auth.users via RPC...');
    const { data: allUsers, error: allUsersError } = await supabase
      .rpc('get_auth_users');
    
    if (allUsersError) {
      console.log('❌ Erro ao verificar auth.users via RPC:', allUsersError.message);
      console.log('🔍 Tentando método alternativo...');
      
      // Tentar método alternativo
      const { data: altUsers, error: altError } = await supabase
        .from('auth.users')
        .select('*')
        .limit(5);
      
      if (altError) {
        console.log('❌ Erro no método alternativo:', altError.message);
      } else {
        console.log(`✅ ${altUsers.length} usuários encontrados via método alternativo:`);
        altUsers.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}`);
        });
      }
    } else {
      console.log(`✅ ${allUsers.length} usuários encontrados via RPC:`);
      allUsers.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkAuthUsers();
