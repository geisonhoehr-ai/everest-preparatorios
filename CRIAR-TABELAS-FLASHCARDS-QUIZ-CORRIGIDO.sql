-- =====================================================
-- SCRIPT CORRIGIDO PARA CRIAR TABELAS DE FLASHCARDS E QUIZ
-- EVEREST PREPARATÓRIOS - ESTRUTURA SIMPLIFICADA
-- =====================================================

-- =====================================================
-- 1. TABELAS BÁSICAS (MATÉRIAS E TÓPICOS)
-- =====================================================

-- Tabela de matérias/disciplinas
CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar(100) NOT NULL,
    "description" text,
    "created_by_user_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subjects_name_key" UNIQUE ("name"),
    CONSTRAINT "public_subjects_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
);

-- Tabela de tópicos por matéria
CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "subject_id" uuid NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "created_by_user_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "topics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "topics_subject_id_name_key" UNIQUE ("subject_id", "name"),
    CONSTRAINT "public_topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE,
    CONSTRAINT "public_topics_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
);

-- =====================================================
-- 2. TABELAS DE FLASHCARDS
-- =====================================================

-- Tabela principal de flashcards
CREATE TABLE IF NOT EXISTS "public"."flashcards" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" uuid NOT NULL,
    "question" text NOT NULL,
    "answer" text NOT NULL,
    "created_by_user_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_flashcards_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE,
    CONSTRAINT "public_flashcards_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
);

-- Tabela de progresso de flashcards (Spaced Repetition)
CREATE TABLE IF NOT EXISTS "public"."flashcard_progress" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "flashcard_id" uuid NOT NULL,
    "ease_factor" numeric NOT NULL DEFAULT 2.5,
    "interval_days" integer NOT NULL DEFAULT 1,
    "repetitions" integer NOT NULL DEFAULT 0,
    "quality" integer NOT NULL DEFAULT 0,
    "last_reviewed" timestamp,
    "next_review" timestamp NOT NULL DEFAULT now(),
    "status" varchar(50) NOT NULL DEFAULT 'new',
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "flashcard_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "flashcard_progress_user_id_flashcard_id_key" UNIQUE ("user_id", "flashcard_id"),
    CONSTRAINT "public_flashcard_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "public_flashcard_progress_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE
);

-- Tabela para revisão de flashcards errados pelos alunos
CREATE TABLE IF NOT EXISTS "public"."user_incorrect_flashcards" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "flashcard_id" uuid NOT NULL,
    "last_incorrect_at" timestamp NOT NULL DEFAULT now(),
    "incorrect_count" integer NOT NULL DEFAULT 1,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "user_incorrect_flashcards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_incorrect_flashcards_user_id_flashcard_id_key" UNIQUE ("user_id", "flashcard_id"),
    CONSTRAINT "public_user_incorrect_flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "public_user_incorrect_flashcards_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE
);

-- =====================================================
-- 3. TABELAS DE QUIZ
-- =====================================================

-- Tabela de quizzes (agrupamentos de questões)
CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" uuid NOT NULL,
    "title" varchar(200) NOT NULL,
    "description" text,
    "time_limit_minutes" integer DEFAULT NULL,
    "created_by_user_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_quizzes_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE,
    CONSTRAINT "public_quizzes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
);

-- Tabela de questões de quiz
CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" uuid NOT NULL,
    "quiz_id" uuid,
    "question_text" text NOT NULL,
    "options" jsonb NOT NULL,
    "correct_answer" varchar(500) NOT NULL,
    "explanation" text,
    "created_by_user_id" uuid NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_quiz_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE,
    CONSTRAINT "public_quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE,
    CONSTRAINT "public_quiz_questions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
);

-- Tabela de tentativas de quiz
CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "topic_id" uuid NOT NULL,
    "quiz_id" uuid,
    "correct_answers" integer DEFAULT 0,
    "total_questions" integer DEFAULT 0,
    "time_spent_seconds" integer DEFAULT 0,
    "completed_at" timestamp DEFAULT now(),
    "created_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "public_quiz_attempts_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE,
    CONSTRAINT "public_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE
);

