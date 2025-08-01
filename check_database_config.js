require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseConfig() {
  console.log('🔍 [CONFIG] Verificando configuração do banco de dados...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Verificar se conseguimos acessar o banco
    console.log('🔧 [CONFIG] Teste 1: Verificando acesso ao banco...');
    
    const { data: testData, error: testError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ [CONFIG] Erro ao acessar banco:', testError.message);
      console.error('❌ [CONFIG] Código do erro:', testError.code);
    } else {
      console.log('✅ [CONFIG] Acesso ao banco funcionando');
    }

    // Verificar tabela user_roles
    console.log('🔧 [CONFIG] Teste 2: Verificando tabela user_roles...');
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);

    if (rolesError) {
      console.error('❌ [CONFIG] Erro ao acessar user_roles:', rolesError.message);
    } else {
      console.log('✅ [CONFIG] Tabela user_roles acessível');
      console.log('📊 [CONFIG] Registros encontrados:', rolesData?.length || 0);
    }

    // Verificar tabela members
    console.log('🔧 [CONFIG] Teste 3: Verificando tabela members...');
    
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(5);

    if (membersError) {
      console.error('❌ [CONFIG] Erro ao acessar members:', membersError.message);
    } else {
      console.log('✅ [CONFIG] Tabela members acessível');
      console.log('📊 [CONFIG] Registros encontrados:', membersData?.length || 0);
    }

    // Verificar configuração de autenticação
    console.log('🔧 [CONFIG] Teste 4: Verificando configuração de auth...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [CONFIG] Erro na configuração de auth:', sessionError.message);
    } else {
      console.log('✅ [CONFIG] Configuração de auth funcionando');
    }

    // Verificar se há usuários existentes
    console.log('🔧 [CONFIG] Teste 5: Verificando usuários existentes...');
    
    // Tentar listar usuários (pode falhar por permissões)
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('⚠️ [CONFIG] Não foi possível listar usuários (normal para anon key)');
      } else {
        console.log('✅ [CONFIG] Usuários encontrados:', users?.length || 0);
      }
    } catch (error) {
      console.log('⚠️ [CONFIG] Não foi possível listar usuários (esperado)');
    }

  } catch (error) {
    console.error('❌ [CONFIG] Erro inesperado:', error);
  }
}

checkDatabaseConfig(); 