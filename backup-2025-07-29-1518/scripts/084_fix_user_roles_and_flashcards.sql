-- Script para corrigir problemas de user_roles e flashcards
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para fazer as correções
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS "Enable read access for all users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for authenticated users on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to delete their own role" ON public.user_roles;

-- 3. Criar políticas mais permissivas para permitir acesso
CREATE POLICY "Allow authenticated users to read user_roles" ON public.user_roles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own role" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Allow users to update their own role" ON public.user_roles
FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Allow users to delete their own role" ON public.user_roles
FOR DELETE USING (auth.uid() = user_uuid);

-- 4. Reabilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se há usuários sem role
SELECT 
  u.id,
  u.email,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 6. Inserir roles padrão para usuários que não têm
INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
  u.id,
  'student',
  true,
  false
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 7. Verificar resultado final
SELECT 
  COUNT(*) as total_users,
  COUNT(ur.user_uuid) as users_with_roles,
  COUNT(*) - COUNT(ur.user_uuid) as users_without_roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid;

-- 8. Verificar se há flashcards disponíveis
SELECT COUNT(*) as total_flashcards FROM public.flashcards;

-- 9. Verificar tópicos com flashcards
SELECT 
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
HAVING COUNT(f.id) > 0
ORDER BY t.name;

-- 10. Verificar se a tabela topics existe e tem dados
SELECT COUNT(*) as total_topics FROM public.topics;

-- 11. Mostrar alguns tópicos de exemplo
SELECT id, name FROM public.topics LIMIT 10; 