-- =====================================================
-- CONFIRMAR EMAILS DOS USUARIOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. FORCAR CONFIRMACAO DOS EMAILS
-- =====================================================
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    email_change_confirm_status = 0,
    confirmation_token = '',
    email_change = '',
    email_change_token_new = '',
    recovery_token = ''
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. VERIFICAR CONFIRMACAO
-- =====================================================
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    email_change_confirm_status
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 3. MENSAGEM DE SUCESSO
-- =====================================================
SELECT 'EMAILS CONFIRMADOS COM SUCESSO!' as status;
