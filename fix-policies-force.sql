-- Script para FORÇAR a correção das políticas RLS
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS temporariamente para remover políticas
ALTER TABLE user_gamification_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_scores DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes (forçar)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Remover políticas de user_gamification_stats
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_gamification_stats') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_gamification_stats';
    END LOOP;
    
    -- Remover políticas de user_rankings
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_rankings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_rankings';
    END LOOP;
    
    -- Remover políticas de user_topic_progress
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_topic_progress') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_topic_progress';
    END LOOP;
    
    -- Remover políticas de user_quiz_scores
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_quiz_scores') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_quiz_scores';
    END LOOP;
END $$;

-- 3. Reabilitar RLS
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_scores ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas para user_gamification_stats
CREATE POLICY "Users can view own gamification stats" ON user_gamification_stats
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own gamification stats" ON user_gamification_stats
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own gamification stats" ON user_gamification_stats
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 5. Criar políticas para user_rankings
CREATE POLICY "Users can view own rankings" ON user_rankings
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own rankings" ON user_rankings
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own rankings" ON user_rankings
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 6. Política para permitir visualização do ranking global
CREATE POLICY "Anyone can view global rankings" ON user_rankings
  FOR SELECT USING (true);

-- 7. Criar políticas para user_topic_progress
CREATE POLICY "Users can view own topic progress" ON user_topic_progress
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own topic progress" ON user_topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own topic progress" ON user_topic_progress
  FOR UPDATE USING (auth.uid() = user_uuid);

-- 8. Criar políticas para user_quiz_scores
CREATE POLICY "Users can view own quiz scores" ON user_quiz_scores
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own quiz scores" ON user_quiz_scores
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- 9. Verificar se as políticas foram criadas corretamente
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

-- 10. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY tablename;
