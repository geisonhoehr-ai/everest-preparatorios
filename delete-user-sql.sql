-- Script para excluir usuário 7a6999a9-db96-4b08-87f1-cdc48bd4a8d6
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário existe
SELECT 
    id, 
    email, 
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 2. Verificar dependências na tabela user_profiles
SELECT 
    id,
    user_id,
    role,
    display_name,
    created_at
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 3. Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Excluir dependências primeiro
DELETE FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 5. Verificar se foi excluído
SELECT COUNT(*) as remaining_profiles 
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 6. Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Excluir usuário do auth.users (se possível)
-- NOTA: Esta operação pode não funcionar dependendo das permissões
-- Se falhar, use o Supabase Dashboard para excluir manualmente
DELETE FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 8. Verificar resultado final
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
