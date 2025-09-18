-- =====================================================
-- SCRIPT COMPLETO PARA CRIAR BANCO DE DADOS - PARTE 2
-- EVEREST PREPARATÓRIOS - CURSOS, TURMAS E PROVAS
-- =====================================================

-- =====================================================
-- 1. TABELAS DE MATÉRIAS E CURSOS
-- =====================================================

-- Matérias/cursos disponíveis
CREATE TABLE "subjects" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" text NOT NULL
);

-- Cursos
CREATE TABLE "courses" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "category" text,
  "duration_hours" numeric,
  "total_lessons" int4,
  "price" numeric,
  "is_active" boolean DEFAULT 'true',
  "show_in_catalog" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now()),
  "teacher_id" uuid
);

-- Módulos dos cursos
CREATE TABLE "course_modules" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "course_id" int8 NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "order_index" int4 NOT NULL DEFAULT 0,
  "is_minimized" boolean DEFAULT 'false',
  "access_rule" text DEFAULT 'free',
  "access_rule_value" text,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Lições dos módulos
CREATE TABLE "course_lessons" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "module_id" int8 NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "order_index" int4 NOT NULL DEFAULT 0,
  "lesson_type" text DEFAULT 'video',
  "panda_video_id" text,
  "video_duration" int4,
  "content_text" text,
  "file_url" text,
  "is_active" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Inscrições nos cursos
CREATE TABLE "course_enrollments" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "course_id" int8 NOT NULL,
  "progress_percentage" numeric DEFAULT 0,
  "enrollment_date" timestamptz DEFAULT (now()),
  "completion_date" timestamptz,
  "is_active" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Progresso das lições
CREATE TABLE "lesson_progress" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "lesson_id" int8 NOT NULL,
  "watched_duration" int4 DEFAULT 0,
  "is_completed" boolean DEFAULT 'false',
  "completed_at" timestamptz,
  "last_watched_at" timestamptz DEFAULT (now()),
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Materiais dos cursos
CREATE TABLE "course_materials" (
  "id" SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "course_id" int8 NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "file_url" text NOT NULL,
  "file_type" text,
  "file_size" int4,
  "download_count" int4 DEFAULT 0,
  "is_active" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- =====================================================
-- 2. TABELAS DE TURMAS E CLASSES
-- =====================================================

-- Turmas
CREATE TABLE "turmas" (
  "id" text PRIMARY KEY NOT NULL,
  "nome" text NOT NULL,
  "descricao" text,
  "professor_uuid" uuid NOT NULL,
  "ativa" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT (now()),
  "codigo_acesso" text,
  "max_alunos" int4 DEFAULT 50,
  "periodo" text,
  "ano_letivo" int4 DEFAULT (extract(year from current_date))
);

-- Classes (turmas de cada curso/matéria)
CREATE TABLE "classes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nome" text NOT NULL,
  "descricao" text,
  "curso_id" text NOT NULL,
  "codigo_acesso" text,
  "max_alunos" int4 DEFAULT 50,
  "periodo" text,
  "ano_letivo" int4 DEFAULT (extract(year from current_date)),
  "data_inicio" timestamptz,
  "data_fim" timestamptz,
  "status" text DEFAULT 'ativa',
  "created_at" timestamptz DEFAULT 'current_timestamp',
  "updated_at" timestamptz DEFAULT 'current_timestamp'
);

-- Alunos nas turmas
CREATE TABLE "alunos_turmas" (
  "user_uuid" uuid NOT NULL,
  "turma_id" text NOT NULL,
  "data_entrada" timestamptz DEFAULT 'current_timestamp',
  PRIMARY KEY ("user_uuid", "turma_id")
);

-- Membros das classes
CREATE TABLE "member_classes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "member_id" uuid NOT NULL,
  "class_id" int4 NOT NULL,
  "data_entrada" timestamptz DEFAULT 'current_timestamp',
  "status" text DEFAULT 'ativo'
);

-- Atividades dos membros
CREATE TABLE "member_activities" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "member_id" uuid,
  "activity_type" text NOT NULL,
  "activity_data" jsonb,
  "ip_address" inet,
  "user_agent" text,
  "created_at" timestamptz DEFAULT (now())
);

