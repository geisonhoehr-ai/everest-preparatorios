-- Script para criar perfis dos usuarios de teste
-- Execute no SQL Editor do Supabase Dashboard
-- IMPORTANTE: Primeiro execute o create-users-auth.js para criar os usuarios no auth

-- Verificar usuarios existentes no auth
SELECT id, email, created_at FROM auth.users WHERE email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com');

-- Inserir perfis na tabela user_profiles
-- Substitua os IDs pelos IDs reais dos usuarios encontrados acima

INSERT INTO user_profiles (user_id, email, name, role, created_at, updated_at) 
VALUES (
    'ID_DO_ALUNO_AQUI', 
    'aluno@teste.com', 
    'Aluno Teste', 
    'student', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Exemplo para admin@teste.com (substitua pelo ID real)
INSERT INTO user_profiles (user_id, email, name, role, created_at, updated_at) 
VALUES (
    'ID_DO_ADMIN_AQUI', 
    'admin@teste.com', 
    'Admin Teste', 
    'admin', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Exemplo para professor@teste.com (substitua pelo ID real)
INSERT INTO user_profiles (user_id, email, name, role, created_at, updated_at) 
VALUES (
    'ID_DO_PROFESSOR_AQUI', 
    'professor@teste.com', 
    'Professor Teste', 
    'teacher', 
    NOW(), 
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verificar perfis criados
SELECT 
    up.id,
    up.user_id,
    up.email,
    up.name,
    up.role,
    up.created_at,
    au.email_confirmed_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.email IN ('aluno@teste.com', 'admin@teste.com', 'professor@teste.com')
ORDER BY up.created_at;
