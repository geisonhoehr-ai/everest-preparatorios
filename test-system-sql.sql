-- Teste completo do sistema de progresso e ranking
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_name IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY table_name;

-- 2. Verificar estrutura das tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY table_name, ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename, policyname;

-- 4. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename;

-- 5. Testar inserção de dados de exemplo (se as tabelas existirem)
-- Descomente as linhas abaixo se as tabelas existirem:

-- INSERT INTO user_gamification_stats (user_uuid, total_xp, level) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 100, 2)
-- ON CONFLICT (user_uuid) DO NOTHING;

-- INSERT INTO user_rankings (user_uuid, total_xp, level, rank_position) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 100, 2, 1)
-- ON CONFLICT (user_uuid) DO NOTHING;

-- 6. Verificar dados inseridos
-- SELECT 'user_gamification_stats' as tabela, COUNT(*) as registros FROM user_gamification_stats
-- UNION ALL
-- SELECT 'user_rankings' as tabela, COUNT(*) as registros FROM user_rankings
-- UNION ALL
-- SELECT 'user_topic_progress' as tabela, COUNT(*) as registros FROM user_topic_progress
-- UNION ALL
-- SELECT 'user_quiz_scores' as tabela, COUNT(*) as registros FROM user_quiz_scores;
