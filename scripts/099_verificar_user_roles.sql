-- Script para verificar a estrutura atual da tabela user_roles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 
  'TABELA EXISTE?' as pergunta,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) as resposta;

-- 2. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Verificar quantos registros existem
SELECT 
  'TOTAL DE REGISTROS' as tipo,
  COUNT(*) as quantidade
FROM user_roles;

-- 4. Verificar registros existentes
SELECT 
  id,
  user_uuid,
  email,
  role,
  created_at,
  updated_at
FROM user_roles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar se o usuário professor@teste.com existe
SELECT 
  'USUARIO EXISTE?' as pergunta,
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'professor@teste.com'
  ) as resposta;

-- 6. Verificar se o usuário tem role definido
SELECT 
  ur.id,
  ur.user_uuid,
  ur.email,
  ur.role,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
JOIN auth.users au ON au.id::text = ur.user_uuid
WHERE au.email = 'professor@teste.com';

-- 7. Verificar todos os usuários auth que não têm role
SELECT 
  'USUARIOS SEM ROLE' as tipo,
  COUNT(*) as quantidade
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_uuid = au.id::text
WHERE ur.user_uuid IS NULL;

-- 8. Verificar usuários auth existentes
SELECT 
  id,
  email,
  created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_uuid = au.id::text) 
    THEN 'COM ROLE' 
    ELSE 'SEM ROLE' 
  END as status
FROM auth.users au
ORDER BY created_at DESC
LIMIT 10;
