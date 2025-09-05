-- Script final para inserir usuarios na tabela user_profiles
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuarios existentes no auth.users
SELECT id, email, created_at FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY created_at;

-- 2. Inserir perfis na tabela user_profiles
-- IMPORTANTE: Substitua os IDs pelos IDs reais encontrados na query acima

-- Para aluno@teste.com
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES (
    'SUBSTITUA_PELO_ID_DO_ALUNO', 
    'student', 
    'Aluno Teste', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Para admin@teste.com
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES (
    'SUBSTITUA_PELO_ID_DO_ADMIN', 
    'admin', 
    'Admin Teste', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Para professor@teste.com
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES (
    'SUBSTITUA_PELO_ID_DO_PROFESSOR', 
    'teacher', 
    'Professor Teste', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- 3. Verificar se os perfis foram criados
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.created_at;
