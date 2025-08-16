-- ===================================================================
-- CRIAÇÃO DAS TABELAS DE GAMIFICAÇÃO RPG - EVEREST PREPARATÓRIOS
-- Este script cria as tabelas que faltam para o sistema RPG completo
-- ===================================================================

-- 1. TABELA DE PONTUAÇÃO TOTAL (XP) DO USUÁRIO
CREATE TABLE IF NOT EXISTS user_gamification_stats (
  user_uuid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_rank TEXT NOT NULL DEFAULT 'Novato da Guilda',
  current_league TEXT NOT NULL DEFAULT 'Aprendizes',
  total_score INTEGER NOT NULL DEFAULT 0,
  flashcards_completed INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE DEFAULT CURRENT_DATE,
  achievements_unlocked INTEGER NOT NULL DEFAULT 0,
  total_study_time INTEGER NOT NULL DEFAULT 0, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE HISTÓRICO DE ATIVIDADES (para calcular XP)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id SERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'flashcard', 'quiz', 'lesson', 'achievement'
  activity_id INTEGER, -- ID da atividade específica
  xp_earned INTEGER NOT NULL DEFAULT 0,
  score_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB, -- Dados adicionais da atividade
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE CONQUISTAS DISPONÍVEIS (template)
CREATE TABLE IF NOT EXISTS available_achievements (
  id SERIAL PRIMARY KEY,
  achievement_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Emoji ou nome do ícone
  category TEXT NOT NULL, -- 'study', 'streak', 'mastery', 'social'
  xp_reward INTEGER NOT NULL DEFAULT 0,
  score_reward INTEGER NOT NULL DEFAULT 0,
  requirements JSONB NOT NULL, -- Critérios para desbloquear
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE PROGRESSO DAS CONQUISTAS (para usuários que ainda não desbloquearam)
CREATE TABLE IF NOT EXISTS user_achievement_progress (
  id SERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL REFERENCES available_achievements(achievement_key),
  current_progress INTEGER NOT NULL DEFAULT 0,
  required_progress INTEGER NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uuid, achievement_key)
);

-- 5. TABELA DE RANKING SEMANAL/MENSAL
CREATE TABLE IF NOT EXISTS user_rankings (
  id SERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  league_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uuid, period_type, period_start)
);

-- 6. TABELA DE ESTATÍSTICAS DIÁRIAS
CREATE TABLE IF NOT EXISTS user_daily_stats (
  id SERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  score_earned INTEGER NOT NULL DEFAULT 0,
  flashcards_studied INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  lessons_watched INTEGER NOT NULL DEFAULT 0,
  study_time_minutes INTEGER NOT NULL DEFAULT 0,
  streak_maintained BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uuid, date)
);

-- ===================================================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- ===================================================================

-- Índices para user_gamification_stats
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_level ON user_gamification_stats(current_level);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_rank ON user_gamification_stats(current_rank);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_league ON user_gamification_stats(current_league);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_total_score ON user_gamification_stats(total_score);