-- Tabela detalhada de respostas de quiz
CREATE TABLE IF NOT EXISTS "public"."quiz_attempt_answers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "quiz_attempt_id" uuid NOT NULL,
    "quiz_question_id" uuid NOT NULL,
    "user_answer" varchar(500) NOT NULL,
    "is_correct" boolean NOT NULL,
    "time_spent_seconds" integer DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "quiz_attempt_answers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_quiz_attempt_answers_quiz_attempt_id_fkey" FOREIGN KEY ("quiz_attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE CASCADE,
    CONSTRAINT "public_quiz_attempt_answers_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE CASCADE
);

-- =====================================================
-- 4. TABELAS DE PROGRESSO E ESTATÍSTICAS
-- =====================================================

-- Tabela de progresso geral do usuário
CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "topic_id" uuid NOT NULL,
    "correct_answers" integer DEFAULT 0,
    "total_questions" integer DEFAULT 0,
    "accuracy" decimal(5,2) DEFAULT 0,
    "time_spent_seconds" integer DEFAULT 0,
    "xp_gained" integer DEFAULT 0,
    "last_attempt" timestamp DEFAULT now(),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_progress_user_id_topic_id_key" UNIQUE ("user_id", "topic_id"),
    CONSTRAINT "public_user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    CONSTRAINT "public_user_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE
);

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para subjects
CREATE INDEX IF NOT EXISTS "idx_subjects_created_by_user_id" ON "public"."subjects"("created_by_user_id");
CREATE INDEX IF NOT EXISTS "idx_subjects_name" ON "public"."subjects"("name");

-- Índices para topics
CREATE INDEX IF NOT EXISTS "idx_topics_subject_id" ON "public"."topics"("subject_id");
CREATE INDEX IF NOT EXISTS "idx_topics_created_by_user_id" ON "public"."topics"("created_by_user_id");

-- Índices para flashcards
CREATE INDEX IF NOT EXISTS "idx_flashcards_topic_id" ON "public"."flashcards"("topic_id");
CREATE INDEX IF NOT EXISTS "idx_flashcards_created_by_user_id" ON "public"."flashcards"("created_by_user_id");

-- Índices para flashcard_progress
CREATE INDEX IF NOT EXISTS "idx_flashcard_progress_user_id" ON "public"."flashcard_progress"("user_id");
CREATE INDEX IF NOT EXISTS "idx_flashcard_progress_flashcard_id" ON "public"."flashcard_progress"("flashcard_id");
CREATE INDEX IF NOT EXISTS "idx_flashcard_progress_next_review" ON "public"."flashcard_progress"("next_review");
CREATE INDEX IF NOT EXISTS "idx_flashcard_progress_status" ON "public"."flashcard_progress"("status");

-- Índices para user_incorrect_flashcards
CREATE INDEX IF NOT EXISTS "idx_user_incorrect_flashcards_user_id" ON "public"."user_incorrect_flashcards"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_incorrect_flashcards_flashcard_id" ON "public"."user_incorrect_flashcards"("flashcard_id");
CREATE INDEX IF NOT EXISTS "idx_user_incorrect_flashcards_last_incorrect_at" ON "public"."user_incorrect_flashcards"("last_incorrect_at");

-- Índices para quizzes
CREATE INDEX IF NOT EXISTS "idx_quizzes_topic_id" ON "public"."quizzes"("topic_id");
CREATE INDEX IF NOT EXISTS "idx_quizzes_created_by_user_id" ON "public"."quizzes"("created_by_user_id");

