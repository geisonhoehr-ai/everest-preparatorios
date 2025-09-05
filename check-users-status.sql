-- Verificar status dos usuarios
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuarios no auth.users
SELECT 
    id, 
    email, 
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY created_at;

-- 2. Verificar se existem perfis na user_profiles
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.created_at;

-- 3. Contar total de usuarios no auth
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 4. Contar total de perfis
SELECT COUNT(*) as total_profiles FROM user_profiles;
