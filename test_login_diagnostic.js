require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testLogin() {
  console.log('🔍 [DIAGNÓSTICO] Iniciando teste de login...');
  
  // Verificar variáveis de ambiente
  console.log('🔧 [DIAGNÓSTICO] Verificando variáveis de ambiente...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
  console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ [DIAGNÓSTICO] Variáveis de ambiente não configuradas!');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Teste 1: Verificar se o cliente Supabase está funcionando
    console.log('🔧 [DIAGNÓSTICO] Teste 1: Verificando cliente Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [DIAGNÓSTICO] Erro ao obter sessão:', sessionError);
    } else {
      console.log('✅ [DIAGNÓSTICO] Cliente Supabase funcionando');
      console.log('📊 [DIAGNÓSTICO] Sessão atual:', session ? 'Ativa' : 'Inativa');
    }

    // Teste 2: Tentar login com credenciais de teste
    console.log('🔧 [DIAGNÓSTICO] Teste 2: Tentando login...');
    
    const testEmail = 'teste@everest.com';
    const testPassword = '123456';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.error('❌ [DIAGNÓSTICO] Erro no login:', error.message);
      console.error('❌ [DIAGNÓSTICO] Código do erro:', error.status);
    } else {
      console.log('✅ [DIAGNÓSTICO] Login bem-sucedido!');
      console.log('👤 [DIAGNÓSTICO] Usuário:', data.user?.email);
      console.log('🆔 [DIAGNÓSTICO] ID:', data.user?.id);
    }

    // Teste 3: Verificar tabela user_roles
    console.log('🔧 [DIAGNÓSTICO] Teste 3: Verificando tabela user_roles...');
    
    if (data?.user?.email) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', data.user.email)
        .single();

      if (roleError) {
        console.error('❌ [DIAGNÓSTICO] Erro ao buscar role:', roleError);
      } else {
        console.log('✅ [DIAGNÓSTICO] Role encontrado:', roleData?.role);
      }
    }

    // Teste 4: Verificar se há usuários na tabela auth.users
    console.log('🔧 [DIAGNÓSTICO] Teste 4: Verificando usuários...');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ [DIAGNÓSTICO] Erro ao listar usuários:', usersError);
    } else {
      console.log('✅ [DIAGNÓSTICO] Usuários encontrados:', users?.length || 0);
      if (users?.length > 0) {
        console.log('📋 [DIAGNÓSTICO] Primeiros 3 usuários:');
        users.slice(0, 3).forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ [DIAGNÓSTICO] Erro inesperado:', error);
  }
}

testLogin(); 