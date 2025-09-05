const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const USER_ID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

async function checkTables() {
  try {
    console.log('🔍 [CHECK] Verificando tabelas disponíveis...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lista de possíveis nomes de tabelas
    const possibleTables = [
      'courses',
      'course',
      'turmas',
      'turma',
      'classes',
      'class',
      'disciplinas',
      'disciplina',
      'materias',
      'materia',
      'user_profiles',
      'user_roles',
      'flashcards',
      'quizzes',
      'redacoes',
      'provas'
    ];
    
    console.log('\n📋 [CHECK] Testando tabelas...');
    
    for (const table of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ [CHECK] Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ [CHECK] Tabela ${table}: Existe (${data.length} registros de teste)`);
          
          // Se for uma tabela que pode ter teacher_id, verificar
          if (table.includes('course') || table.includes('turma') || table.includes('class') || table.includes('disciplina') || table.includes('materia')) {
            try {
              const { data: teacherData, error: teacherError } = await supabase
                .from(table)
                .select('*')
                .eq('teacher_id', USER_ID);
              
              if (teacherError) {
                console.log(`   ⚠️ [CHECK] Erro ao verificar teacher_id: ${teacherError.message}`);
              } else {
                console.log(`   👨‍🏫 [CHECK] Registros com teacher_id: ${teacherData.length}`);
                teacherData.forEach(record => {
                  console.log(`      - ID: ${record.id}, Title: ${record.title || record.name || 'N/A'}`);
                });
              }
            } catch (error) {
              console.log(`   ⚠️ [CHECK] Erro ao verificar teacher_id: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ [CHECK] Tabela ${table}: Erro geral - ${error.message}`);
      }
    }
    
    // Verificar especificamente user_profiles
    console.log('\n👤 [CHECK] Verificando user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (profilesError) {
      console.error(`❌ [CHECK] Erro ao buscar profiles: ${profilesError.message}`);
    } else {
      console.log(`✅ [CHECK] Profiles encontrados: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.display_name || profile.name || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ [CHECK] Erro geral:', error);
  }
}

// Executar
checkTables();

module.exports = { checkTables };
