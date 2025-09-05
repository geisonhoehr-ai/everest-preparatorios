-- Script para verificar TODAS as tabelas de progresso
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se as tabelas existem e suas colunas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY table_name, ordinal_position;