-- Regras de conteúdo
CREATE TABLE "content_rules" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "class_id" int4 NOT NULL,
  "content_type" text NOT NULL,
  "content_id" text NOT NULL,
  "rule_type" text NOT NULL,
  "data_liberacao" timestamptz,
  "dias_apos_compra" int4,
  "pontuacao_minima" int4,
  "created_at" timestamptz DEFAULT 'current_timestamp'
);

-- =====================================================
-- 3. TABELAS DE QUIZZES E SIMULADOS
-- =====================================================

-- Quizzes
CREATE TABLE "quizzes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "topic_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "created_at" timestamptz DEFAULT 'current_timestamp'
);

-- Questões dos quizzes
CREATE TABLE "quiz_questions" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "quiz_id" int4 NOT NULL,
  "question_text" text NOT NULL,
  "options" jsonb NOT NULL,
  "correct_answer" text NOT NULL,
  "explanation" text
);

-- Pontuações dos usuários nos quizzes
CREATE TABLE "user_quiz_scores" (
  "user_uuid" uuid NOT NULL,
  "quiz_id" int4 NOT NULL,
  "score" int4 NOT NULL DEFAULT 0,
  "total_questions" int4 NOT NULL DEFAULT 0,
  "correct_answers" int4 NOT NULL DEFAULT 0,
  "incorrect_answers" int4 NOT NULL DEFAULT 0,
  "completed_at" timestamptz DEFAULT 'current_timestamp',
  PRIMARY KEY ("user_uuid", "quiz_id")
);

-- Simulados
CREATE TABLE "simulados" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "created_by" uuid,
  "created_at" timestamp DEFAULT (now()),
  "turma_id" text,
  "modo" text NOT NULL
);

-- Questões dos simulados
CREATE TABLE "simulado_questoes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "simulado_id" int4,
  "question_type" text NOT NULL,
  "content" jsonb NOT NULL,
  "options" jsonb,
  "answer_key" jsonb,
  "ordem" int4
);

-- Resultados dos simulados
CREATE TABLE "simulado_resultados" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "simulado_id" int4,
  "user_id" uuid,
  "respostas" jsonb,
  "score" int4,
  "data_envio" timestamp DEFAULT (now())
);

-- =====================================================
-- 4. TABELAS DE PROVAS E EXAMES
-- =====================================================

-- Provas
CREATE TABLE "provas" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "titulo" varchar NOT NULL,
  "descricao" text,
  "materia" varchar NOT NULL,
  "dificuldade" varchar DEFAULT 'medio',
  "tempo_limite" int4 NOT NULL DEFAULT 60,
  "tentativas_permitidas" int4 DEFAULT 1,
  "nota_minima" numeric DEFAULT 7,
  "status" varchar DEFAULT 'rascunho',
  "tags" _text,
  "criado_por" uuid,
  "criado_em" timestamptz DEFAULT (now()),
  "atualizado_em" timestamptz DEFAULT (now()),
  "texto_base" text,
  "tem_texto_base" boolean DEFAULT 'false',
  "titulo_texto_base" varchar,
  "fonte_texto_base" varchar
);

-- Questões das provas
CREATE TABLE "questoes" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "prova_id" uuid,
  "tipo" varchar NOT NULL,
  "enunciado" text NOT NULL,
  "imagens" _text,
  "pontuacao" numeric DEFAULT 1,
  "explicacao" text,
  "ordem" int4 NOT NULL,
  "criado_em" timestamptz DEFAULT (now()),
  "tempo_estimado" int4 DEFAULT 60
);

-- Opções das questões
CREATE TABLE "opcoes_questao" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "questao_id" uuid,
  "texto" text NOT NULL,
  "correta" boolean DEFAULT 'false',
  "ordem" int4 NOT NULL,
  "criado_em" timestamptz DEFAULT (now()),
  "is_correta" boolean NOT NULL DEFAULT 'false'
);

-- Tentativas de prova
CREATE TABLE "tentativas_prova" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "prova_id" uuid,
  "aluno_id" uuid,
  "nota_final" numeric,
  "tempo_gasto" int4,
  "iniciada_em" timestamptz DEFAULT (now()),
  "finalizada_em" timestamptz,
  "status" varchar DEFAULT 'em_andamento',
  "criado_em" timestamptz DEFAULT (now())
);

-- Respostas dos alunos
CREATE TABLE "respostas_aluno" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "tentativa_id" uuid,
  "questao_id" uuid,
  "resposta" text,
  "correta" boolean,
  "pontos_obtidos" numeric DEFAULT 0,
  "tempo_gasto" int4,
  "criado_em" timestamptz DEFAULT (now())
);

