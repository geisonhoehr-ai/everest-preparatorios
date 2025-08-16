-- ===================================================================
-- ANÁLISE COMPLETA DO SUPABASE - EVEREST PREPARATÓRIOS
-- Execute este script no SQL Editor do Supabase para mapear toda a estrutura
-- ===================================================================

-- 1. LISTAR TODAS AS TABELAS EXISTENTES
SELECT 
  '=== TABELAS EXISTENTES ===' as secao,
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) as tamanho_tabela
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. ESTRUTURA COMPLETA DE TODAS AS COLUNAS
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
  n_dead_tup as registros_mortos,
  pg_size_pretty(pg_total_relation_size(quote_ident(relname))) as tamanho_tabela
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

-- 11. VERIFICAR TABELAS ESPECÍFICAS DO SISTEMA
SELECT 
  '=== TABELAS DO SISTEMA EVEREST ===' as secao,
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as total_colunas,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as tamanho_tabela
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'user_roles', 'student_profiles', 'teacher_profiles', 'paid_users',
    'turmas', 'alunos_turmas', 'subjects', 'topics', 'flashcards', 
    'user_flashcard_progress', 'user_scores', 'quizzes', 'quiz_questions',
    'user_quiz_scores', 'redacoes', 'temas_redacao', 'imagens_redacao',
    'correcoes_redacao', 'notificacoes', 'community_posts', 'community_comments',
    'community_categories', 'community_likes', 'calendar_events', 'wrong_cards'
  )
ORDER BY table_name;

-- 12. VERIFICAR TABELAS QUE PODEM ESTAR OBSOLETAS
SELECT 
  '=== POSSÍVEIS TABELAS OBSOLETAS ===' as secao,
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as total_colunas,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as tamanho_tabela
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT IN (
    'user_roles', 'student_profiles', 'teacher_profiles', 'paid_users',
    'turmas', 'alunos_turmas', 'subjects', 'topics', 'flashcards', 
    'user_flashcard_progress', 'user_scores', 'quizzes', 'quiz_questions',
    'user_quiz_scores', 'redacoes', 'temas_redacao', 'imagens_redacao',
    'correcoes_redacao', 'notificacoes', 'community_posts', 'community_comments',
    'community_categories', 'community_likes', 'calendar_events', 'wrong_cards'
  )
ORDER BY table_name;

-- 13. VERIFICAR TABELAS DE GAMIFICAÇÃO EXISTENTES
SELECT 
  '=== TABELAS DE GAMIFICAÇÃO ===' as secao,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('user_scores', 'user_quiz_scores', 'user_topic_progress', 'user_flashcard_progress')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 14. VERIFICAR DADOS NAS TABELAS DE GAMIFICAÇÃO
SELECT 
  '=== DADOS NAS TABELAS DE GAMIFICAÇÃO ===' as secao,
  'user_scores' as tabela,
  count(*) as total_registros,
  'Registros de pontuação' as descricao
FROM user_scores
UNION ALL
SELECT 
  '=== DADOS NAS TABELAS DE GAMIFICAÇÃO ===' as secao,
  'user_quiz_scores' as tabela,
  count(*) as total_registros,
  'Registros de quiz' as descricao
FROM user_quiz_scores
UNION ALL
SELECT 
  '=== DADOS NAS TABELAS DE GAMIFICAÇÃO ===' as secao,
  'user_topic_progress' as tabela,
  count(*) as total_registros,
  'Registros de progresso por tópico' as descricao
FROM user_topic_progress
UNION ALL
SELECT 
  '=== DADOS NAS TABELAS DE GAMIFICAÇÃO ===' as secao,
  'user_flashcard_progress' as tabela,
  count(*) as total_registros,
  'Registros de progresso de flashcards' as descricao
FROM user_flashcard_progress;

-- 15. VERIFICAR ESTRUTURA DAS TABELAS DE USUÁRIOS
SELECT 
  '=== ESTRUTURA DAS TABELAS DE USUÁRIOS ===' as secao,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('user_roles', 'student_profiles', 'teacher_profiles', 'paid_users')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 16. VERIFICAR DADOS NAS TABELAS DE USUÁRIOS
SELECT 
  '=== DADOS NAS TABELAS DE USUÁRIOS ===' as secao,
  'user_roles' as tabela,
  count(*) as total_registros,
  'Registros de roles' as descricao
FROM user_roles
UNION ALL
SELECT 
  '=== DADOS NAS TABELAS DE USUÁRIOS ===' as secao,
  'student_profiles' as tabela,
  count(*) as total_registros,
  'Perfis de alunos' as descricao
FROM student_profiles
UNION ALL
SELECT 
  '=== DADOS NAS TABELAS DE USUÁRIOS ===' as secao,
  'teacher_profiles' as tabela,
  count(*) as total_registros,
  'Perfis de professores' as descricao
FROM teacher_profiles
UNION ALL
SELECT 
  '=== DADOS NAS TABELAS DE USUÁRIOS ===' as secao,
  'paid_users' as tabela,
  count(*) as total_registros,
  'Usuários pagos' as descricao
FROM paid_users;

-- 17. RESUMO FINAL
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
WHERE schemaname = 'public'

UNION ALL

SELECT 
  '=== RESUMO GERAL ===' as secao,
  'Tamanho total do banco: ' || pg_size_pretty(pg_database_size(current_database())) as estatistica;

-- ===================================================================
-- INSTRUÇÕES DE USO:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Analise os resultados seção por seção
-- 3. Identifique tabelas obsoletas ou faltantes
-- 4. Planeje as correções necessárias
-- 5. Verifique se as tabelas de gamificação estão funcionando
-- ===================================================================
