-- ===================================================================
-- CORREÇÃO DAS POLÍTICAS DE GAMIFICAÇÃO - EVEREST PREPARATÓRIOS
-- Este script corrige as políticas duplicadas e cria apenas as que faltam
-- ===================================================================

-- ===================================================================
-- REMOVER POLÍTICAS EXISTENTES (se houver)
-- ===================================================================

-- Remove políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can update own gamification stats" ON user_gamification_stats;
DROP POLICY IF EXISTS "Users can insert own gamification stats" ON user_gamification_stats;

DROP POLICY IF EXISTS "Users can view own activity log" ON user_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity log" ON user_activity_log;

DROP POLICY IF EXISTS "Anyone can view available achievements" ON available_achievements;

DROP POLICY IF EXISTS "Users can view own achievement progress" ON user_achievement_progress;
DROP POLICY IF EXISTS "Users can update own achievement progress" ON user_achievement_progress;
DROP POLICY IF EXISTS "Users can insert own achievement progress" ON user_achievement_progress;

DROP POLICY IF EXISTS "Anyone can view rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can insert own rankings" ON user_rankings;

DROP POLICY IF EXISTS "Users can view own daily stats" ON user_daily_stats;
DROP POLICY IF EXISTS "Users can insert own daily stats" ON user_daily_stats;

-- ===================================================================
-- CRIAR POLÍTICAS CORRIGIDAS
-- ===================================================================

-- Políticas para user_gamification_stats
CREATE POLICY "Users can view own gamification stats" ON user_gamification_stats
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update own gamification stats" ON user_gamification_stats
  FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own gamification stats" ON user_gamification_stats
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para user_activity_log
CREATE POLICY "Users can view own activity log" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own activity log" ON user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para available_achievements (leitura pública)
CREATE POLICY "Anyone can view available achievements" ON available_achievements
  FOR SELECT USING (true);

-- Políticas para user_achievement_progress
CREATE POLICY "Users can view own achievement progress" ON user_achievement_progress
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update own achievement progress" ON user_achievement_progress
  FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own achievement progress" ON user_achievement_progress
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para user_rankings (leitura pública para ranking)
CREATE POLICY "Anyone can view rankings" ON user_rankings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own rankings" ON user_rankings
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para user_daily_stats
CREATE POLICY "Users can view own daily stats" ON user_daily_stats
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own daily stats" ON user_daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- ===================================================================
-- VERIFICAR SE AS TABELAS EXISTEM ANTES DE INSERIR CONQUISTAS
-- ===================================================================

