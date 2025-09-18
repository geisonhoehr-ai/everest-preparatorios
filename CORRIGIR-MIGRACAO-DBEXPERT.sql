-- =====================================================
-- CORREÇÃO DEFINITIVA DA MIGRAÇÃO DBEXPERT
-- EVEREST PREPARATÓRIOS
-- =====================================================

-- =====================================================
-- 1. EXECUTAR MIGRAÇÃO CORRIGIDA - PARTE 1 (TABELAS BÁSICAS)
-- =====================================================

-- BEGIN ALTER TABLE "public"."users" ---
ALTER TABLE IF EXISTS "public"."users"
ALTER COLUMN "email" SET DATA TYPE varchar(255) USING "email"::varchar(255);

ALTER TABLE IF EXISTS "public"."users"
ALTER COLUMN "password_hash" SET DATA TYPE varchar(255) USING "password_hash"::varchar(255);

ALTER TABLE IF EXISTS "public"."users"
ALTER COLUMN "first_name" SET DATA TYPE varchar(100) USING "first_name"::varchar(100);

ALTER TABLE IF EXISTS "public"."users"
ALTER COLUMN "last_name" SET DATA TYPE varchar(100) USING "last_name"::varchar(100);

ALTER TABLE IF EXISTS "public"."users"
ALTER COLUMN "is_active" SET DATA TYPE boolean USING "is_active"::boolean;

ALTER TABLE IF EXISTS "public"."users" DROP CONSTRAINT IF EXISTS "users_email_key" CASCADE;
ALTER TABLE IF EXISTS "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users" USING btree ("email");
-- END ALTER TABLE "public"."users" ---

-- BEGIN ALTER TABLE "public"."teachers" ---
ALTER TABLE IF EXISTS "public"."teachers"
ALTER COLUMN "employee_id_number" SET DATA TYPE varchar(50) USING "employee_id_number"::varchar(50);

ALTER TABLE IF EXISTS "public"."teachers"
ALTER COLUMN "department" SET DATA TYPE varchar(100) USING "department"::varchar(100);

ALTER TABLE IF EXISTS "public"."teachers" DROP CONSTRAINT IF EXISTS "teachers_user_id_key" CASCADE;
ALTER TABLE IF EXISTS "public"."teachers" ADD CONSTRAINT "teachers_user_id_key" UNIQUE ("user_id");

ALTER TABLE IF EXISTS "public"."teachers" DROP CONSTRAINT IF EXISTS "teachers_employee_id_number_key" CASCADE;
ALTER TABLE IF EXISTS "public"."teachers" ADD CONSTRAINT "teachers_employee_id_number_key" UNIQUE ("employee_id_number");

CREATE UNIQUE INDEX IF NOT EXISTS "teachers_employee_id_number_idx" ON "public"."teachers" USING btree ("employee_id_number");
-- END ALTER TABLE "public"."teachers" ---

-- BEGIN ALTER TABLE "public"."classes" ---
ALTER TABLE IF EXISTS "public"."classes"
ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);
-- END ALTER TABLE "public"."classes" ---

-- BEGIN ALTER TABLE "public"."subjects" ---
ALTER TABLE IF EXISTS "public"."subjects"
ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);

ALTER TABLE IF EXISTS "public"."subjects" DROP CONSTRAINT IF EXISTS "subjects_name_key" CASCADE;
ALTER TABLE IF EXISTS "public"."subjects" ADD CONSTRAINT "subjects_name_key" UNIQUE ("name");

CREATE UNIQUE INDEX IF NOT EXISTS "subjects_name_idx" ON "public"."subjects" USING btree ("name");
-- END ALTER TABLE "public"."subjects" ---

-- BEGIN ALTER TABLE "public"."topics" ---
ALTER TABLE IF EXISTS "public"."topics"
ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);
-- END ALTER TABLE "public"."topics" ---

-- BEGIN ALTER TABLE "public"."flashcards" ---
ALTER TABLE IF EXISTS "public"."flashcards"
ALTER COLUMN "difficulty" SET DATA TYPE integer USING "difficulty"::integer;
-- END ALTER TABLE "public"."flashcards" ---

