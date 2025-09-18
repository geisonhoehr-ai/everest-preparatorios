-- =====================================================
-- SCRIPT PARA CRIAR BANCO DE DADOS - ESTRUTURA INTEGER
-- EVEREST PREPARATÓRIOS - COMPATÍVEL COM ESTRUTURA ATUAL
-- =====================================================

-- =====================================================
-- 1. TABELAS DE AUTENTICAÇÃO E PERFIS (COMPATÍVEIS)
-- =====================================================

-- Tabela de perfis de usuário (compatível com INTEGER)
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  "display_name" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de permissões de página
CREATE TABLE IF NOT EXISTS "page_permissions" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER,
  "page_name" VARCHAR(255) NOT NULL,
  "has_access" BOOLEAN DEFAULT 'false',
  "granted_by" INTEGER,
  "granted_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expires_at" TIMESTAMP WITH TIME ZONE
);

-- Tabela de senhas temporárias
CREATE TABLE IF NOT EXISTS "temporary_passwords" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "used" BOOLEAN DEFAULT 'false',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS DE GAMIFICAÇÃO E ESTATÍSTICAS
-- =====================================================

-- Estatísticas de gamificação
CREATE TABLE IF NOT EXISTS "user_gamification_stats" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "total_xp" INTEGER NOT NULL DEFAULT 0,
  "current_level" INTEGER NOT NULL DEFAULT 1,
  "current_rank" VARCHAR(255) NOT NULL DEFAULT 'novato da guilda',
  "current_league" VARCHAR(255) NOT NULL DEFAULT 'aprendizes',
  "total_score" INTEGER NOT NULL DEFAULT 0,
  "flashcards_completed" INTEGER NOT NULL DEFAULT 0,
  "quizzes_completed" INTEGER NOT NULL DEFAULT 0,
  "lessons_completed" INTEGER NOT NULL DEFAULT 0,
  "current_streak" INTEGER NOT NULL DEFAULT 0,
  "longest_streak" INTEGER NOT NULL DEFAULT 0,
  "last_study_date" DATE DEFAULT CURRENT_DATE,
  "achievements_unlocked" INTEGER NOT NULL DEFAULT 0,
  "total_study_time" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Progresso de conquistas
CREATE TABLE IF NOT EXISTS "user_achievement_progress" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "achievement_key" VARCHAR(255) NOT NULL,
  "current_progress" INTEGER NOT NULL DEFAULT 0,
  "required_progress" INTEGER NOT NULL,
  "is_unlocked" BOOLEAN NOT NULL DEFAULT 'false',
  "unlocked_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estatísticas diárias
CREATE TABLE IF NOT EXISTS "user_daily_stats" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "date" DATE NOT NULL,
  "xp_earned" INTEGER NOT NULL DEFAULT 0,
  "score_earned" INTEGER NOT NULL DEFAULT 0,
  "flashcards_studied" INTEGER NOT NULL DEFAULT 0,
  "quizzes_completed" INTEGER NOT NULL DEFAULT 0,
  "lessons_watched" INTEGER NOT NULL DEFAULT 0,
  "study_time_minutes" INTEGER NOT NULL DEFAULT 0,
  "streak_maintained" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rankings
CREATE TABLE IF NOT EXISTS "user_rankings" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "period_type" VARCHAR(50) NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "total_score" INTEGER NOT NULL DEFAULT 0,
  "total_xp" INTEGER NOT NULL DEFAULT 0,
  "rank_position" INTEGER,
  "league_position" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conquistas
CREATE TABLE IF NOT EXISTS "achievements" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "achievement_type" VARCHAR(100) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "icon" VARCHAR(255) NOT NULL,
  "xp_reward" INTEGER NOT NULL,
  "unlocked_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "shared" BOOLEAN DEFAULT 'false'
);

-- Sequências de estudo
CREATE TABLE IF NOT EXISTS "study_streaks" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "days_count" INTEGER NOT NULL,
  "is_active" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ranks RPG
CREATE TABLE IF NOT EXISTS "rpg_ranks" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "level" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "insignia" VARCHAR(255) NOT NULL,
  "blessing" VARCHAR(255) NOT NULL,
  "xp_required" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS DE FLASHCARDS E ESTUDO
-- =====================================================

-- Tópicos
CREATE TABLE IF NOT EXISTS "topics" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "user_id" INTEGER,
  "subject_id" INTEGER
);

-- Flashcards
CREATE TABLE IF NOT EXISTS "flashcards" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL
);

