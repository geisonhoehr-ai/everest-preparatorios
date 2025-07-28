-- Script simples para testar autenticação
-- Execute este script no Supabase SQL Editor

-- 1. Contar usuários autenticados
SELECT 'Total de usuários:' as info, COUNT(*) as count FROM auth.users;

-- 2. Contar usuários com roles
SELECT 'Usuários com roles:' as info, COUNT(*) as count 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_uuid;

-- 3. Contar usuários sem roles
SELECT 'Usuários sem roles:' as info, COUNT(*) as count 
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 4. Listar usuários sem roles (se houver)
SELECT 'Usuários sem roles:' as info, id, email, created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 5. Verificar se há dados na tabela user_roles
SELECT 'Dados em user_roles:' as info, COUNT(*) as total_roles FROM public.user_roles;

-- 6. Listar todos os roles existentes
SELECT 'Roles existentes:' as info, user_uuid, role, created_at FROM public.user_roles ORDER BY created_at DESC; 