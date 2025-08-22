-- Script SIMPLES para corrigir user_roles (VERSÃO DE EMERGÊNCIA)
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para inserir dados
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Inserir usuários de teste diretamente
INSERT INTO user_roles (user_uuid, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'tiago@everest.com', 'teacher'),
  ('00000000-0000-0000-0000-000000000002', 'admin@everest.com', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'aluno@teste.com', 'student')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- 3. Verificar se os dados foram inseridos
SELECT 
  'DADOS INSERIDOS' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as professores,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as estudantes
FROM user_roles;

-- 4. Mostrar usuários criados
SELECT 
  email,
  role,
  created_at,
  updated_at
FROM user_roles
ORDER BY role, created_at;

-- 5. Reabilitar RLS com políticas mais permissivas
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Criar política mais permissiva para SELECT
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (true); -- Permite que qualquer usuário autenticado veja roles

-- 7. Criar política para admins gerenciarem roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_uuid = auth.uid()::text 
      AND ur.role = 'admin'
    )
  );

-- 8. Verificar resultado final
SELECT 
  'ESTRUTURA FINAL' as tipo,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as professores,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as estudantes
FROM user_roles;
