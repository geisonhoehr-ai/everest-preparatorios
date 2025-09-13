-- =====================================================
-- CRIAR TABELAS AUXILIARES PARA PÁGINA DE MEMBROS
-- =====================================================
-- Este script cria as tabelas necessárias baseado na estrutura real existente

-- 1. Criar tabela access_plans
-- =====================================================
CREATE TABLE IF NOT EXISTS access_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL,
  price DECIMAL(10,2),
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela student_subscriptions
-- =====================================================
-- NOTA: Ajustado para funcionar com a estrutura real das tabelas existentes
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_plan_id UUID REFERENCES access_plans(id),
  class_id INTEGER REFERENCES classes(id), -- Ajustado para INTEGER baseado no erro
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela temporary_passwords
-- =====================================================
CREATE TABLE IF NOT EXISTS temporary_passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  temporary_password VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE
);

-- 4. Adicionar campos à tabela user_profiles existente
-- =====================================================
-- Adicionar campos que podem estar faltando
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id),
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES student_subscriptions(id),
ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 5. Criar índices para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_access_plans_active ON access_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_user ON student_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_active ON student_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_temporary_passwords_user ON temporary_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_temporary_passwords_expires ON temporary_passwords(expires_at);

-- 6. Habilitar RLS (Row Level Security)
-- =====================================================
ALTER TABLE access_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança
-- =====================================================

-- Políticas para access_plans
CREATE POLICY "Teachers and admins can manage access_plans" ON access_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Políticas para student_subscriptions
CREATE POLICY "Teachers and admins can manage subscriptions" ON student_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Políticas para temporary_passwords
CREATE POLICY "Teachers and admins can manage passwords" ON temporary_passwords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 8. Inserir dados de exemplo
-- =====================================================

-- Inserir planos de acesso de exemplo
INSERT INTO access_plans (name, description, duration_months, price, features) VALUES
('Plano Básico', 'Acesso básico ao sistema', 6, 99.90, '{"quiz": true, "flashcards": true, "evercast": false, "calendario": false}'),
('Plano Completo', 'Acesso completo ao sistema', 12, 199.90, '{"quiz": true, "flashcards": true, "evercast": true, "calendario": true}'),
('Plano Premium', 'Acesso premium com suporte', 24, 349.90, '{"quiz": true, "flashcards": true, "evercast": true, "calendario": true}')
ON CONFLICT DO NOTHING;

-- Inserir classes de exemplo (usando os nomes corretos das colunas)
-- NOTA: curso_id é obrigatório e deve referenciar subjects existentes
INSERT INTO classes (nome, max_alunos, curso_id) VALUES
('Turma A - Manhã', 30, 1),
('Turma B - Tarde', 25, 1),
('Turma C - Noite', 20, 2)
ON CONFLICT DO NOTHING;

-- 9. Comentários para documentação
-- =====================================================
COMMENT ON TABLE access_plans IS 'Planos de acesso para alunos';
COMMENT ON TABLE student_subscriptions IS 'Assinaturas dos alunos';
COMMENT ON TABLE temporary_passwords IS 'Senhas provisórias para novos usuários';

COMMENT ON COLUMN access_plans.features IS 'JSON com permissões: {"quiz": true, "flashcards": true, "evercast": false, "calendario": false}';
COMMENT ON COLUMN student_subscriptions.class_id IS 'Referência para classes (INTEGER)';
COMMENT ON COLUMN temporary_passwords.expires_at IS 'Data de expiração da senha (7 dias)';
