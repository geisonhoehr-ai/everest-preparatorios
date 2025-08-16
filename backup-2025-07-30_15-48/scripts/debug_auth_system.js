const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debug do Sistema de Autenticação');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAuthSystem() {
  try {
    console.log('🚀 Iniciando debug...');

    // 1. Testar conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('✅ Roles encontrados:', roles?.length || 0);
      console.log('📊 Primeiro role:', roles?.[0]);
    }

    // 2. Testar tabela de sessões
    console.log('\n2️⃣ Testando tabela user_sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .limit(5);

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
    } else {
      console.log('✅ Sessões encontradas:', sessions?.length || 0);
      console.log('📊 Primeira sessão:', sessions?.[0]);
    }

    // 3. Testar usuários auth
    console.log('\n3️⃣ Testando usuários auth...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('✅ Usuários encontrados:', users?.length || 0);
      console.log('📊 Primeiro usuário:', users?.[0]?.email);
    }

    // 4. Verificar tabelas existentes
    console.log('\n4️⃣ Verificando tabelas existentes...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_roles', 'user_sessions', 'redacoes', 'turmas']);

    if (tablesError) {
      console.error('❌ Erro ao buscar tabelas:', tablesError);
    } else {
      console.log('✅ Tabelas encontradas:', tables?.map(t => t.table_name));
    }

    // 5. Testar redações
    console.log('\n5️⃣ Testando redações...');
    const { data: redacoes, error: redacoesError } = await supabase
      .from('redacoes')
      .select('*')
      .limit(5);

    if (redacoesError) {
      console.error('❌ Erro ao buscar redações:', redacoesError);
    } else {
      console.log('✅ Redações encontradas:', redacoes?.length || 0);
      console.log('📊 Primeira redação:', redacoes?.[0]);
    }

    // 6. Testar turmas
    console.log('\n6️⃣ Testando turmas...');
    const { data: turmas, error: turmasError } = await supabase
      .from('turmas')
      .select('*')
      .limit(5);

    if (turmasError) {
      console.error('❌ Erro ao buscar turmas:', turmasError);
    } else {
      console.log('✅ Turmas encontradas:', turmas?.length || 0);
      console.log('📊 Primeira turma:', turmas?.[0]);
    }

    console.log('\n✅ Debug concluído!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

debugAuthSystem(); 