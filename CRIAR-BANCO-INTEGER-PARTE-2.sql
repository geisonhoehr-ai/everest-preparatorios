-- =====================================================
-- SCRIPT PARA CRIAR BANCO DE DADOS - ESTRUTURA INTEGER
-- EVEREST PREPARATÓRIOS - PARTE 2: CURSOS, TURMAS E PROVAS
-- =====================================================

-- =====================================================
-- 1. TABELAS DE MATÉRIAS E CURSOS
-- =====================================================

-- Matérias/cursos disponíveis
CREATE TABLE IF NOT EXISTS "subjects" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL
);

-- Cursos
CREATE TABLE IF NOT EXISTS "courses" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100),
  "duration_hours" NUMERIC,
  "total_lessons" INTEGER,
  "price" NUMERIC,
  "is_active" BOOLEAN DEFAULT 'true',
  "show_in_catalog" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "teacher_id" INTEGER
);

-- Módulos dos cursos
CREATE TABLE IF NOT EXISTS "course_modules" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "course_id" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "is_minimized" BOOLEAN DEFAULT 'false',
  "access_rule" VARCHAR(50) DEFAULT 'free',
  "access_rule_value" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lições dos módulos
CREATE TABLE IF NOT EXISTS "course_lessons" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "module_id" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "lesson_type" VARCHAR(50) DEFAULT 'video',
  "panda_video_id" VARCHAR(255),
  "video_duration" INTEGER,
  "content_text" TEXT,
  "file_url" VARCHAR(500),
  "is_active" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inscrições nos cursos
CREATE TABLE IF NOT EXISTS "course_enrollments" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "course_id" INTEGER NOT NULL,
  "progress_percentage" NUMERIC DEFAULT 0,
  "enrollment_date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "completion_date" TIMESTAMP WITH TIME ZONE,
  "is_active" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progresso das lições
CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "lesson_id" INTEGER NOT NULL,
  "watched_duration" INTEGER DEFAULT 0,
  "is_completed" BOOLEAN DEFAULT 'false',
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "last_watched_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materiais dos cursos
CREATE TABLE IF NOT EXISTS "course_materials" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "course_id" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "file_url" VARCHAR(500) NOT NULL,
  "file_type" VARCHAR(100),
  "file_size" INTEGER,
  "download_count" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS DE TURMAS E CLASSES
-- =====================================================

-- Turmas (compatível com estrutura existente)
CREATE TABLE IF NOT EXISTS "turmas" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nome" VARCHAR(255) NOT NULL,
  "descricao" TEXT,
  "professor_id" INTEGER NOT NULL,
  "ativa" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "codigo_acesso" VARCHAR(50),
  "max_alunos" INTEGER DEFAULT 50,
  "periodo" VARCHAR(100),
  "ano_letivo" INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Alunos nas turmas
CREATE TABLE IF NOT EXISTS "alunos_turmas" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "turma_id" INTEGER NOT NULL,
  "data_entrada" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, turma_id)
);

-- Membros das classes
CREATE TABLE IF NOT EXISTS "member_classes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "member_id" INTEGER NOT NULL,
  "class_id" INTEGER NOT NULL,
  "data_entrada" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "status" VARCHAR(50) DEFAULT 'ativo'
);

-- Atividades dos membros
CREATE TABLE IF NOT EXISTS "member_activities" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "member_id" INTEGER,
  "activity_type" VARCHAR(100) NOT NULL,
  "activity_data" JSONB,
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regras de conteúdo
CREATE TABLE IF NOT EXISTS "content_rules" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "class_id" INTEGER NOT NULL,
  "content_type" VARCHAR(100) NOT NULL,
  "content_id" VARCHAR(255) NOT NULL,
  "rule_type" VARCHAR(100) NOT NULL,
  "data_liberacao" TIMESTAMP WITH TIME ZONE,
  "dias_apos_compra" INTEGER,
  "pontuacao_minima" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS DE QUIZZES E SIMULADOS
-- =====================================================

