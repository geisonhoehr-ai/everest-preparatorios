require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testGetAllSubjects() {
  console.log('🔍 Testando função getAllSubjects...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas');
    return;
  }
  
  try {
    // Simular a função getAllSubjects do arquivo actions.ts
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado');
    
    console.log('🔍 [Server Action] getAllSubjects() iniciada');
    
    const { data, error } = await supabase.from("subjects").select("id, name").order("name");
    
    console.log('🔍 [Server Action] Query executada');
    console.log('🔍 [Server Action] Data:', data);
    console.log('🔍 [Server Action] Error:', error);
    
    if (error) {
      console.error('❌ [Server Action] Erro ao buscar matérias:', error);
      return;
    }
    
    console.log('✅ [Server Action] Matérias encontradas:', data?.length || 0);
    
    // Simular o que a página faz
    if (data && Array.isArray(data)) {
      console.log('✅ [DEBUG] Dados válidos, setando subjects...');
      console.log('✅ [DEBUG] Subjects setados:', data);
      
      if (data.length === 0) {
        console.log('📚 [DEBUG] Nenhum subject encontrado, carregando tópicos diretamente...');
      }
    } else {
      console.error('❌ [DEBUG] Dados inválidos:', data);
      console.log('📚 [DEBUG] Carregando tópicos diretamente devido a dados inválidos...');
    }
    
  } catch (error) {
    console.error('❌ [Server Action] Erro inesperado em getAllSubjects:', error);
  }
}

testGetAllSubjects();
