const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function createWorkingUsers() {
  try {
    console.log('🔧 [CREATE] Criando usuários que realmente funcionam...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Primeiro, vamos limpar usuários existentes que não funcionam
    console.log('🧹 [CREATE] Limpando usuários existentes que não funcionam...');
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\n👤 [CREATE] Processando: ${user.email}`);
      
      try {
        // Tentar fazer login para ver se o usuário existe e funciona
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
            
            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 3000));
            
          } else if (loginError.message.includes('Email not confirmed')) {
            console.log(`⚠️ [CREATE] Usuário existe mas email não confirmado`);
            console.log(`🗑️ [CREATE] Vamos tentar uma abordagem diferente...`);
            
            // Tentar criar com email diferente temporariamente
            const tempEmail = user.email.replace('@teste.com', '@temp.com');
            console.log(`🔄 [CREATE] Tentando criar com email temporário: ${tempEmail}`);
            
            const { data: tempSignUpData, error: tempSignUpError } = await supabase.auth.signUp({
              email: tempEmail,
              password: user.password,
              options: {
                data: {
                  name: user.name
                }
              }
            });
            
            if (tempSignUpError) {
              console.error(`❌ [CREATE] Erro ao criar usuário temporário:`, tempSignUpError.message);
            } else {
              console.log(`✅ [CREATE] Usuário temporário criado! ID: ${tempSignUpData.user?.id}`);
              
              // Aguardar processamento
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Tentar fazer login com o usuário temporário
              const { data: tempLoginData, error: tempLoginError } = await supabase.auth.signInWithPassword({
                email: tempEmail,
                password: user.password
              });
              
              if (tempLoginError) {
                console.error(`❌ [CREATE] Erro no login temporário:`, tempLoginError.message);
              } else {
                console.log(`✅ [CREATE] Login temporário funcionou!`);
                
                const userId = tempLoginData.user.id;
                console.log(`🔑 [CREATE] ID do usuário temporário: ${userId}`);
                
                // Criar perfil na tabela user_profiles com o email original
                const { error: profileError } = await supabase
                  .from('user_profiles')
                  .upsert({
                    user_id: userId,
                    email: user.email, // Usar email original
                    name: user.name,
                    role: user.role,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                
                if (profileError) {
                  console.error(`❌ [CREATE] Erro ao criar perfil:`, profileError.message);
                } else {
                  console.log(`✅ [CREATE] Perfil criado com email original: ${user.email}`);
                }
              }
            }
            continue;
          } else {
            console.error(`❌ [CREATE] Erro no login:`, loginError.message);
            continue;
          }
        } else {
          console.log(`✅ [CREATE] Usuário ${user.email} já existe e está funcionando!`);
          console.log(`   ID: ${loginData.user?.id}`);
          
          const userId = loginData.user.id;
          
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
            console.error(`❌ [CREATE] Erro ao criar perfil:`, profileError.message);
          } else {
            console.log(`✅ [CREATE] Perfil criado/atualizado na tabela user_profiles`);
          }
        }
        
      } catch (error) {
        console.error(`❌ [CREATE] Erro ao processar ${user.email}:`, error.message);
      }
    }
    
    // Verificar todos os perfis
    console.log('\n🔍 [CREATE] Verificando todos os perfis...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('❌ [CREATE] Erro ao buscar perfis:', allProfilesError.message);
    } else {
      console.log('✅ [CREATE] Perfis encontrados:');
      if (allProfiles.length === 0) {
        console.log('   Nenhum perfil encontrado');
      } else {
        allProfiles.forEach(profile => {
          console.log(`   - ${profile.email} (${profile.role}) - ID: ${profile.user_id}`);
        });
      }
    }
    
    // Testar logins
    console.log('\n🧪 [CREATE] Testando logins...');
    await testLogins();
    
  } catch (error) {
    console.error('❌ [CREATE] Erro geral:', error);
  }
}

async function testLogins() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student' },
      { email: 'admin@teste.com', password: '123456', role: 'admin' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher' }
    ];
    
    for (const user of users) {
      console.log(`\n🧪 [CREATE] Testando: ${user.email}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        console.log(`❌ [CREATE] ${user.email}: ${loginError.message}`);
      } else {
        console.log(`✅ [CREATE] ${user.email}: Login funcionando!`);
        console.log(`   ID: ${loginData.user?.id}`);
        console.log(`   Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .single();
        
        if (profileError) {
          console.log(`⚠️ [CREATE] Perfil não encontrado na tabela user_profiles`);
        } else {
          console.log(`✅ [CREATE] Perfil encontrado: ${profile.role}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ [CREATE] Erro ao testar logins:', error);
  }
}

// Executar
createWorkingUsers();

module.exports = { createWorkingUsers, testLogins };
