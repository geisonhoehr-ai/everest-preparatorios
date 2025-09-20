// Teste de conexão com Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'NÃO CONFIGURADA');
console.log('Supabase Key:', supabaseKey ? 'Configurada' : 'NÃO CONFIGURADA');

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function testConnection() {
    try {
      console.log('Testando conexão...');
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .limit(1);
      
      if (error) {
        console.error('Erro na conexão:', error);
      } else {
        console.log('Conexão OK! Dados:', data);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  }
  
  testConnection();
} else {
  console.log('Variáveis de ambiente não configuradas');
}