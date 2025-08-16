require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function fixSupabaseAuth() {
  console.log('🔧 [FIX] Iniciando diagnóstico e correção do problema de autenticação...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Verificar se o problema é específico da criação de usuários
    console.log('🔍 [FIX] Verificando se o problema é específico da criação...');
    
    // Tentar criar um usuário com configuração mínima
    const { data, error } = await supabase.auth.signUp({
      email: 'teste-fix@everest.com',
      password: '123456'
    });

    if (error) {
      console.error('❌ [FIX] Erro persistente:', error.message);
      console.error('❌ [FIX] Código:', error.code);
      console.error('❌ [FIX] Status:', error.status);
      
      // Verificar se é um problema de configuração específica
      if (error.message.includes('Database error')) {
        console.log('🔍 [FIX] Problema identificado: Erro no banco de dados');
        console.log('💡 [FIX] Possíveis soluções:');
        console.log('   1. Verificar configuração de email no Supabase Dashboard');
        console.log('   2. Verificar políticas de segurança (RLS)');
        console.log('   3. Verificar triggers ou funções personalizadas');
        console.log('   4. Verificar configuração de autenticação');
        
        // Tentar verificar se há problemas com a configuração de email
        console.log('🔧 [FIX] Verificando configuração de email...');
        
        // Tentar criar usuário com configuração diferente
        const { data: data2, error: error2 } = await supabase.auth.signUp({
          email: 'teste-fix2@everest.com',
          password: '123456',
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`
          }
        });

        if (error2) {
          console.error('❌ [FIX] Erro persiste mesmo com configuração diferente:', error2.message);
        } else {
          console.log('✅ [FIX] Usuário criado com configuração alternativa!');
        }
      }
    } else {
      console.log('✅ [FIX] Usuário criado com sucesso!');
      console.log('👤 [FIX] Email:', data.user?.email);
    }

    // Verificar se há problemas com a tabela auth.users
    console.log('🔧 [FIX] Verificando tabela auth.users...');
    
    // Tentar acessar informações sobre a configuração de auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [FIX] Erro ao acessar sessão:', sessionError.message);
    } else {
      console.log('✅ [FIX] Sessão acessível');
    }

    // Verificar se há problemas com triggers ou funções
    console.log('🔧 [FIX] Verificando se há problemas com triggers...');
    
    // Tentar inserir diretamente na tabela user_roles para ver se há problemas
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_uuid: 'teste-trigger@everest.com',
        role: 'student'
      })
      .select();

    if (insertError) {
      console.error('❌ [FIX] Erro ao inserir na user_roles:', insertError.message);
    } else {
      console.log('✅ [FIX] Inserção na user_roles funcionando');
      
      // Remover o registro de teste
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_uuid', 'teste-trigger@everest.com');
      
      if (deleteError) {
        console.error('⚠️ [FIX] Erro ao remover teste:', deleteError.message);
      }
    }

    // Sugerir soluções
    console.log('💡 [FIX] Sugestões para resolver o problema:');
    console.log('   1. Acesse o Supabase Dashboard');
    console.log('   2. Vá para Authentication > Settings');
    console.log('   3. Verifique se "Enable email confirmations" está desabilitado');
    console.log('   4. Verifique se "Enable sign ups" está habilitado');
    console.log('   5. Verifique se há triggers ou funções personalizadas causando problemas');
    console.log('   6. Verifique as políticas de segurança (RLS) na tabela auth.users');

  } catch (error) {
    console.error('❌ [FIX] Erro inesperado:', error);
  }
}

fixSupabaseAuth(); 