const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const USER_ID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

async function fixAllConstraints() {
  try {
    console.log('🔧 [FIX] Resolvendo todas as constraints de foreign key...');
    console.log(`👤 [FIX] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lista de tabelas e suas colunas que podem ter dependências
    const tablesToCheck = [
      { table: 'courses', column: 'teacher_id' },
      { table: 'temas_redacao', column: 'criado_por' },
      { table: 'user_profiles', column: 'user_id' }
    ];
    
    // 1. Verificar todas as dependências
    console.log('\n🔍 [FIX] 1. Verificando todas as dependências...');
    const dependencies = {};
    
    for (const { table, column } of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(column, USER_ID);
        
        if (error) {
          console.log(`⚠️ [FIX] Tabela ${table}: ${error.message}`);
          dependencies[table] = { error: error.message, data: [] };
        } else {
          console.log(`✅ [FIX] Tabela ${table}: ${data.length} registros encontrados`);
          dependencies[table] = { error: null, data: data };
          
          data.forEach(record => {
            console.log(`   - ID: ${record.id}, ${column}: ${record[column]}`);
            if (record.title) console.log(`     Title: ${record.title}`);
            if (record.titulo) console.log(`     Titulo: ${record.titulo}`);
          });
        }
      } catch (error) {
        console.log(`❌ [FIX] Erro ao verificar ${table}: ${error.message}`);
        dependencies[table] = { error: error.message, data: [] };
      }
    }
    
    // 2. Resolver dependências
    console.log('\n🔧 [FIX] 2. Resolvendo dependências...');
    
    // Atualizar courses
    if (dependencies.courses && !dependencies.courses.error && dependencies.courses.data.length > 0) {
      console.log('🔧 [FIX] Atualizando courses...');
      const { error: updateCoursesError } = await supabase
        .from('courses')
        .update({ teacher_id: null })
        .eq('teacher_id', USER_ID);
      
      if (updateCoursesError) {
        console.error(`❌ [FIX] Erro ao atualizar courses: ${updateCoursesError.message}`);
      } else {
        console.log(`✅ [FIX] Courses atualizados com sucesso`);
      }
    }
    
    // Atualizar temas_redacao
    if (dependencies.temas_redacao && !dependencies.temas_redacao.error && dependencies.temas_redacao.data.length > 0) {
      console.log('🔧 [FIX] Atualizando temas_redacao...');
      const { error: updateTemasError } = await supabase
        .from('temas_redacao')
        .update({ criado_por: null })
        .eq('criado_por', USER_ID);
      
      if (updateTemasError) {
        console.error(`❌ [FIX] Erro ao atualizar temas_redacao: ${updateTemasError.message}`);
      } else {
        console.log(`✅ [FIX] Temas_redacao atualizados com sucesso`);
      }
    }
    
    // Excluir user_profiles
    if (dependencies.user_profiles && !dependencies.user_profiles.error && dependencies.user_profiles.data.length > 0) {
      console.log('🗑️ [FIX] Excluindo user_profiles...');
      const { error: deleteProfilesError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', USER_ID);
      
      if (deleteProfilesError) {
        console.error(`❌ [FIX] Erro ao excluir user_profiles: ${deleteProfilesError.message}`);
      } else {
        console.log(`✅ [FIX] User_profiles excluídos com sucesso`);
      }
    }
    
    // 3. Verificar se as atualizações funcionaram
    console.log('\n🔍 [FIX] 3. Verificando se as atualizações funcionaram...');
    const finalDependencies = {};
    
    for (const { table, column } of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(column, USER_ID);
        
        if (error) {
          console.log(`⚠️ [FIX] Erro ao verificar ${table}: ${error.message}`);
          finalDependencies[table] = { error: error.message, data: [] };
        } else {
          console.log(`✅ [FIX] ${table} restantes: ${data.length}`);
          finalDependencies[table] = { error: null, data: data };
        }
      } catch (error) {
        console.log(`❌ [FIX] Erro ao verificar ${table}: ${error.message}`);
        finalDependencies[table] = { error: error.message, data: [] };
      }
    }
    
    // 4. Verificar se está seguro para excluir
    const totalRemaining = Object.values(finalDependencies).reduce((sum, dep) => {
      return sum + (dep.data ? dep.data.length : 0);
    }, 0);
    
    if (totalRemaining === 0) {
      console.log('\n✅ [FIX] Todas as dependências foram removidas!');
      console.log(`📋 [FIX] Agora você pode excluir o usuário do Supabase Dashboard:`);
      console.log(`   1. Vá para Authentication > Users`);
      console.log(`   2. Encontre o usuário ${USER_ID}`);
      console.log(`   3. Clique em "Delete user"`);
      console.log(`   4. Os erros 500 não devem mais aparecer`);
    } else {
      console.log('\n⚠️ [FIX] Ainda há dependências restantes:');
      Object.entries(finalDependencies).forEach(([table, dep]) => {
        if (dep.data && dep.data.length > 0) {
          console.log(`   - ${table}: ${dep.data.length} registros`);
        }
      });
      console.log(`📋 [FIX] Execute o script SQL fix-all-constraints.sql no Supabase Dashboard`);
    }
    
  } catch (error) {
    console.error('❌ [FIX] Erro geral:', error);
    console.log(`📋 [FIX] Execute o script SQL fix-all-constraints.sql no Supabase Dashboard`);
  }
}

// Função para verificar status
async function checkAllConstraintsStatus() {
  try {
    console.log('🔍 [STATUS] Verificando status de todas as dependências...');
    console.log(`👤 [STATUS] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const tablesToCheck = [
      { table: 'courses', column: 'teacher_id' },
      { table: 'temas_redacao', column: 'criado_por' },
      { table: 'user_profiles', column: 'user_id' }
    ];
    
    for (const { table, column } of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(column, USER_ID);
        
        if (error) {
          console.log(`❌ [STATUS] ${table}: ${error.message}`);
        } else {
          console.log(`✅ [STATUS] ${table}: ${data.length} registros`);
          data.forEach(record => {
            console.log(`   - ID: ${record.id}, ${column}: ${record[column]}`);
          });
        }
      } catch (error) {
        console.log(`❌ [STATUS] ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ [STATUS] Erro geral:', error);
  }
}

// Executar baseado no argumento
if (process.argv[2] === 'status') {
  checkAllConstraintsStatus();
} else {
  fixAllConstraints();
}

module.exports = { fixAllConstraints, checkAllConstraintsStatus };
