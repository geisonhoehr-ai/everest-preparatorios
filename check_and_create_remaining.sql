-- Script para verificar qual perfil existe e criar os outros 2
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar qual perfil foi criado
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.role;

-- 2. Verificar todos os usuários disponíveis
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email IN (
    'admin@everest.com',
    'professor@everest.com', 
    'aluno@everest.com'
)
ORDER BY email;

-- 3. Criar os perfis que estão faltando
-- Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Inserir Admin (se não existir)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'admin',
    'Administrador Everest'
FROM auth.users 
WHERE email = 'admin@everest.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    JOIN auth.users au ON up.user_id = au.id 
    WHERE au.email = 'admin@everest.com'
);

-- Inserir Professor (se não existir)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'teacher',
    'Professor Everest'
FROM auth.users 
WHERE email = 'professor@everest.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    JOIN auth.users au ON up.user_id = au.id 
    WHERE au.email = 'professor@everest.com'
);

-- Inserir Aluno (se não existir)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'student',
    'Aluno Everest'
FROM auth.users 
WHERE email = 'aluno@everest.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    JOIN auth.users au ON up.user_id = au.id 
    WHERE au.email = 'aluno@everest.com'
);

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verificar resultado final
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.role;

-- 5. Contar total de perfis
SELECT COUNT(*) as total_profiles FROM user_profiles;
