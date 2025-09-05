-- Script para criar perfis com IDs reais
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Primeiro, pegar os IDs reais dos usuarios
SELECT id, email FROM auth.users 
WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- 2. Depois de ver os IDs acima, substitua pelos IDs reais e execute:
-- (Substitua os IDs pelos reais encontrados na query acima)

-- Exemplo com IDs ficticios (substitua pelos reais):
INSERT INTO user_profiles (user_id, role, display_name, created_at, updated_at) 
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'student', 'Aluno Teste', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', 'admin', 'Admin Teste', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', 'teacher', 'Professor Teste', NOW(), NOW());

-- 3. Verificar se os perfis foram criados
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');
