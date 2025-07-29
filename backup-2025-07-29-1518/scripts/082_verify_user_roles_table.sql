-- Script para verificar a estrutura da tabela user_roles

-- Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_roles';

-- Verificar a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM public.user_roles;

-- Verificar alguns registros de exemplo
SELECT * FROM public.user_roles LIMIT 5;

-- Verificar se há usuários autenticados
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Verificar se há usuários sem role
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL
LIMIT 10;

-- Verificar políticas RLS
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
WHERE tablename = 'user_roles';

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_roles'; 