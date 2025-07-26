-- ===================================================================
-- SCRIPT DE LIMPEZA DO BANCO DE DADOS - REMOÇÃO DE REDUNDÂNCIAS
-- Execute no SQL Editor do Supabase
-- ===================================================================

-- 1. REMOVER TABELAS COMMUNITY (não implementadas ainda)
DROP TABLE IF EXISTS community_reactions CASCADE;
DROP TABLE IF EXISTS community_likes CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;

-- 2. LIMPAR CAMPOS DUPLICADOS EM student_profiles
-- Manter: school, grade (campos em inglês)
-- Remover: escola, ano_escolar (campos em português duplicados)
ALTER TABLE student_profiles 
DROP COLUMN IF EXISTS escola,
DROP COLUMN IF EXISTS ano_escolar;

-- 3. CONSOLIDAR TABELAS DE SCORE
-- Verificar se user_scores tem dados importantes antes de remover
SELECT 'user_scores tem dados:', count(*) FROM user_scores;

-- Se não tiver dados importantes, pode remover:
-- DROP TABLE IF EXISTS user_scores CASCADE;

-- 4. VERIFICAR TABELAS COM POUCOS DADOS
SELECT 
  'live_sessions' as tabela, count(*) as registros,
  CASE WHEN count(*) = 0 THEN '⚠️ Vazia' ELSE '✅ Tem dados' END as status
FROM live_sessions
UNION ALL
SELECT 'live_session_classes', count(*), 
  CASE WHEN count(*) = 0 THEN '⚠️ Vazia' ELSE '✅ Tem dados' END
FROM live_session_classes
UNION ALL
SELECT 'calendar_events', count(*),
  CASE WHEN count(*) = 0 THEN '⚠️ Vazia' ELSE '✅ Tem dados' END  
FROM calendar_events
UNION ALL
SELECT 'simulados', count(*),
  CASE WHEN count(*) = 0 THEN '⚠️ Vazia' ELSE '✅ Tem dados' END
FROM simulados
UNION ALL
SELECT 'templates_redacao', count(*),
  CASE WHEN count(*) = 0 THEN '⚠️ Vazia' ELSE '✅ Tem dados' END
FROM templates_redacao;

-- 5. OTIMIZAR TABELAS RESTANTES
VACUUM ANALYZE;

-- ===================================================================
-- RESULTADO ESPERADO:
-- - 4 tabelas community removidas
-- - 2 campos duplicados removidos
-- - Banco mais limpo e organizado
-- - Melhora na performance
-- ===================================================================

-- SUMMARY DOS ESPAÇOS LIBERADOS:
SELECT 
  '🎉 LIMPEZA CONCLUÍDA' as status,
  'Tabelas removidas: 4 (community)' as community,
  'Campos removidos: 2 (duplicados)' as duplicados,
  'Benefícios: Performance + Organização' as resultado; 