require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseConfig() {
  console.log('🔍 [SUPABASE CONFIG] Verificando configuração do Supabase...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Verificar configuração de autenticação
    console.log('🔧 [SUPABASE CONFIG] Verificando configuração de auth...');
    
    // Tentar obter informações sobre a configuração
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [SUPABASE CONFIG] Erro na sessão:', sessionError.message);
    } else {
      console.log('✅ [SUPABASE CONFIG] Sessão configurada corretamente');
    }

    // Verificar se há problemas com a tabela auth.users
    console.log('🔧 [SUPABASE CONFIG] Verificando tabela auth.users...');
    
    // Tentar inserir um registro de teste na tabela user_roles para ver se há problemas de permissão
    console.log('🔧 [SUPABASE CONFIG] Testando inserção na tabela user_roles...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_uuid: 'teste@config.com',
        role: 'student'
      })
      .select();

    if (insertError) {
      console.error('❌ [SUPABASE CONFIG] Erro ao inserir na user_roles:', insertError.message);
      console.error('❌ [SUPABASE CONFIG] Código do erro:', insertError.code);
    } else {
      console.log('✅ [SUPABASE CONFIG] Inserção na user_roles funcionando');
      
      // Remover o registro de teste
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_uuid', 'teste@config.com');
      
      if (deleteError) {
        console.error('⚠️ [SUPABASE CONFIG] Erro ao remover registro de teste:', deleteError.message);
      } else {
        console.log('✅ [SUPABASE CONFIG] Remoção de teste bem-sucedida');
      }
    }

    // Verificar se há problemas com a tabela members
    console.log('🔧 [SUPABASE CONFIG] Verificando tabela members...');
    
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(1);

    if (membersError) {
      console.error('❌ [SUPABASE CONFIG] Erro ao acessar members:', membersError.message);
    } else {
      console.log('✅ [SUPABASE CONFIG] Tabela members acessível');
    }

    // Verificar configuração de email
    console.log('🔧 [SUPABASE CONFIG] Verificando configuração de email...');
    
    // Tentar criar um usuário com configuração específica
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'teste-config@everest.com',
      password: '123456',
      options: {
        data: {
          full_name: 'Teste Config'
        }
      }
    });

    if (signUpError) {
      console.error('❌ [SUPABASE CONFIG] Erro específico no signup:', signUpError.message);
      console.error('❌ [SUPABASE CONFIG] Código:', signUpError.code);
      console.error('❌ [SUPABASE CONFIG] Status:', signUpError.status);
      
      // Verificar se é um problema de configuração específica
      if (signUpError.message.includes('Database error')) {
        console.log('🔍 [SUPABASE CONFIG] Problema identificado: Erro no banco de dados');
        console.log('💡 [SUPABASE CONFIG] Possíveis causas:');
        console.log('   - Políticas de segurança (RLS) mal configuradas');
        console.log('   - Triggers ou funções com problemas');
        console.log('   - Configuração de email desabilitada');
        console.log('   - Problemas com a tabela auth.users');
      }
    } else {
      console.log('✅ [SUPABASE CONFIG] Signup funcionando!');
      console.log('👤 [SUPABASE CONFIG] Usuário criado:', signUpData.user?.email);
    }

  } catch (error) {
    console.error('❌ [SUPABASE CONFIG] Erro inesperado:', error);
  }
}

checkSupabaseConfig(); 