const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function setupAuthDirect() {
  try {
    console.log('🔧 [SETUP] Configurando autenticação diretamente...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lista de usuários para criar
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\n👤 [SETUP] Processando: ${user.email}`);
      
      try {
        // Tentar fazer login primeiro
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            console.log(`🔄 [SETUP] Usuário não existe, criando...`);
            
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
              console.error(`❌ [SETUP] Erro ao criar usuário:`, signUpError.message);
              continue;
            }
            
            console.log(`✅ [SETUP] Usuário criado! ID: ${signUpData.user?.id}`);
            
            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } else if (loginError.message.includes('Email not confirmed')) {
            console.log(`⚠️ [SETUP] Email não confirmado para ${user.email}`);
            console.log(`📧 [SETUP] Para resolver isso:`);
            console.log(`   1. Vá para o Supabase Dashboard`);
            console.log(`   2. Acesse Authentication > Users`);
            console.log(`   3. Encontre o usuário ${user.email}`);
            console.log(`   4. Clique em "Confirm user" ou "Send confirmation email"`);
            continue;
          } else {
            console.error(`❌ [SETUP] Erro no login:`, loginError.message);
            continue;
          }
        } else {
          console.log(`✅ [SETUP] Usuário ${user.email} já existe e está funcionando!`);
          console.log(`   ID: ${loginData.user?.id}`);
        }
        
        // Tentar fazer login novamente para obter o ID
        const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        if (finalLoginError) {
          console.error(`❌ [SETUP] Erro no login final:`, finalLoginError.message);
          continue;
        }
        
        const userId = finalLoginData.user.id;
        console.log(`🔑 [SETUP] ID do usuário: ${userId}`);
        
        // Criar perfil na tabela user_profiles
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
          console.error(`❌ [SETUP] Erro ao criar perfil:`, profileError.message);
        } else {
          console.log(`✅ [SETUP] Perfil criado/atualizado na tabela user_profiles`);
        }
        
      } catch (error) {
        console.error(`❌ [SETUP] Erro ao processar ${user.email}:`, error.message);
      }
    }
    
    // Verificar todos os perfis
    console.log('\n🔍 [SETUP] Verificando todos os perfis...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('❌ [SETUP] Erro ao buscar perfis:', allProfilesError.message);
    } else {
      console.log('✅ [SETUP] Perfis encontrados:');
      if (allProfiles.length === 0) {
        console.log('   Nenhum perfil encontrado');
      } else {
        allProfiles.forEach(profile => {
          console.log(`   - ${profile.email} (${profile.role}) - ID: ${profile.user_id}`);
        });
      }
    }
    
    console.log('\n📋 [SETUP] Próximos passos:');
    console.log('1. Se algum usuário não funcionar, vá para o Supabase Dashboard');
    console.log('2. Acesse Authentication > Users');
    console.log('3. Encontre os usuários não confirmados');
    console.log('4. Clique em "Confirm user" para cada um');
    console.log('5. Execute "node setup-auth-direct.js test" para testar');
    
  } catch (error) {
    console.error('❌ [SETUP] Erro geral:', error);
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

// Função para excluir usuário
async function deleteUser(email) {
  try {
    console.log(`🗑️ [DELETE] Excluindo usuário: ${email}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fazer login para obter o ID
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: '123456'
    });
    
    if (loginError) {
      console.error(`❌ [DELETE] Erro no login:`, loginError.message);
      return;
    }
    
    const userId = loginData.user.id;
    console.log(`🔍 [DELETE] ID do usuário: ${userId}`);
    
    // Excluir perfil da tabela user_profiles
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (deleteProfileError) {
      console.error(`❌ [DELETE] Erro ao excluir perfil:`, deleteProfileError.message);
    } else {
      console.log(`✅ [DELETE] Perfil excluído da tabela user_profiles`);
    }
    
    console.log(`⚠️ [DELETE] Para excluir completamente do auth.users, use o Supabase Dashboard`);
    
  } catch (error) {
    console.error('❌ [DELETE] Erro geral:', error);
  }
}

// Executar baseado no argumento
if (process.argv[2] === 'test') {
  testLogins();
} else if (process.argv[2] === 'delete' && process.argv[3]) {
  deleteUser(process.argv[3]);
} else {
  setupAuthDirect();
}

module.exports = { setupAuthDirect, testLogins, deleteUser };
