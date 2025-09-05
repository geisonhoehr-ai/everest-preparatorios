-- Desabilitar RLS temporariamente para criar usuarios
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS na tabela user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Desabilitar RLS na tabela courses (se existir)
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- 3. Desabilitar RLS na tabela temas_redacao (se existir)
ALTER TABLE temas_redacao DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'courses', 'temas_redacao')
AND schemaname = 'public';
