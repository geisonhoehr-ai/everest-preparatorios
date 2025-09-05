-- SOLUÇÃO PARA O ERRO 500: Foreign Key Constraint
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se o usuário existe
SELECT 
    id, 
    email, 
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 2. Verificar todas as tabelas que podem ter foreign key para auth.users
-- (Execute cada query separadamente para identificar a tabela correta)

-- Verificar se existe tabela courses em outros schemas
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%course%' OR table_name LIKE '%turma%' OR table_name LIKE '%class%';

-- Verificar constraints de foreign key
SELECT 
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.column_name = 'id';

-- 3. Se encontrar a tabela, verificar dependências
-- (Substitua 'NOME_DA_TABELA' pelo nome real encontrado acima)
-- SELECT * FROM NOME_DA_TABELA WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 4. Atualizar para remover a referência
-- (Substitua 'NOME_DA_TABELA' pelo nome real)
-- UPDATE NOME_DA_TABELA 
-- SET teacher_id = NULL 
-- WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 5. Excluir dependências na tabela user_profiles
DELETE FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 6. Verificar se não há mais dependências
SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 7. Agora tentar excluir o usuário do auth.users
DELETE FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 8. Verificar resultado final
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