-- Progresso de flashcards
CREATE TABLE IF NOT EXISTS "flashcard_progress" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "flashcard_id" INTEGER NOT NULL,
  "ease_factor" NUMERIC NOT NULL DEFAULT 2.5,
  "interval_days" INTEGER NOT NULL DEFAULT 1,
  "repetitions" INTEGER NOT NULL DEFAULT 0,
  "quality" INTEGER NOT NULL DEFAULT 0,
  "last_reviewed" TIMESTAMP WITH TIME ZONE,
  "next_review" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "status" VARCHAR(50) NOT NULL DEFAULT 'new',
  UNIQUE(user_id, flashcard_id)
);

-- Categorias de flashcards
CREATE TABLE IF NOT EXISTS "flashcard_categories" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "color" VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  "icon" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tags de flashcards
CREATE TABLE IF NOT EXISTS "flashcard_tags" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "color" VARCHAR(7) NOT NULL DEFAULT '#6b7280',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Relações categoria-flashcard
CREATE TABLE IF NOT EXISTS "flashcard_category_relations" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "flashcard_id" INTEGER NOT NULL,
  "category_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Relações tag-flashcard
CREATE TABLE IF NOT EXISTS "flashcard_tag_relations" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "flashcard_id" INTEGER NOT NULL,
  "tag_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cards errados
CREATE TABLE IF NOT EXISTS "wrong_cards" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "flashcard_id" INTEGER NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "reviewed" BOOLEAN DEFAULT 'false',
  "reviewed_at" TIMESTAMP WITH TIME ZONE
);

-- Progresso por tópico
CREATE TABLE IF NOT EXISTS "user_topic_progress" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "correct_count" INTEGER NOT NULL DEFAULT 0,
  "incorrect_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Sessões de estudo
CREATE TABLE IF NOT EXISTS "study_sessions" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "session_type" VARCHAR(50) NOT NULL DEFAULT 'review',
  "total_cards" INTEGER NOT NULL DEFAULT 0,
  "correct_answers" INTEGER NOT NULL DEFAULT 0,
  "incorrect_answers" INTEGER NOT NULL DEFAULT 0,
  "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
  "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cards das sessões de estudo
CREATE TABLE IF NOT EXISTS "study_session_cards" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "session_id" INTEGER NOT NULL,
  "flashcard_id" INTEGER NOT NULL,
  "quality" INTEGER NOT NULL,
  "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
  "was_correct" BOOLEAN NOT NULL,
  "ease_factor_before" NUMERIC,
  "ease_factor_after" NUMERIC,
  "interval_before" INTEGER,
  "interval_after" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Metas de estudo
CREATE TABLE IF NOT EXISTS "study_goals" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "goal_type" VARCHAR(100) NOT NULL,
  "target_value" INTEGER NOT NULL,
  "current_value" INTEGER NOT NULL DEFAULT 0,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_completed" BOOLEAN NOT NULL DEFAULT 'false',
  "description" TEXT,
  "reward" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE "user_gamification_stats" IS 'Estatísticas de gamificação do usuário (XP, nível, rank, liga)';
COMMENT ON TABLE "wrong_cards" IS 'Tabela para armazenar flashcards que os usuários erraram para revisão posterior';
COMMENT ON COLUMN "wrong_cards"."user_id" IS 'ID do usuário que errou o card';
COMMENT ON COLUMN "wrong_cards"."flashcard_id" IS 'ID do flashcard que foi errado';
COMMENT ON COLUMN "wrong_cards"."topic_id" IS 'ID do tópico do flashcard';
COMMENT ON COLUMN "wrong_cards"."created_at" IS 'Data/hora em que o card foi errado';
COMMENT ON COLUMN "wrong_cards"."reviewed" IS 'Se o card errado foi revisado (acertado em sessão posterior)';
COMMENT ON COLUMN "wrong_cards"."reviewed_at" IS 'Data/hora em que o card foi marcado como revisado';
COMMENT ON TABLE "user_achievement_progress" IS 'Progresso do usuário em cada conquista';
COMMENT ON TABLE "user_daily_stats" IS 'Estatísticas diárias do usuário';
COMMENT ON TABLE "user_rankings" IS 'Rankings semanais, mensais e gerais';
COMMENT ON TABLE "flashcard_progress" IS 'Progresso dos flashcards com algoritmo SM2/Anki';
COMMENT ON COLUMN "flashcard_progress"."ease_factor" IS 'Fator de facilidade do algoritmo SM2 (1.3-2.5)';
COMMENT ON COLUMN "flashcard_progress"."interval_days" IS 'Intervalo em dias até próxima revisão';
COMMENT ON COLUMN "flashcard_progress"."quality" IS 'Qualidade da resposta (0-5)';
COMMENT ON COLUMN "flashcard_progress"."status" IS 'Status do card: new, learning, review, relearning';
COMMENT ON TABLE "flashcard_categories" IS 'Categorias para organizar flashcards';
COMMENT ON TABLE "flashcard_tags" IS 'Tags para classificar flashcards';
COMMENT ON TABLE "study_sessions" IS 'Sessões de estudo dos usuários';
COMMENT ON TABLE "study_goals" IS 'Metas de estudo dos usuários';

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para perfis
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Índices para gamificação
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_user_id ON user_gamification_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_level ON user_gamification_stats(current_level);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_league ON user_gamification_stats(current_league);

