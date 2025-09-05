const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

// Tentar usar service role key se disponível
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function finalAuthFix() {
  try {
    console.log('🔧 [FINAL] Tentando solução final para autenticação...');
    
    // Usar service role se disponível, senão usar anon key
    const supabase = SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log(`🔑 [FINAL] Usando: ${SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}`);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\n👤 [FINAL] Processando: ${user.email}`);
      
      try {
        // Tentar fazer login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            console.log(`🔄 [FINAL] Usuário não existe, criando...`);
            
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
              console.error(`❌ [FINAL] Erro ao criar usuário:`, signUpError.message);
              continue;
            }
            
            console.log(`✅ [FINAL] Usuário criado! ID: ${signUpData.user?.id}`);
            
            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 3000));
            
          } else if (loginError.message.includes('Email not confirmed')) {
            console.log(`⚠️ [FINAL] Email não confirmado para ${user.email}`);
            
            // Se temos service role key, tentar confirmar diretamente
            if (SUPABASE_SERVICE_ROLE_KEY) {
              console.log(`🔧 [FINAL] Tentando confirmar email com service role...`);
              
              // Buscar usuário por email
              const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
              
              if (usersError) {
                console.error(`❌ [FINAL] Erro ao buscar usuários:`, usersError.message);
              } else {
                const targetUser = users.users.find(u => u.email === user.email);
                
                if (targetUser) {
                  console.log(`🔍 [FINAL] Usuário encontrado: ${targetUser.id}`);
                  
                  // Confirmar usuário
                  const { error: confirmError } = await supabase.auth.admin.updateUserById(
                    targetUser.id,
                    { email_confirm: true }
                  );
                  
                  if (confirmError) {
                    console.error(`❌ [FINAL] Erro ao confirmar usuário:`, confirmError.message);
                  } else {
                    console.log(`✅ [FINAL] Usuário confirmado com sucesso!`);
                  }
                } else {
                  console.log(`❌ [FINAL] Usuário não encontrado na lista de usuários`);
                }
              }
            } else {
              console.log(`📧 [FINAL] Para confirmar o email:`);
              console.log(`   1. Vá para o Supabase Dashboard`);
              console.log(`   2. Authentication > Users`);
              console.log(`   3. Encontre ${user.email}`);
              console.log(`   4. Clique em "Confirm user"`);
            }
            continue;
          } else {
            console.error(`❌ [FINAL] Erro no login:`, loginError.message);
            continue;
          }
        } else {
          console.log(`✅ [FINAL] Usuário ${user.email} já existe e está funcionando!`);
          console.log(`   ID: ${loginData.user?.id}`);
        }
        
        // Tentar fazer login novamente para obter o ID
        const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });
        
        if (finalLoginError) {
          console.error(`❌ [FINAL] Erro no login final:`, finalLoginError.message);
          continue;
        }
        
        const userId = finalLoginData.user.id;
        console.log(`🔑 [FINAL] ID do usuário: ${userId}`);
        
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
          console.error(`❌ [FINAL] Erro ao criar perfil:`, profileError.message);
        } else {
          console.log(`✅ [FINAL] Perfil criado/atualizado na tabela user_profiles`);
        }
        
      } catch (error) {
        console.error(`❌ [FINAL] Erro ao processar ${user.email}:`, error.message);
      }
    }
    
    // Verificar todos os perfis
    console.log('\n🔍 [FINAL] Verificando todos os perfis...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('❌ [FINAL] Erro ao buscar perfis:', allProfilesError.message);
    } else {
      console.log('✅ [FINAL] Perfis encontrados:');
      if (allProfiles.length === 0) {
        console.log('   Nenhum perfil encontrado');
      } else {
        allProfiles.forEach(profile => {
          console.log(`   - ${profile.email} (${profile.role}) - ID: ${profile.user_id}`);
        });
      }
    }
    
    // Testar logins finais
    console.log('\n🧪 [FINAL] Testando logins finais...');
    await testFinalLogins();
    
  } catch (error) {
    console.error('❌ [FINAL] Erro geral:', error);
  }
}

async function testFinalLogins() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student' },
      { email: 'admin@teste.com', password: '123456', role: 'admin' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher' }
    ];
    
    for (const user of users) {
      console.log(`\n🧪 [FINAL] Testando: ${user.email}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        console.log(`❌ [FINAL] ${user.email}: ${loginError.message}`);
      } else {
        console.log(`✅ [FINAL] ${user.email}: Login funcionando!`);
        console.log(`   ID: ${loginData.user?.id}`);
        console.log(`   Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .single();
        
        if (profileError) {
          console.log(`⚠️ [FINAL] Perfil não encontrado na tabela user_profiles`);
        } else {
          console.log(`✅ [FINAL] Perfil encontrado: ${profile.role}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ [FINAL] Erro ao testar logins:', error);
  }
}

// Executar
finalAuthFix();

module.exports = { finalAuthFix, testFinalLogins };
