const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '***' : 'não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserSessionsTable() {
  try {
    console.log('🚀 Criando tabela user_sessions...');

    // SQL para criar a tabela
    const sql = `
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
      DROP TRIGGER IF EXISTS trigger_update_user_sessions_updated_at ON user_sessions;
      CREATE TRIGGER trigger_update_user_sessions_updated_at
        BEFORE UPDATE ON user_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_user_sessions_updated_at();

      -- Políticas RLS para user_sessions
      ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

      -- Política para usuários verem apenas suas próprias sessões
      DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
      CREATE POLICY "Users can view their own sessions" ON user_sessions
        FOR SELECT USING (auth.uid() = user_id);

      -- Política para usuários inserirem suas próprias sessões
      DROP POLICY IF EXISTS "Users can insert their own sessions" ON user_sessions;
      CREATE POLICY "Users can insert their own sessions" ON user_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Política para usuários atualizarem suas próprias sessões
      DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
      CREATE POLICY "Users can update their own sessions" ON user_sessions
        FOR UPDATE USING (auth.uid() = user_id);

      -- Política para usuários deletarem suas próprias sessões
      DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
      CREATE POLICY "Users can delete their own sessions" ON user_sessions
        FOR DELETE USING (auth.uid() = user_id);
    `;

    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Erro ao criar tabela:', error);
      return;
    }

    console.log('✅ Tabela user_sessions criada com sucesso!');

    // Verificar se a tabela foi criada
    const { data: tables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_sessions');

    if (listError) {
      console.error('❌ Erro ao verificar tabela:', listError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Tabela user_sessions encontrada no banco de dados');
    } else {
      console.log('⚠️ Tabela user_sessions não encontrada');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

createUserSessionsTable(); 