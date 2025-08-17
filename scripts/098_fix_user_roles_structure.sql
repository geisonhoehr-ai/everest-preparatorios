-- Script para corrigir e implementar sistema completo de roles
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela temporária com estrutura correta
CREATE TABLE IF NOT EXISTS user_roles_temp (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Migrar dados existentes (convertendo emails para UUIDs reais)
INSERT INTO user_roles_temp (user_uuid, email, role, created_at, updated_at)
SELECT 
  u.id::text as user_uuid,
  ur.user_uuid as email, -- o campo atual contém emails
  ur.role,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
JOIN auth.users u ON u.email = ur.user_uuid
ON CONFLICT (user_uuid) DO NOTHING;

-- 3. Verificar migração
SELECT 
  'DADOS MIGRADOS' as status,
  COUNT(*) as total_migrados
FROM user_roles_temp;

-- 4. Substituir tabela antiga
DROP TABLE user_roles;
ALTER TABLE user_roles_temp RENAME TO user_roles;

-- 5. Recriar índices
CREATE INDEX idx_user_roles_user_uuid ON user_roles(user_uuid);
CREATE INDEX idx_user_roles_email ON user_roles(email);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- 6. Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de segurança
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid()::text = user_uuid);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_uuid = auth.uid()::text 
      AND ur.role = 'admin'
    )
  );

-- 8. Criar função para inserir/atualizar role automaticamente
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

-- 9. Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 10. Inserir usuários existentes que não estão na tabela
INSERT INTO user_roles (user_uuid, email, role)
SELECT 
  id::text,
  email,
  CASE 
    WHEN email = 'geisonhoehr@gmail.com' THEN 'admin'
    WHEN email LIKE '%@everest.com' OR email LIKE '%everest%' THEN 'teacher'
    WHEN email LIKE '%professor%' OR email LIKE '%teacher%' THEN 'teacher'
    WHEN email LIKE '%admin%' THEN 'admin'
    ELSE 'student'
  END as role
FROM auth.users
WHERE id::text NOT IN (SELECT user_uuid FROM user_roles)
ON CONFLICT (user_uuid) DO NOTHING;

-- 11. Verificar estrutura final
SELECT 
  'ESTRUTURA FINAL' as tipo,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as professores,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as estudantes
FROM user_roles;

-- 12. Mostrar usuários finais
SELECT 
  ur.email,
  ur.role,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
ORDER BY ur.role, ur.created_at;

-- 13. Verificar trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 14. Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Estrutura da tabela user_roles corrigida com sucesso!';
  RAISE NOTICE '📋 Dados migrados para UUIDs reais';
  RAISE NOTICE '🔧 Trigger para novos usuários configurado';
  RAISE NOTICE '🔐 Políticas de segurança aplicadas';
END $$;