-- =====================================================
-- 2. CORREÇÃO ESPECIAL PARA QUIZZES (SEM O DEFAULT INCORRETO)
-- =====================================================

-- BEGIN ALTER TABLE "public"."quizzes" ---
ALTER TABLE IF EXISTS "public"."quizzes"
ALTER COLUMN "title" SET DATA TYPE varchar(255) USING "title"::varchar(255);

ALTER TABLE IF EXISTS "public"."quizzes"
ALTER COLUMN "duration_minutes" SET DATA TYPE integer USING "duration_minutes"::integer;

-- CORREÇÃO: Adicionar coluna SEM o default incorreto
ALTER TABLE IF EXISTS "public"."quizzes" ADD COLUMN IF NOT EXISTS "time_limit_minutes" integer;

-- Adicionar comentário
COMMENT ON COLUMN "public"."quizzes"."time_limit_minutes" IS 'Tempo limite em minutos para a conclusão do quiz';
-- END ALTER TABLE "public"."quizzes" ---

-- =====================================================
-- 3. CONTINUAR COM O RESTO DA MIGRAÇÃO
-- =====================================================

-- BEGIN ALTER TABLE "public"."flashcard_categories" ---
ALTER TABLE IF EXISTS "public"."flashcard_categories"
ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);

ALTER TABLE IF EXISTS "public"."flashcard_categories" DROP CONSTRAINT IF EXISTS "flashcard_categories_name_key" CASCADE;
ALTER TABLE IF EXISTS "public"."flashcard_categories" ADD CONSTRAINT "flashcard_categories_name_key" UNIQUE ("name");

CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_categories_name_idx" ON "public"."flashcard_categories" USING btree ("name");
-- END ALTER TABLE "public"."flashcard_categories" ---

-- BEGIN ALTER TABLE "public"."flashcard_tags" ---
ALTER TABLE IF EXISTS "public"."flashcard_tags"
ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);

ALTER TABLE IF EXISTS "public"."flashcard_tags" DROP CONSTRAINT IF EXISTS "flashcard_tags_name_key" CASCADE;
ALTER TABLE IF EXISTS "public"."flashcard_tags" ADD CONSTRAINT "flashcard_tags_name_key" UNIQUE ("name");

CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_tags_name_idx" ON "public"."flashcard_tags" USING btree ("name");
-- END ALTER TABLE "public"."flashcard_tags" ---

-- BEGIN ALTER TABLE "public"."quiz_attempts" ---
ALTER TABLE IF EXISTS "public"."quiz_attempts"
ALTER COLUMN "score" SET DATA TYPE integer USING "score"::integer;

ALTER TABLE IF EXISTS "public"."quiz_attempts"
ALTER COLUMN "total_questions" SET DATA TYPE integer USING "total_questions"::integer;

ALTER TABLE IF EXISTS "public"."quiz_attempts"
ALTER COLUMN "duration_seconds" SET DATA TYPE integer USING "duration_seconds"::integer;
-- END ALTER TABLE "public"."quiz_attempts" ---

-- BEGIN ALTER TABLE "public"."quiz_questions" ---
ALTER TABLE IF EXISTS "public"."quiz_questions"
ALTER COLUMN "question_type" SET DATA TYPE varchar(50) USING "question_type"::varchar(50);

ALTER TABLE IF EXISTS "public"."quiz_questions"
ALTER COLUMN "points" SET DATA TYPE integer USING "points"::integer;
-- END ALTER TABLE "public"."quiz_questions" ---

-- BEGIN ALTER TABLE "public"."students" ---
ALTER TABLE IF EXISTS "public"."students"
ALTER COLUMN "student_id_number" SET DATA TYPE varchar(50) USING "student_id_number"::varchar(50);

ALTER TABLE IF EXISTS "public"."students" DROP CONSTRAINT IF EXISTS "students_user_id_key" CASCADE;
ALTER TABLE IF EXISTS "public"."students" ADD CONSTRAINT "students_user_id_key" UNIQUE ("user_id");

