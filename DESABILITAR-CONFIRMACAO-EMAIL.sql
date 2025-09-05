-- =====================================================
-- DESABILITAR CONFIRMACAO DE EMAIL
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. ATUALIZAR CONFIGURACAO DE AUTH
-- =====================================================
-- Nota: Esta configuracao deve ser feita no Dashboard do Supabase
-- Authentication > Settings > Email Auth > Disable email confirmations

-- 2. FORCAR CONFIRMACAO DOS USUARIOS EXISTENTES
-- =====================================================
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    email_change_confirm_status = 0
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 3. VERIFICAR STATUS
-- =====================================================
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    email_change_confirm_status
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY email;

-- 4. INSTRUCOES PARA O DASHBOARD
-- =====================================================
SELECT 'INSTRUCOES:' as info;
SELECT '1. Vá para Authentication > Settings' as passo1;
SELECT '2. Clique em Email Auth' as passo2;
SELECT '3. Desabilite "Enable email confirmations"' as passo3;
SELECT '4. Salve as configurações' as passo4;
