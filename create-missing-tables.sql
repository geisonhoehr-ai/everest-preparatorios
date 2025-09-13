-- =====================================================
-- CRIAR TABELAS FALTANDO PARA PÁGINA DE MEMBROS
-- =====================================================
-- Este script cria apenas as tabelas que ainda não existem

-- 1. Criar tabela student_subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  access_plan_id UUID NOT NULL REFERENCES access_plans(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela temporary_passwords
-- =====================================================
CREATE TABLE IF NOT EXISTS temporary_passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar colunas faltando em user_profiles
-- =====================================================
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Criar índices para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_user_id ON student_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_class_id ON student_subscriptions(class_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_access_plan_id ON student_subscriptions(access_plan_id);
CREATE INDEX IF NOT EXISTS idx_temporary_passwords_user_id ON temporary_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_temporary_passwords_expires_at ON temporary_passwords(expires_at);

-- 5. Habilitar RLS (Row Level Security)
-- =====================================================
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS básicas
-- =====================================================
-- Política para student_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON student_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON student_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Política para temporary_passwords
CREATE POLICY "Users can view their own temporary passwords" ON temporary_passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all temporary passwords" ON temporary_passwords
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Verificar se foram criadas
-- =====================================================
SELECT 'Tabelas criadas:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_subscriptions', 'temporary_passwords')
ORDER BY table_name;
