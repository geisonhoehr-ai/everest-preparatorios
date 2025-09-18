-- =====================================================
-- VERIFICAR USUÁRIOS DISPONÍVEIS
-- =====================================================

-- 1. Ver todos os usuários
SELECT 'USUÁRIOS DISPONÍVEIS' as status, 
       id,
       email,
       role
FROM "public"."users"
ORDER BY created_at;

-- 2. Verificar se há usuários
SELECT 'TOTAL DE USUÁRIOS' as status,
       COUNT(*) as total_users
FROM "public"."users";

-- 3. Verificar se há usuários com role admin
SELECT 'USUÁRIOS ADMIN' as status,
       COUNT(*) as total_admin_users
FROM "public"."users"
WHERE role = 'admin';

-- 4. Verificar se há usuários com role teacher
SELECT 'USUÁRIOS TEACHER' as status,
       COUNT(*) as total_teacher_users
FROM "public"."users"
WHERE role = 'teacher';
