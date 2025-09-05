-- Criar tabelas de progresso e ranking (VERSÃO CORRIGIDA)
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de estatísticas de gamificação
CREATE TABLE IF NOT EXISTS user_gamification_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- em segundos
  flashcards_studied INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_uuid)
);

-- 2. Tabela de ranking
CREATE TABLE IF NOT EXISTS user_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  rank_position INTEGER DEFAULT 999999,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Tabela de progresso por tópico
CREATE TABLE IF NOT EXISTS user_topic_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  flashcards_studied INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 4. Tabela de pontuações de quiz
CREATE TABLE IF NOT EXISTS user_quiz_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_spent INTEGER DEFAULT 0, -- em segundos
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_scores ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para permitir acesso autenticado
CREATE POLICY "Users can view own gamification stats" ON user_gamification_stats
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert own gamification stats" ON user_gamification_stats
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update own gamification stats" ON user_gamification_stats
  FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can view own rankings" ON user_rankings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rankings" ON user_rankings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rankings" ON user_rankings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own topic progress" ON user_topic_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic progress" ON user_topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic progress" ON user_topic_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz scores" ON user_quiz_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz scores" ON user_quiz_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Políticas para permitir visualização do ranking global (apenas posição e pontuação)
CREATE POLICY "Anyone can view global rankings" ON user_rankings
  FOR SELECT USING (true);

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_user_uuid ON user_gamification_stats(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_total_score ON user_rankings(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_id ON user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_id ON user_quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_completed_at ON user_quiz_scores(completed_at DESC);

-- 9. Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Triggers para atualizar updated_at
CREATE TRIGGER update_user_gamification_stats_updated_at 
  BEFORE UPDATE ON user_gamification_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_rankings_updated_at 
  BEFORE UPDATE ON user_rankings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_topic_progress_updated_at 
  BEFORE UPDATE ON user_topic_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Verificar se as tabelas foram criadas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY table_name, ordinal_position;

