-- Script para criar os perfis corretos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar TODOS os usuários disponíveis
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY email;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Criar perfis para os usuários que existem
-- Perfil do Professor (que já existe)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'teacher',
    'Professor Everest'
FROM auth.users 
WHERE email = 'professor@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    JOIN auth.users au ON up.user_id = au.id 
    WHERE au.email = 'professor@teste.com'
);

-- 4. Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar resultado
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.role;

-- 6. Contar total de perfis
SELECT COUNT(*) as total_profiles FROM user_profiles;
