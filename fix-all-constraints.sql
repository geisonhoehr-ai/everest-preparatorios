-- Solucao completa para todos os erros de foreign key
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar o usuario que esta causando o problema
SELECT 
    id, 
    email, 
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 2. Verificar dependencias na tabela courses
SELECT 
    id,
    title,
    teacher_id,
    created_at
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 3. Verificar dependencias na tabela temas_redacao
SELECT 
    id,
    titulo,
    criado_por,
    created_at
FROM temas_redacao 
WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 4. Verificar dependencias na tabela user_profiles
SELECT 
    id,
    user_id,
    role,
    display_name,
    created_at
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 5. Atualizar courses para remover a referencia
UPDATE courses 
SET teacher_id = NULL 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 6. Atualizar temas_redacao para remover a referencia
UPDATE temas_redacao 
SET criado_por = NULL 
WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 7. Verificar se as atualizacoes funcionaram
SELECT 
    'courses' as tabela,
    COUNT(*) as total
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'temas_redacao' as tabela,
    COUNT(*) as total
FROM temas_redacao 
WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 8. Excluir dependencias na tabela user_profiles
DELETE FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 9. Verificar se nao ha mais dependencias
SELECT 
    'courses' as tabela,
    COUNT(*) as total
FROM courses 
WHERE teacher_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'temas_redacao' as tabela,
    COUNT(*) as total
FROM temas_redacao 
WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 10. Excluir o usuario do auth.users
DELETE FROM auth.users 
WHERE id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';

-- 11. Verificar resultado final
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
    'temas_redacao' as tabela,
    COUNT(*) as total
FROM temas_redacao 
WHERE criado_por = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6'

UNION ALL

SELECT 
    'user_profiles' as tabela,
    COUNT(*) as total
FROM user_profiles 
WHERE user_id = '7a6999a9-db96-4b08-87f1-cdc48bd4a8d6';
