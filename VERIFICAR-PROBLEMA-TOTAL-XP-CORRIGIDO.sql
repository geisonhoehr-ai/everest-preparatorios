-- ========================================
-- VERIFICAR PROBLEMA TOTAL_XP CORRIGIDO
-- ========================================
-- Este script verifica o problema real com a coluna total_xp

-- 1. VERIFICAR ESTRUTURA DA TABELA USERS
SELECT 'ESTRUTURA DA TABELA USERS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE HÁ USUÁRIOS
SELECT 'USUÁRIOS EXISTENTES' as status,
       COUNT(*) as total_users
FROM "public"."users";

-- 3. VER PRIMEIROS USUÁRIOS
SELECT 'PRIMEIROS USUÁRIOS' as status,
       id,
       email,
       first_name,
       last_name,
       role,
       created_at
FROM "public"."users"
ORDER BY created_at
LIMIT 5;

-- 4. VERIFICAR SE A COLUNA TOTAL_XP EXISTE
SELECT 'VERIFICAR COLUNA TOTAL_XP' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 
               FROM information_schema.columns 
               WHERE table_name = 'users' 
                 AND table_schema = 'public'
                 AND column_name = 'total_xp'
           ) THEN 'EXISTE'
           ELSE 'NÃO EXISTE - PRECISA SER CRIADA'
       END as status_coluna;