-- Índices para quiz_questions
CREATE INDEX IF NOT EXISTS "idx_quiz_questions_topic_id" ON "public"."quiz_questions"("topic_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_questions_quiz_id" ON "public"."quiz_questions"("quiz_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_questions_created_by_user_id" ON "public"."quiz_questions"("created_by_user_id");

-- Índices para quiz_attempts
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_user_id" ON "public"."quiz_attempts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_topic_id" ON "public"."quiz_attempts"("topic_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_quiz_id" ON "public"."quiz_attempts"("quiz_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_completed_at" ON "public"."quiz_attempts"("completed_at");

-- Índices para quiz_attempt_answers
CREATE INDEX IF NOT EXISTS "idx_quiz_attempt_answers_quiz_attempt_id" ON "public"."quiz_attempt_answers"("quiz_attempt_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempt_answers_quiz_question_id" ON "public"."quiz_attempt_answers"("quiz_question_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempt_answers_is_correct" ON "public"."quiz_attempt_answers"("is_correct");

-- Índices para user_progress
CREATE INDEX IF NOT EXISTS "idx_user_progress_user_id" ON "public"."user_progress"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_progress_topic_id" ON "public"."user_progress"("topic_id");
CREATE INDEX IF NOT EXISTS "idx_user_progress_accuracy" ON "public"."user_progress"("accuracy");

-- =====================================================
-- 6. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas com updated_at
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON "public"."subjects"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
    BEFORE UPDATE ON "public"."topics"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON "public"."flashcards"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_progress_updated_at
    BEFORE UPDATE ON "public"."flashcard_progress"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_incorrect_flashcards_updated_at
    BEFORE UPDATE ON "public"."user_incorrect_flashcards"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON "public"."quizzes"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON "public"."quiz_questions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON "public"."user_progress"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."flashcards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."flashcard_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_incorrect_flashcards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quizzes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quiz_attempt_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. POLÍTICAS RLS
-- =====================================================

-- Políticas para subjects
CREATE POLICY "Users can view all subjects" ON "public"."subjects"
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own subjects" ON "public"."subjects"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'teacher' AND id = created_by_user_id
        )
    );

CREATE POLICY "Admins can manage all subjects" ON "public"."subjects"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'administrator'
        )
    );

-- Políticas para topics
CREATE POLICY "Users can view all topics" ON "public"."topics"
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own topics" ON "public"."topics"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'teacher' AND id = created_by_user_id
        )
    );

CREATE POLICY "Admins can manage all topics" ON "public"."topics"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'administrator'
        )
    );

-- Políticas para flashcards
CREATE POLICY "Users can view all flashcards" ON "public"."flashcards"
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own flashcards" ON "public"."flashcards"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'teacher' AND id = created_by_user_id
        )
    );

CREATE POLICY "Admins can manage all flashcards" ON "public"."flashcards"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'administrator'
        )
    );

-- Políticas para flashcard_progress
CREATE POLICY "Users can manage their own flashcard progress" ON "public"."flashcard_progress"
    FOR ALL USING (user_id = auth.uid());

-- Políticas para user_incorrect_flashcards
CREATE POLICY "Users can manage their own incorrect flashcards" ON "public"."user_incorrect_flashcards"
    FOR ALL USING (user_id = auth.uid());

-- Políticas para quizzes
CREATE POLICY "Users can view all quizzes" ON "public"."quizzes"
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own quizzes" ON "public"."quizzes"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'teacher' AND id = created_by_user_id
        )
    );

CREATE POLICY "Admins can manage all quizzes" ON "public"."quizzes"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'administrator'
        )
    );

-- Políticas para quiz_questions
CREATE POLICY "Users can view all quiz questions" ON "public"."quiz_questions"
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own quiz questions" ON "public"."quiz_questions"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'teacher' AND id = created_by_user_id
        )
    );

CREATE POLICY "Admins can manage all quiz questions" ON "public"."quiz_questions"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."users" 
            WHERE id = auth.uid() AND role = 'administrator'
        )
    );

-- Políticas para quiz_attempts
CREATE POLICY "Users can manage their own quiz attempts" ON "public"."quiz_attempts"
    FOR ALL USING (user_id = auth.uid());

