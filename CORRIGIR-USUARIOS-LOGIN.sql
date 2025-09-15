-- Script para corrigir problemas de login e RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela user_profiles existe
SELECT 'Verificando tabela user_profiles...' as status;
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- 2. Desabilitar RLS temporariamente para user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Criar perfis para os usuários existentes
INSERT INTO user_profiles (user_id, role, display_name)
VALUES 
  ('fc601291-cfda-4763-8232-b5bc759bcbc9', 'student', 'Aluno Teste'),
  ('ac5e97ad-5dc8-4590-ae01-eb444ff19bd2', 'teacher', 'Professor Teste'),
  ('41a3e9b0-d844-446a-ab19-f47e4f6ff7d8', 'admin', 'Admin Teste')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;

-- 4. Verificar se os perfis foram criados
SELECT 'Verificando perfis criados...' as status;
SELECT user_id, role, display_name FROM user_profiles;

-- 5. Reabilitar RLS com política mais permissiva
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Criar política permissiva para user_profiles
DROP POLICY IF EXISTS "Permitir acesso a perfis" ON user_profiles;
CREATE POLICY "Permitir acesso a perfis" ON user_profiles
  FOR ALL USING (true);

-- 7. Verificar se tudo está funcionando
SELECT 'Testando acesso aos perfis...' as status;
SELECT user_id, role, display_name FROM user_profiles LIMIT 5;
