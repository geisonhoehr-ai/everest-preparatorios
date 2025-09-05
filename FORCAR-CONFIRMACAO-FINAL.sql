-- FORCAR CONFIRMACAO DE EMAIL - SOLUCAO FINAL
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR STATUS ATUAL
SELECT 
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 2. FORCAR CONFIRMACAO COMPLETA
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    last_sign_in_at = NOW(),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
    raw_user_meta_data = '{"email_verified": true}'
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 3. VERIFICAR STATUS APOS ATUALIZACAO
SELECT 
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 4. VERIFICAR SE OS PERFIS EXISTEM
SELECT 
    up.user_id,
    up.role,
    up.display_name,
    u.email
FROM user_profiles up
JOIN auth.users u ON u.id = up.user_id
WHERE u.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY u.email;