-- Índices para flashcards
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review ON flashcard_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_status ON flashcard_progress(status);

-- Índices para progresso
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_id ON user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_topic_id ON user_topic_progress(topic_id);

-- Índices para sessões de estudo
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_id ON user_daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_date ON user_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_period ON user_rankings(period_type, period_start, period_end);

-- =====================================================
-- 6. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpg_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_session_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para gamificação
CREATE POLICY "Users can view their own gamification stats" ON user_gamification_stats
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own gamification stats" ON user_gamification_stats
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own gamification stats" ON user_gamification_stats
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para flashcards
CREATE POLICY "Anyone can view flashcards" ON flashcards
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own flashcard progress" ON flashcard_progress
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own flashcard progress" ON flashcard_progress
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own flashcard progress" ON flashcard_progress
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para progresso
CREATE POLICY "Users can view their own topic progress" ON user_topic_progress
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own topic progress" ON user_topic_progress
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own topic progress" ON user_topic_progress
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para sessões de estudo
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para estatísticas
CREATE POLICY "Users can view their own daily stats" ON user_daily_stats
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own daily stats" ON user_daily_stats
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own daily stats" ON user_daily_stats
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para rankings
CREATE POLICY "Anyone can view rankings" ON user_rankings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own rankings" ON user_rankings
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para conquistas
CREATE POLICY "Users can view their own achievements" ON achievements
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own achievements" ON achievements
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para metas de estudo
CREATE POLICY "Users can view their own study goals" ON study_goals
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own study goals" ON study_goals
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own study goals" ON study_goals
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para cards errados
CREATE POLICY "Users can view their own wrong cards" ON wrong_cards
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own wrong cards" ON wrong_cards
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own wrong cards" ON wrong_cards
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para tópicos
CREATE POLICY "Anyone can view topics" ON topics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own topics" ON topics
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own topics" ON topics
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para categorias e tags (públicas)
CREATE POLICY "Anyone can view flashcard categories" ON flashcard_categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view flashcard tags" ON flashcard_tags
    FOR SELECT USING (true);

-- Políticas para relações (públicas para leitura)
CREATE POLICY "Anyone can view flashcard category relations" ON flashcard_category_relations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view flashcard tag relations" ON flashcard_tag_relations
    FOR SELECT USING (true);

-- Políticas para ranks RPG (públicos)
CREATE POLICY "Anyone can view rpg ranks" ON rpg_ranks
    FOR SELECT USING (true);

-- Políticas para sequências de estudo
CREATE POLICY "Users can view their own study streaks" ON study_streaks
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own study streaks" ON study_streaks
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own study streaks" ON study_streaks
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para progresso de conquistas
CREATE POLICY "Users can view their own achievement progress" ON user_achievement_progress
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own achievement progress" ON user_achievement_progress
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own achievement progress" ON user_achievement_progress
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para permissões de página
CREATE POLICY "Users can view their own page permissions" ON page_permissions
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can view their own temporary passwords" ON temporary_passwords
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- =====================================================
-- 8. FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 9. TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_gamification_stats_updated_at
    BEFORE UPDATE ON user_gamification_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievement_progress_updated_at
    BEFORE UPDATE ON user_achievement_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_progress_updated_at
    BEFORE UPDATE ON flashcard_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_categories_updated_at
    BEFORE UPDATE ON flashcard_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_topic_progress_updated_at
    BEFORE UPDATE ON user_topic_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at
    BEFORE UPDATE ON study_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'PARTE 1 CONCLUÍDA - TABELAS DE AUTENTICAÇÃO, GAMIFICAÇÃO E FLASHCARDS (INTEGER)' as status;

SELECT 
    table_name,
    '✅ CRIADA' as status
FROM information_schema.tables 
WHERE table_name IN (
    'user_profiles', 'page_permissions', 'temporary_passwords',
    'user_gamification_stats', 'user_achievement_progress', 'user_daily_stats',
    'user_rankings', 'achievements', 'study_streaks', 'rpg_ranks',
    'topics', 'flashcards', 'flashcard_progress', 'flashcard_categories',
    'flashcard_tags', 'flashcard_category_relations', 'flashcard_tag_relations',
    'wrong_cards', 'user_topic_progress', 'study_sessions', 'study_session_cards',
    'study_goals'
)
AND table_schema = 'public'
ORDER BY table_name;
