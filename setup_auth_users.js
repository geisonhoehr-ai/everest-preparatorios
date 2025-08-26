const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (valores reais do projeto)
const SUPABASE_URL = 'https://hnhzindsfuqnaxosujay.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaHppbmRzZnVxbmF4b3N1amF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzU5NTIsImV4cCI6MjA2ODUxMTk1Mn0.cT7fe1wjee9HfZw_IVD7K_exMqu-LtUxiClCD-sDLyU';

async function setupAuthUsers() {
  try {
    console.log('🔐 [SETUP] Configurando usuários de teste...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Criar usuário aluno
    console.log('👨‍🎓 [SETUP] Criando usuário aluno...');
    const { data: alunoData, error: alunoError } = await supabase.auth.signUp({
      email: 'aluno@teste.com',
      password: '123456',
      options: {
        data: {
          name: 'Aluno Teste'
        }
      }
    });
    
    if (alunoError) {
      if (alunoError.message.includes('already registered')) {
        console.log('✅ [SETUP] Usuário aluno já existe');
      } else {
        console.error('❌ [SETUP] Erro ao criar aluno:', alunoError);
      }
    } else {
      console.log('✅ [SETUP] Usuário aluno criado:', alunoData.user?.id);
    }
    
    // 2. Criar usuário admin
    console.log('👨‍💼 [SETUP] Criando usuário admin...');
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: 'geisonhoehr@gmail.com',
      password: '123456',
      options: {
        data: {
          name: 'Geison Admin'
        }
      }
    });
    
    if (adminError) {
      if (adminError.message.includes('already registered')) {
        console.log('✅ [SETUP] Usuário admin já existe');
      } else {
        console.error('❌ [SETUP] Erro ao criar admin:', adminError);
      }
    } else {
      console.log('✅ [SETUP] Usuário admin criado:', adminData.user?.id);
    }
    
    // 3. Fazer login com aluno para obter o ID
    console.log('🔐 [SETUP] Fazendo login com aluno...');
    const { data: alunoLogin, error: alunoLoginError } = await supabase.auth.signInWithPassword({
      email: 'aluno@teste.com',
      password: '123456'
    });
    
    if (alunoLoginError) {
      console.error('❌ [SETUP] Erro no login do aluno:', alunoLoginError);
      return;
    }
    
    const alunoId = alunoLogin.user.id;
    console.log('✅ [SETUP] ID do aluno:', alunoId);
    
    // 4. Fazer login com admin para obter o ID
    console.log('🔐 [SETUP] Fazendo login com admin...');
    const { data: adminLogin, error: adminLoginError } = await supabase.auth.signInWithPassword({
      email: 'geisonhoehr@gmail.com',
      password: '123456'
    });
    
    if (adminLoginError) {
      console.error('❌ [SETUP] Erro no login do admin:', adminLoginError);
      return;
    }
    
    const adminId = adminLogin.user.id;
    console.log('✅ [SETUP] ID do admin:', adminId);
    
    // 5. Inserir roles na tabela user_roles
    console.log('📝 [SETUP] Inserindo roles na tabela user_roles...');
    
    // Inserir role do aluno
    const { error: alunoRoleError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: alunoId,
        role: 'student',
        created_at: new Date().toISOString()
      });
    
    if (alunoRoleError) {
      console.error('❌ [SETUP] Erro ao inserir role do aluno:', alunoRoleError);
    } else {
      console.log('✅ [SETUP] Role do aluno inserido');
    }
    
    // Inserir role do admin
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .upsert({
        user_uuid: adminId,
        role: 'admin',
        created_at: new Date().toISOString()
      });
    
    if (adminRoleError) {
      console.error('❌ [SETUP] Erro ao inserir role do admin:', adminRoleError);
    } else {
      console.log('✅ [SETUP] Role do admin inserido');
    }
    
    // 6. Verificar se os roles foram inseridos
    console.log('🔍 [SETUP] Verificando roles inseridos...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.error('❌ [SETUP] Erro ao verificar roles:', rolesError);
    } else {
      console.log('✅ [SETUP] Roles na tabela:', roles);
    }
    
    console.log('🎉 [SETUP] Configuração concluída!');
    
  } catch (error) {
    console.error('❌ [SETUP] Erro geral:', error);
  }
}

setupAuthUsers();
