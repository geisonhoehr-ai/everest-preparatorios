-- Script para confirmar emails dos usuários de teste
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar usuários não confirmados
SELECT 'Usuários não confirmados:' as status;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- 2. Confirmar emails dos usuários de teste
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 0,
  confirmation_sent_at = NOW()
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
  AND email_confirmed_at IS NULL;

-- 3. Verificar se foram confirmados
SELECT 'Usuários após confirmação:' as status;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');

-- 4. Verificar/criar perfis
SELECT 'Verificando perfis:' as status;
SELECT user_id, role, display_name 
FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com')
);

-- 5. Se não existirem perfis, criar
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
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name;

-- 6. Verificar resultado final
SELECT 'Resultado final:' as status;
SELECT 
  u.email,
  u.email_confirmed_at,
  p.role,
  p.display_name
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');
