// Script para testar variáveis de ambiente do Supabase
// Execute este script no terminal: node scripts/080_test_env_variables.js

const fs = require('fs');
const path = require('path');

console.log('🔍 [TESTE] Verificando variáveis de ambiente...\n');

// Verificar se o arquivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 Arquivo .env.local existe:', envExists);

if (envExists) {
  console.log('📄 Conteúdo do .env.local:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar variáveis específicas do Supabase
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    console.log(`  ${varName}: ${hasVar ? '✅ Presente' : '❌ Ausente'}`);
  });
  
  // Mostrar valores (mascarados)
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        const maskedValue = value.length > 10 ? 
          value.substring(0, 10) + '...' : 
          value;
        console.log(`  ${key}=${maskedValue}`);
      }
    }
  });
} else {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('💡 Crie o arquivo .env.local na raiz do projeto com as seguintes variáveis:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role');
}

console.log('\n🔍 [TESTE] Verificando se as variáveis estão disponíveis no processo...');

// Verificar se as variáveis estão no processo (pode não estar se não carregou o .env)
const processVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

processVars.forEach(varName => {
  const value = process.env[varName];
  const hasValue = !!value;
  console.log(`  ${varName}: ${hasValue ? '✅ Disponível' : '❌ Não disponível'}`);
  if (hasValue) {
    const maskedValue = value.length > 10 ? 
      value.substring(0, 10) + '...' : 
      value;
    console.log(`    Valor: ${maskedValue}`);
  }
});

console.log('\n🎯 [TESTE] Conclusão:');
if (envExists) {
  console.log('✅ Arquivo .env.local encontrado');
  console.log('💡 Execute o script SQL 079_test_subjects_debug.sql no Supabase para verificar os dados');
  console.log('💡 Verifique os logs no console do navegador ao acessar /flashcards');
} else {
  console.log('❌ Arquivo .env.local não encontrado - configure as variáveis de ambiente');
} 