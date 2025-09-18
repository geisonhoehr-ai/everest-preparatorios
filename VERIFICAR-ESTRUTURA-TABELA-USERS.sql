-- ========================================
-- VERIFICAR ESTRUTURA REAL DA TABELA USERS
-- ========================================
-- Este script verifica a estrutura real da tabela users

-- 1. VERIFICAR SE A TABELA USERS EXISTE
SELECT 'VERIFICAR TABELA USERS' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 
               FROM information_schema.tables 
               WHERE table_name = 'users' 
                 AND table_schema = 'public'
           ) THEN 'EXISTE'
           ELSE 'NÃO EXISTE'
       END as status_tabela;

-- 2. VER TODAS AS COLUNAS DA TABELA USERS
SELECT 'COLUNAS DA TABELA USERS' as status,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VER DADOS EXISTENTES NA TABELA USERS
SELECT 'DADOS EXISTENTES NA TABELA USERS' as status,
       COUNT(*) as total_users
FROM "public"."users";

-- 4. VER PRIMEIROS USUÁRIOS (SE HOUVER)
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
