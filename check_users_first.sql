-- Script para verificar quais usuários existem
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar TODOS os usuários no auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at;

-- 2. Verificar se os usuários específicos existem
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

-- 3. Verificar perfis existentes
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at;
