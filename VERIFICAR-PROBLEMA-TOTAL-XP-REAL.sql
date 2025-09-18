-- ========================================
-- VERIFICAR PROBLEMA REAL COM TOTAL_XP
-- ========================================
-- Este script verifica o problema real com a coluna total_xp

-- 1. VERIFICAR ESTRUTURA DA COLUNA
SELECT 'ESTRUTURA DA COLUNA TOTAL_XP' as status,
       column_name,
       is_nullable,
       data_type,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name = 'total_xp';

-- 2. VERIFICAR SE HÁ USUÁRIOS COM TOTAL_XP NULL
SELECT 'USUÁRIOS COM TOTAL_XP NULL' as status,
       COUNT(*) as total_null
FROM "public"."users"
WHERE total_xp IS NULL;

-- 3. VER TODOS OS USUÁRIOS E SEUS VALORES DE TOTAL_XP
SELECT 'TODOS OS USUÁRIOS' as status,
       id,
       email,
       total_xp,
       role,
       created_at
FROM "public"."users"
ORDER BY created_at;

-- 4. VERIFICAR SE HÁ CONSTRAINTS NA TABELA
SELECT 'CONSTRAINTS DA TABELA USERS' as status,
       constraint_name,
       constraint_type,
       column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' 
  AND tc.table_schema = 'public'
  AND kcu.column_name = 'total_xp';

-- 5. VERIFICAR SE HÁ DADOS EXISTENTES
SELECT 'DADOS EXISTENTES' as status,
       COUNT(*) as total_users,
       COUNT(total_xp) as users_com_xp,
       COUNT(*) - COUNT(total_xp) as users_sem_xp
FROM "public"."users";

-- 6. VERIFICAR SE A TABELA ESTÁ VAZIA
SELECT 'TABELA VAZIA?' as status,
       CASE 
           WHEN COUNT(*) = 0 THEN 'SIM - TABELA VAZIA'
           ELSE 'NÃO - TEM ' || COUNT(*) || ' USUÁRIOS'
       END as resultado
FROM "public"."users";
