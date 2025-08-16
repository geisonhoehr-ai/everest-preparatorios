-- Script para testar permissões RLS e acesso à tabela user_roles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT 
  'Status RLS user_roles' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_roles';

-- 2. Listar todas as políticas RLS da tabela user_roles
SELECT 
  'Políticas RLS user_roles' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 3. Verificar permissões da tabela user_roles
SELECT 
  'Permissões da tabela' as info,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'user_roles'
AND table_schema = 'public';

-- 4. Verificar se o role 'anon' tem acesso
SELECT 
  'Permissões do role anon' as info,
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'user_roles'
AND table_schema = 'public'
AND grantee = 'anon';

-- 5. Verificar se o role 'authenticated' tem acesso
SELECT 
  'Permissões do role authenticated' as info,
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'user_roles'
AND table_schema = 'public'
AND grantee = 'authenticated';

-- 6. Testar acesso direto à tabela (como usuário anon)
-- Isso simula o que o cliente Supabase faria
SELECT 
  'Teste de acesso direto' as info,
  COUNT(*) as total_records
FROM public.user_roles;

-- 7. Verificar se há dados na tabela
SELECT 
  'Dados na tabela' as info,
  COUNT(*) as total_roles,
  COUNT(DISTINCT user_uuid) as unique_users
FROM public.user_roles;

-- 8. Listar alguns registros para verificar se há dados
SELECT 
  'Registros na tabela' as info,
  user_uuid,
  role,
  created_at
FROM public.user_roles
ORDER BY created_at DESC
LIMIT 5; 