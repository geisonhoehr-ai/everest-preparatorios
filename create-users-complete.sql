-- Script completo para criar usuarios e perfis
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar se usuarios existem no auth
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. Se nao existirem usuarios, execute este script para criar:
-- (Descomente as linhas abaixo se precisar criar os usuarios)

/*
-- Criar usuario aluno
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'aluno@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Criar usuario admin
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Criar usuario professor
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'professor@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
*/

-- 3. Depois de criar os usuarios, pegar os IDs e criar os perfis
-- (Substitua os IDs pelos reais encontrados na query 1)

INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES 
    ('ID_DO_ALUNO_AQUI', 'student', 'Aluno Teste', NOW(), NOW()),
    ('ID_DO_ADMIN_AQUI', 'admin', 'Admin Teste', NOW(), NOW()),
    ('ID_DO_PROFESSOR_AQUI', 'teacher', 'Professor Teste', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- 4. Verificar resultado final
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
