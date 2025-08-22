require('dotenv').config({path: '.env.local'});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 [TEST] Testando getAllSubjects...');
console.log('URL:', supabaseUrl ? '✅' : '❌');
console.log('KEY:', supabaseKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetAllSubjects() {
  try {
    console.log('🔍 [TEST] Executando query...');
    
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name")
      .order("name");
    
    if (error) {
      console.error('❌ [TEST] Erro na query:', error);
      return;
    }
    
    console.log('✅ [TEST] Query executada com sucesso');
    console.log('📊 [TEST] Dados retornados:', data);
    console.log('📊 [TEST] Total de subjects:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 [TEST] Subjects encontrados:');
      data.forEach(subject => {
        console.log(`  - ID: ${subject.id}, Nome: ${subject.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erro inesperado:', error);
  }
}

testGetAllSubjects();
