-- Script para corrigir políticas RLS existentes
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover todas as políticas existentes das tabelas de progresso
DROP POLICY IF EXISTS "Users can view own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can insert own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can update own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can view own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can insert own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can update own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can view own topic progress" ON user_topic_progress;
DROP POLICY IF EXISTS "Users can insert own topic progress" ON user_topic_progress;
DROP POLICY IF EXISTS "Users can update own topic progress" ON user_topic_progress;
DROP POLICY IF EXISTS "Users can view own quiz scores" ON user_quiz_scores;
DROP POLICY IF EXISTS "Users can insert own quiz scores" ON user_quiz_scores;
DROP POLICY IF EXISTS "Users can update own quiz scores" ON user_quiz_scores;
DROP POLICY IF EXISTS "Anyone can view global rankings" ON user_rankings;

-- 2. Recriar políticas para user_gamification_stats
CREATE POLICY "Users can view own gamification stats" ON user_gamification_stats
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own gamification stats" ON user_gamification_stats
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own gamification stats" ON user_gamification_stats
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 3. Recriar políticas para user_rankings
CREATE POLICY "Users can view own rankings" ON user_rankings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rankings" ON user_rankings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rankings" ON user_rankings
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Política para permitir visualização do ranking global
CREATE POLICY "Anyone can view global rankings" ON user_rankings
  FOR SELECT USING (true);

-- 5. Recriar políticas para user_topic_progress
CREATE POLICY "Users can view own topic progress" ON user_topic_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic progress" ON user_topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic progress" ON user_topic_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Recriar políticas para user_quiz_scores
CREATE POLICY "Users can view own quiz scores" ON user_quiz_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz scores" ON user_quiz_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename, policyname;
