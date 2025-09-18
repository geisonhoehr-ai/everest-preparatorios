-- ========================================
-- CORRIGIR COLUNA TOTAL_XP COM VALORES NULL
-- ========================================
-- Este script corrige a coluna total_xp que está com valores NULL

-- 1. VERIFICAR O PROBLEMA
SELECT 'VERIFICAR PROBLEMA TOTAL_XP' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 2. VER USUÁRIOS COM TOTAL_XP NULL
SELECT 'USUÁRIOS COM TOTAL_XP NULL' as status,
       id,
       email,
       total_xp,
       created_at
FROM "public"."users"
WHERE total_xp IS NULL
ORDER BY created_at;

-- 3. CORRIGIR VALORES NULL PARA 0
UPDATE "public"."users"
SET total_xp = 0
WHERE total_xp IS NULL;

-- 4. VERIFICAR SE FOI CORRIGIDO
SELECT 'VERIFICAÇÃO APÓS CORREÇÃO' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 5. VER DISTRIBUIÇÃO DE XP
SELECT 'DISTRIBUIÇÃO DE XP' as status,
       total_xp,
       COUNT(*) as total_users
FROM "public"."users"
GROUP BY total_xp
ORDER BY total_xp;

-- 6. VERIFICAR SE A COLUNA TEM CONSTRAINT NOT NULL
SELECT 'VERIFICAR CONSTRAINT TOTAL_XP' as status,
       column_name,
       is_nullable,
       data_type,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';
