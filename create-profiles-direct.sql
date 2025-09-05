-- Script direto para criar perfis de usuarios
-- Execute no SQL Editor do Supabase Dashboard

-- Verificar usuarios existentes no auth
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- Inserir perfis (substitua os IDs pelos reais encontrados acima)
INSERT INTO user_profiles (user_id, email, name, role, created_at, updated_at) 
VALUES 
    ('SUBSTITUA_PELO_ID_DO_ALUNO', 'aluno@teste.com', 'Aluno Teste', 'student', NOW(), NOW()),
    ('SUBSTITUA_PELO_ID_DO_ADMIN', 'admin@teste.com', 'Admin Teste', 'admin', NOW(), NOW()),
    ('SUBSTITUA_PELO_ID_DO_PROFESSOR', 'professor@teste.com', 'Professor Teste', 'teacher', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verificar resultado
SELECT * FROM user_profiles 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
