-- =====================================================
-- SCRIPT COMPLETO PARA CRIAR BANCO DE DADOS - PARTE 1
-- EVEREST PREPARATÓRIOS - ESTRUTURA COMPLETA
-- =====================================================

-- =====================================================
-- 1. CRIAR SCHEMA AUTH (se não existir)
-- =====================================================
CREATE SCHEMA IF NOT EXISTS "auth";

-- =====================================================
-- 2. TABELAS DE AUTENTICAÇÃO E PERFIS
-- =====================================================

-- Tabela de perfis de usuário
CREATE TABLE "profiles" (
  "user_uuid" uuid PRIMARY KEY NOT NULL,
  "nome_completo" text,
  "turma_id" text DEFAULT 'turma-basica',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Tabela de permissões de página
CREATE TABLE "page_permissions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "user_id" uuid,
  "page_name" varchar NOT NULL,
  "has_access" boolean DEFAULT 'false',
  "granted_by" uuid,
  "granted_at" timestamptz DEFAULT (now()),
  "expires_at" timestamptz
);

-- Tabela de senhas temporárias
CREATE TABLE "temporary_passwords" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "password" varchar NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used" boolean DEFAULT 'false',
  "created_at" timestamptz DEFAULT (now())
);

-- =====================================================
-- 3. TABELAS DE GAMIFICAÇÃO E ESTATÍSTICAS
-- =====================================================

-- Estatísticas de gamificação
CREATE TABLE "user_gamification_stats" (
  "user_uuid" uuid PRIMARY KEY NOT NULL,
  "total_xp" int4 NOT NULL DEFAULT 0,
  "current_level" int4 NOT NULL DEFAULT 1,
  "current_rank" text NOT NULL DEFAULT 'novato da guilda',
  "current_league" text NOT NULL DEFAULT 'aprendizes',
  "total_score" int4 NOT NULL DEFAULT 0,
  "flashcards_completed" int4 NOT NULL DEFAULT 0,
  "quizzes_completed" int4 NOT NULL DEFAULT 0,
  "lessons_completed" int4 NOT NULL DEFAULT 0,
  "current_streak" int4 NOT NULL DEFAULT 0,
  "longest_streak" int4 NOT NULL DEFAULT 0,
  "last_study_date" date DEFAULT 'current_date',
  "achievements_unlocked" int4 NOT NULL DEFAULT 0,
  "total_study_time" int4 NOT NULL DEFAULT 0,
  "created_at" timestamptz DEFAULT 'current_timestamp',
  "updated_at" timestamptz DEFAULT 'current_timestamp'
);

-- Progresso de conquistas
CREATE TABLE "user_achievement_progress" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "achievement_key" text NOT NULL,
  "current_progress" int4 NOT NULL DEFAULT 0,
  "required_progress" int4 NOT NULL,
  "is_unlocked" boolean NOT NULL DEFAULT 'false',
  "unlocked_at" timestamptz,
  "created_at" timestamptz DEFAULT 'current_timestamp',
  "updated_at" timestamptz DEFAULT 'current_timestamp'
);

-- Estatísticas diárias
CREATE TABLE "user_daily_stats" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "date" date NOT NULL,
  "xp_earned" int4 NOT NULL DEFAULT 0,
  "score_earned" int4 NOT NULL DEFAULT 0,
  "flashcards_studied" int4 NOT NULL DEFAULT 0,
  "quizzes_completed" int4 NOT NULL DEFAULT 0,
  "lessons_watched" int4 NOT NULL DEFAULT 0,
  "study_time_minutes" int4 NOT NULL DEFAULT 0,
  "streak_maintained" boolean NOT NULL DEFAULT 'false',
  "created_at" timestamptz DEFAULT 'current_timestamp'
);

-- Rankings
CREATE TABLE "user_rankings" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "period_type" text NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "total_score" int4 NOT NULL DEFAULT 0,
  "total_xp" int4 NOT NULL DEFAULT 0,
  "rank_position" int4,
  "league_position" int4,
  "created_at" timestamptz DEFAULT 'current_timestamp'
);

-- Conquistas
CREATE TABLE "achievements" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "achievement_type" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "icon" text NOT NULL,
  "xp_reward" int4 NOT NULL,
  "unlocked_at" timestamptz DEFAULT (now()),
  "shared" boolean DEFAULT 'false'
);