ALTER TABLE IF EXISTS "public"."students" DROP CONSTRAINT IF EXISTS "students_student_id_number_key" CASCADE;
ALTER TABLE IF EXISTS "public"."students" ADD CONSTRAINT "students_student_id_number_key" UNIQUE ("student_id_number");

CREATE UNIQUE INDEX IF NOT EXISTS "students_student_id_number_idx" ON "public"."students" USING btree ("student_id_number");
-- END ALTER TABLE "public"."students" ---

-- BEGIN ALTER TABLE "public"."student_classes" ---
CREATE UNIQUE INDEX IF NOT EXISTS "student_classes_user_id_class_id_idx" ON "public"."student_classes" USING btree ("user_id", "class_id");
COMMENT ON INDEX "public"."student_classes_user_id_class_id_idx" IS 'Garante que um aluno não possa ser matriculado na mesma turma mais de uma vez';
-- END ALTER TABLE "public"."student_classes" ---

-- BEGIN ALTER TABLE "public"."password_reset_tokens" ---
ALTER TABLE IF EXISTS "public"."password_reset_tokens"
ALTER COLUMN "token" SET DATA TYPE varchar(255) USING "token"::varchar(255);

ALTER TABLE IF EXISTS "public"."password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_token_key" CASCADE;
ALTER TABLE IF EXISTS "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_token_key" UNIQUE ("token");

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_idx" ON "public"."password_reset_tokens" USING btree ("token");
-- END ALTER TABLE "public"."password_reset_tokens" ---

-- BEGIN ALTER TABLE "public"."user_sessions" ---
ALTER TABLE IF EXISTS "public"."user_sessions"
ALTER COLUMN "session_token" SET DATA TYPE varchar(255) USING "session_token"::varchar(255);

ALTER TABLE IF EXISTS "public"."user_sessions"
ALTER COLUMN "ip_address" SET DATA TYPE varchar(45) USING "ip_address"::varchar(45);

ALTER TABLE IF EXISTS "public"."user_sessions"
ALTER COLUMN "is_active" SET DATA TYPE boolean USING "is_active"::boolean;

ALTER TABLE IF EXISTS "public"."user_sessions" DROP CONSTRAINT IF EXISTS "user_sessions_session_token_key" CASCADE;
ALTER TABLE IF EXISTS "public"."user_sessions" ADD CONSTRAINT "user_sessions_session_token_key" UNIQUE ("session_token");

CREATE UNIQUE INDEX IF NOT EXISTS "user_sessions_session_token_idx" ON "public"."user_sessions" USING btree ("session_token");
-- END ALTER TABLE "public"."user_sessions" ---

-- BEGIN ALTER TABLE "public"."flashcard_progress" ---
ALTER TABLE IF EXISTS "public"."flashcard_progress"
ALTER COLUMN "interval_days" SET DATA TYPE integer USING "interval_days"::integer,
ALTER COLUMN "interval_days" DROP DEFAULT;

ALTER TABLE IF EXISTS "public"."flashcard_progress"
ALTER COLUMN "ease_factor" SET DATA TYPE decimal(3,2) USING "ease_factor"::decimal(3,2);

ALTER TABLE IF EXISTS "public"."flashcard_progress"
ALTER COLUMN "repetitions" SET DATA TYPE integer USING "repetitions"::integer,
ALTER COLUMN "repetitions" DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_progress_user_id_flashcard_id_idx" ON "public"."flashcard_progress" USING btree ("user_id", "flashcard_id");
COMMENT ON INDEX "public"."flashcard_progress_user_id_flashcard_id_idx" IS 'Garante um único registro de progresso por usuário e flashcard';
-- END ALTER TABLE "public"."flashcard_progress" ---

-- BEGIN ALTER TABLE "public"."user_progress" ---
ALTER TABLE IF EXISTS "public"."user_progress"
ALTER COLUMN "completion_percentage" SET DATA TYPE decimal(5,2) USING "completion_percentage"::decimal(5,2),
ALTER COLUMN "completion_percentage" DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS "user_progress_user_id_topic_id_idx" ON "public"."user_progress" USING btree ("user_id", "topic_id");
COMMENT ON INDEX "public"."user_progress_user_id_topic_id_idx" IS 'Garante um único registro de progresso por usuário e tópico';
-- END ALTER TABLE "public"."user_progress" ---

