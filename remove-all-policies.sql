-- Script para REMOVER todas as políticas existentes
-- Execute este script PRIMEIRO no SQL Editor do Supabase Dashboard

-- Remover políticas de user_gamification_stats
DROP POLICY IF EXISTS "Users can view own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can insert own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can update own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Admins can view all gamification stats" ON user_gamification_stats;

-- Remover políticas de user_rankings
DROP POLICY IF EXISTS "Users can view own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can insert own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can update own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Anyone can view global rankings" ON user_rankings;
DROP POLICY IF EXISTS "Admins can view all rankings" ON user_rankings;

-- Remover políticas de user_topic_progress
DROP POLICY IF EXISTS "Users can view own topic progress" ON user_topic_progress;
DROP POLICY IF EXISTS "Users can insert own topic progress" ON user_topic_progress;
DROP POLICY IF EXISTS "Users can update own topic progress" ON user_topic_progress;
DROP POLICY IF EXISTS "Admins can view all topic progress" ON user_topic_progress;

-- Remover políticas de user_quiz_scores
DROP POLICY IF EXISTS "Users can view own quiz scores" ON user_quiz_scores;
DROP POLICY IF EXISTS "Users can insert own quiz scores" ON user_quiz_scores;
DROP POLICY IF EXISTS "Users can update own quiz scores" ON user_quiz_scores;
DROP POLICY IF EXISTS "Admins can view all quiz scores" ON user_quiz_scores;

-- Verificar se todas as políticas foram removidas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename, policyname;
