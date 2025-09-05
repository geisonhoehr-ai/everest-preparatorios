const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase - usando as credenciais corretas
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function fixAuthUsers() {
  try {
    console.log('🔧 [FIX] Iniciando correção dos usuários de autenticação...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Verificar usuários existentes
    console.log('🔍 [FIX] Verificando usuários existentes...');
    
    // Tentar fazer login com cada usuário para verificar se existem
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\n🔐 [FIX] Verificando usuário: ${user.email}`);
      
      // Tentar fazer login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          console.log(`❌ [FIX] Usuário ${user.email} não existe ou senha incorreta`);
          
          // Tentar criar o usuário
          console.log(`🔄 [FIX] Criando usuário ${user.email}...`);
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
            console.error(`❌ [FIX] Erro ao criar ${user.email}:`, signUpError.message);
          } else {
            console.log(`✅ [FIX] Usuário ${user.email} criado com sucesso!`);
            console.log(`   ID: ${signUpData.user?.id}`);
            
            // Aguardar um pouco para o usuário ser criado
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Fazer login novamente para obter o ID
            const { data: newLoginData, error: newLoginError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: user.password
            });
            
            if (newLoginError) {
              console.error(`❌ [FIX] Erro no login após criação:`, newLoginError.message);
            } else {
              console.log(`✅ [FIX] Login bem-sucedido após criação`);
              
              // Criar perfil na tabela user_profiles
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: newLoginData.user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (profileError) {
                console.error(`❌ [FIX] Erro ao criar perfil:`, profileError.message);
              } else {
                console.log(`✅ [FIX] Perfil criado na tabela user_profiles`);
              }
            }
          }
        } else {
          console.error(`❌ [FIX] Erro no login de ${user.email}:`, loginError.message);
        }
      } else {
        console.log(`✅ [FIX] Usuário ${user.email} existe e login funcionou`);
        console.log(`   ID: ${loginData.user?.id}`);
        
        // Verificar se o perfil existe na tabela user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .single();
        
        if (profileError) {
          console.log(`⚠️ [FIX] Perfil não encontrado na tabela user_profiles, criando...`);
          
          const { error: createProfileError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: loginData.user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (createProfileError) {
            console.error(`❌ [FIX] Erro ao criar perfil:`, createProfileError.message);
          } else {
            console.log(`✅ [FIX] Perfil criado na tabela user_profiles`);
          }
        } else {
          console.log(`✅ [FIX] Perfil já existe na tabela user_profiles`);
        }
      }
    }
    
    // 2. Verificar todos os perfis na tabela user_profiles
    console.log('\n🔍 [FIX] Verificando todos os perfis na tabela user_profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('❌ [FIX] Erro ao buscar perfis:', allProfilesError.message);
    } else {
      console.log('✅ [FIX] Perfis encontrados:');
      allProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.role}) - ID: ${profile.user_id}`);
      });
    }
    
    // 3. Função para excluir usuário (se necessário)
    console.log('\n🗑️ [FIX] Para excluir um usuário, use a função deleteUser()');
    
    console.log('\n🎉 [FIX] Verificação concluída!');
    
  } catch (error) {
    console.error('❌ [FIX] Erro geral:', error);
  }
}

// Função para excluir usuário específico
async function deleteUser(email) {
  try {
    console.log(`🗑️ [DELETE] Excluindo usuário: ${email}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Primeiro, fazer login para obter o ID
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
    
    // Nota: Não é possível excluir usuários do auth.users via cliente anônimo
    // Isso deve ser feito via Supabase Dashboard ou service role key
    console.log(`⚠️ [DELETE] Para excluir completamente do auth.users, use o Supabase Dashboard`);
    
  } catch (error) {
    console.error('❌ [DELETE] Erro geral:', error);
  }
}

// Executar o script
if (process.argv[2] === 'delete' && process.argv[3]) {
  deleteUser(process.argv[3]);
} else {
  fixAuthUsers();
}

module.exports = { fixAuthUsers, deleteUser };