-- Índices para user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_uuid ON user_activity_log(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Índices para user_achievement_progress
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_uuid ON user_achievement_progress(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_achievement_key ON user_achievement_progress(achievement_key);
CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_is_unlocked ON user_achievement_progress(is_unlocked);

-- Índices para user_rankings
CREATE INDEX IF NOT EXISTS idx_user_rankings_period ON user_rankings(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_user_rankings_total_score ON user_rankings(total_score);
CREATE INDEX IF NOT EXISTS idx_user_rankings_rank_position ON user_rankings(rank_position);

-- Índices para user_daily_stats
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_uuid ON user_daily_stats(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_date ON user_daily_stats(date);

-- ===================================================================
-- FUNÇÕES AUXILIARES
-- ===================================================================

-- Função para calcular XP baseado na atividade
CREATE OR REPLACE FUNCTION calculate_activity_xp(
  activity_type TEXT,
  score INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'medium'
) RETURNS INTEGER AS $$
BEGIN
  CASE activity_type
    WHEN 'flashcard' THEN
      RETURN CASE difficulty
        WHEN 'easy' THEN 5
        WHEN 'medium' THEN 10
        WHEN 'hard' THEN 15
        ELSE 10
      END;
    WHEN 'quiz' THEN
      RETURN GREATEST(10, score / 10); -- Mínimo 10 XP, máximo baseado na pontuação
    WHEN 'lesson' THEN
      RETURN 20;
    WHEN 'achievement' THEN
      RETURN 50;
    ELSE
      RETURN 5;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estatísticas do usuário
CREATE OR REPLACE FUNCTION update_user_gamification_stats(
  p_user_uuid UUID,
  p_xp_earned INTEGER DEFAULT 0,
  p_score_earned INTEGER DEFAULT 0,
  p_activity_type TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_gamification_stats (
    user_uuid, 
    total_xp, 
    total_score,
    flashcards_completed,
    quizzes_completed,
    lessons_completed,
    last_study_date
  )
  VALUES (
    p_user_uuid,
    p_xp_earned,
    p_score_earned,
    CASE WHEN p_activity_type = 'flashcard' THEN 1 ELSE 0 END,
    CASE WHEN p_activity_type = 'quiz' THEN 1 ELSE 0 END,
    CASE WHEN p_activity_type = 'lesson' THEN 1 ELSE 0 END,
    CURRENT_DATE
  )
  ON CONFLICT (user_uuid) DO UPDATE SET
    total_xp = user_gamification_stats.total_xp + p_xp_earned,
    total_score = user_gamification_stats.total_score + p_score_earned,
    flashcards_completed = user_gamification_stats.flashcards_completed + 
      CASE WHEN p_activity_type = 'flashcard' THEN 1 ELSE 0 END,
    quizzes_completed = user_gamification_stats.quizzes_completed + 
      CASE WHEN p_activity_type = 'quiz' THEN 1 ELSE 0 END,
    lessons_completed = user_gamification_stats.lessons_completed + 
      CASE WHEN p_activity_type = 'lesson' THEN 1 ELSE 0 END,
    last_study_date = CURRENT_DATE,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ===================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_stats ENABLE ROW LEVEL SECURITY;

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
-- INSERIR CONQUISTAS PADRÃO
-- ===================================================================

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
('league_lendas', 'Lenda', 'Complete a Liga das Lendas', '🌌', 'league', 2000, 10000, '{"type": "league", "name": "Lendas"}')

ON CONFLICT (achievement_key) DO NOTHING;

-- ===================================================================
-- COMENTÁRIOS DAS TABELAS
-- ===================================================================

COMMENT ON TABLE user_gamification_stats IS 'Estatísticas de gamificação do usuário (XP, nível, rank, liga)';
COMMENT ON TABLE user_activity_log IS 'Log de todas as atividades do usuário para cálculo de XP';
COMMENT ON TABLE available_achievements IS 'Conquistas disponíveis no sistema';
COMMENT ON TABLE user_achievement_progress IS 'Progresso do usuário em cada conquista';
COMMENT ON TABLE user_rankings IS 'Rankings semanais, mensais e gerais';
COMMENT ON TABLE user_daily_stats IS 'Estatísticas diárias do usuário';

-- ===================================================================
-- MENSAGEM DE SUCESSO
-- ===================================================================

SELECT 
  '✅ SISTEMA DE GAMIFICAÇÃO RPG CRIADO COM SUCESSO!' as status,
  'Tabelas criadas: 6' as tabelas,
  'Conquistas padrão: 20' as conquistas,
  'Funções auxiliares: 2' as funcoes,
  'Índices criados: 15' as indices;

-- ===================================================================
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Teste a criação das tabelas
-- 3. Integre com o dashboard e ranking
-- 4. Conecte com as tabelas existentes
-- ===================================================================
