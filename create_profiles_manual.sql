-- Script para criar os 3 perfis essenciais manualmente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuários existentes no auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email IN (
    'admin@everest.com',
    'professor@everest.com', 
    'aluno@everest.com'
)
ORDER BY created_at;

-- 2. Inserir perfis na tabela user_profiles
-- Substitua os user_id pelos IDs reais dos usuários acima

-- Perfil do Admin
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'admin',
    'Administrador Everest'
FROM auth.users au
WHERE au.email = 'admin@everest.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- Perfil do Professor
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'teacher',
    'Professor Everest'
FROM auth.users au
WHERE au.email = 'professor@everest.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- Perfil do Aluno
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'student',
    'Aluno Everest'
FROM auth.users au
WHERE au.email = 'aluno@everest.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- 3. Verificar os perfis criados
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN (
    'admin@everest.com',
    'professor@everest.com', 
    'aluno@everest.com'
)
ORDER BY up.created_at;

-- 4. Verificar total de perfis
SELECT COUNT(*) as total_profiles FROM user_profiles;
