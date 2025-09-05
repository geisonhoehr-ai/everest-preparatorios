-- SOLUÇÃO ESPECÍFICA PARA O ERRO 500
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar o usuário que está causando o problema
SELECT 
    id, 
    email, 
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 2. Verificar dependências na tabela courses
SELECT 
    id,
    title,
    teacher_id,
    created_at
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 3. Verificar dependências na tabela user_profiles
SELECT 
    id,
    user_id,
    role,
    display_name,
    created_at
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 4. SOLUÇÃO: Atualizar courses para remover a referência
UPDATE courses 
SET teacher_id = NULL 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 5. Verificar se a atualização funcionou
SELECT 
    id,
    title,
    teacher_id,
    created_at
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 6. Excluir dependências na tabela user_profiles
DELETE FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 7. Verificar se não há mais dependências
SELECT 
    'courses' as tabela,
    COUNT(*) as total
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 8. Agora tentar excluir o usuário do auth.users
DELETE FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 9. Verificar resultado final
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'courses' as tabela,
    COUNT(*) as total
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
