const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function createTestUsers() {
  try {
    console.log('👥 [CREATE] Criando usuários de teste...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\n👤 [CREATE] Processando: ${user.email}`);
      
      // Primeiro, tentar fazer login para ver se o usuário já existe
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          console.log(`🔄 [CREATE] Usuário não existe, criando...`);
          
          // Criar usuário
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                name: user.name
              }
            }
          });
          
          if (signUpError) {
            console.error(`❌ [CREATE] Erro ao criar usuário:`, signUpError.message);
            continue;
          }
          
          console.log(`✅ [CREATE] Usuário criado! ID: ${signUpData.user?.id}`);
          
          // Aguardar um pouco para o usuário ser processado
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } else if (loginError.message.includes('Email not confirmed')) {
          console.log(`⚠️ [CREATE] Email não confirmado para ${user.email}`);
          console.log(`📧 [CREATE] Verifique seu email e clique no link de confirmação`);
          continue;
        } else {
          console.error(`❌ [CREATE] Erro no login:`, loginError.message);
          continue;
        }
      } else {
        console.log(`✅ [CREATE] Usuário ${user.email} já existe e está funcionando!`);
        console.log(`   ID: ${loginData.user?.id}`);
      }
      
      // Tentar fazer login novamente para obter o ID
      const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (finalLoginError) {
        console.error(`❌ [CREATE] Erro no login final:`, finalLoginError.message);
        continue;
      }
      
      const userId = finalLoginData.user.id;
      console.log(`🔑 [CREATE] ID do usuário: ${userId}`);
      
      // Criar ou atualizar perfil na tabela user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error(`❌ [CREATE] Erro ao criar perfil:`, profileError.message);
      } else {
        console.log(`✅ [CREATE] Perfil criado/atualizado na tabela user_profiles`);
      }
    }
    
    // Verificar todos os perfis criados
    console.log('\n🔍 [CREATE] Verificando todos os perfis...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('❌ [CREATE] Erro ao buscar perfis:', allProfilesError.message);
    } else {
      console.log('✅ [CREATE] Perfis encontrados:');
      allProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.role}) - ID: ${profile.user_id}`);
      });
    }
    
    console.log('\n📋 [CREATE] Instruções finais:');
    console.log('1. Se algum usuário não funcionar, verifique se o email foi confirmado');
    console.log('2. Para confirmar emails, verifique sua caixa de entrada (incluindo spam)');
    console.log('3. Se não receber emails, pode ser necessário configurar o Supabase para não exigir confirmação');
    console.log('4. Execute "node create-test-users.js test" para testar os logins');
    
  } catch (error) {
    console.error('❌ [CREATE] Erro geral:', error);
  }
}

// Função para testar logins
async function testLogins() {
  try {
    console.log('🧪 [TEST] Testando logins dos usuários...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student' },
      { email: 'admin@teste.com', password: '123456', role: 'admin' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher' }
    ];
    
    for (const user of users) {
      console.log(`\n🧪 [TEST] Testando: ${user.email}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        console.log(`❌ [TEST] ${user.email}: ${loginError.message}`);
      } else {
        console.log(`✅ [TEST] ${user.email}: Login funcionando!`);
        console.log(`   ID: ${loginData.user?.id}`);
        console.log(`   Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .single();
        
        if (profileError) {
          console.log(`⚠️ [TEST] Perfil não encontrado na tabela user_profiles`);
        } else {
          console.log(`✅ [TEST] Perfil encontrado: ${profile.role}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erro geral:', error);
  }
}

// Executar baseado no argumento
if (process.argv[2] === 'test') {
  testLogins();
} else {
  createTestUsers();
}

module.exports = { createTestUsers, testLogins };
