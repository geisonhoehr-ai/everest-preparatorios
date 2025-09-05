-- Script simples para criar perfis de usuarios
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuarios no auth
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. Inserir perfis (substitua os IDs pelos reais encontrados acima)
INSERT INTO user_profiles (user_id, role, display_name, created_at) 
VALUES 
    ('SUBSTITUA_PELO_ID_DO_ALUNO', 'student', 'Aluno Teste', NOW()),
    ('SUBSTITUA_PELO_ID_DO_ADMIN', 'admin', 'Admin Teste', NOW()),
    ('SUBSTITUA_PELO_ID_DO_PROFESSOR', 'teacher', 'Professor Teste', NOW())
ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;

-- 3. Verificar resultado
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
