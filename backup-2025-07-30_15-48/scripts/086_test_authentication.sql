-- Script para testar autenticação e verificar roles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários autenticados
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar roles dos usuários
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.first_login,
  ur.profile_completed
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. Verificar se há usuários sem role
SELECT 
  COUNT(*) as users_without_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 4. Verificar políticas RLS da tabela user_roles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_roles';

-- 6. Testar acesso à tabela user_roles (simular)
-- Este comando deve funcionar se as políticas estiverem corretas
SELECT COUNT(*) as total_roles FROM public.user_roles;

-- 7. Verificar estrutura da tabela user_roles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position; 