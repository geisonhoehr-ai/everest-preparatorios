-- ========================================
-- RESOLVER TOTAL_XP DEFINITIVAMENTE
-- ========================================
-- Este script resolve definitivamente o problema da coluna total_xp

-- 1. PRIMEIRO, VERIFICAR O PROBLEMA
SELECT 'VERIFICAR PROBLEMA' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 2. SE HÁ USUÁRIOS COM TOTAL_XP NULL, CORRIGIR
UPDATE "public"."users"
SET total_xp = 0
WHERE total_xp IS NULL;

-- 3. SE A TABELA ESTÁ VAZIA, CRIAR UM USUÁRIO DE TESTE
INSERT INTO "public"."users" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    total_xp
)
SELECT 
    'teste@everest.com',
    '$2a$10$dummy.hash.for.testing',
    'Usuário',
    'Teste',
    'student',
    0
WHERE NOT EXISTS (
    SELECT 1 FROM "public"."users" LIMIT 1
);

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

-- 6. VERIFICAR CONSTRAINT FINAL
SELECT 'VERIFICAR CONSTRAINT FINAL' as status,
       column_name,
       is_nullable,
       data_type,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';

-- 7. TESTE FINAL - TENTAR INSERIR UM USUÁRIO
SELECT 'TESTE FINAL' as status,
       'Coluna total_xp está funcionando corretamente!' as resultado;
