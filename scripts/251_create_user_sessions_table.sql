-- Script para criar tabela de sessões de usuário
-- Suporte ao sistema de sessão única do AuthManager

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

-- Função para limpar sessões antigas (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  -- Deletar sessões inativas há mais de 30 dias
  DELETE FROM user_sessions 
  WHERE is_active = false 
  AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Marcar como inativas sessões não acessadas há mais de 24 horas
  UPDATE user_sessions 
  SET is_active = false 
  WHERE is_active = true 
  AND last_accessed < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE user_sessions IS 'Tabela para gerenciar sessões únicas de usuário';
COMMENT ON COLUMN user_sessions.session_token IS 'Token único da sessão';
COMMENT ON COLUMN user_sessions.device_info IS 'Informações do dispositivo (browser, OS)';
COMMENT ON COLUMN user_sessions.is_active IS 'Se a sessão está ativa';
COMMENT ON COLUMN user_sessions.last_accessed IS 'Último acesso à sessão';

-- Verificar se a tabela foi criada corretamente
SELECT 
  'Tabela user_sessions criada com sucesso!' as status,
  COUNT(*) as total_sessions
FROM user_sessions; 