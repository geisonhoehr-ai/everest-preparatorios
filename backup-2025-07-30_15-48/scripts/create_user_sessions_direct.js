const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserSessionsTable() {
  try {
    console.log('🚀 Verificando tabela user_sessions...');

    // Testar se a tabela existe tentando fazer uma consulta
    const { data: testData, error: testError } = await supabase
      .from('user_sessions')
      .select('*')
      .limit(1);

    if (testError) {
      if (testError.code === '42P01') {
        console.log('📝 Tabela user_sessions não existe, criando...');
        console.log('\n📋 Para criar a tabela user_sessions, execute o seguinte SQL no Supabase Dashboard:');
        console.log(`
-- Criar tabela de sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  user_agent TEXT,
  ip_address INET,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_accessed = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_sessions_updated_at();

-- Políticas RLS para user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias sessões
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias sessões
CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias sessões
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias sessões
CREATE POLICY "Users can delete their own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);
        `);
        console.log('\n✅ Script de criação da tabela gerado!');
        console.log('💡 Execute o SQL acima no Supabase Dashboard > SQL Editor');
      } else {
        console.error('❌ Erro ao verificar tabela:', testError);
      }
      return;
    }

    console.log('✅ Tabela user_sessions já existe!');
    console.log('📊 Dados encontrados:', testData?.length || 0);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

createUserSessionsTable(); 