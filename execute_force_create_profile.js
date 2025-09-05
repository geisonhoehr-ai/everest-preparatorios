const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeForceCreateProfile() {
  try {
    console.log('🚀 Iniciando execução do script force_create_profile.sql...');
    
    // 1. Desabilitar RLS
    console.log('📝 1. Desabilitando RLS...');
    const { error: rlsDisableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsDisableError) {
      console.log('⚠️ Aviso ao desabilitar RLS:', rlsDisableError.message);
    } else {
      console.log('✅ RLS desabilitado com sucesso');
    }

    // 2. Limpar a tabela
    console.log('📝 2. Limpando tabela user_profiles...');
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.log('⚠️ Aviso ao limpar tabela:', deleteError.message);
    } else {
      console.log('✅ Tabela limpa com sucesso');
    }

    // 3. Inserir o perfil diretamente
    console.log('📝 3. Inserindo perfil do professor...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6',
        role: 'teacher',
        display_name: 'Professor Everest'
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir perfil:', insertError);
      return;
    } else {
      console.log('✅ Perfil inserido com sucesso:', insertData);
    }

    // 4. Reabilitar RLS
    console.log('📝 4. Reabilitando RLS...');
    const { error: rlsEnableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsEnableError) {
      console.log('⚠️ Aviso ao reabilitar RLS:', rlsEnableError.message);
    } else {
      console.log('✅ RLS reabilitado com sucesso');
    }

    // 5. Verificar resultado
    console.log('📝 5. Verificando resultado...');
    const { data: profiles, error: selectError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        role,
        display_name,
        created_at
      `);

    if (selectError) {
      console.error('❌ Erro ao verificar resultado:', selectError);
    } else {
      console.log('✅ Perfis encontrados:', profiles);
    }

    // 6. Contar total
    console.log('📝 6. Contando total de perfis...');
    const { count, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao contar perfis:', countError);
    } else {
      console.log('✅ Total de perfis:', count);
    }

    console.log('🎉 Script executado com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
executeForceCreateProfile();

