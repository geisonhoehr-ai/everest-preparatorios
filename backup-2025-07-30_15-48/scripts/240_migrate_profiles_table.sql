-- Script para migrar tabela profiles existente
-- Data: 2025-01-28
-- Migração: Adicionar user_id e ajustar estrutura

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
  END IF;
END $$;

-- 3. MIGRAR DADOS EXISTENTES (se houver)
-- Copiar dados de user_uuid para user_id se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_uuid'
  ) THEN
    UPDATE public.profiles 
    SET user_id = user_uuid 
    WHERE user_id IS NULL AND user_uuid IS NOT NULL;
  END IF;
END $$;

-- 4. COPIAR DADOS DE auth.users SE NECESSÁRIO
-- Para registros que não têm user_id mas têm email
UPDATE public.profiles 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE profiles.user_id IS NULL 
  AND profiles.email = auth_users.email;

-- 5. ADICIONAR CONSTRAINTS
-- Tornar user_id NOT NULL e adicionar foreign key
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Adicionar foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Adicionar unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- 6. REMOVER COLUNAS ANTIGAS SE EXISTIREM
-- Remover user_uuid se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_uuid'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN user_uuid;
  END IF;
END $$;

-- 7. RECRIAR POLÍTICAS RLS
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar políticas novas
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- 8. VERIFICAÇÃO FINAL
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

-- Verificar políticas RLS
SELECT 
  'Políticas RLS:' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar dados migrados
SELECT 
  'Dados migrados:' as tipo,
  COUNT(*) as total_profiles,
  COUNT(user_id) as profiles_com_user_id,
  COUNT(avatar_url) as profiles_com_avatar
FROM public.profiles;

SELECT '=== MIGRAÇÃO CONCLUÍDA ===' as info; 