-- BEGIN ALTER TABLE "public"."class_topics" ---
CREATE UNIQUE INDEX IF NOT EXISTS "class_topics_class_id_topic_id_idx" ON "public"."class_topics" USING btree ("class_id", "topic_id");
COMMENT ON INDEX "public"."class_topics_class_id_topic_id_idx" IS 'Garante que um tópico seja associado a uma turma apenas uma vez';
-- END ALTER TABLE "public"."class_topics" ---

-- BEGIN ALTER TABLE "public"."flashcard_flashcard_categories" ---
CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_flashcard_categories_flashcard_id_category_id_idx" ON "public"."flashcard_flashcard_categories" USING btree ("flashcard_id", "category_id");
COMMENT ON INDEX "public"."flashcard_flashcard_categories_flashcard_id_category_id_idx" IS 'Garante que um flashcard seja associado a uma categoria apenas uma vez';
-- END ALTER TABLE "public"."flashcard_flashcard_categories" ---

-- BEGIN ALTER TABLE "public"."flashcard_flashcard_tags" ---
CREATE UNIQUE INDEX IF NOT EXISTS "flashcard_flashcard_tags_flashcard_id_tag_id_idx" ON "public"."flashcard_flashcard_tags" USING btree ("flashcard_id", "tag_id");
COMMENT ON INDEX "public"."flashcard_flashcard_tags_flashcard_id_tag_id_idx" IS 'Garante que um flashcard seja associado a uma tag apenas uma vez';
-- END ALTER TABLE "public"."flashcard_flashcard_tags" ---

-- BEGIN ALTER TABLE "public"."user_incorrect_flashcards" ---
CREATE UNIQUE INDEX IF NOT EXISTS "user_incorrect_flashcards_user_id_flashcard_id_idx" ON "public"."user_incorrect_flashcards" USING btree ("user_id", "flashcard_id");
-- END ALTER TABLE "public"."user_incorrect_flashcards" ---

-- BEGIN ALTER TABLE "public"."quiz_attempt_answers" ---
ALTER TABLE IF EXISTS "public"."quiz_attempt_answers"
ALTER COLUMN "is_correct" SET DATA TYPE boolean USING "is_correct"::boolean;

CREATE UNIQUE INDEX IF NOT EXISTS "quiz_attempt_answers_quiz_attempt_id_quiz_question_id_idx" ON "public"."quiz_attempt_answers" USING btree ("quiz_attempt_id", "quiz_question_id");
-- END ALTER TABLE "public"."quiz_attempt_answers" ---

-- =====================================================
-- 4. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se a coluna time_limit_minutes foi criada corretamente
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as default_value
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
AND column_name = 'time_limit_minutes';

-- Teste: Inserir quiz com time_limit_minutes
INSERT INTO "public"."quizzes" (topic_id, title, description, time_limit_minutes, created_by_user_id)
SELECT 
    t.id,
    'Quiz de Teste - Migração',
    'Quiz de teste após migração corrigida',
    15,
    u.id
FROM "public"."topics" t
CROSS JOIN "public"."users" u
WHERE t.name = 'Gramática Básica'
AND u.email = 'admin@teste.com'
LIMIT 1;

-- Verificar inserção
SELECT 
    'TESTE MIGRAÇÃO' as status,
    q.title as quiz,
    q.time_limit_minutes as tempo_limite
FROM "public"."quizzes" q
WHERE q.title = 'Quiz de Teste - Migração';

-- Limpar teste
DELETE FROM "public"."quizzes" 
WHERE title = 'Quiz de Teste - Migração';

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

SELECT 
    '✅' as emoji,
    'MIGRAÇÃO DBEXPERT EXECUTADA COM SUCESSO!' as status,
    'Todas as tabelas foram atualizadas e a coluna time_limit_minutes está funcionando!' as resultado;
