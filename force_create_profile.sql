-- Script para FORÇAR a criação do perfil
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Limpar a tabela
DELETE FROM user_profiles;

-- 3. Inserir o perfil diretamente
INSERT INTO user_profiles (user_id, role, display_name)
VALUES ('7a6999a9-db96-4b08-87f1-cdc48bd4a8d6', 'teacher', 'Professor Everest');

-- 4. Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar resultado
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id;

-- 6. Contar total
SELECT COUNT(*) as total_profiles FROM user_profiles;
