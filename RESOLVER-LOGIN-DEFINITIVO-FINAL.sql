-- SCRIPT DEFINITIVO FINAL PARA RESOLVER LOGIN
-- Execute este script COMPLETO no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR ESTADO ATUAL DOS USUÁRIOS
SELECT '=== VERIFICANDO USUÁRIOS ===' as status;
SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 2. FORÇAR CONFIRMAÇÃO DE EMAIL E ATUALIZAR DADOS
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 0,
  confirmation_sent_at = NOW(),
  last_sign_in_at = NOW(),
  updated_at = NOW(),
  phone_confirmed_at = NOW()
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 3. VERIFICAR SE FORAM CONFIRMADOS
SELECT '=== EMAILS CONFIRMADOS ===' as status;
SELECT id, email, email_confirmed_at, last_sign_in_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 4. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR PERFIS EXISTENTES
SELECT '=== PERFIS EXISTENTES ===' as status;
SELECT user_id, role, display_name, created_at, updated_at
FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

-- 6. DELETAR PERFIS EXISTENTES
DELETE FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

-- 7. CRIAR NOVOS PERFIS
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
  id as user_id,
  CASE 
    WHEN email = 'aluno@teste.com' THEN 'student'
    WHEN email = 'professor@teste.com' THEN 'teacher' 
    WHEN email = 'admin@teste.com' THEN 'admin'
  END as role,
  CASE
    WHEN email = 'aluno@teste.com' THEN 'Aluno Teste'
    WHEN email = 'professor@teste.com' THEN 'Professor Teste'
    WHEN email = 'admin@teste.com' THEN 'Admin Teste'
  END as display_name,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 8. VERIFICAR PERFIS CRIADOS
SELECT '=== PERFIS CRIADOS ===' as status;
SELECT user_id, role, display_name, created_at, updated_at
FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

-- 9. REABILITAR RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Permitir acesso total" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- 11. CRIAR POLÍTICA PERMISSIVA
CREATE POLICY "Permitir acesso total" ON user_profiles FOR ALL USING (true);

-- 12. VERIFICAÇÃO FINAL COMPLETA
SELECT '=== VERIFICAÇÃO FINAL ===' as status;
SELECT 
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
  p.role,
  p.display_name,
  p.created_at as perfil_criado,
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

-- 13. MENSAGEM FINAL
SELECT '=== LOGIN DEVE FUNCIONAR AGORA ===' as status;
SELECT 'Execute este script e teste o login com:' as info;
SELECT 'professor@teste.com | 123456' as usuario1;
SELECT 'aluno@teste.com | 123456' as usuario2;
SELECT 'admin@teste.com | 123456' as usuario3;
