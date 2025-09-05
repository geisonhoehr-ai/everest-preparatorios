-- Script direto para criar usuarios agora
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuarios no auth
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. Inserir perfis (substitua os IDs pelos reais encontrados acima)
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES 
    ('ID_DO_ALUNO_AQUI', 'student', 'Aluno Teste', NOW(), NOW()),
    ('ID_DO_ADMIN_AQUI', 'admin', 'Admin Teste', NOW(), NOW()),
    ('ID_DO_PROFESSOR_AQUI', 'teacher', 'Professor Teste', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

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