-- Políticas para quiz_attempt_answers
CREATE POLICY "Users can manage their own quiz attempt answers" ON "public"."quiz_attempt_answers"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."quiz_attempts" 
            WHERE id = quiz_attempt_id AND user_id = auth.uid()
        )
    );

-- Políticas para user_progress
CREATE POLICY "Users can manage their own progress" ON "public"."user_progress"
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 9. DADOS INICIAIS
-- =====================================================

-- Inserir matérias básicas (usando o admin como criador)
INSERT INTO "public"."subjects" (name, description, created_by_user_id)
SELECT 'Português', 'Gramática, Literatura e Redação', id
FROM "public"."users" WHERE email = 'admin@teste.com' AND role = 'administrator'
ON CONFLICT (name) DO NOTHING;

INSERT INTO "public"."subjects" (name, description, created_by_user_id)
SELECT 'Matemática', 'Álgebra, Geometria e Cálculo', id
FROM "public"."users" WHERE email = 'admin@teste.com' AND role = 'administrator'
ON CONFLICT (name) DO NOTHING;

INSERT INTO "public"."subjects" (name, description, created_by_user_id)
SELECT 'História', 'História do Brasil e Mundial', id
FROM "public"."users" WHERE email = 'admin@teste.com' AND role = 'administrator'
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 10. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    'TABELAS CRIADAS' as status,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'subjects', 'topics', 'flashcards', 'flashcard_progress', 'user_incorrect_flashcards',
    'quizzes', 'quiz_questions', 'quiz_attempts', 'quiz_attempt_answers', 'user_progress'
)
ORDER BY table_name;

-- Verificar RLS
SELECT 
    'RLS STATUS' as status,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESABILITADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'subjects', 'topics', 'flashcards', 'flashcard_progress', 'user_incorrect_flashcards',
    'quizzes', 'quiz_questions', 'quiz_attempts', 'quiz_attempt_answers', 'user_progress'
)
ORDER BY tablename;

-- Verificar dados iniciais
SELECT 
    'DADOS INICIAIS' as status,
    'subjects' as tabela,
    COUNT(*) as registros
FROM "public"."subjects"
UNION ALL
SELECT 
    'DADOS INICIAIS' as status,
    'topics' as tabela,
    COUNT(*) as registros
FROM "public"."topics";

-- =====================================================
-- RESUMO
-- =====================================================

/*
✅ TABELAS DE FLASHCARDS E QUIZ CRIADAS COM SUCESSO!

🎯 ESTRUTURA IMPLEMENTADA:

1. ✅ TABELAS BÁSICAS:
   - subjects (matérias/disciplinas)
   - topics (tópicos por matéria)

2. ✅ FLASHCARDS:
   - flashcards (cartões de estudo)
   - flashcard_progress (spaced repetition)
   - user_incorrect_flashcards (revisão de erros)

3. ✅ QUIZ:
   - quizzes (agrupamentos de questões)
   - quiz_questions (questões)
   - quiz_attempts (tentativas)
   - quiz_attempt_answers (respostas detalhadas)

4. ✅ PROGRESSO:
   - user_progress (progresso geral)

5. ✅ RECURSOS:
   - UUIDs para todos os IDs
   - created_by_user_id para CRUD
   - RLS habilitado
   - Políticas de segurança
   - Índices otimizados
   - Triggers para updated_at

6. ✅ PERMISSÕES:
   - Alunos: veem conteúdo, gerenciam próprio progresso
   - Professores: gerenciam próprio conteúdo
   - Admins: gerenciam todo conteúdo

7. ✅ FUNCIONALIDADES:
   - Revisão de flashcards errados
   - Análise detalhada de respostas de quiz
   - Spaced repetition
   - Progresso personalizado
   - CRUD completo para professores/admins

🚀 O sistema está pronto para integração com o frontend!
*/
