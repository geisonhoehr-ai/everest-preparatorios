-- Script FINAL para corrigir todas as políticas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover a política restante
DROP POLICY IF EXISTS "Anyone can view rankings" ON user_rankings;

-- 2. Verificar se todas as políticas foram removidas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename, policyname;

-- 3. Criar políticas para user_gamification_stats
CREATE POLICY "Users can view own gamification stats" ON user_gamification_stats
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own gamification stats" ON user_gamification_stats
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own gamification stats" ON user_gamification_stats
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 4. Criar políticas para user_rankings
CREATE POLICY "Users can view own rankings" ON user_rankings
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own rankings" ON user_rankings
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own rankings" ON user_rankings
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 5. Política para permitir visualização do ranking global
CREATE POLICY "Anyone can view global rankings" ON user_rankings
  FOR SELECT USING (true);

-- 6. Criar políticas para user_topic_progress
CREATE POLICY "Users can view own topic progress" ON user_topic_progress
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own topic progress" ON user_topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own topic progress" ON user_topic_progress
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 7. Criar políticas para user_quiz_scores
CREATE POLICY "Users can view own quiz scores" ON user_quiz_scores
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own quiz scores" ON user_quiz_scores
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- 8. Verificar se todas as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename, policyname;