-- Sequências de estudo
CREATE TABLE "study_streaks" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "days_count" int4 NOT NULL,
  "is_active" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT (now())
);

-- Ranks RPG
CREATE TABLE "rpg_ranks" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "category" text NOT NULL,
  "level" int4 NOT NULL,
  "title" text NOT NULL,
  "insignia" text NOT NULL,
  "blessing" text NOT NULL,
  "xp_required" int4 NOT NULL,
  "created_at" timestamptz DEFAULT (now())
);

-- =====================================================
-- 4. TABELAS DE FLASHCARDS E ESTUDO
-- =====================================================

-- Tópicos
CREATE TABLE "topics" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "user_uuid" uuid,
  "subject_id" int4
);

-- Flashcards
CREATE TABLE "flashcards" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "topic_id" text NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL
);

-- Progresso de flashcards
CREATE TABLE "flashcard_progress" (
  "user_uuid" uuid NOT NULL,
  "flashcard_id" int4 NOT NULL,
  "ease_factor" numeric NOT NULL DEFAULT 2.5,
  "interval_days" int4 NOT NULL DEFAULT 1,
  "repetitions" int4 NOT NULL DEFAULT 0,
  "quality" int4 NOT NULL DEFAULT 0,
  "last_reviewed" timestamptz,
  "next_review" timestamptz NOT NULL DEFAULT (now()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "status" varchar NOT NULL DEFAULT 'new',
  PRIMARY KEY ("user_uuid", "flashcard_id")
);

-- Categorias de flashcards
CREATE TABLE "flashcard_categories" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "description" text,
  "color" varchar NOT NULL DEFAULT '#3b82f6',
  "icon" varchar,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

-- Tags de flashcards
CREATE TABLE "flashcard_tags" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "color" varchar NOT NULL DEFAULT '#6b7280',
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

-- Relações categoria-flashcard
CREATE TABLE "flashcard_category_relations" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "flashcard_id" int4 NOT NULL,
  "category_id" int8 NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

-- Relações tag-flashcard
CREATE TABLE "flashcard_tag_relations" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "flashcard_id" int4 NOT NULL,
  "tag_id" int8 NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

-- Cards errados
CREATE TABLE "wrong_cards" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "flashcard_id" int4 NOT NULL,
  "topic_id" text NOT NULL,
  "created_at" timestamptz DEFAULT (now()),
  "reviewed" boolean DEFAULT 'false',
  "reviewed_at" timestamptz
);

-- Progresso por tópico
CREATE TABLE "user_topic_progress" (
  "user_uuid" uuid NOT NULL,
  "topic_id" text NOT NULL,
  "correct_count" int4 NOT NULL DEFAULT 0,
  "incorrect_count" int4 NOT NULL DEFAULT 0,
  "created_at" timestamptz DEFAULT 'current_timestamp',
  "updated_at" timestamptz DEFAULT 'current_timestamp',
  PRIMARY KEY ("user_uuid", "topic_id")
);

-- Sessões de estudo
CREATE TABLE "study_sessions" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "topic_id" varchar NOT NULL,
  "session_type" varchar NOT NULL DEFAULT 'review',
  "total_cards" int4 NOT NULL DEFAULT 0,
  "correct_answers" int4 NOT NULL DEFAULT 0,
  "incorrect_answers" int4 NOT NULL DEFAULT 0,
  "time_spent_seconds" int4 NOT NULL DEFAULT 0,
  "started_at" timestamptz NOT NULL DEFAULT (now()),
  "completed_at" timestamptz,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

-- Cards das sessões de estudo
CREATE TABLE "study_session_cards" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "session_id" int8 NOT NULL,
  "flashcard_id" int4 NOT NULL,
  "quality" int4 NOT NULL,
  "time_spent_seconds" int4 NOT NULL DEFAULT 0,
  "was_correct" boolean NOT NULL,
  "ease_factor_before" numeric,
  "ease_factor_after" numeric,
  "interval_before" int4,
  "interval_after" int4,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

-- Metas de estudo
CREATE TABLE "study_goals" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "goal_type" varchar NOT NULL,
  "target_value" int4 NOT NULL,
  "current_value" int4 NOT NULL DEFAULT 0,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "is_active" boolean NOT NULL DEFAULT 'true',
  "is_completed" boolean NOT NULL DEFAULT 'false',
  "description" text,
  "reward" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

