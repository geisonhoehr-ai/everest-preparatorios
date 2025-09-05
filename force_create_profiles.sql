-- Script para FORÇAR a criação dos 3 perfis
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuários existentes
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

-- 2. Desabilitar temporariamente o RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Inserir os 3 perfis diretamente
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'admin',
    'Administrador Everest'
FROM auth.users 
WHERE email = 'admin@everest.com';

INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'teacher',
    'Professor Everest'
FROM auth.users 
WHERE email = 'professor@everest.com';

INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'student',
    'Aluno Everest'
FROM auth.users 
WHERE email = 'aluno@everest.com';

-- 4. Reabilitar o RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se os 3 perfis foram criados
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

-- 6. Contar total de perfis
SELECT COUNT(*) as total_profiles FROM user_profiles;
