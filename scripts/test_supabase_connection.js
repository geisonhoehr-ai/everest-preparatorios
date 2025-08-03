const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testando conexão com Supabase...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '***' : 'não definida');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('🚀 Testando conexão...');
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão:', error);
      return;
    }

    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Dados encontrados:', data?.length || 0);

    // Testar se podemos executar SQL
    console.log('🔧 Testando execução de SQL...');
    
    const { error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT NOW() as current_time;' 
    });

    if (sqlError) {
      console.error('❌ Erro ao executar SQL:', sqlError);
      console.log('💡 A função exec_sql pode não estar disponível');
    } else {
      console.log('✅ SQL executado com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testConnection(); 