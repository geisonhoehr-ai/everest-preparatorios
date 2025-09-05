const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function confirmUsers() {
  try {
    console.log('📧 [CONFIRM] Iniciando confirmação de usuários...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456', role: 'student', name: 'Aluno Teste' },
      { email: 'admin@teste.com', password: '123456', role: 'admin', name: 'Admin Teste' },
      { email: 'professor@teste.com', password: '123456', role: 'teacher', name: 'Professor Teste' }
    ];
    
    for (const user of users) {
      console.log(`\n📧 [CONFIRM] Processando usuário: ${user.email}`);
      
      // Tentar fazer login primeiro
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          console.log(`⚠️ [CONFIRM] Email não confirmado para ${user.email}`);
          
          // Tentar reenviar email de confirmação
          console.log(`📤 [CONFIRM] Reenviando email de confirmação...`);
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: user.email
          });
          
          if (resendError) {
            console.error(`❌ [CONFIRM] Erro ao reenviar email:`, resendError.message);
          } else {
            console.log(`✅ [CONFIRM] Email de confirmação reenviado para ${user.email}`);
          }
          
        } else if (loginError.message.includes('Invalid login credentials')) {
          console.log(`❌ [CONFIRM] Usuário ${user.email} não existe, criando...`);
          
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
            console.error(`❌ [CONFIRM] Erro ao criar usuário:`, signUpError.message);
          } else {
            console.log(`✅ [CONFIRM] Usuário ${user.email} criado!`);
            console.log(`   ID: ${signUpData.user?.id}`);
            
            // Aguardar um pouco
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reenviar email de confirmação
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: user.email
            });
            
            if (resendError) {
              console.error(`❌ [CONFIRM] Erro ao reenviar email:`, resendError.message);
            } else {
              console.log(`✅ [CONFIRM] Email de confirmação enviado para ${user.email}`);
            }
          }
        } else {
          console.error(`❌ [CONFIRM] Erro no login:`, loginError.message);
        }
      } else {
        console.log(`✅ [CONFIRM] Usuário ${user.email} já está confirmado e funcionando!`);
        console.log(`   ID: ${loginData.user?.id}`);
        
        // Verificar e criar perfil se necessário
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', loginData.user.id)
          .single();
        
        if (profileError) {
          console.log(`⚠️ [CONFIRM] Perfil não encontrado, criando...`);
          
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
            console.error(`❌ [CONFIRM] Erro ao criar perfil:`, createProfileError.message);
          } else {
            console.log(`✅ [CONFIRM] Perfil criado na tabela user_profiles`);
          }
        } else {
          console.log(`✅ [CONFIRM] Perfil já existe na tabela user_profiles`);
        }
      }
    }
    
    console.log('\n📋 [CONFIRM] Instruções:');
    console.log('1. Verifique seu email (incluindo spam) para os links de confirmação');
    console.log('2. Clique nos links de confirmação para ativar os usuários');
    console.log('3. Após confirmar, execute novamente este script para verificar');
    console.log('4. Se não receber os emails, verifique as configurações do Supabase');
    
  } catch (error) {
    console.error('❌ [CONFIRM] Erro geral:', error);
  }
}

// Função para verificar status dos usuários
async function checkUserStatus() {
  try {
    console.log('🔍 [STATUS] Verificando status dos usuários...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const users = [
      { email: 'aluno@teste.com', password: '123456' },
      { email: 'admin@teste.com', password: '123456' },
      { email: 'professor@teste.com', password: '123456' }
    ];
    
    for (const user of users) {
      console.log(`\n🔍 [STATUS] Verificando: ${user.email}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (loginError) {
        console.log(`❌ [STATUS] ${user.email}: ${loginError.message}`);
      } else {
        console.log(`✅ [STATUS] ${user.email}: Login funcionando!`);
        console.log(`   ID: ${loginData.user?.id}`);
        console.log(`   Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sim' : 'Não'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ [STATUS] Erro geral:', error);
  }
}

// Executar baseado no argumento
if (process.argv[2] === 'status') {
  checkUserStatus();
} else {
  confirmUsers();
}

module.exports = { confirmUsers, checkUserStatus };
