-- =====================================================
-- CRIAR PERFIS PARA USUÁRIOS EXISTENTES NO SUPABASE AUTH
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. VERIFICAR USUÁRIOS EXISTENTES
-- =====================================================
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
WHERE au.email IN ('professor@teste.com', 'admin@teste.com', 'aluno@teste.com')
ORDER BY au.email;

-- 2. CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- =====================================================
-- Perfil do Professor
INSERT INTO user_profiles (
    user_id, 
    role, 
    display_name
)
SELECT 
    au.id,
    'teacher',
    'Professor Teste'
FROM auth.users au
WHERE au.email = 'professor@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- Perfil do Admin
INSERT INTO user_profiles (
    user_id, 
    role, 
    display_name
)
SELECT 
    au.id,
    'administrator',
    'Admin Teste'
FROM auth.users au
WHERE au.email = 'admin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- Perfil do Aluno
INSERT INTO user_profiles (
    user_id, 
    role, 
    display_name
)
SELECT 
    au.id,
    'student',
    'Aluno Teste'
FROM auth.users au
WHERE au.email = 'aluno@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- 3. VERIFICAR PERFIS CRIADOS
-- =====================================================
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email,
    au.email_confirmed_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('professor@teste.com', 'admin@teste.com', 'aluno@teste.com')
ORDER BY up.role;

-- 4. CONFIRMAÇÃO
-- =====================================================
SELECT 'PERFIS CRIADOS COM SUCESSO!' as status;
