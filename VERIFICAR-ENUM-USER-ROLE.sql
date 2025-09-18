-- =====================================================
-- VERIFICAR ENUM USER_ROLE
-- =====================================================

-- 1. Ver todos os valores do enum user_role
SELECT 'VALORES DO ENUM USER_ROLE' as status, 
       unnest(enum_range(NULL::user_role)) as role_value;

-- 2. Ver todos os usuários
SELECT 'USUÁRIOS DISPONÍVEIS' as status, 
       id,
       email,
       role
FROM "public"."users"
ORDER BY created_at;

-- 3. Verificar se há usuários
SELECT 'TOTAL DE USUÁRIOS' as status,
       COUNT(*) as total_users
FROM "public"."users";

-- 4. Verificar distribuição por role
SELECT 'DISTRIBUIÇÃO POR ROLE' as status,
       role,
       COUNT(*) as total_users
FROM "public"."users"
GROUP BY role
ORDER BY total_users DESC;
