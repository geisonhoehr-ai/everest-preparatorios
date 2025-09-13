-- Criar tabelas para gestão completa de membros/alunos
-- Este script cria todas as tabelas necessárias para o sistema de gestão de membros

-- 1. Tabela de turmas/classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de planos de acesso
CREATE TABLE IF NOT EXISTS access_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL, -- 6, 12, 24 meses
  price DECIMAL(10,2),
  features JSONB DEFAULT '{}', -- {"quiz": true, "flashcards": true, "evercast": false}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de permissões de acesso por página
CREATE TABLE IF NOT EXISTS page_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name VARCHAR(100) NOT NULL, -- 'quiz', 'flashcards', 'evercast', 'calendario'
  has_access BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, page_name)
);

-- 4. Tabela de assinaturas de alunos
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_plan_id UUID REFERENCES access_plans(id),
  class_id UUID REFERENCES classes(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de senhas provisórias
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

-- 6. Adicionar campos à tabela user_profiles existente
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id),
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES student_subscriptions(id),
ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_page_permissions_user ON page_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_page_permissions_page ON page_permissions(page_name);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_user ON student_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_active ON student_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_temporary_passwords_user ON temporary_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_temporary_passwords_expires ON temporary_passwords(expires_at);

-- 8. Políticas RLS (Row Level Security)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;

-- Políticas para classes
CREATE POLICY "Teachers and admins can view all classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage classes" ON classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Políticas para access_plans
CREATE POLICY "Teachers and admins can view access plans" ON access_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage access plans" ON access_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Políticas para page_permissions
CREATE POLICY "Users can view their own permissions" ON page_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers and admins can manage all permissions" ON page_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Políticas para student_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON student_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers and admins can manage all subscriptions" ON student_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Políticas para temporary_passwords
CREATE POLICY "Users can view their own temporary passwords" ON temporary_passwords
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers and admins can manage all temporary passwords" ON temporary_passwords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- 9. Inserir planos de acesso padrão
INSERT INTO access_plans (name, description, duration_months, price, features) VALUES
('Básico - Quiz', 'Acesso apenas à página de Quiz por 6 meses', 6, 99.90, '{"quiz": true, "flashcards": false, "evercast": false, "calendario": false}'),
('Básico - Flashcards', 'Acesso apenas à página de Flashcards por 6 meses', 6, 99.90, '{"quiz": false, "flashcards": true, "evercast": false, "calendario": false}'),
('Básico - Evercast', 'Acesso apenas à página de Evercast por 6 meses', 6, 149.90, '{"quiz": false, "flashcards": false, "evercast": true, "calendario": false}'),
('Completo 6 meses', 'Acesso completo a todas as páginas por 6 meses', 6, 299.90, '{"quiz": true, "flashcards": true, "evercast": true, "calendario": true}'),
('Completo 1 ano', 'Acesso completo a todas as páginas por 1 ano', 12, 499.90, '{"quiz": true, "flashcards": true, "evercast": true, "calendario": true}'),
('Premium 2 anos', 'Acesso completo a todas as páginas por 2 anos', 24, 799.90, '{"quiz": true, "flashcards": true, "evercast": true, "calendario": true}');

-- 10. Inserir turmas de exemplo
INSERT INTO classes (name, description, start_date, end_date, max_students) VALUES
('EAOF 2026 - Turma A', 'Turma A do curso EAOF 2026', '2026-05-01', '2027-02-28', 50),
('EAOF 2026 - Turma B', 'Turma B do curso EAOF 2026', '2026-05-01', '2027-02-28', 50),
('EAOF 2026 - Turma C', 'Turma C do curso EAOF 2026', '2026-05-01', '2027-02-28', 50);

-- 11. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_plans_updated_at BEFORE UPDATE ON access_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_subscriptions_updated_at BEFORE UPDATE ON student_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Função para verificar permissões de acesso
CREATE OR REPLACE FUNCTION check_page_access(user_uuid UUID, page_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
    user_role TEXT;
    access_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Verificar se é professor ou admin (acesso total)
    SELECT role INTO user_role FROM user_profiles WHERE user_id = user_uuid;
    
    IF user_role IN ('teacher', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se o acesso não expirou
    SELECT access_expires_at INTO access_expires FROM user_profiles WHERE user_id = user_uuid;
    
    IF access_expires IS NOT NULL AND access_expires < NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar permissão específica da página
    SELECT has_access INTO has_permission 
    FROM page_permissions 
    WHERE user_id = user_uuid 
    AND page_name = check_page_access.page_name
    AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários das tabelas
COMMENT ON TABLE classes IS 'Tabela de turmas/classes para organizar alunos';
COMMENT ON TABLE access_plans IS 'Planos de acesso com diferentes durações e funcionalidades';
COMMENT ON TABLE page_permissions IS 'Permissões específicas de acesso por página para cada usuário';
COMMENT ON TABLE student_subscriptions IS 'Assinaturas ativas dos alunos com planos de acesso';
COMMENT ON TABLE temporary_passwords IS 'Senhas provisórias para novos usuários';
COMMENT ON FUNCTION check_page_access IS 'Função para verificar se um usuário tem acesso a uma página específica';