-- Quizzes
CREATE TABLE IF NOT EXISTS "quizzes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "topic_id" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questões dos quizzes
CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "quiz_id" INTEGER NOT NULL,
  "question_text" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "correct_answer" VARCHAR(255) NOT NULL,
  "explanation" TEXT
);

-- Pontuações dos usuários nos quizzes
CREATE TABLE IF NOT EXISTS "user_quiz_scores" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "quiz_id" INTEGER NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "total_questions" INTEGER NOT NULL DEFAULT 0,
  "correct_answers" INTEGER NOT NULL DEFAULT 0,
  "incorrect_answers" INTEGER NOT NULL DEFAULT 0,
  "completed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Simulados
CREATE TABLE IF NOT EXISTS "simulados" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "created_by" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "turma_id" INTEGER,
  "modo" VARCHAR(100) NOT NULL
);

-- Questões dos simulados
CREATE TABLE IF NOT EXISTS "simulado_questoes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "simulado_id" INTEGER,
  "question_type" VARCHAR(100) NOT NULL,
  "content" JSONB NOT NULL,
  "options" JSONB,
  "answer_key" JSONB,
  "ordem" INTEGER
);

-- Resultados dos simulados
CREATE TABLE IF NOT EXISTS "simulado_resultados" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "simulado_id" INTEGER,
  "user_id" INTEGER,
  "respostas" JSONB,
  "score" INTEGER,
  "data_envio" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELAS DE PROVAS E EXAMES
-- =====================================================

-- Provas
CREATE TABLE IF NOT EXISTS "provas" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "titulo" VARCHAR(255) NOT NULL,
  "descricao" TEXT,
  "materia" VARCHAR(100) NOT NULL,
  "dificuldade" VARCHAR(50) DEFAULT 'medio',
  "tempo_limite" INTEGER NOT NULL DEFAULT 60,
  "tentativas_permitidas" INTEGER DEFAULT 1,
  "nota_minima" NUMERIC DEFAULT 7,
  "status" VARCHAR(50) DEFAULT 'rascunho',
  "tags" TEXT[],
  "criado_por" INTEGER,
  "criado_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "atualizado_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "texto_base" TEXT,
  "tem_texto_base" BOOLEAN DEFAULT 'false',
  "titulo_texto_base" VARCHAR(255),
  "fonte_texto_base" VARCHAR(255)
);

-- Questões das provas
CREATE TABLE IF NOT EXISTS "questoes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "prova_id" INTEGER,
  "tipo" VARCHAR(100) NOT NULL,
  "enunciado" TEXT NOT NULL,
  "imagens" TEXT[],
  "pontuacao" NUMERIC DEFAULT 1,
  "explicacao" TEXT,
  "ordem" INTEGER NOT NULL,
  "criado_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "tempo_estimado" INTEGER DEFAULT 60
);

-- Opções das questões
CREATE TABLE IF NOT EXISTS "opcoes_questao" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "questao_id" INTEGER,
  "texto" TEXT NOT NULL,
  "correta" BOOLEAN DEFAULT 'false',
  "ordem" INTEGER NOT NULL,
  "criado_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "is_correta" BOOLEAN NOT NULL DEFAULT 'false'
);

-- Tentativas de prova
CREATE TABLE IF NOT EXISTS "tentativas_prova" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "prova_id" INTEGER,
  "aluno_id" INTEGER,
  "nota_final" NUMERIC,
  "tempo_gasto" INTEGER,
  "iniciada_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "finalizada_em" TIMESTAMP WITH TIME ZONE,
  "status" VARCHAR(50) DEFAULT 'em_andamento',
  "criado_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Respostas dos alunos
CREATE TABLE IF NOT EXISTS "respostas_aluno" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "tentativa_id" INTEGER,
  "questao_id" INTEGER,
  "resposta" TEXT,
  "correta" BOOLEAN,
  "pontos_obtidos" NUMERIC DEFAULT 0,
  "tempo_gasto" INTEGER,
  "criado_em" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exames EAOF
CREATE TABLE IF NOT EXISTS "eaof_exams" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "year" INTEGER NOT NULL,
  "exam_type" VARCHAR(100) NOT NULL,
  "subject" VARCHAR(100) NOT NULL,
  "exam_date" DATE,
  "total_questions" INTEGER DEFAULT 0,
  "time_limit_minutes" INTEGER DEFAULT 120,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questões dos exames EAOF
