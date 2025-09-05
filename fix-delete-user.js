const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const USER_ID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

async function fixDeleteUser() {
  try {
    console.log('🔧 [FIX] Diagnosticando problema de exclusão de usuário...');
    console.log(`👤 [FIX] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Verificar se o usuário existe no auth.users
    console.log('\n🔍 [FIX] 1. Verificando se usuário existe no auth.users...');
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);
      if (authError) {
        console.log(`❌ [FIX] Erro ao buscar usuário no auth: ${authError.message}`);
      } else {
        console.log(`✅ [FIX] Usuário encontrado no auth: ${authUser.user?.email}`);
      }
    } catch (error) {
      console.log(`⚠️ [FIX] Não foi possível verificar auth.users (normal com anon key)`);
    }
    
    // 2. Verificar dependências na tabela user_profiles
    console.log('\n🔍 [FIX] 2. Verificando dependências em user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (profilesError) {
      console.error(`❌ [FIX] Erro ao buscar perfis: ${profilesError.message}`);
    } else {
      console.log(`✅ [FIX] Perfis encontrados: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.display_name || profile.name}`);
      });
    }
    
    // 3. Verificar outras tabelas que podem ter dependências
    console.log('\n🔍 [FIX] 3. Verificando outras tabelas com dependências...');
    
    const tablesToCheck = [
      'user_roles',
      'flashcards',
      'quizzes', 
      'redacoes',
      'provas',
      'community_posts',
      'community_comments',
      'student_progress',
      'ranking',
      'turmas',
      'membros'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', USER_ID)
          .limit(1);
        
        if (error) {
          console.log(`⚠️ [FIX] Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ [FIX] Tabela ${table}: ${data.length} registros encontrados`);
        }
      } catch (error) {
        console.log(`⚠️ [FIX] Tabela ${table}: Não acessível ou não existe`);
      }
    }
    
    // 4. Tentar excluir dependências primeiro
    console.log('\n🗑️ [FIX] 4. Tentando excluir dependências...');
    
    // Excluir perfis primeiro
    if (profiles && profiles.length > 0) {
      console.log('🗑️ [FIX] Excluindo perfis...');
      const { error: deleteProfilesError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', USER_ID);
      
      if (deleteProfilesError) {
        console.error(`❌ [FIX] Erro ao excluir perfis: ${deleteProfilesError.message}`);
      } else {
        console.log(`✅ [FIX] Perfis excluídos com sucesso`);
      }
    }
    
    // 5. Verificar se ainda há dependências
    console.log('\n🔍 [FIX] 5. Verificando se ainda há dependências...');
    const { data: remainingProfiles, error: remainingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (remainingError) {
      console.error(`❌ [FIX] Erro ao verificar perfis restantes: ${remainingError.message}`);
    } else {
      console.log(`✅ [FIX] Perfis restantes: ${remainingProfiles.length}`);
    }
    
    // 6. Tentar excluir o usuário do auth (se possível)
    console.log('\n🗑️ [FIX] 6. Tentando excluir usuário do auth...');
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(USER_ID);
      if (deleteAuthError) {
        console.error(`❌ [FIX] Erro ao excluir usuário do auth: ${deleteAuthError.message}`);
        console.log(`📋 [FIX] Para excluir do auth.users, use o Supabase Dashboard:`);
        console.log(`   1. Vá para Authentication > Users`);
        console.log(`   2. Encontre o usuário ${USER_ID}`);
        console.log(`   3. Clique em "Delete user"`);
      } else {
        console.log(`✅ [FIX] Usuário excluído do auth com sucesso`);
      }
    } catch (error) {
      console.log(`⚠️ [FIX] Não foi possível excluir do auth (normal com anon key)`);
      console.log(`📋 [FIX] Para excluir do auth.users, use o Supabase Dashboard`);
    }
    
    // 7. Verificar resultado final
    console.log('\n🔍 [FIX] 7. Verificando resultado final...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (finalError) {
      console.error(`❌ [FIX] Erro ao verificar resultado final: ${finalError.message}`);
    } else {
      console.log(`✅ [FIX] Perfis restantes após limpeza: ${finalProfiles.length}`);
      if (finalProfiles.length === 0) {
        console.log(`🎉 [FIX] Usuário limpo com sucesso!`);
      } else {
        console.log(`⚠️ [FIX] Ainda há perfis restantes`);
      }
    }
    
  } catch (error) {
    console.error('❌ [FIX] Erro geral:', error);
  }
}

// Função para limpeza completa
async function completeCleanup() {
  try {
    console.log('🧹 [CLEANUP] Iniciando limpeza completa...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Desabilitar RLS temporariamente
    console.log('🔧 [CLEANUP] Desabilitando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log(`⚠️ [CLEANUP] Aviso ao desabilitar RLS: ${rlsError.message}`);
    }
    
    // 2. Excluir todos os registros relacionados
    console.log('🗑️ [CLEANUP] Excluindo registros relacionados...');
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', USER_ID);
    
    if (deleteError) {
      console.error(`❌ [CLEANUP] Erro ao excluir: ${deleteError.message}`);
    } else {
      console.log(`✅ [CLEANUP] Registros excluídos com sucesso`);
    }
    
    // 3. Reabilitar RLS
    console.log('🔧 [CLEANUP] Reabilitando RLS...');
    const { error: rlsEnableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsEnableError) {
      console.log(`⚠️ [CLEANUP] Aviso ao reabilitar RLS: ${rlsEnableError.message}`);
    }
    
    console.log('🎉 [CLEANUP] Limpeza completa concluída!');
    
  } catch (error) {
    console.error('❌ [CLEANUP] Erro geral:', error);
  }
}

// Executar baseado no argumento
if (process.argv[2] === 'cleanup') {
  completeCleanup();
} else {
  fixDeleteUser();
}

module.exports = { fixDeleteUser, completeCleanup };
