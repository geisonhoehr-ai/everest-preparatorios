const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://wruvehhfzkvmfyhxzmwo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ';

const USER_ID = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

async function fixCoursesConstraint() {
  try {
    console.log('🔧 [FIX] Resolvendo constraint da tabela courses...');
    console.log(`👤 [FIX] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Verificar dependências na tabela courses
    console.log('\n🔍 [FIX] 1. Verificando dependências na tabela courses...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', USER_ID);
    
    if (coursesError) {
      console.error(`❌ [FIX] Erro ao buscar courses: ${coursesError.message}`);
      console.log(`📋 [FIX] A tabela courses pode não estar acessível via API`);
      console.log(`📋 [FIX] Execute o script SQL fix-courses-constraint.sql no Supabase Dashboard`);
      return;
    } else {
      console.log(`✅ [FIX] Courses encontrados: ${courses.length}`);
      courses.forEach(course => {
        console.log(`   - ID: ${course.id}, Title: ${course.title}, Teacher ID: ${course.teacher_id}`);
      });
    }
    
    // 2. Verificar dependências na tabela user_profiles
    console.log('\n🔍 [FIX] 2. Verificando dependências na tabela user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (profilesError) {
      console.error(`❌ [FIX] Erro ao buscar profiles: ${profilesError.message}`);
    } else {
      console.log(`✅ [FIX] Profiles encontrados: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}, Name: ${profile.display_name || profile.name}`);
      });
    }
    
    // 3. Atualizar courses para remover a referência
    console.log('\n🔧 [FIX] 3. Atualizando courses para remover referência...');
    if (courses && courses.length > 0) {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ teacher_id: null })
        .eq('teacher_id', USER_ID);
      
      if (updateError) {
        console.error(`❌ [FIX] Erro ao atualizar courses: ${updateError.message}`);
        console.log(`📋 [FIX] Execute o script SQL fix-courses-constraint.sql no Supabase Dashboard`);
        return;
      } else {
        console.log(`✅ [FIX] Courses atualizados com sucesso`);
      }
    } else {
      console.log(`✅ [FIX] Nenhum course para atualizar`);
    }
    
    // 4. Verificar se a atualização funcionou
    console.log('\n🔍 [FIX] 4. Verificando se a atualização funcionou...');
    const { data: updatedCourses, error: updatedCoursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', USER_ID);
    
    if (updatedCoursesError) {
      console.error(`❌ [FIX] Erro ao verificar courses atualizados: ${updatedCoursesError.message}`);
    } else {
      console.log(`✅ [FIX] Courses restantes com teacher_id: ${updatedCourses.length}`);
    }
    
    // 5. Excluir dependências na tabela user_profiles
    console.log('\n🗑️ [FIX] 5. Excluindo dependências na tabela user_profiles...');
    if (profiles && profiles.length > 0) {
      const { error: deleteProfilesError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', USER_ID);
      
      if (deleteProfilesError) {
        console.error(`❌ [FIX] Erro ao excluir profiles: ${deleteProfilesError.message}`);
      } else {
        console.log(`✅ [FIX] Profiles excluídos com sucesso`);
      }
    } else {
      console.log(`✅ [FIX] Nenhum profile para excluir`);
    }
    
    // 6. Verificar se não há mais dependências
    console.log('\n🔍 [FIX] 6. Verificando se não há mais dependências...');
    const { data: finalCourses, error: finalCoursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', USER_ID);
    
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (finalCoursesError) {
      console.error(`❌ [FIX] Erro ao verificar courses finais: ${finalCoursesError.message}`);
    } else {
      console.log(`✅ [FIX] Courses restantes: ${finalCourses.length}`);
    }
    
    if (finalProfilesError) {
      console.error(`❌ [FIX] Erro ao verificar profiles finais: ${finalProfilesError.message}`);
    } else {
      console.log(`✅ [FIX] Profiles restantes: ${finalProfiles.length}`);
    }
    
    // 7. Verificar se está seguro para excluir
    if (finalCourses.length === 0 && finalProfiles.length === 0) {
      console.log('\n✅ [FIX] Todas as dependências foram removidas!');
      console.log(`📋 [FIX] Agora você pode excluir o usuário do Supabase Dashboard:`);
      console.log(`   1. Vá para Authentication > Users`);
      console.log(`   2. Encontre o usuário ${USER_ID}`);
      console.log(`   3. Clique em "Delete user"`);
      console.log(`   4. O erro 500 não deve mais aparecer`);
    } else {
      console.log('\n⚠️ [FIX] Ainda há dependências restantes:');
      console.log(`   - Courses: ${finalCourses.length}`);
      console.log(`   - Profiles: ${finalProfiles.length}`);
      console.log(`📋 [FIX] Execute o script SQL fix-courses-constraint.sql no Supabase Dashboard`);
    }
    
  } catch (error) {
    console.error('❌ [FIX] Erro geral:', error);
    console.log(`📋 [FIX] Execute o script SQL fix-courses-constraint.sql no Supabase Dashboard`);
  }
}

// Função para verificar status
async function checkCoursesStatus() {
  try {
    console.log('🔍 [STATUS] Verificando status das dependências...');
    console.log(`👤 [STATUS] User ID: ${USER_ID}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verificar courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', USER_ID);
    
    if (coursesError) {
      console.error(`❌ [STATUS] Erro ao buscar courses: ${coursesError.message}`);
      console.log(`📋 [STATUS] Execute o script SQL fix-courses-constraint.sql no Supabase Dashboard`);
    } else {
      console.log(`✅ [STATUS] Courses com teacher_id: ${courses.length}`);
      courses.forEach(course => {
        console.log(`   - ID: ${course.id}, Title: ${course.title}`);
      });
    }
    
    // Verificar profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (profilesError) {
      console.error(`❌ [STATUS] Erro ao buscar profiles: ${profilesError.message}`);
    } else {
      console.log(`✅ [STATUS] Profiles com user_id: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ [STATUS] Erro geral:', error);
  }
}

// Executar baseado no argumento
if (process.argv[2] === 'status') {
  checkCoursesStatus();
} else {
  fixCoursesConstraint();
}

module.exports = { fixCoursesConstraint, checkCoursesStatus };
