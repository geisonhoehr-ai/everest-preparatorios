require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  console.log('🔍 [CRIAÇÃO] Iniciando criação de usuário de teste...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Criar usuário de teste
    const testEmail = 'teste@everest.com';
    const testPassword = '123456';
    
    console.log('🔧 [CRIAÇÃO] Criando usuário:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.error('❌ [CRIAÇÃO] Erro ao criar usuário:', error.message);
      console.error('❌ [CRIAÇÃO] Código do erro:', error.status);
      return;
    }

    console.log('✅ [CRIAÇÃO] Usuário criado com sucesso!');
    console.log('👤 [CRIAÇÃO] Email:', data.user?.email);
    console.log('🆔 [CRIAÇÃO] ID:', data.user?.id);
    console.log('📧 [CRIAÇÃO] Confirmação necessária:', data.user?.email_confirmed_at ? 'Não' : 'Sim');

    // Adicionar role na tabela user_roles
    if (data.user?.email) {
      console.log('🔧 [CRIAÇÃO] Adicionando role na tabela user_roles...');
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_uuid: data.user.email,
          role: 'student'
        });

      if (roleError) {
        console.error('❌ [CRIAÇÃO] Erro ao adicionar role:', roleError.message);
      } else {
        console.log('✅ [CRIAÇÃO] Role adicionado com sucesso!');
      }
    }

    // Tentar fazer login com o usuário criado
    console.log('🔧 [CRIAÇÃO] Testando login com o usuário criado...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ [CRIAÇÃO] Erro no login:', loginError.message);
    } else {
      console.log('✅ [CRIAÇÃO] Login bem-sucedido!');
      console.log('👤 [CRIAÇÃO] Usuário logado:', loginData.user?.email);
    }

  } catch (error) {
    console.error('❌ [CRIAÇÃO] Erro inesperado:', error);
  }
}

createTestUser(); 