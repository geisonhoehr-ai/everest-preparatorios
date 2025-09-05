-- =====================================================
-- REMOVER TRIGGERS CONFLITANTES
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. REMOVER TRIGGER QUE REFERENCIA user_roles
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. VERIFICAR TRIGGERS RESTANTES
-- =====================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 3. MENSAGEM DE SUCESSO
-- =====================================================
SELECT 'TRIGGERS CONFLITANTES REMOVIDOS COM SUCESSO!' as status;
