require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 [FIX] Verificando configuração do Supabase...');
console.log('🔧 [FIX] URL:', supabaseUrl);
console.log('🔧 [FIX] Service Key:', supabaseServiceKey ? 'Definido' : 'Não definido');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ [FIX] Variáveis de ambiente não configuradas!');
  console.error('❌ [FIX] Necessário NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Criar cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMembersStructure() {
  try {
    console.log('\n🔍 [FIX] Iniciando correção da estrutura da tabela members...');
    
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, '246_fix_members_table_structure.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 [FIX] Arquivo SQL carregado');
    
    // Executar o SQL
    console.log('⚡ [FIX] Executando SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ [FIX] Erro ao executar SQL:', error);
      
      // Tentar executar comandos individuais
      console.log('🔄 [FIX] Tentando executar comandos individuais...');
      
      // 1. Verificar estrutura atual
      console.log('📊 [FIX] Verificando estrutura atual...');
      const { data: structureData, error: structureError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'members')
        .eq('table_schema', 'public');
      
      if (structureError) {
        console.error('❌ [FIX] Erro ao verificar estrutura:', structureError);
      } else {
        console.log('📊 [FIX] Estrutura atual:', structureData);
      }
      
      // 2. Tentar recriar a tabela
      console.log('🔨 [FIX] Recriando tabela...');
      const dropTableSQL = 'DROP TABLE IF EXISTS members CASCADE;';
      const createTableSQL = `
        CREATE TABLE members (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          cpf_cnpj TEXT,
          phone TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
          login_count INTEGER DEFAULT 0,
          last_seen_at TIMESTAMP WITH TIME ZONE,
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Executar comandos via RPC ou usar uma abordagem alternativa
      console.log('⚠️ [FIX] Execute manualmente o SQL no painel do Supabase:');
      console.log('📄 [FIX] Arquivo: scripts/246_fix_members_table_structure.sql');
      
      return;
    }
    
    console.log('✅ [FIX] SQL executado com sucesso!');
    console.log('📊 [FIX] Resultado:', data);
    
  } catch (error) {
    console.error('❌ [FIX] Erro geral:', error);
  }
}

// Executar correção
fixMembersStructure(); 