-- Script correto para inserir usuarios na tabela user_profiles
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuarios existentes no auth.users
SELECT id, email, created_at FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY created_at;

-- 2. Inserir perfis na tabela user_profiles (sem coluna email)
-- Substitua os IDs pelos IDs reais encontrados acima

-- Exemplo para aluno@teste.com (substitua pelo ID real)
INSERT INTO user_profiles (user_id, role, display_name, created_at) 
VALUES (
    'ID_DO_ALUNO_AQUI', 
    'student', 
    'Aluno Teste', 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;

-- Exemplo para admin@teste.com (substitua pelo ID real)
INSERT INTO user_profiles (user_id, role, display_name, created_at) 
VALUES (
    'ID_DO_ADMIN_AQUI', 
    'admin', 
    'Admin Teste', 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;

-- Exemplo para professor@teste.com (substitua pelo ID real)
INSERT INTO user_profiles (user_id, role, display_name, created_at) 
VALUES (
    'ID_DO_PROFESSOR_AQUI', 
    'teacher', 
    'Professor Teste', 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;

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
