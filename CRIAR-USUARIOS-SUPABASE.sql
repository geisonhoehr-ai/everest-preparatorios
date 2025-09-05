-- =====================================================
-- CRIAR USUÁRIOS NO SUPABASE - VERSÃO SIMPLES
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. CRIAR USUÁRIOS (VERSÃO MÍNIMA)
-- =====================================================
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
) VALUES 
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aluno@teste.com', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@teste.com', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'professor@teste.com', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW());

-- 2. CRIAR PERFIS
-- =====================================================
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

-- 3. VERIFICAR RESULTADO
-- =====================================================
SELECT 'USUÁRIOS CRIADOS COM SUCESSO!' as status;

SELECT 
    au.email,
    au.email_confirmed_at,
    up.role,
    up.display_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.role;
