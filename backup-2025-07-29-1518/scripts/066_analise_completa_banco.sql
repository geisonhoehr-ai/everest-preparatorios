-- ===================================================================
-- SCRIPT COMPLETO PARA ANÁLISE DO BANCO DE DADOS SUPABASE
-- Execute no SQL Editor do Supabase para mapear toda a estrutura
-- ===================================================================

-- 1. LISTAR TODAS AS TABELAS COM INFORMAÇÕES BÁSICAS
SELECT 
  '=== TABELAS EXISTENTES ===' as secao,
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. DETALHES COMPLETOS DE TODAS AS COLUNAS
SELECT 
  '=== ESTRUTURA DAS COLUNAS ===' as secao,
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  c.ordinal_position,
  coalesce(col_description(pgc.oid, c.ordinal_position), 'Sem comentário') as column_comment
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
LEFT JOIN pg_class pgc ON pgc.relname = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. CHAVES PRIMÁRIAS E ESTRANGEIRAS
SELECT 
  '=== CONSTRAINTS E RELACIONAMENTOS ===' as secao,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 4. ÍNDICES EXISTENTES
SELECT 
  '=== ÍNDICES ===' as secao,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. CONTAGEM DE REGISTROS POR TABELA
SELECT 
  '=== QUANTIDADE DE DADOS ===' as secao,
  schemaname,
  relname as tablename,
  n_tup_ins as total_inseridos,
  n_tup_upd as total_atualizados,
  n_tup_del as total_deletados,
  n_live_tup as registros_atuais,
  n_dead_tup as registros_mortos
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6. TABELAS E SUAS DESCRIÇÕES/COMENTÁRIOS
SELECT 
  '=== COMENTÁRIOS DAS TABELAS ===' as secao,
  t.table_name,
  coalesce(obj_description(c.oid), 'Sem descrição') as table_comment
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 7. STORAGE BUCKETS (SUPABASE STORAGE)
SELECT 
  '=== STORAGE BUCKETS ===' as secao,
  name as bucket_name,
  created_at,
  updated_at,
  public
FROM storage.buckets
ORDER BY name;

-- 8. POLICIES DE SEGURANÇA (RLS)
SELECT 
  '=== POLÍTICAS DE SEGURANÇA (RLS) ===' as secao,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. TRIGGERS EXISTENTES
SELECT 
  '=== TRIGGERS ===' as secao,
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. FUNÇÕES CUSTOMIZADAS
SELECT 
  '=== FUNÇÕES CUSTOMIZADAS ===' as secao,
  routine_name as function_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ===================================================================
-- ANÁLISE ESPECÍFICA PARA O PROJETO EVEREST
-- ===================================================================

-- 11. VERIFICAR TABELAS RELACIONADAS AO SISTEMA DE USUÁRIOS
SELECT 
  '=== SISTEMA DE USUÁRIOS ===' as analise,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_roles', 'student_profiles', 'teacher_profiles', 'paid_users')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 12. VERIFICAR TABELAS DO SISTEMA EDUCACIONAL
SELECT 
  '=== SISTEMA EDUCACIONAL ===' as analise,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('turmas', 'alunos_turmas', 'subjects', 'topics', 'flashcards', 'quizzes', 'quiz_questions')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 13. VERIFICAR SISTEMA DE REDAÇÕES
SELECT 
  '=== SISTEMA DE REDAÇÕES ===' as analise,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('redacoes', 'temas_redacao', 'imagens_redacao', 'correcoes_redacao', 'notificacoes')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 14. VERIFICAR TABELAS QUE PODEM ESTAR OBSOLETAS OU DUPLICADAS
SELECT 
  '=== POSSÍVEIS TABELAS OBSOLETAS ===' as analise,
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as total_colunas,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as tamanho_tabela
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT IN (
    'user_roles', 'student_profiles', 'teacher_profiles', 'paid_users',
    'turmas', 'alunos_turmas', 'subjects', 'topics', 'flashcards', 
    'quizzes', 'quiz_questions', 'redacoes', 'temas_redacao', 
    'imagens_redacao', 'correcoes_redacao', 'notificacoes'
  )
ORDER BY table_name;

-- 15. RESUMO FINAL
SELECT 
  '=== RESUMO GERAL ===' as secao,
  'Total de tabelas: ' || count(*) as estatistica
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  '=== RESUMO GERAL ===' as secao,
  'Total de colunas: ' || count(*) as estatistica
FROM information_schema.columns 
WHERE table_schema = 'public'

UNION ALL

SELECT 
  '=== RESUMO GERAL ===' as secao,
  'Total de constraints: ' || count(*) as estatistica
FROM information_schema.table_constraints 
WHERE table_schema = 'public'

UNION ALL

SELECT 
  '=== RESUMO GERAL ===' as secao,
  'Total de índices: ' || count(*) as estatistica
FROM pg_indexes 
WHERE schemaname = 'public';

-- ===================================================================
-- INSTRUÇÕES DE USO:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Analise os resultados seção por seção
-- 3. Identifique tabelas obsoletas ou faltantes
-- 4. Planeje as correções necessárias
-- =================================================================== 