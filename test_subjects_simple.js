require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testSubjects() {
  console.log('🔍 Testando conexão com Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
  console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ Não configurada');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado');
    
    // Testar tabela subjects
    console.log('🔍 Testando tabela subjects...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');
    
    if (subjectsError) {
      console.error('❌ Erro ao buscar subjects:', subjectsError);
      return;
    }
    
    console.log('✅ Subjects encontrados:', subjects?.length || 0);
    if (subjects && subjects.length > 0) {
      subjects.forEach(subject => {
        console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`);
      });
    } else {
      console.log('⚠️ Nenhum subject encontrado na tabela');
    }
    
    // Testar tabela topics
    console.log('🔍 Testando tabela topics...');
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*');
    
    if (topicsError) {
      console.error('❌ Erro ao buscar topics:', topicsError);
      return;
    }
    
    console.log('✅ Topics encontrados:', topics?.length || 0);
    if (topics && topics.length > 0) {
      topics.forEach(topic => {
        console.log(`  - ID: ${topic.id}, Nome: ${topic.name}, Subject ID: ${topic.subject_id}`);
      });
    } else {
      console.log('⚠️ Nenhum topic encontrado na tabela');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testSubjects();
