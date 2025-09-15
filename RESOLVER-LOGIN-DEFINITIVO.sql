-- SCRIPT DEFINITIVO PARA RESOLVER LOGIN
-- Execute este script COMPLETO no SQL Editor do Supabase Dashboard

-- 1. Verificar estado atual dos usuários
SELECT '=== ESTADO ATUAL DOS USUÁRIOS ===' as status;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 2. CONFIRMAR TODOS OS EMAILS (FORÇAR CONFIRMAÇÃO)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 0,
  confirmation_sent_at = NOW(),
  last_sign_in_at = NOW()
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 3. Verificar se foram confirmados
SELECT '=== EMAILS CONFIRMADOS ===' as status;
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 4. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 5. CRIAR/ATUALIZAR PERFIS
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
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
  END as display_name,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

-- 6. Verificar perfis criados
SELECT '=== PERFIS CRIADOS ===' as status;
SELECT user_id, role, display_name 
FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

-- 7. REABILITAR RLS COM POLÍTICA PERMISSIVA
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICA PERMISSIVA
DROP POLICY IF EXISTS "Permitir acesso total" ON user_profiles;
CREATE POLICY "Permitir acesso total" ON user_profiles FOR ALL USING (true);

-- 9. VERIFICAÇÃO FINAL COMPLETA
SELECT '=== VERIFICAÇÃO FINAL ===' as status;
SELECT 
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.role,
  p.display_name,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ CONFIRMADO'
    ELSE '❌ NÃO CONFIRMADO'
  END as status_email,
  CASE 
    WHEN p.user_id IS NOT NULL THEN '✅ PERFIL OK'
    ELSE '❌ SEM PERFIL'
  END as status_perfil
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY u.email;

-- 10. MENSAGEM FINAL
SELECT '=== LOGIN DEVE FUNCIONAR AGORA ===' as status;
SELECT 'Execute este script e teste o login com:' as info;
SELECT 'professor@teste.com | 123456' as usuario1;
SELECT 'aluno@teste.com | 123456' as usuario2;
SELECT 'admin@teste.com | 123456' as usuario3;
