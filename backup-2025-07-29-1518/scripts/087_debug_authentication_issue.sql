-- Script para debugar o problema de autenticação e busca de roles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se há usuários autenticados
SELECT 
  'Usuários autenticados' as info,
  COUNT(*) as total_users
FROM auth.users;

-- 2. Listar todos os usuários com seus roles
SELECT 
  'Usuários e roles' as info,
  u.id,
  u.email,
  u.created_at,
  ur.role,
  ur.first_login,
  ur.profile_completed
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
ORDER BY u.created_at DESC;

-- 3. Verificar usuários sem role
SELECT 
  'Usuários sem role' as info,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 4. Verificar políticas RLS atuais
SELECT 
  'Políticas RLS user_roles' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 5. Verificar se RLS está habilitado
SELECT 
  'Status RLS' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_roles';

-- 6. Testar inserção de role para usuário sem role (se houver)
-- Primeiro, vamos ver se há usuários sem role
WITH users_without_role AS (
  SELECT u.id, u.email
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
  WHERE ur.user_uuid IS NULL
  LIMIT 1
)
SELECT 
  'Usuário para teste' as info,
  id,
  email
FROM users_without_role;

-- 7. Verificar se a tabela user_roles tem dados
SELECT 
  'Dados na tabela user_roles' as info,
  COUNT(*) as total_roles,
  COUNT(DISTINCT user_uuid) as unique_users,
  COUNT(CASE WHEN role = 'student' THEN 1 END) as student_roles,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teacher_roles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_roles
FROM public.user_roles;

-- 8. Verificar se há problemas de permissão
SELECT 
  'Permissões da tabela user_roles' as info,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'user_roles'
AND table_schema = 'public'; 