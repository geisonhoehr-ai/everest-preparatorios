-- DESABILITAR CONFIRMAÇÃO DE EMAIL COMPLETAMENTE
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. CONFIRMAR TODOS OS EMAILS EXISTENTES
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 0,
  confirmation_sent_at = NOW(),
  last_sign_in_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. VERIFICAR RESULTADO
SELECT 'TODOS OS EMAILS FORAM CONFIRMADOS' as status;
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'professor@teste.com', 'admin@teste.com');
