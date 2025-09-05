-- =====================================================
-- CRIAR USUÁRIOS DE TESTE - VERSÃO LIMPA
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. REMOVER TRIGGERS CONFLITANTES
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. CRIAR USUÁRIOS
-- =====================================================
-- Aluno
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'aluno@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

-- Admin
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

-- Professor
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'professor@teste.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

-- 3. CRIAR PERFIS
-- =====================================================
-- Perfil do Aluno
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    id,
    'student',
    'Aluno Teste',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'aluno@teste.com';

-- Perfil do Admin
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    id,
    'admin',
    'Admin Teste',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@teste.com';

-- Perfil do Professor
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at)
SELECT 
    id,
    'teacher',
    'Professor Teste',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'professor@teste.com';

-- 4. VERIFICAR RESULTADO
-- =====================================================
SELECT 'USUARIOS CRIADOS COM SUCESSO!' as status;

SELECT 
    au.email,
    au.email_confirmed_at,
    up.role,
    up.display_name,
    up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role;
