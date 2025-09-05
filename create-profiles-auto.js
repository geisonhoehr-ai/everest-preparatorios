const { createClient } = require('@supabase/supabase-js');

// Configuracao do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

async function createProfilesAuto() {
  try {
    console.log('Criando perfis de usuarios automaticamente...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Buscar usuarios existentes no auth.users
    console.log('\nBuscando usuarios no auth.users...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .in('email', ['aluno@teste.com', 'admin@teste.com', 'professor@teste.com']);
    
    if (authError) {
      console.error('Erro ao buscar usuarios no auth:', authError.message);
      console.log('Tentando abordagem alternativa...');
      
      // Tentar buscar via RPC se disponivel
      const { data: rpcUsers, error: rpcError } = await supabase.rpc('get_auth_users');
      if (rpcError) {
        console.error('Erro ao buscar usuarios via RPC:', rpcError.message);
        return;
      }
      console.log('Usuarios encontrados via RPC:', rpcUsers);
    } else {
      console.log('Usuarios encontrados no auth:', authUsers);
    }
    
    // 2. Criar perfis na tabela user_profiles
    const usersToCreate = [
      { email: 'aluno@teste.com', name: 'Aluno Teste', role: 'student' },
      { email: 'admin@teste.com', name: 'Admin Teste', role: 'admin' },
      { email: 'professor@teste.com', name: 'Professor Teste', role: 'teacher' }
    ];
    
    console.log('\nCriando perfis na tabela user_profiles...');
    
    for (const user of usersToCreate) {
      console.log(`\nProcessando: ${user.email}`);
      
      // Tentar encontrar o ID do usuario
      let userId = null;
      
      if (authUsers && authUsers.length > 0) {
        const foundUser = authUsers.find(u => u.email === user.email);
        if (foundUser) {
          userId = foundUser.id;
          console.log(`ID encontrado: ${userId}`);
        }
      }
      
      if (!userId) {
        // Se nao encontrou o ID, criar com ID temporario
        userId = `${user.role}-${Date.now()}`;
        console.log(`ID temporario criado: ${userId}`);
      }
      
      // Inserir perfil
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (profileError) {
        console.error(`Erro ao criar perfil para ${user.email}:`, profileError.message);
      } else {
        console.log(`Perfil criado com sucesso para ${user.email}`);
        console.log(`ID: ${profileData[0]?.id}`);
      }
    }
    
    // 3. Verificar perfis criados
    console.log('\nVerificando perfis criados...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('email', ['aluno@teste.com', 'admin@teste.com', 'professor@teste.com'])
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('Erro ao verificar perfis:', allProfilesError.message);
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
    
    // 4. Gerar script SQL para referencia
    console.log('\nScript SQL gerado para referencia:');
    console.log('-- Execute este script no SQL Editor do Supabase Dashboard');
    console.log('INSERT INTO user_profiles (user_id, email, name, role, created_at, updated_at) VALUES');
    
    if (allProfiles && allProfiles.length > 0) {
      allProfiles.forEach((profile, index) => {
        const isLast = index === allProfiles.length - 1;
        console.log(`    ('${profile.user_id}', '${profile.email}', '${profile.name}', '${profile.role}', NOW(), NOW())${isLast ? ';' : ','}`);
      });
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar
createProfilesAuto();

module.exports = { createProfilesAuto };
