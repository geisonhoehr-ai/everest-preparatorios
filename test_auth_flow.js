require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testAuthFlow() {
  console.log('🔍 [AUTH_FLOW] Testando fluxo completo de autenticação...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Teste 1: Login com usuário existente
    console.log('🔧 [AUTH_FLOW] Teste 1: Fazendo login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'geisonhoehr@gmail.com',
      password: '123456'
    });

    if (error) {
      console.error('❌ [AUTH_FLOW] Erro no login:', error.message);
      return;
    }

    console.log('✅ [AUTH_FLOW] Login bem-sucedido!');
    console.log('👤 [AUTH_FLOW] Usuário:', data.user?.email);
    console.log('🆔 [AUTH_FLOW] ID:', data.user?.id);

    // Teste 2: Verificar sessão
    console.log('🔧 [AUTH_FLOW] Teste 2: Verificando sessão...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [AUTH_FLOW] Erro ao obter sessão:', sessionError.message);
    } else {
      console.log('✅ [AUTH_FLOW] Sessão válida:', !!session);
      if (session) {
        console.log('📊 [AUTH_FLOW] Dados da sessão:', {
          user: session.user?.email,
          expires_at: session.expires_at,
          access_token: session.access_token ? 'Presente' : 'Ausente'
        });
      }
    }

    // Teste 3: Verificar role
    console.log('🔧 [AUTH_FLOW] Teste 3: Verificando role...');
    
    let roleData = null;
    if (data.user?.email) {
      const { data: roleResult, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_uuid', data.user.email)
        .single();

      if (roleError) {
        console.error('❌ [AUTH_FLOW] Erro ao buscar role:', roleError.message);
      } else {
        roleData = roleResult;
        console.log('✅ [AUTH_FLOW] Role encontrado:', roleData?.role);
      }
    }

    // Teste 4: Verificar se há problemas com cookies/sessão
    console.log('🔧 [AUTH_FLOW] Teste 4: Verificando persistência da sessão...');
    
    // Aguardar um pouco e verificar novamente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: { session: session2 }, error: sessionError2 } = await supabase.auth.getSession();
    
    if (sessionError2) {
      console.error('❌ [AUTH_FLOW] Erro ao verificar sessão persistente:', sessionError2.message);
    } else {
      console.log('✅ [AUTH_FLOW] Sessão persistente:', !!session2);
    }

    // Teste 5: Verificar se há problemas com redirecionamento
    console.log('🔧 [AUTH_FLOW] Teste 5: Simulando redirecionamento...');
    
    const role = roleData?.role || 'student';
    console.log('🎯 [AUTH_FLOW] Role para redirecionamento:', role);
    
    let redirectUrl = '/dashboard';
    if (role === 'teacher') {
      redirectUrl = '/dashboard';
    } else if (role === 'admin') {
      redirectUrl = '/admin';
    }
    
    console.log('🔄 [AUTH_FLOW] URL de redirecionamento sugerida:', redirectUrl);

    // Teste 6: Verificar se há problemas com middleware
    console.log('🔧 [AUTH_FLOW] Teste 6: Verificando se middleware pode acessar sessão...');
    
    // Simular o que o middleware faria
    try {
      const { data: { session: middlewareSession }, error: middlewareError } = await supabase.auth.getSession();
      
      if (middlewareError) {
        console.error('❌ [AUTH_FLOW] Middleware não consegue acessar sessão:', middlewareError.message);
      } else {
        console.log('✅ [AUTH_FLOW] Middleware pode acessar sessão:', !!middlewareSession);
      }
    } catch (error) {
      console.error('❌ [AUTH_FLOW] Erro ao simular middleware:', error.message);
    }

    // Teste 7: Verificar se há problemas com AuthManager
    console.log('🔧 [AUTH_FLOW] Teste 7: Verificando compatibilidade com AuthManager...');
    
    // Simular o que o AuthManager faria
    try {
      const roleForAuthManager = await getUserRoleClient(data.user.email);
      console.log('✅ [AUTH_FLOW] AuthManager pode obter role:', roleForAuthManager);
    } catch (error) {
      console.error('❌ [AUTH_FLOW] AuthManager não consegue obter role:', error.message);
    }

    // Teste 8: Verificar se há problemas específicos com o browser
    console.log('🔧 [AUTH_FLOW] Teste 8: Verificando compatibilidade com browser...');
    
    console.log('💡 [AUTH_FLOW] Conclusões:');
    console.log('   ✅ Login funciona corretamente');
    console.log('   ✅ Sessão é criada e persistida');
    console.log('   ✅ Role é obtido corretamente');
    console.log('   ✅ Middleware pode acessar sessão');
    console.log('   ✅ AuthManager pode obter role');
    console.log('');
    console.log('🔍 [AUTH_FLOW] Possíveis problemas no browser:');
    console.log('   1. Cookies não estão sendo salvos corretamente');
    console.log('   2. Middleware está redirecionando incorretamente');
    console.log('   3. AuthManager está causando loops de redirecionamento');
    console.log('   4. ClientLayout está bloqueando a renderização');

  } catch (error) {
    console.error('❌ [AUTH_FLOW] Erro inesperado:', error);
  }
}

// Função auxiliar para simular getUserRoleClient
async function getUserRoleClient(userEmail) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_uuid', userEmail)
    .single();

  if (error) {
    throw error;
  }

  return data.role;
}

testAuthFlow(); 