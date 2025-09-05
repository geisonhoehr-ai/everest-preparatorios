-- Script SIMPLES para criar os 3 perfis
-- Execute este script no SQL Editor do Supabase

-- 1. Ver qual perfil existe
SELECT 
    up.role,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id;

-- 2. Desabilitar RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Inserir diretamente os 3 perfis
INSERT INTO user_profiles (user_id, role, display_name)
VALUES 
    ((SELECT id FROM auth.users WHERE email = 'admin@everest.com'), 'admin', 'Administrador Everest'),
    ((SELECT id FROM auth.users WHERE email = 'professor@everest.com'), 'teacher', 'Professor Everest'),
    ((SELECT id FROM auth.users WHERE email = 'aluno@everest.com'), 'student', 'Aluno Everest');

-- 4. Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar resultado
SELECT COUNT(*) as total_profiles FROM user_profiles;
