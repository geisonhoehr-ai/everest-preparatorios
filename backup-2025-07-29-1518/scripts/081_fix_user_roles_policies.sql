-- Script para corrigir políticas da tabela user_roles
-- Este script garante que os usuários autenticados possam ler seus próprios roles

-- Desabilitar RLS temporariamente para fazer as correções
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Enable read access for all users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for authenticated users on user_roles" ON public.user_roles;

-- Criar políticas mais permissivas para permitir acesso
CREATE POLICY "Allow authenticated users to read user_roles" ON public.user_roles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own role" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Allow users to update their own role" ON public.user_roles
FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Allow users to delete their own role" ON public.user_roles
FOR DELETE USING (auth.uid() = user_uuid);

-- Reabilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Verificar se há usuários sem role
SELECT 
  u.id,
  u.email,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- Inserir roles padrão para usuários que não têm
INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
  u.id,
  'student',
  true,
  false
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- Verificar resultado
SELECT 
  COUNT(*) as total_users,
  COUNT(ur.user_uuid) as users_with_roles,
  COUNT(*) - COUNT(ur.user_uuid) as users_without_roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid; 