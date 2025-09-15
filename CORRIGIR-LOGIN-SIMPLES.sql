-- Script SIMPLES para corrigir login
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar usuários existentes
SELECT 'Usuários existentes:' as status;
SELECT id, email, email_confirmed_at FROM auth.users;

-- 2. Verificar se a tabela user_profiles existe
SELECT 'Verificando user_profiles...' as status;
SELECT COUNT(*) as total FROM user_profiles;

-- 3. Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Inserir perfis para os usuários existentes (se não existirem)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
  id as user_id,
  CASE 
    WHEN email = 'aluno@teste.com' THEN 'student'
    WHEN email = 'professor@teste.com' THEN 'teacher' 
    WHEN email = 'admin@teste.com' THEN 'admin'
    ELSE 'student'
  END as role,
  CASE
    WHEN email = 'aluno@teste.com' THEN 'Aluno Teste'
    WHEN email = 'professor@teste.com' THEN 'Professor Teste'
    WHEN email = 'admin@teste.com' THEN 'Admin Teste'
    ELSE 'Usuário'
  END as display_name
FROM auth.users
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Verificar se os perfis foram criados
SELECT 'Perfis criados:' as status;
SELECT user_id, role, display_name FROM user_profiles;

-- 6. Reabilitar RLS com política permissiva
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Criar política permissiva
DROP POLICY IF EXISTS "Permitir acesso" ON user_profiles;
CREATE POLICY "Permitir acesso" ON user_profiles FOR ALL USING (true);

-- 8. Teste final
SELECT 'Teste de acesso:' as status;
SELECT user_id, role, display_name FROM user_profiles LIMIT 3;
