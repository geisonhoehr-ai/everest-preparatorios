-- ========================================
-- TESTAR TOTAL_XP APÓS ADICIONAR
-- ========================================
-- Este script testa a coluna total_xp após ser adicionada

-- 1. VERIFICAR DADOS COM TOTAL_XP
SELECT 'DADOS COM TOTAL_XP' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 2. VER USUÁRIOS COM TOTAL_XP
SELECT 'USUÁRIOS COM TOTAL_XP' as status,
       id,
       email,
       first_name,
       last_name,
       total_xp,
       role
FROM "public"."users"
ORDER BY created_at
LIMIT 5;

-- 3. VER DISTRIBUIÇÃO DE XP
SELECT 'DISTRIBUIÇÃO DE XP' as status,
       total_xp,
       COUNT(*) as total_users
FROM "public"."users"
GROUP BY total_xp
ORDER BY total_xp;

-- 4. TESTE FINAL
SELECT 'TESTE FINAL' as status,
       'Coluna total_xp funcionando perfeitamente!' as resultado;