CREATE TABLE IF NOT EXISTS "exam_questions" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "exam_id" INTEGER,
  "question_number" INTEGER NOT NULL,
  "question_text" TEXT NOT NULL,
  "question_type" VARCHAR(100) DEFAULT 'multiple_choice',
  "subject" VARCHAR(100) NOT NULL,
  "topic" VARCHAR(255),
  "difficulty_level" VARCHAR(50) DEFAULT 'medium',
  "correct_answer" VARCHAR(255) NOT NULL,
  "explanation" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resultados dos exames
CREATE TABLE IF NOT EXISTS "exam_results" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER,
  "exam_id" INTEGER,
  "score" INTEGER DEFAULT 0,
  "total_questions" INTEGER DEFAULT 0,
  "correct_answers" INTEGER DEFAULT 0,
  "time_taken_minutes" INTEGER DEFAULT 0,
  "completed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELAS DE REDAÇÃO
-- =====================================================

-- Temas de redação
CREATE TABLE IF NOT EXISTS "temas_redacao" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "titulo" VARCHAR(255) NOT NULL,
  "descricao" TEXT NOT NULL,
  "tipo_prova" VARCHAR(100) NOT NULL,
  "ano" INTEGER,
  "dificuldade" VARCHAR(50) DEFAULT 'medio',
  "tags" TEXT[],
  "ativo" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "criado_por" INTEGER,
  "publico" BOOLEAN DEFAULT 'false'
);

-- Templates de redação
CREATE TABLE IF NOT EXISTS "templates_redacao" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nome" VARCHAR(255) NOT NULL,
  "tipo" VARCHAR(100) NOT NULL,
  "descricao" TEXT,
  "arquivo_url" VARCHAR(500) NOT NULL,
  "ativo" BOOLEAN DEFAULT 'true',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de feedback
CREATE TABLE IF NOT EXISTS "templates_feedback" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "categoria" VARCHAR(100) NOT NULL,
  "subcategoria" VARCHAR(100) NOT NULL,
  "titulo" VARCHAR(255) NOT NULL,
  "descricao" TEXT NOT NULL,
  "sugestao" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELAS DE SUPORTE E NOTIFICAÇÕES
-- =====================================================

-- Mensagens de suporte
CREATE TABLE IF NOT EXISTS "suporte_mensagens" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nome" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "mensagem" TEXT NOT NULL,
  "data_envio" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "status" VARCHAR(50) DEFAULT 'pendente'
);

-- Notificações
CREATE TABLE IF NOT EXISTS "notificacoes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" INTEGER NOT NULL,
  "tipo" VARCHAR(100) NOT NULL,
  "titulo" VARCHAR(255) NOT NULL,
  "mensagem" TEXT NOT NULL,
  "lida" BOOLEAN DEFAULT 'false',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE "eaof_exams" IS 'Tabela para armazenar as provas do EAOF de diferentes anos';
