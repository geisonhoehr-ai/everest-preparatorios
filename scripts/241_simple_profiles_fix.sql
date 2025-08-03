-- Script simples para adicionar user_id à tabela profiles existente
-- Data: 2025-01-28

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT '=== ESTRUTURA ATUAL ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNA user_id SE NÃO EXISTIR
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN user_id UUID;
    RAISE NOTICE 'Coluna user_id adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna user_id já existe';
  END IF;
END $$;

-- 3. COPIAR DADOS DE auth.users PARA user_id
-- Para registros que têm email mas não têm user_id
UPDATE public.profiles 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE profiles.user_id IS NULL 
  AND profiles.email = auth_users.email;

-- 4. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar estrutura final
SELECT 
  'Estrutura final:' as tipo,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar dados
SELECT 
  'Dados:' as tipo,
  COUNT(*) as total_profiles,
  COUNT(user_id) as profiles_com_user_id,
  COUNT(avatar_url) as profiles_com_avatar
FROM public.profiles;

SELECT '=== SCRIPT CONCLUÍDO ===' as info; 