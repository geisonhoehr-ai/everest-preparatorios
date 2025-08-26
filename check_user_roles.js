const { createClient } = require('@/lib/supabase/client');

async function checkUserRoles() {
  try {
    console.log('🔍 [CHECK] Verificando tabela user_roles...');
    
    const supabase = createClient();
    
    // Verificar se a tabela existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_roles');
    
    if (tablesError) {
      console.error('❌ [CHECK] Erro ao verificar tabelas:', tablesError);
      return;
    }
    
    console.log('✅ [CHECK] Tabela user_roles existe:', tables.length > 0);
    
    if (tables.length > 0) {
      // Verificar dados da tabela
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) {
        console.error('❌ [CHECK] Erro ao buscar roles:', rolesError);
        return;
      }
      
      console.log('✅ [CHECK] Roles encontrados:', roles.length);
      console.log('📋 [CHECK] Dados:', roles);
    }
    
  } catch (error) {
    console.error('❌ [CHECK] Erro geral:', error);
  }
}

checkUserRoles();
