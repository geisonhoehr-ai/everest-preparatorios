-- Script para verificar a estrutura das tabelas de progresso
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar estrutura da tabela user_gamification_stats
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_gamification_stats'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela user_rankings
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_rankings'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela user_topic_progress
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_topic_progress'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela user_quiz_scores
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_quiz_scores'
ORDER BY ordinal_position;