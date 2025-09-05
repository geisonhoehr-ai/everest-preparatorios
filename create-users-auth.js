const { createClient } = require('@supabase/supabase-js');

// Configuracao do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function createUsersAuth() {
  try {
    console.log('Criando usuarios de teste no auth...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\nCriando usuario: ${user.email}`);
      
      try {
        // Tentar fazer login primeiro para ver se ja existe
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            console.log(`Usuario nao existe, criando...`);
            
            // Criar usuario
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
              console.error(`Erro ao criar usuario: ${signUpError.message}`);
            } else {
              console.log(`Usuario criado com sucesso! ID: ${signUpData.user?.id}`);
              
              // Aguardar processamento
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Criar perfil na tabela user_profiles
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: signUpData.user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (profileError) {
                console.error(`Erro ao criar perfil: ${profileError.message}`);
              } else {
                console.log(`Perfil criado na tabela user_profiles`);
              }
            }
          } else if (loginError.message.includes('Email not confirmed')) {
            console.log(`Usuario existe mas email nao confirmado`);
            console.log(`Para confirmar: va para o Supabase Dashboard > Authentication > Users`);
            console.log(`Encontre o usuario ${user.email} e clique em "Confirm user"`);
          } else {
            console.error(`Erro no login: ${loginError.message}`);
          }
        } else {
          console.log(`Usuario ja existe e esta funcionando! ID: ${loginData.user?.id}`);
          
          // Verificar se o perfil existe
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', loginData.user.id)
            .single();
          
          if (profileError) {
            console.log(`Perfil nao encontrado, criando...`);
            
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
              console.error(`Erro ao criar perfil: ${createProfileError.message}`);
            } else {
              console.log(`Perfil criado na tabela user_profiles`);
            }
          } else {
            console.log(`Perfil ja existe na tabela user_profiles`);
          }
        }
        
      } catch (error) {
        console.error(`Erro ao processar ${user.email}: ${error.message}`);
      }
    }
    
    // Verificar todos os perfis criados
    console.log('\nVerificando todos os perfis...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('Erro ao buscar perfis:', allProfilesError.message);
    } else {
      console.log('Perfis encontrados:');
      if (allProfiles.length === 0) {
        console.log('Nenhum perfil encontrado');
      } else {
        allProfiles.forEach(profile => {
          console.log(`- ${profile.email} (${profile.role}) - ID: ${profile.user_id}`);
        });
      }
    }
    
    console.log('\nTestando logins...');
    await testLogins();
    
  } catch (error) {
    console.error('Erro geral:', error);
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
      console.log(`\nTestando: ${user.email}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        console.log(`Falha: ${loginError.message}`);
      } else {
        console.log(`Sucesso! ID: ${loginData.user?.id}`);
        console.log(`Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sim' : 'Nao'}`);
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .single();
        
        if (profileError) {
          console.log(`Perfil nao encontrado na tabela user_profiles`);
        } else {
          console.log(`Perfil encontrado: ${profile.role}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Erro ao testar logins:', error);
  }
}

// Executar
createUsersAuth();

module.exports = { createUsersAuth, testLogins };