-- Exames EAOF
CREATE TABLE "eaof_exams" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "year" int4 NOT NULL,
  "exam_type" varchar NOT NULL,
  "subject" varchar NOT NULL,
  "exam_date" date,
  "total_questions" int4 DEFAULT 0,
  "time_limit_minutes" int4 DEFAULT 120,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Questões dos exames EAOF
CREATE TABLE "exam_questions" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "exam_id" uuid,
  "question_number" int4 NOT NULL,
  "question_text" text NOT NULL,
  "question_type" varchar DEFAULT 'multiple_choice',
  "subject" varchar NOT NULL,
  "topic" varchar,
  "difficulty_level" varchar DEFAULT 'medium',
  "correct_answer" varchar NOT NULL,
  "explanation" text,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

-- Resultados dos exames
CREATE TABLE "exam_results" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "user_id" uuid,
  "exam_id" uuid,
  "score" int4 DEFAULT 0,
  "total_questions" int4 DEFAULT 0,
  "correct_answers" int4 DEFAULT 0,
  "time_taken_minutes" int4 DEFAULT 0,
  "completed_at" timestamptz DEFAULT (now()),
  "created_at" timestamptz DEFAULT (now())
);

-- =====================================================
-- 5. TABELAS DE REDAÇÃO
-- =====================================================

-- Temas de redação
CREATE TABLE "temas_redacao" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "titulo" text NOT NULL,
  "descricao" text NOT NULL,
  "tipo_prova" text NOT NULL,
  "ano" int4,
  "dificuldade" text DEFAULT 'medio',
  "tags" _text,
  "ativo" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT 'current_timestamp',
  "criado_por" uuid,
  "publico" boolean DEFAULT 'false'
);

-- Templates de redação
CREATE TABLE "templates_redacao" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nome" text NOT NULL,
  "tipo" text NOT NULL,
  "descricao" text,
  "arquivo_url" text NOT NULL,
  "ativo" boolean DEFAULT 'true',
  "created_at" timestamptz DEFAULT 'current_timestamp'
);

-- Templates de feedback
CREATE TABLE "templates_feedback" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "categoria" text NOT NULL,
  "subcategoria" text NOT NULL,
  "titulo" text NOT NULL,
  "descricao" text NOT NULL,
  "sugestao" text,
  "created_at" timestamp DEFAULT (now())
);

-- =====================================================
-- 6. TABELAS DE SUPORTE E NOTIFICAÇÕES
-- =====================================================

-- Mensagens de suporte
CREATE TABLE "suporte_mensagens" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nome" text NOT NULL,
  "email" text NOT NULL,
  "mensagem" text NOT NULL,
  "data_envio" timestamp DEFAULT (now()),
  "status" text DEFAULT 'pendente'
);

-- Notificações
CREATE TABLE "notificacoes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_uuid" uuid NOT NULL,
  "tipo" text NOT NULL,
  "titulo" text NOT NULL,
  "mensagem" text NOT NULL,
  "lida" boolean DEFAULT 'false',
  "created_at" timestamptz DEFAULT 'current_timestamp'
);

-- =====================================================
-- 7. COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE "eaof_exams" IS 'Tabela para armazenar as provas do EAOF de diferentes anos';
COMMENT ON TABLE "exam_questions" IS 'Tabela para armazenar as questões das provas';
COMMENT ON TABLE "exam_results" IS 'Tabela para armazenar os resultados dos alunos nas provas';
COMMENT ON TABLE "classes" IS 'Turmas de cada curso/matéria';
COMMENT ON TABLE "subjects" IS 'Matérias/cursos disponíveis no sistema';
COMMENT ON TABLE "templates_feedback" IS 'Tabela com templates de feedback para padronizar correções';

-- =====================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para cursos
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_uuid ON course_enrollments(user_uuid);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_uuid ON lesson_progress(user_uuid);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Índices para turmas
CREATE INDEX IF NOT EXISTS idx_turmas_professor_uuid ON turmas(professor_uuid);
CREATE INDEX IF NOT EXISTS idx_turmas_ativa ON turmas(ativa);
CREATE INDEX IF NOT EXISTS idx_alunos_turmas_user_uuid ON alunos_turmas(user_uuid);
CREATE INDEX IF NOT EXISTS idx_alunos_turmas_turma_id ON alunos_turmas(turma_id);
CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_classes_class_id ON member_classes(class_id);

