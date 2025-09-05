-- Script para confirmar emails dos usuários de teste
-- Execute no SQL Editor do Supabase Dashboard

-- Confirmar emails dos usuários de teste
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    email_change_confirm_status = 0
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- Verificar se os emails foram confirmados
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY created_at;
