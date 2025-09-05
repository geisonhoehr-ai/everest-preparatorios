-- =====================================================
-- FORCAR CONFIRMACAO DE EMAILS - VERSÃO DIRETA
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR STATUS ATUAL
-- =====================================================
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    email_change_confirm_status,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 2. FORCAR CONFIRMACAO COMPLETA
-- =====================================================
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    email_change_confirm_status = 0,
    confirmation_token = '',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
    raw_user_meta_data = '{}',
    is_super_admin = false,
    last_sign_in_at = NOW(),
    phone = NULL,
    phone_confirmed_at = NULL,
    phone_change = '',
    phone_change_token = '',
    phone_change_sent_at = NULL,
    email_change_token_current = '',
    banned_until = NULL,
    reauthentication_token = '',
    reauthentication_sent_at = NULL,
    is_sso_user = false,
    deleted_at = NULL,
    updated_at = NOW()
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 3. VERIFICAR STATUS APOS ATUALIZACAO
-- =====================================================
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    email_change_confirm_status,
    last_sign_in_at,
    updated_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 4. VERIFICAR PERFIS
-- =====================================================
SELECT 
    au.email,
    up.role,
    up.display_name,
    up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role;

-- 5. MENSAGEM DE SUCESSO
-- =====================================================
SELECT 'CONFIRMACAO FORCADA COM SUCESSO!' as status;
