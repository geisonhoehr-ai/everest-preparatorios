-- SCRIPT FINAL PARA FORÇAR CONFIRMAÇÃO DE EMAILS
-- Execute este script COMPLETO no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR USUÁRIOS ATUAIS
SELECT '=== USUÁRIOS ATUAIS ===' as status;
SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY email;

-- 2. FORÇAR CONFIRMAÇÃO DE EMAIL DIRETAMENTE
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 0,
  confirmation_sent_at = NOW(),
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 3. VERIFICAR SE FORAM CONFIRMADOS
SELECT '=== EMAILS CONFIRMADOS ===' as status;
SELECT id, email, email_confirmed_at, last_sign_in_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
ORDER BY email;

-- 4. VERIFICAR PERFIS
SELECT '=== PERFIS DE USUÁRIO ===' as status;
SELECT user_id, role, display_name, created_at, updated_at
FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
)
ORDER BY role;

-- 5. SE NÃO EXISTIREM PERFIS, CRIAR
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
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
AND id NOT IN (SELECT user_id FROM user_profiles);

-- 6. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as status;
SELECT 
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
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

-- 7. MENSAGEM FINAL
SELECT '=== LOGIN DEVE FUNCIONAR AGORA ===' as status;
SELECT 'Teste o login com:' as info;
SELECT 'professor@teste.com | 123456' as usuario1;
SELECT 'aluno@teste.com | 123456' as usuario2;
SELECT 'admin@teste.com | 123456' as usuario3;
