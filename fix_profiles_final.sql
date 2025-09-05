-- Script FINAL para criar os 3 perfis
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos ver quais usuários existem
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email IN (
    'admin@everest.com',
    'professor@everest.com', 
    'aluno@everest.com'
)
ORDER BY email;

-- 2. Limpar a tabela user_profiles (se necessário)
DELETE FROM user_profiles;

-- 3. Inserir os 3 perfis diretamente
-- Substitua os user_id pelos IDs reais que apareceram na consulta acima

-- Perfil do Admin (substitua o user_id pelo ID real)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'admin',
    'Administrador Everest'
FROM auth.users 
WHERE email = 'admin@everest.com';

-- Perfil do Professor (substitua o user_id pelo ID real)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'teacher',
    'Professor Everest'
FROM auth.users 
WHERE email = 'professor@everest.com';

-- Perfil do Aluno (substitua o user_id pelo ID real)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    id,
    'student',
    'Aluno Everest'
FROM auth.users 
WHERE email = 'aluno@everest.com';

-- 4. Verificar se os 3 perfis foram criados
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.role;

-- 5. Contar total de perfis
SELECT COUNT(*) as total_profiles FROM user_profiles;
