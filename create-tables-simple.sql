-- Script SIMPLES para criar apenas as tabelas essenciais
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Tabela de estatísticas de gamificação
CREATE TABLE IF NOT EXISTS user_gamification_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
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
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank_position INTEGER DEFAULT 999999,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_uuid)
);

-- 3. Tabela de progresso por tópico
CREATE TABLE IF NOT EXISTS user_topic_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  flashcards_studied INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_uuid, topic_id)
);

-- 4. Tabela de pontuações de quiz
CREATE TABLE IF NOT EXISTS user_quiz_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_scores ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se as tabelas foram criadas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('user_gamification_stats', 'user_rankings', 'user_topic_progress', 'user_quiz_scores')
ORDER BY table_name, ordinal_position;
