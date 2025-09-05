-- Verificar políticas RLS das tabelas
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'courses', 'temas_redacao')
AND schemaname = 'public';

-- 2. Verificar políticas existentes na tabela user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
AND schemaname = 'public';

-- 3. Verificar políticas existentes na tabela courses
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'courses'
AND schemaname = 'public';

-- 4. Verificar políticas existentes na tabela temas_redacao
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'temas_redacao'
AND schemaname = 'public';