COMMENT ON TABLE "exam_questions" IS 'Tabela para armazenar as questões das provas';
COMMENT ON TABLE "exam_results" IS 'Tabela para armazenar os resultados dos alunos nas provas';
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
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Índices para turmas
CREATE INDEX IF NOT EXISTS idx_turmas_professor_id ON turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_ativa ON turmas(ativa);
CREATE INDEX IF NOT EXISTS idx_alunos_turmas_user_id ON alunos_turmas(user_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turmas_turma_id ON alunos_turmas(turma_id);
CREATE INDEX IF NOT EXISTS idx_member_classes_member_id ON member_classes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_classes_class_id ON member_classes(class_id);

-- Índices para quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_id ON user_quiz_scores(user_id);
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
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
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
    FOR ALL USING (teacher_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para módulos e lições
CREATE POLICY "Anyone can view course modules" ON course_modules
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view course lessons" ON course_lessons
    FOR SELECT USING (is_active = true);

-- Políticas para inscrições
CREATE POLICY "Users can view their own enrollments" ON course_enrollments
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own enrollments" ON course_enrollments
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para progresso das lições
CREATE POLICY "Users can view their own lesson progress" ON lesson_progress
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own lesson progress" ON lesson_progress
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own lesson progress" ON lesson_progress
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para materiais dos cursos
CREATE POLICY "Anyone can view course materials" ON course_materials
    FOR SELECT USING (is_active = true);

-- Políticas para turmas
CREATE POLICY "Users can view active turmas" ON turmas
    FOR SELECT USING (ativa = true);

CREATE POLICY "Teachers can manage their own turmas" ON turmas
    FOR ALL USING (professor_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para alunos nas turmas
CREATE POLICY "Users can view their own turma memberships" ON alunos_turmas
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own turma memberships" ON alunos_turmas
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para membros das classes
CREATE POLICY "Users can view their own class memberships" ON member_classes
    FOR SELECT USING (member_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own class memberships" ON member_classes
    FOR INSERT WITH CHECK (member_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para atividades dos membros
CREATE POLICY "Users can view their own activities" ON member_activities
    FOR SELECT USING (member_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own activities" ON member_activities
    FOR INSERT WITH CHECK (member_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para quizzes
CREATE POLICY "Anyone can view quizzes" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view quiz questions" ON quiz_questions
    FOR SELECT USING (true);

-- Políticas para pontuações dos quizzes
CREATE POLICY "Users can view their own quiz scores" ON user_quiz_scores
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own quiz scores" ON user_quiz_scores
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own quiz scores" ON user_quiz_scores
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para simulados
CREATE POLICY "Users can view simulados" ON simulados
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their own simulados" ON simulados
    FOR ALL USING (created_by = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para questões dos simulados
CREATE POLICY "Anyone can view simulado questions" ON simulado_questoes
    FOR SELECT USING (true);

-- Políticas para resultados dos simulados
CREATE POLICY "Users can view their own simulado results" ON simulado_resultados
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own simulado results" ON simulado_resultados
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para provas
CREATE POLICY "Users can view active provas" ON provas
    FOR SELECT USING (status = 'publicada');

CREATE POLICY "Teachers can manage their own provas" ON provas
    FOR ALL USING (criado_por = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para questões das provas
CREATE POLICY "Anyone can view prova questions" ON questoes
    FOR SELECT USING (true);

-- Políticas para opções das questões
CREATE POLICY "Anyone can view question options" ON opcoes_questao
    FOR SELECT USING (true);

-- Políticas para tentativas de prova
CREATE POLICY "Users can view their own prova attempts" ON tentativas_prova
    FOR SELECT USING (aluno_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own prova attempts" ON tentativas_prova
    FOR INSERT WITH CHECK (aluno_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own prova attempts" ON tentativas_prova
    FOR UPDATE USING (aluno_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

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
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own exam results" ON exam_results
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Políticas para temas de redação
CREATE POLICY "Anyone can view active redacao themes" ON temas_redacao
    FOR SELECT USING (ativo = true);

CREATE POLICY "Teachers can manage their own redacao themes" ON temas_redacao
    FOR ALL USING (criado_por = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

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
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own notifications" ON notificacoes
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

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

SELECT 'PARTE 2 CONCLUÍDA - TABELAS DE CURSOS, TURMAS E PROVAS (INTEGER)' as status;

SELECT 
    table_name,
    '✅ CRIADA' as status
FROM information_schema.tables 
WHERE table_name IN (
    'subjects', 'courses', 'course_modules', 'course_lessons', 'course_enrollments',
    'lesson_progress', 'course_materials', 'turmas', 'alunos_turmas',
    'member_classes', 'member_activities', 'content_rules', 'quizzes', 'quiz_questions',
    'user_quiz_scores', 'simulados', 'simulado_questoes', 'simulado_resultados',
    'provas', 'questoes', 'opcoes_questao', 'tentativas_prova', 'respostas_aluno',
    'eaof_exams', 'exam_questions', 'exam_results', 'temas_redacao', 'templates_redacao',
    'templates_feedback', 'suporte_mensagens', 'notificacoes'
)
AND table_schema = 'public'
ORDER BY table_name;
