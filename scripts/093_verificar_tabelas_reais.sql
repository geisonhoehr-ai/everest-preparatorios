-- ===================================================================
-- VERIFICAÇÃO SIMPLES DAS TABELAS REAIS NO SUPABASE
-- Execute este script primeiro para descobrir o que realmente existe
-- ===================================================================

-- 1. LISTAR TODAS AS TABELAS EXISTENTES (SIMPLES)
SELECT 
  '=== TABELAS EXISTENTES ===' as secao,
  tablename,
  pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) as tamanho_tabela
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR SE EXISTEM TABELAS COM NOMES SIMILARES
SELECT 
  '=== TABELAS COM NOMES SIMILARES ===' as secao,
  tablename,
  CASE 
    WHEN tablename LIKE '%score%' THEN 'Possível tabela de pontuação'
    WHEN tablename LIKE '%user%' THEN 'Possível tabela de usuário'
    WHEN tablename LIKE '%progress%' THEN 'Possível tabela de progresso'
    WHEN tablename LIKE '%quiz%' THEN 'Possível tabela de quiz'
    WHEN tablename LIKE '%flashcard%' THEN 'Possível tabela de flashcard'
    WHEN tablename LIKE '%role%' THEN 'Possível tabela de roles'
    WHEN tablename LIKE '%profile%' THEN 'Possível tabela de perfis'
    ELSE 'Outra tabela'
  END as tipo_sugerido
FROM pg_tables 
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%score%' OR
    tablename LIKE '%user%' OR
    tablename LIKE '%progress%' OR
    tablename LIKE '%quiz%' OR
    tablename LIKE '%flashcard%' OR
    tablename LIKE '%role%' OR
    tablename LIKE '%profile%'
  )
ORDER BY tablename;

-- 3. VERIFICAR ESTRUTURA DAS PRIMEIRAS 5 TABELAS (para não sobrecarregar)
SELECT 
  '=== ESTRUTURA DAS PRIMEIRAS 5 TABELAS ===' as secao,
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN (
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename 
    LIMIT 5
  )
ORDER BY t.table_name, c.ordinal_position;

-- 4. CONTAR REGISTROS NAS PRIMEIRAS 5 TABELAS
SELECT 
  '=== CONTAGEM NAS PRIMEIRAS 5 TABELAS ===' as secao,
  schemaname,
  relname as tablename,
  n_live_tup as registros_atuais,
  pg_size_pretty(pg_total_relation_size(quote_ident(relname))) as tamanho_tabela
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
  AND relname IN (
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename 
    LIMIT 5
  )
ORDER BY n_live_tup DESC;

-- 5. VERIFICAR SE EXISTEM TABELAS DE AUTH (SUPABASE)
SELECT 
  '=== TABELAS DE AUTENTICAÇÃO SUPABASE ===' as secao,
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- 6. RESUMO SIMPLES
SELECT 
  '=== RESUMO SIMPLES ===' as secao,
  'Total de tabelas públicas: ' || count(*) as estatistica
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  '=== RESUMO SIMPLES ===' as secao,
  'Tamanho total do banco: ' || pg_size_pretty(pg_database_size(current_database())) as estatistica;

-- ===================================================================
-- INSTRUÇÕES:
-- 1. Execute este script primeiro
-- 2. Veja quais tabelas realmente existem
-- 3. Me envie os resultados
-- 4. Depois criaremos o SQL completo baseado no que existe
-- ===================================================================