-- =====================================================
-- 5. COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE "user_gamification_stats" IS 'Estatísticas de gamificação do usuário (XP, nível, rank, liga)';
COMMENT ON TABLE "wrong_cards" IS 'Tabela para armazenar flashcards que os usuários erraram para revisão posterior';
COMMENT ON COLUMN "wrong_cards"."user_uuid" IS 'UUID do usuário que errou o card';
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
COMMENT ON COLUMN "profiles"."turma_id" IS 'ID da turma do usuário. Valores possíveis: turma-basica, turma-intermediaria, turma-avancada, turma-completa';

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para perfis
CREATE INDEX IF NOT EXISTS idx_profiles_user_uuid ON profiles(user_uuid);
CREATE INDEX IF NOT EXISTS idx_profiles_turma_id ON profiles(turma_id);

-- Índices para gamificação
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_user_uuid ON user_gamification_stats(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_level ON user_gamification_stats(current_level);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_league ON user_gamification_stats(current_league);

-- Índices para flashcards
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_uuid ON flashcard_progress(user_uuid);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review ON flashcard_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_status ON flashcard_progress(status);

-- Índices para progresso
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_uuid ON user_topic_progress(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_topic_id ON user_topic_progress(topic_id);

-- Índices para sessões de estudo
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);

-- Índices para estatísticas
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_user_uuid ON user_daily_stats(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_daily_stats_date ON user_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_uuid ON user_rankings(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_rankings_period ON user_rankings(period_type, period_start, period_end);

-- =====================================================
-- 7. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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
-- 8. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para gamificação
CREATE POLICY "Users can view their own gamification stats" ON user_gamification_stats
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own gamification stats" ON user_gamification_stats
    FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own gamification stats" ON user_gamification_stats
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para flashcards
CREATE POLICY "Users can view all flashcards" ON flashcards
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own flashcard progress" ON flashcard_progress
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own flashcard progress" ON flashcard_progress
    FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own flashcard progress" ON flashcard_progress
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para progresso
CREATE POLICY "Users can view their own topic progress" ON user_topic_progress
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own topic progress" ON user_topic_progress
    FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own topic progress" ON user_topic_progress
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para sessões de estudo
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para estatísticas
CREATE POLICY "Users can view their own daily stats" ON user_daily_stats
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own daily stats" ON user_daily_stats
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own daily stats" ON user_daily_stats
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para rankings
CREATE POLICY "Users can view all rankings" ON user_rankings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own rankings" ON user_rankings
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para conquistas
CREATE POLICY "Users can view their own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para metas de estudo
CREATE POLICY "Users can view their own study goals" ON study_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study goals" ON study_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study goals" ON study_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para cards errados
CREATE POLICY "Users can view their own wrong cards" ON wrong_cards
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own wrong cards" ON wrong_cards
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own wrong cards" ON wrong_cards
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para tópicos
CREATE POLICY "Users can view all topics" ON topics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own topics" ON topics
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own topics" ON topics
    FOR UPDATE USING (auth.uid() = user_uuid);

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
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own study streaks" ON study_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own study streaks" ON study_streaks
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para progresso de conquistas
CREATE POLICY "Users can view their own achievement progress" ON user_achievement_progress
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own achievement progress" ON user_achievement_progress
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own achievement progress" ON user_achievement_progress
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para permissões de página
CREATE POLICY "Users can view their own page permissions" ON page_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own temporary passwords" ON temporary_passwords
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 9. FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 10. TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
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
-- 11. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'PARTE 1 CONCLUÍDA - TABELAS DE AUTENTICAÇÃO, GAMIFICAÇÃO E FLASHCARDS' as status;

SELECT 
    table_name,
    '✅ CRIADA' as status
FROM information_schema.tables 
WHERE table_name IN (
    'profiles', 'page_permissions', 'temporary_passwords',
    'user_gamification_stats', 'user_achievement_progress', 'user_daily_stats',
    'user_rankings', 'achievements', 'study_streaks', 'rpg_ranks',
    'topics', 'flashcards', 'flashcard_progress', 'flashcard_categories',
    'flashcard_tags', 'flashcard_category_relations', 'flashcard_tag_relations',
    'wrong_cards', 'user_topic_progress', 'study_sessions', 'study_session_cards',
    'study_goals'
)
AND table_schema = 'public'
ORDER BY table_name;
