-- Script para criar usuários já confirmados
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Limpar usuários existentes (se houver)
DELETE FROM auth.users WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. Criar usuários já confirmados
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES 
    (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'aluno@teste.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    ),
    (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@teste.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    ),
    (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'professor@teste.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    );

-- 3. Criar perfis automaticamente
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
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 4. Verificar resultado
SELECT 
    au.email,
    au.email_confirmed_at,
    au.confirmed_at,
    up.role,
    up.display_name,
    up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role, up.created_at;
