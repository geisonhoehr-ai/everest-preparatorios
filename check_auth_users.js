const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://hnhzindsfuqnaxosujay.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU';

async function checkAuthUsers() {
  try {
    console.log('🔍 [CHECK] Verificando usuários no Supabase Auth...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Tentar fazer login com o aluno
    console.log('🔐 [CHECK] Testando login do aluno...');
    const { data: alunoLogin, error: alunoLoginError } = await supabase.auth.signInWithPassword({
      email: 'aluno@teste.com',
      password: '123456'
    });
    
    if (alunoLoginError) {
      console.error('❌ [CHECK] Erro no login do aluno:', alunoLoginError.message);
      
      // Se for erro de credenciais inválidas, tentar criar o usuário
      if (alunoLoginError.message.includes('Invalid login credentials')) {
        console.log('🔄 [CHECK] Tentando criar usuário aluno...');
        
        const { data: alunoSignUp, error: alunoSignUpError } = await supabase.auth.signUp({
          email: 'aluno@teste.com',
          password: '123456',
          options: {
            data: {
              name: 'Aluno Teste'
            }
          }
        });
        
        if (alunoSignUpError) {
          console.error('❌ [CHECK] Erro ao criar aluno:', alunoSignUpError.message);
        } else {
          console.log('✅ [CHECK] Usuário aluno criado:', alunoSignUp.user?.id);
          
          // Fazer login novamente
          const { data: novoLogin, error: novoLoginError } = await supabase.auth.signInWithPassword({
            email: 'aluno@teste.com',
            password: '123456'
          });
          
          if (novoLoginError) {
            console.error('❌ [CHECK] Erro no novo login:', novoLoginError.message);
          } else {
            console.log('✅ [CHECK] Login bem-sucedido após criação:', novoLogin.user?.id);
          }
        }
      }
    } else {
      console.log('✅ [CHECK] Login do aluno funcionou:', alunoLogin.user?.id);
    }
    
    // 2. Verificar se o usuário está na tabela user_roles
    console.log('🔍 [CHECK] Verificando tabela user_roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('email', 'aluno@teste.com');
    
    if (rolesError) {
      console.error('❌ [CHECK] Erro ao verificar user_roles:', rolesError.message);
    } else {
      console.log('✅ [CHECK] Roles encontrados:', roles);
    }
    
    // 3. Tentar fazer login com admin
    console.log('🔐 [CHECK] Testando login do admin...');
    const { data: adminLogin, error: adminLoginError } = await supabase.auth.signInWithPassword({
      email: 'geisonhoehr@gmail.com',
      password: '123456'
    });
    
    if (adminLoginError) {
      console.error('❌ [CHECK] Erro no login do admin:', adminLoginError.message);
    } else {
      console.log('✅ [CHECK] Login do admin funcionou:', adminLogin.user?.id);
    }
    
  } catch (error) {
    console.error('❌ [CHECK] Erro geral:', error);
  }
}

checkAuthUsers();
