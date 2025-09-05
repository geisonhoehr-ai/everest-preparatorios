-- Script automatico para criar perfis
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Criar perfis automaticamente usando subquery
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    au.id,
    CASE 
        WHEN au.email = 'aluno@teste.com' THEN 'student'
        WHEN au.email = 'admin@teste.com' THEN 'admin'
        WHEN au.email = 'professor@teste.com' THEN 'teacher'
    END as role,
    CASE 
        WHEN au.email = 'aluno@teste.com' THEN 'Aluno Teste'
        WHEN au.email = 'admin@teste.com' THEN 'Admin Teste'
        WHEN au.email = 'professor@teste.com' THEN 'Professor Teste'
    END as display_name,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- 2. Verificar se os perfis foram criados
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email,
    au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.created_at;
