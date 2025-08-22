-- Script para implementar sistema completo de roles no Supabase (VERSÃO CORRIGIDA)
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela user_roles se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    CREATE TABLE user_roles (
      id SERIAL PRIMARY KEY,
      user_uuid TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índices para busca rápida
    CREATE INDEX idx_user_roles_user_uuid ON user_roles(user_uuid);
    CREATE INDEX idx_user_roles_email ON user_roles(email);
    CREATE INDEX idx_user_roles_role ON user_roles(role);
    
    -- Habilitar RLS
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Políticas de segurança
    CREATE POLICY "Users can view own role" ON user_roles
      FOR SELECT USING (auth.uid()::text = user_uuid OR auth.jwt() ->> 'email' = email);
    
    CREATE POLICY "Admins can manage all roles" ON user_roles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles ur 
          WHERE ur.user_uuid = auth.uid()::text 
          AND ur.role = 'admin'
        )
      );
  END IF;
END $$;

-- 2. Criar função para inserir/atualizar role automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo usuário na tabela user_roles com role padrão 'student'
  INSERT INTO user_roles (user_uuid, email, role)
  VALUES (NEW.id::text, NEW.email, 'student')
  ON CONFLICT (user_uuid) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Inserir usuários existentes com roles padrão
INSERT INTO user_roles (user_uuid, email, role)
SELECT 
  id::text,
  email,
  CASE 
    WHEN email = 'tiago@everest.com' THEN 'teacher'
    WHEN email = 'admin@everest.com' THEN 'admin'
    ELSE 'student'
  END as role
FROM auth.users
WHERE id::text NOT IN (SELECT user_uuid FROM user_roles)
ON CONFLICT (user_uuid) DO NOTHING;

-- 5. Criar função para atualizar role de usuário
CREATE OR REPLACE FUNCTION update_user_role(
  user_email TEXT,
  new_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se quem está executando é admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_uuid = auth.uid()::text 
    AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles';
  END IF;
  
  -- Atualizar role
  UPDATE user_roles 
  SET role = new_role, updated_at = NOW()
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função para obter role do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_uuid = auth.uid()::text;
  
  RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Inserir alguns usuários de teste com roles específicos
INSERT INTO user_roles (user_uuid, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'tiago@everest.com', 'teacher'),
  ('00000000-0000-0000-0000-000000000002', 'admin@everest.com', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'aluno@teste.com', 'student')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- 8. Verificar estrutura final
SELECT 
  'ESTRUTURA FINAL' as tipo,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as professores,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as estudantes
FROM user_roles;

-- 9. Mostrar usuários criados
SELECT 
  email,
  role,
  created_at,
  updated_at
FROM user_roles
ORDER BY role, created_at;

-- 10. Verificar trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ✅ Script executado com sucesso!
-- 📋 Tabela user_roles criada e populada
-- 🔧 Trigger para novos usuários configurado
-- 👥 Usuários de teste inseridos
-- 🔐 Funções de segurança criadas
