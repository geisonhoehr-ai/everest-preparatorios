-- =====================================================
-- CONFIRMAR EMAILS - VERSÃO SIMPLES
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR STATUS ATUAL
-- =====================================================
SELECT 
    email,
    email_confirmed_at,
    email_change_confirm_status
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 2. ATUALIZAR APENAS CAMPOS ESSENCIAIS
-- =====================================================
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    email_change_confirm_status = 0,
    confirmation_token = '',
    email_change = '',
    email_change_token_new = '',
    recovery_token = '',
    last_sign_in_at = NOW(),
    updated_at = NOW()
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 3. VERIFICAR STATUS APOS ATUALIZACAO
-- =====================================================
SELECT 
    email,
    email_confirmed_at,
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
    up.display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role;

-- 5. MENSAGEM DE SUCESSO
-- =====================================================
SELECT 'CONFIRMACAO REALIZADA COM SUCESSO!' as status;