-- Insere conquistas apenas se a tabela existir e estiver vazia
DO $$
BEGIN
  -- Verifica se a tabela available_achievements existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'available_achievements') THEN
    -- Verifica se já tem conquistas
    IF NOT EXISTS (SELECT 1 FROM available_achievements LIMIT 1) THEN
      -- Insere conquistas padrão
      INSERT INTO available_achievements (achievement_key, title, description, icon, category, xp_reward, score_reward, requirements) VALUES
      -- Conquistas de Estudo
      ('first_flashcard', 'Primeira Vitória', 'Complete seu primeiro flashcard', '🧿', 'study', 50, 100, '{"type": "flashcard", "count": 1}'),
      ('flashcard_master', 'Mestre dos Cards', 'Complete 100 flashcards', '📚', 'study', 200, 500, '{"type": "flashcard", "count": 100}'),
      ('first_quiz', 'Primeiro Quiz', 'Complete seu primeiro quiz', '🎯', 'study', 50, 100, '{"type": "quiz", "count": 1}'),
      ('quiz_champion', 'Campeão dos Quizzes', 'Complete 20 quizzes', '🏆', 'study', 300, 1000, '{"type": "quiz", "count": 20}'),
      ('first_lesson', 'Primeira Lição', 'Assista sua primeira lição', '📖', 'study', 50, 100, '{"type": "lesson", "count": 1}'),

      -- Conquistas de Streak
      ('streak_3_days', 'Consistente', 'Estude por 3 dias consecutivos', '🔥', 'streak', 100, 200, '{"type": "streak", "days": 3}'),
      ('streak_7_days', 'Maratonista', 'Estude por 7 dias consecutivos', '🏃', 'streak', 200, 500, '{"type": "streak", "days": 7}'),
      ('streak_30_days', 'Lenda', 'Estude por 30 dias consecutivos', '👑', 'streak', 500, 2000, '{"type": "streak", "days": 30}'),

      -- Conquistas de Domínio
      ('topic_master', 'Mestre do Tópico', 'Complete 50 flashcards de um tópico', '🎓', 'mastery', 150, 400, '{"type": "topic_mastery", "flashcards": 50}'),
      ('perfect_quiz', 'Perfeição', 'Acerte 100% em um quiz', '💯', 'mastery', 100, 300, '{"type": "perfect_score", "percentage": 100}'),

      -- Conquistas de Nível
      ('level_5', 'Aprendiz', 'Alcance o nível 5', '⭐', 'level', 100, 300, '{"type": "level", "target": 5}'),
      ('level_10', 'Estudante', 'Alcance o nível 10', '⭐⭐', 'level', 200, 600, '{"type": "level", "target": 10}'),
      ('level_20', 'Mestre', 'Alcance o nível 20', '⭐⭐⭐', 'level', 500, 1500, '{"type": "level", "target": 20}'),

      -- Conquistas de Liga
      ('league_aprendizes', 'Aprendiz da Guilda', 'Complete a Liga dos Aprendizes', '🪄', 'league', 300, 1000, '{"type": "league", "name": "Aprendizes"}'),
      ('league_aventureiros', 'Aventureiro', 'Complete a Liga dos Aventureiros', '🗡️', 'league', 500, 2000, '{"type": "league", "name": "Aventureiros"}'),
      ('league_herois', 'Herói', 'Complete a Liga dos Heróis', '🛡️', 'league', 800, 3500, '{"type": "league", "name": "Heróis"}'),
      ('league_mestres', 'Mestre', 'Complete a Liga dos Mestres', '🔥', 'league', 1200, 5000, '{"type": "league", "name": "Mestres"}'),
      ('league_lendas', 'Lenda', 'Complete a Liga das Lendas', '🌌', 'league', 2000, 10000, '{"type": "league", "name": "Lendas"}');
      
      RAISE NOTICE '✅ 20 conquistas padrão inseridas com sucesso!';
    ELSE
      RAISE NOTICE 'ℹ️ Tabela de conquistas já possui dados. Pulando inserção.';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Tabela available_achievements não existe. Execute o script principal primeiro.';
  END IF;
END $$;

-- ===================================================================
-- VERIFICAR STATUS DAS TABELAS
-- ===================================================================

SELECT 
  '=== VERIFICAÇÃO DAS TABELAS DE GAMIFICAÇÃO ===' as secao,
  'Tabelas criadas' as status;

-- Verifica se as tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM (
  SELECT 'user_gamification_stats' as table_name
  UNION ALL SELECT 'user_activity_log'
  UNION ALL SELECT 'available_achievements'
  UNION ALL SELECT 'user_achievement_progress'
  UNION ALL SELECT 'user_rankings'
  UNION ALL SELECT 'user_daily_stats'
) t
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = t.table_name
);

-- Verifica políticas criadas
SELECT 
  '=== VERIFICAÇÃO DAS POLÍTICAS ===' as secao,
  'Políticas configuradas' as status;

SELECT 
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
  AND tablename IN (
    'user_gamification_stats',
    'user_activity_log', 
    'available_achievements',
    'user_achievement_progress',
    'user_rankings',
    'user_daily_stats'
  )
ORDER BY tablename, policyname;

-- ===================================================================
-- MENSAGEM DE SUCESSO
-- ===================================================================

SELECT 
  '✅ POLÍTICAS DE GAMIFICAÇÃO CORRIGIDAS COM SUCESSO!' as status,
  'Execute este script se houver erros de políticas duplicadas' as instrucao;

-- ===================================================================
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se não há mais erros de políticas
-- 3. Teste o sistema de gamificação
-- ===================================================================
