const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const USER_ID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

async function deleteUserComplete() {
  try {
    console.log('🗑️ [DELETE] Iniciando exclusão completa do usuário...');
    console.log(`👤 [DELETE] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Verificar dependências
    console.log('\n🔍 [DELETE] 1. Verificando dependências...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (profilesError) {
      console.error(`❌ [DELETE] Erro ao buscar perfis: ${profilesError.message}`);
      return;
    }
    
    console.log(`✅ [DELETE] Perfis encontrados: ${profiles.length}`);
    profiles.forEach(profile => {
      console.log(`   - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.display_name || profile.name}`);
    });
    
    // 2. Desabilitar RLS temporariamente
    console.log('\n🔧 [DELETE] 2. Desabilitando RLS...');
    const { error: rlsDisableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsDisableError) {
      console.log(`⚠️ [DELETE] Aviso ao desabilitar RLS: ${rlsDisableError.message}`);
    } else {
      console.log(`✅ [DELETE] RLS desabilitado com sucesso`);
    }
    
    // 3. Excluir dependências
    console.log('\n🗑️ [DELETE] 3. Excluindo dependências...');
    if (profiles.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', USER_ID);
      
      if (deleteError) {
        console.error(`❌ [DELETE] Erro ao excluir perfis: ${deleteError.message}`);
      } else {
        console.log(`✅ [DELETE] Perfis excluídos com sucesso`);
      }
    } else {
      console.log(`✅ [DELETE] Nenhum perfil para excluir`);
    }
    
    // 4. Verificar se foi excluído
    console.log('\n🔍 [DELETE] 4. Verificando exclusão...');
    const { data: remainingProfiles, error: remainingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (remainingError) {
      console.error(`❌ [DELETE] Erro ao verificar perfis restantes: ${remainingError.message}`);
    } else {
      console.log(`✅ [DELETE] Perfis restantes: ${remainingProfiles.length}`);
    }
    
    // 5. Reabilitar RLS
    console.log('\n🔧 [DELETE] 5. Reabilitando RLS...');
    const { error: rlsEnableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsEnableError) {
      console.log(`⚠️ [DELETE] Aviso ao reabilitar RLS: ${rlsEnableError.message}`);
    } else {
      console.log(`✅ [DELETE] RLS reabilitado com sucesso`);
    }
    
    // 6. Tentar excluir do auth.users
    console.log('\n🗑️ [DELETE] 6. Tentando excluir do auth.users...');
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(USER_ID);
      if (deleteAuthError) {
        console.error(`❌ [DELETE] Erro ao excluir do auth: ${deleteAuthError.message}`);
        console.log(`📋 [DELETE] Para excluir do auth.users, use o Supabase Dashboard:`);
        console.log(`   1. Vá para Authentication > Users`);
        console.log(`   2. Encontre o usuário ${USER_ID}`);
        console.log(`   3. Clique em "Delete user"`);
      } else {
        console.log(`✅ [DELETE] Usuário excluído do auth com sucesso`);
      }
    } catch (error) {
      console.log(`⚠️ [DELETE] Não foi possível excluir do auth (normal com anon key)`);
      console.log(`📋 [DELETE] Para excluir do auth.users, use o Supabase Dashboard`);
    }
    
    // 7. Verificar resultado final
    console.log('\n🔍 [DELETE] 7. Verificando resultado final...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (finalError) {
      console.error(`❌ [DELETE] Erro ao verificar resultado final: ${finalError.message}`);
    } else {
      console.log(`✅ [DELETE] Perfis restantes após limpeza: ${finalProfiles.length}`);
      if (finalProfiles.length === 0) {
        console.log(`🎉 [DELETE] Usuário limpo com sucesso!`);
        console.log(`📋 [DELETE] Próximo passo: Excluir do auth.users via Dashboard se necessário`);
      } else {
        console.log(`⚠️ [DELETE] Ainda há perfis restantes`);
      }
    }
    
  } catch (error) {
    console.error('❌ [DELETE] Erro geral:', error);
  }
}

// Função para verificar status
async function checkUserStatus() {
  try {
    console.log('🔍 [STATUS] Verificando status do usuário...');
    console.log(`👤 [STATUS] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verificar perfis
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (profilesError) {
      console.error(`❌ [STATUS] Erro ao buscar perfis: ${profilesError.message}`);
    } else {
      console.log(`✅ [STATUS] Perfis encontrados: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.display_name || profile.name}`);
      });
    }
    
    // Verificar se há outros registros
    console.log('\n🔍 [STATUS] Verificando outras tabelas...');
    const tablesToCheck = ['user_roles', 'flashcards', 'quizzes', 'redacoes', 'provas'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', USER_ID)
          .limit(1);
        
        if (error) {
          console.log(`⚠️ [STATUS] Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ [STATUS] Tabela ${table}: ${data.length} registros`);
        }
      } catch (error) {
        console.log(`⚠️ [STATUS] Tabela ${table}: Não acessível`);
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
  deleteUserComplete();
}

module.exports = { deleteUserComplete, checkUserStatus };