-- Índices para quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_uuid ON user_quiz_scores(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_quiz_id ON user_quiz_scores(quiz_id);

-- Índices para simulados
CREATE INDEX IF NOT EXISTS idx_simulados_created_by ON simulados(created_by);
CREATE INDEX IF NOT EXISTS idx_simulados_turma_id ON simulados(turma_id);
CREATE INDEX IF NOT EXISTS idx_simulado_questoes_simulado_id ON simulado_questoes(simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_resultados_simulado_id ON simulado_resultados(simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_resultados_user_id ON simulado_resultados(user_id);

-- Índices para provas
CREATE INDEX IF NOT EXISTS idx_provas_criado_por ON provas(criado_por);
CREATE INDEX IF NOT EXISTS idx_provas_status ON provas(status);
CREATE INDEX IF NOT EXISTS idx_questoes_prova_id ON questoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_opcoes_questao_questao_id ON opcoes_questao(questao_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_prova_prova_id ON tentativas_prova(prova_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_prova_aluno_id ON tentativas_prova(aluno_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_tentativa_id ON respostas_aluno(tentativa_id);
CREATE INDEX IF NOT EXISTS idx_respostas_aluno_questao_id ON respostas_aluno(questao_id);

-- Índices para exames EAOF
CREATE INDEX IF NOT EXISTS idx_eaof_exams_year ON eaof_exams(year);
CREATE INDEX IF NOT EXISTS idx_eaof_exams_exam_type ON eaof_exams(exam_type);
CREATE INDEX IF NOT EXISTS idx_eaof_exams_subject ON eaof_exams(subject);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);

-- Índices para redação
CREATE INDEX IF NOT EXISTS idx_temas_redacao_criado_por ON temas_redacao(criado_por);
CREATE INDEX IF NOT EXISTS idx_temas_redacao_ativo ON temas_redacao(ativo);
CREATE INDEX IF NOT EXISTS idx_templates_redacao_ativo ON templates_redacao(ativo);

-- Índices para notificações e suporte
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_uuid ON notificacoes(user_uuid);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_suporte_mensagens_status ON suporte_mensagens(status);

-- =====================================================
-- 9. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos_turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opcoes_questao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tentativas_prova ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE eaof_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas_redacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_redacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE suporte_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para matérias (públicas)
CREATE POLICY "Anyone can view subjects" ON subjects
    FOR SELECT USING (true);

-- Políticas para cursos
CREATE POLICY "Anyone can view active courses" ON courses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can manage their own courses" ON courses
    FOR ALL USING (auth.uid() = teacher_id);

-- Políticas para módulos e lições
CREATE POLICY "Anyone can view course modules" ON course_modules
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view course lessons" ON course_lessons
    FOR SELECT USING (is_active = true);

-- Políticas para inscrições
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para progresso das lições
CREATE POLICY "Users can view their own lesson progress" ON lesson_progress
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own lesson progress" ON lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own lesson progress" ON lesson_progress
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para materiais dos cursos
CREATE POLICY "Anyone can view course materials" ON course_materials
    FOR SELECT USING (is_active = true);

-- Políticas para turmas
CREATE POLICY "Users can view active turmas" ON turmas
    FOR SELECT USING (ativa = true);

CREATE POLICY "Teachers can manage their own turmas" ON turmas
    FOR ALL USING (auth.uid() = professor_uuid);

-- Políticas para classes
CREATE POLICY "Anyone can view active classes" ON classes
    FOR SELECT USING (status = 'ativa');

-- Políticas para alunos nas turmas
CREATE POLICY "Users can view their own turma memberships" ON alunos_turmas
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own turma memberships" ON alunos_turmas
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

-- Políticas para membros das classes
CREATE POLICY "Users can view their own class memberships" ON member_classes
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own class memberships" ON member_classes
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Políticas para atividades dos membros
CREATE POLICY "Users can view their own activities" ON member_activities
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own activities" ON member_activities
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Políticas para quizzes
CREATE POLICY "Anyone can view quizzes" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view quiz questions" ON quiz_questions
    FOR SELECT USING (true);

-- Políticas para pontuações dos quizzes
CREATE POLICY "Users can view their own quiz scores" ON user_quiz_scores
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can insert their own quiz scores" ON user_quiz_scores
    FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own quiz scores" ON user_quiz_scores
    FOR UPDATE USING (auth.uid() = user_uuid);

-- Políticas para simulados
CREATE POLICY "Users can view simulados" ON simulados
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own simulados" ON simulados
    FOR ALL USING (auth.uid() = created_by);

-- Políticas para questões dos simulados
CREATE POLICY "Anyone can view simulado questions" ON simulado_questoes
    FOR SELECT USING (true);

-- Políticas para resultados dos simulados
CREATE POLICY "Users can view their own simulado results" ON simulado_resultados
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own simulado results" ON simulado_resultados
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para provas
CREATE POLICY "Users can view active provas" ON provas
    FOR SELECT USING (status = 'publicada');

CREATE POLICY "Teachers can manage their own provas" ON provas
    FOR ALL USING (auth.uid() = criado_por);

-- Políticas para questões das provas
CREATE POLICY "Anyone can view prova questions" ON questoes
    FOR SELECT USING (true);

-- Políticas para opções das questões
CREATE POLICY "Anyone can view question options" ON opcoes_questao
    FOR SELECT USING (true);

-- Políticas para tentativas de prova
CREATE POLICY "Users can view their own prova attempts" ON tentativas_prova
    FOR SELECT USING (auth.uid() = aluno_id);

CREATE POLICY "Users can insert their own prova attempts" ON tentativas_prova
    FOR INSERT WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Users can update their own prova attempts" ON tentativas_prova
    FOR UPDATE USING (auth.uid() = aluno_id);

-- Políticas para respostas dos alunos
CREATE POLICY "Users can view their own answers" ON respostas_aluno
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own answers" ON respostas_aluno
    FOR INSERT WITH CHECK (true);

-- Políticas para exames EAOF
CREATE POLICY "Anyone can view EAOF exams" ON eaof_exams
    FOR SELECT USING (true);

-- Políticas para questões dos exames EAOF
CREATE POLICY "Anyone can view exam questions" ON exam_questions
    FOR SELECT USING (true);

-- Políticas para resultados dos exames
CREATE POLICY "Users can view their own exam results" ON exam_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam results" ON exam_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para temas de redação
CREATE POLICY "Anyone can view active redacao themes" ON temas_redacao
    FOR SELECT USING (ativo = true);

CREATE POLICY "Teachers can manage their own redacao themes" ON temas_redacao
    FOR ALL USING (auth.uid() = criado_por);

-- Políticas para templates de redação
CREATE POLICY "Anyone can view active redacao templates" ON templates_redacao
    FOR SELECT USING (ativo = true);

-- Políticas para templates de feedback
CREATE POLICY "Anyone can view feedback templates" ON templates_feedback
    FOR SELECT USING (true);

-- Políticas para mensagens de suporte
CREATE POLICY "Anyone can insert support messages" ON suporte_mensagens
    FOR INSERT WITH CHECK (true);

-- Políticas para notificações
CREATE POLICY "Users can view their own notifications" ON notificacoes
    FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "Users can update their own notifications" ON notificacoes
    FOR UPDATE USING (auth.uid() = user_uuid);

-- =====================================================
-- 11. TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_materials_updated_at
    BEFORE UPDATE ON course_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provas_updated_at
    BEFORE UPDATE ON provas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eaof_exams_updated_at
    BEFORE UPDATE ON eaof_exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_questions_updated_at
    BEFORE UPDATE ON exam_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'PARTE 2 CONCLUÍDA - TABELAS DE CURSOS, TURMAS E PROVAS' as status;

SELECT 
    table_name,
    '✅ CRIADA' as status
FROM information_schema.tables 
WHERE table_name IN (
    'subjects', 'courses', 'course_modules', 'course_lessons', 'course_enrollments',
    'lesson_progress', 'course_materials', 'turmas', 'classes', 'alunos_turmas',
    'member_classes', 'member_activities', 'content_rules', 'quizzes', 'quiz_questions',
    'user_quiz_scores', 'simulados', 'simulado_questoes', 'simulado_resultados',
    'provas', 'questoes', 'opcoes_questao', 'tentativas_prova', 'respostas_aluno',
    'eaof_exams', 'exam_questions', 'exam_results', 'temas_redacao', 'templates_redacao',
    'templates_feedback', 'suporte_mensagens', 'notificacoes'
)
AND table_schema = 'public'
ORDER BY table_name;
