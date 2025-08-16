require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 [TESTE] Verificando configuração do Supabase...');
console.log('🔧 [TESTE] URL:', supabaseUrl);
console.log('🔧 [TESTE] Anon Key:', supabaseAnonKey ? 'Definido' : 'Não definido');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [TESTE] Variáveis de ambiente não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMembersConnection() {
  try {
    console.log('\n🔍 [TESTE] Testando conexão com a tabela members...');
    
    // Teste 1: Verificar se conseguimos conectar
    console.log('📊 [TESTE] Teste 1: Verificando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('members')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ [TESTE] Erro ao conectar:', testError);
      return;
    }
    
    console.log('✅ [TESTE] Conexão OK');
    
    // Teste 2: Verificar estrutura da tabela
    console.log('\n📊 [TESTE] Teste 2: Verificando estrutura da tabela...');
    const { data: structureData, error: structureError } = await supabase
      .from('members')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ [TESTE] Erro ao verificar estrutura:', structureError);
      return;
    }
    
    console.log('✅ [TESTE] Estrutura da tabela OK');
    console.log('📊 [TESTE] Colunas disponíveis:', Object.keys(structureData[0] || {}));
    
    // Teste 3: Tentar inserir um membro de teste
    console.log('\n📝 [TESTE] Teste 3: Tentando inserir membro de teste...');
    const testMember = {
      full_name: 'Usuário Teste Script',
      email: `teste.script.${Date.now()}@exemplo.com`,
      phone: '11999999999',
      status: 'active'
    };
    
    console.log('📊 [TESTE] Dados para inserção:', testMember);
    
    const { data: insertData, error: insertError } = await supabase
      .from('members')
      .insert(testMember)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ [TESTE] Erro ao inserir:', insertError);
      console.error('❌ [TESTE] Detalhes do erro:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return;
    }
    
    console.log('✅ [TESTE] Inserção bem-sucedida!');
    console.log('📊 [TESTE] Membro criado:', insertData);
    
    // Teste 4: Verificar se conseguimos ler o membro inserido
    console.log('\n📖 [TESTE] Teste 4: Verificando leitura...');
    const { data: readData, error: readError } = await supabase
      .from('members')
      .select('*')
      .eq('email', testMember.email)
      .single();
    
    if (readError) {
      console.error('❌ [TESTE] Erro ao ler membro:', readError);
      return;
    }
    
    console.log('✅ [TESTE] Leitura OK');
    console.log('📊 [TESTE] Membro lido:', readData);
    
    // Teste 5: Limpar dados de teste
    console.log('\n🧹 [TESTE] Teste 5: Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('email', testMember.email);
    
    if (deleteError) {
      console.error('❌ [TESTE] Erro ao deletar teste:', deleteError);
    } else {
      console.log('✅ [TESTE] Dados de teste removidos');
    }
    
    console.log('\n🎉 [TESTE] Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ [TESTE] Erro geral:', error);
  }
}

// Executar testes
testMembersConnection(); 