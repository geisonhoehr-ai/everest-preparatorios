require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testAuthConfig() {
  console.log('🔍 [AUTH TEST] Testando configuração de autenticação...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Teste 1: Verificar se o email está habilitado
    console.log('🔧 [AUTH TEST] Teste 1: Verificando configuração de email...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [AUTH TEST] Erro ao obter sessão:', sessionError.message);
    } else {
      console.log('✅ [AUTH TEST] Sessão obtida com sucesso');
    }

    // Teste 2: Tentar criar usuário com email diferente
    console.log('🔧 [AUTH TEST] Teste 2: Tentando criar usuário com email diferente...');
    
    const testEmail = 'teste2@everest.com';
    const testPassword = '123456';
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`
      }
    });

    if (error) {
      console.error('❌ [AUTH TEST] Erro ao criar usuário:', error.message);
      console.error('❌ [AUTH TEST] Código do erro:', error.status);
      console.error('❌ [AUTH TEST] Detalhes:', error);
    } else {
      console.log('✅ [AUTH TEST] Usuário criado com sucesso!');
      console.log('👤 [AUTH TEST] Email:', data.user?.email);
      console.log('🆔 [AUTH TEST] ID:', data.user?.id);
      console.log('📧 [AUTH TEST] Confirmação necessária:', data.user?.email_confirmed_at ? 'Não' : 'Sim');
    }

    // Teste 3: Verificar se há usuários existentes na tabela user_roles
    console.log('🔧 [AUTH TEST] Teste 3: Verificando usuários existentes...');
    
    const { data: existingUsers, error: existingError } = await supabase
      .from('user_roles')
      .select('*');

    if (existingError) {
      console.error('❌ [AUTH TEST] Erro ao buscar usuários existentes:', existingError.message);
    } else {
      console.log('✅ [AUTH TEST] Usuários existentes encontrados:', existingUsers?.length || 0);
      if (existingUsers && existingUsers.length > 0) {
        console.log('📋 [AUTH TEST] Usuários:');
        existingUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.user_uuid} (${user.role})`);
        });
      }
    }

    // Teste 4: Tentar fazer login com um usuário existente
    if (existingUsers && existingUsers.length > 0) {
      console.log('🔧 [AUTH TEST] Teste 4: Tentando login com usuário existente...');
      
      const existingUser = existingUsers[0];
      console.log('👤 [AUTH TEST] Tentando login com:', existingUser.user_uuid);
      
      // Nota: Precisaríamos da senha do usuário para testar o login
      console.log('⚠️ [AUTH TEST] Não é possível testar login sem a senha do usuário');
    }

  } catch (error) {
    console.error('❌ [AUTH TEST] Erro inesperado:', error);
  }
}

testAuthConfig(); 